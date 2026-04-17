import { api } from "@/api/Client";
import { Card } from "@/components/Card";
import { Pill } from "@/components/Pill";
import { Screen } from "@/components/Screen";
import { badgeMilestones } from "@/lib/gamification";
import { supabase } from "@/lib/supabase";
import { useApp } from "@/store/store";
import { theme } from "@/theme";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Alert, Image, Pressable, RefreshControl, ScrollView, Text, TextInput, View } from "react-native";

const COMMUNITY_BUCKET = "community-post-images";

type CommunityPost = {
  id: string;
  body: string;
  imageUrl?: string | null;
  imageBucket?: string | null;
  imagePath?: string | null;
  badgeId?: string | null;
  createdAt: string;
  author: {
    id: string;
    displayName: string;
  };
  likeCount: number;
  commentCount: number;
  likedByMe: boolean;
};

type PostComment = {
  id: string;
  body: string;
  createdAt: string;
  author: {
    id: string;
    displayName: string;
  };
};

export default function CommunityScreen() {
  const { state } = useApp();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [commentsByPost, setCommentsByPost] = useState<Record<string, PostComment[]>>({});
  const [openComments, setOpenComments] = useState<Record<string, boolean>>({});
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});
  const [body, setBody] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageBucket, setImageBucket] = useState("");
  const [imagePath, setImagePath] = useState("");
  const [badgeId, setBadgeId] = useState("");
  const [loading, setLoading] = useState(false);
  const [posting, setPosting] = useState(false);
  const [uploading, setUploading] = useState(false);

  const isSignedIn = !!state.authUser && !state.isAnonymous;

  const loadPosts = useCallback(async () => {
    if (!isSignedIn) return;

    setLoading(true);
    try {
      const list = await api<CommunityPost[]>("/community/posts", { auth: true });
      setPosts(list);
    } catch (error: any) {
      Alert.alert("Could not load community", String(error?.message ?? error));
    } finally {
      setLoading(false);
    }
  }, [isSignedIn]);

  useEffect(() => {
    void loadPosts();
  }, [loadPosts]);

  const createPost = async () => {
    const cleanBody = body.trim();
    const cleanImageUrl = imageUrl.trim();

    if (!cleanBody) {
      Alert.alert("Add something to share", "Write a short update, win, or reflection first.");
      return;
    }

    setPosting(true);
    try {
      const created = await api<CommunityPost>("/community/posts", {
        method: "POST",
        auth: true,
        body: JSON.stringify({
          body: cleanBody,
          imageUrl: cleanImageUrl,
          imageBucket,
          imagePath,
          badgeId,
        }),
      });

      setPosts((current) => [created, ...current]);
      setBody("");
      setImageUrl("");
      setImageBucket("");
      setImagePath("");
      setBadgeId("");
    } catch (error: any) {
      Alert.alert("Could not post", String(error?.message ?? error));
    } finally {
      setPosting(false);
    }
  };

  const pickImage = async () => {
    if (!state.authUser) return;

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Photo access needed", "Allow photo access to attach an image to your post.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 0.8,
    });

    if (result.canceled || !result.assets?.[0]?.uri) {
      return;
    }

    const asset = result.assets[0];
    setUploading(true);

    try {
      const response = await fetch(asset.uri);
      const imageBody = await response.blob();
      const extension = getImageExtension(asset.fileName, asset.mimeType);
      const path = `${state.authUser.id}/post-${Date.now()}.${extension}`;
      const { error } = await supabase.storage.from(COMMUNITY_BUCKET).upload(path, imageBody, {
        contentType: asset.mimeType ?? `image/${extension}`,
        upsert: false,
      });

      if (error) throw error;

      const { data } = supabase.storage.from(COMMUNITY_BUCKET).getPublicUrl(path);
      setImageUrl(data.publicUrl);
      setImageBucket(COMMUNITY_BUCKET);
      setImagePath(path);
    } catch {
      Alert.alert(
        "Image upload not ready",
        "The app tried to upload to Supabase Storage. Run the latest migration or create a public bucket named community-post-images, then try again.",
      );
    } finally {
      setUploading(false);
    }
  };

  const toggleLike = async (post: CommunityPost) => {
    setPosts((current) =>
      current.map((item) =>
        item.id === post.id
          ? {
              ...item,
              likedByMe: !item.likedByMe,
              likeCount: Math.max(0, item.likeCount + (item.likedByMe ? -1 : 1)),
            }
          : item,
      ),
    );

    try {
      await api<void>(`/community/posts/${post.id}/like`, {
        method: post.likedByMe ? "DELETE" : "POST",
        auth: true,
      });
    } catch (error: any) {
      await loadPosts();
      Alert.alert("Could not update like", String(error?.message ?? error));
    }
  };

  const toggleComments = async (postId: string) => {
    const nextOpen = !openComments[postId];
    setOpenComments((current) => ({ ...current, [postId]: nextOpen }));

    if (nextOpen && !commentsByPost[postId]) {
      await loadComments(postId);
    }
  };

  const loadComments = async (postId: string) => {
    try {
      const comments = await api<PostComment[]>(`/community/posts/${postId}/comments`, { auth: true });
      setCommentsByPost((current) => ({ ...current, [postId]: comments }));
    } catch (error: any) {
      Alert.alert("Could not load comments", String(error?.message ?? error));
    }
  };

  const addComment = async (postId: string) => {
    const draft = commentDrafts[postId]?.trim() ?? "";
    if (!draft) return;

    try {
      const created = await api<PostComment>(`/community/posts/${postId}/comments`, {
        method: "POST",
        auth: true,
        body: JSON.stringify({ body: draft }),
      });

      setCommentsByPost((current) => ({
        ...current,
        [postId]: [...(current[postId] ?? []), created],
      }));
      setPosts((current) =>
        current.map((post) => (post.id === postId ? { ...post, commentCount: post.commentCount + 1 } : post)),
      );
      setCommentDrafts((current) => ({ ...current, [postId]: "" }));
    } catch (error: any) {
      Alert.alert("Could not comment", String(error?.message ?? error));
    }
  };

  if (!isSignedIn) {
    return (
      <Screen scroll>
        <View style={{ marginBottom: 16 }}>
          <Text style={{ color: theme.colors.primary, fontWeight: "900", letterSpacing: 0.6, textTransform: "uppercase" }}>
            Community
          </Text>
          <Text style={{ color: theme.colors.text, fontSize: 28, fontWeight: "900", marginTop: 6 }}>
            Share wins with others
          </Text>
          <Text style={{ color: theme.colors.muted, marginTop: 4, lineHeight: 20 }}>
            Create an account to post achievements, like updates, and comment in the community feed.
          </Text>
        </View>

        <Card>
          <Text style={{ color: theme.colors.text, fontSize: 18, fontWeight: "900" }}>Account required</Text>
          <Text style={{ color: theme.colors.muted, marginTop: 6, lineHeight: 20 }}>
            Community posts are tied to signed-in accounts so the feed stays safer and easier to moderate.
          </Text>
          <Pressable onPress={() => router.push("/login")} style={primaryButton}>
            <Ionicons name="log-in-outline" size={18} color="white" />
            <Text style={{ color: "white", fontWeight: "900" }}>Sign in or create account</Text>
          </Pressable>
        </Card>
      </Screen>
    );
  }

  return (
    <Screen keyboard>
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadPosts} />}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        <View style={{ marginBottom: 16 }}>
          <Text style={{ color: theme.colors.primary, fontWeight: "900", letterSpacing: 0.6, textTransform: "uppercase" }}>
            Community
          </Text>
          <Text style={{ color: theme.colors.text, fontSize: 28, fontWeight: "900", marginTop: 6 }}>
            Wins worth sharing
          </Text>
          <Text style={{ color: theme.colors.muted, marginTop: 4, lineHeight: 20 }}>
            Post sober milestones, small victories, and encouragement for people walking the same road.
          </Text>
        </View>

        <Card style={{ marginBottom: 16 }}>
          <Text style={{ color: theme.colors.text, fontSize: 18, fontWeight: "900" }}>Create a post</Text>
          <Text style={{ color: theme.colors.muted, marginTop: 5, lineHeight: 20 }}>
            Share a win, a badge, or a moment you want to remember.
          </Text>

          <TextInput
            value={body}
            onChangeText={setBody}
            placeholder="Today I hit a milestone..."
            placeholderTextColor={theme.colors.muted2}
            multiline
            scrollEnabled={false}
            style={{
              marginTop: 14,
              minHeight: 100,
              textAlignVertical: "top",
              borderWidth: 1,
              borderColor: theme.colors.borderSoft,
              borderRadius: 16,
              paddingHorizontal: 14,
              paddingVertical: 12,
              color: theme.colors.text,
              backgroundColor: theme.colors.bgElevated,
            }}
          />

          <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
            {badgeMilestones.map((badge) => (
              <Pressable
                key={badge.id}
                onPress={() => setBadgeId((current) => (current === badge.id ? "" : badge.id))}
                style={{
                  paddingHorizontal: 10,
                  paddingVertical: 8,
                  borderRadius: 999,
                  borderWidth: 1,
                  borderColor: badgeId === badge.id ? theme.colors.primary : theme.colors.borderSoft,
                  backgroundColor: badgeId === badge.id ? theme.colors.primarySoft : theme.colors.bg,
                }}
              >
                <Text style={{ color: badgeId === badge.id ? theme.colors.primary : theme.colors.text, fontWeight: "900" }}>
                  {badge.label}
                </Text>
              </Pressable>
            ))}
          </View>

          <View style={{ flexDirection: "row", gap: 10, marginTop: 12, alignItems: "center" }}>
            <TextInput
              value={imageUrl}
              onChangeText={(value) => {
                setImageUrl(value);
                setImageBucket("");
                setImagePath("");
              }}
              placeholder="Optional image URL"
              placeholderTextColor={theme.colors.muted2}
              autoCapitalize="none"
              style={{
                flex: 1,
                borderWidth: 1,
                borderColor: theme.colors.borderSoft,
                borderRadius: 16,
                paddingHorizontal: 14,
                paddingVertical: 12,
                color: theme.colors.text,
                backgroundColor: theme.colors.bgElevated,
              }}
            />
            <Pressable onPress={pickImage} disabled={uploading} style={[secondaryIconButton, { opacity: uploading ? 0.65 : 1 }]}>
              <Ionicons name={uploading ? "cloud-upload-outline" : "image-outline"} size={18} color={theme.colors.primary} />
            </Pressable>
          </View>

          {!!imageUrl.trim() && (
            <View style={{ marginTop: 12 }}>
              <Image
                source={{ uri: imageUrl.trim() }}
                style={{ width: "100%", height: 170, borderRadius: 16, backgroundColor: theme.colors.bgSoft }}
                resizeMode="cover"
              />
              <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 10, marginTop: 8, alignItems: "center" }}>
                <Text style={{ color: theme.colors.muted, flex: 1 }}>
                  {imagePath ? "Image uploaded and ready to save with this post." : "This image URL will be saved with the post."}
                </Text>
                <Pressable
                  onPress={() => {
                    setImageUrl("");
                    setImageBucket("");
                    setImagePath("");
                  }}
                >
                  <Text style={{ color: theme.colors.danger, fontWeight: "900" }}>Remove</Text>
                </Pressable>
              </View>
            </View>
          )}

          <Pressable onPress={createPost} disabled={posting} style={[primaryButton, { opacity: posting ? 0.7 : 1 }]}>
            <Ionicons name="send-outline" size={18} color="white" />
            <Text style={{ color: "white", fontWeight: "900" }}>{posting ? "Posting..." : "Post to community"}</Text>
          </Pressable>
        </Card>

        {posts.map((post) => {
          const badge = badgeMilestones.find((item) => item.id === post.badgeId);
          const commentsOpen = Boolean(openComments[post.id]);
          const comments = commentsByPost[post.id] ?? [];

          return (
            <Card key={post.id} style={{ marginBottom: 14 }}>
              <View style={{ flexDirection: "row", gap: 12, alignItems: "flex-start" }}>
                <View
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 16,
                    backgroundColor: theme.colors.primarySoft,
                    borderWidth: 1,
                    borderColor: theme.colors.borderSoft,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text style={{ color: theme.colors.primary, fontWeight: "900" }}>
                    {post.author.displayName.slice(0, 2).toUpperCase()}
                  </Text>
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={{ color: theme.colors.text, fontWeight: "900" }}>{post.author.displayName}</Text>
                  <Text style={{ color: theme.colors.muted, marginTop: 2 }}>{formatPostDate(post.createdAt)}</Text>
                </View>

                {badge && <Pill label={badge.label} icon="ribbon-outline" tint={theme.colors.success} soft />}
              </View>

              <Text style={{ color: theme.colors.text, marginTop: 14, lineHeight: 21 }}>{post.body}</Text>

              {!!post.imageUrl && (
                <Image
                  source={{ uri: post.imageUrl }}
                  style={{ width: "100%", height: 210, borderRadius: 18, marginTop: 14, backgroundColor: theme.colors.bgSoft }}
                  resizeMode="cover"
                />
              )}

              <View style={{ flexDirection: "row", gap: 10, marginTop: 14 }}>
                <PostAction
                  icon={post.likedByMe ? "heart" : "heart-outline"}
                  label={`${post.likeCount}`}
                  active={post.likedByMe}
                  onPress={() => toggleLike(post)}
                />
                <PostAction
                  icon="chatbubble-outline"
                  label={`${post.commentCount}`}
                  active={commentsOpen}
                  onPress={() => toggleComments(post.id)}
                />
              </View>

              {commentsOpen && (
                <View style={{ marginTop: 14, paddingTop: 14, borderTopWidth: 1, borderTopColor: theme.colors.borderSoft }}>
                  {comments.map((comment) => (
                    <View key={comment.id} style={{ marginBottom: 12 }}>
                      <Text style={{ color: theme.colors.text, fontWeight: "900" }}>{comment.author.displayName}</Text>
                      <Text style={{ color: theme.colors.text, marginTop: 3, lineHeight: 20 }}>{comment.body}</Text>
                    </View>
                  ))}

                  {comments.length === 0 && (
                    <Text style={{ color: theme.colors.muted, marginBottom: 12 }}>No comments yet. Add the first one.</Text>
                  )}

                  <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
                    <TextInput
                      value={commentDrafts[post.id] ?? ""}
                      onChangeText={(value) => setCommentDrafts((current) => ({ ...current, [post.id]: value }))}
                      placeholder="Write a comment..."
                      placeholderTextColor={theme.colors.muted2}
                      style={{
                        flex: 1,
                        borderWidth: 1,
                        borderColor: theme.colors.borderSoft,
                        borderRadius: 14,
                        paddingHorizontal: 12,
                        paddingVertical: 10,
                        color: theme.colors.text,
                        backgroundColor: theme.colors.bgElevated,
                      }}
                    />
                    <Pressable onPress={() => addComment(post.id)} style={sendButton}>
                      <Ionicons name="send" size={16} color="white" />
                    </Pressable>
                  </View>
                </View>
              )}
            </Card>
          );
        })}

        {posts.length === 0 && !loading && (
          <Card>
            <Text style={{ color: theme.colors.text, fontWeight: "900", fontSize: 18 }}>No posts yet</Text>
            <Text style={{ color: theme.colors.muted, marginTop: 6, lineHeight: 20 }}>
              Share the first community win or milestone.
            </Text>
          </Card>
        )}
      </ScrollView>
    </Screen>
  );
}

function PostAction({
  icon,
  label,
  active,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 7,
        borderRadius: 999,
        paddingHorizontal: 12,
        paddingVertical: 8,
        backgroundColor: active ? theme.colors.primarySoft : theme.colors.bgSoft,
        borderWidth: 1,
        borderColor: active ? `${theme.colors.primary}30` : theme.colors.borderSoft,
      }}
    >
      <Ionicons name={icon} size={16} color={active ? theme.colors.primary : theme.colors.muted} />
      <Text style={{ color: active ? theme.colors.primary : theme.colors.muted, fontWeight: "900" }}>{label}</Text>
    </Pressable>
  );
}

function formatPostDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getImageExtension(fileName?: string | null, mimeType?: string | null) {
  const fromName = fileName?.split(".").pop()?.toLowerCase();
  if (fromName && ["jpg", "jpeg", "png", "webp", "heic"].includes(fromName)) {
    return fromName === "jpeg" ? "jpg" : fromName;
  }

  const fromMime = mimeType?.split("/").pop()?.toLowerCase();
  if (fromMime && ["jpg", "jpeg", "png", "webp", "heic"].includes(fromMime)) {
    return fromMime === "jpeg" ? "jpg" : fromMime;
  }

  return "jpg";
}

const primaryButton = {
  marginTop: 14,
  backgroundColor: theme.colors.primary,
  borderRadius: 16,
  paddingVertical: 14,
  alignItems: "center" as const,
  justifyContent: "center" as const,
  flexDirection: "row" as const,
  gap: 8,
};

const secondaryIconButton = {
  width: 46,
  height: 46,
  borderRadius: 16,
  borderWidth: 1,
  borderColor: theme.colors.borderSoft,
  backgroundColor: theme.colors.primarySoft,
  alignItems: "center" as const,
  justifyContent: "center" as const,
};

const sendButton = {
  width: 42,
  height: 42,
  borderRadius: 14,
  backgroundColor: theme.colors.primary,
  alignItems: "center" as const,
  justifyContent: "center" as const,
};
