import { Card } from "@/components/Card";
import { Screen } from "@/components/Screen";
import { useApp } from "@/store/store";
import { theme } from "@/theme";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { FlatList, Pressable, RefreshControl, Text, View } from "react-native";

export default function JournalListScreen() {
  const { state, actions } = useApp();
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      setRefreshing(true);
      await actions.loadJournal();
    } finally {
      setRefreshing(false);
    }
  }, [actions]);

  useEffect(() => {
    
    load();
  }, [load]);

  return (
    <Screen>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <Text style={{ fontSize: 26, fontWeight: "900", color: theme.colors.text }}>Journal</Text>

        <Pressable
          onPress={() => router.push("/journal/new")}
          style={{
            backgroundColor: theme.colors.primary,
            paddingHorizontal: 14,
            paddingVertical: 10,
            borderRadius: 14,
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
          }}
        >
          <Ionicons name="add" size={18} color="white" />
          <Text style={{ color: "white", fontWeight: "900" }}>New</Text>
        </Pressable>
      </View>

      <Card style={{ marginBottom: 12 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <View>
            <Text style={{ color: theme.colors.muted, fontWeight: "700" }}>Total entries</Text>
            <Text style={{ fontSize: 28, fontWeight: "900", color: theme.colors.text }}>{state.journal.length}</Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={{ color: theme.colors.muted, fontWeight: "700" }}>Most recent</Text>
            <Text style={{ fontWeight: "900", color: theme.colors.text }}>
              {state.journal[0]?.date ?? "—"}
            </Text>
          </View>
        </View>
      </Card>

      <FlatList
        data={state.journal}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 120 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={load} />}
        ListEmptyComponent={
          <View style={{ marginTop: 60, alignItems: "center", gap: 10 }}>
            <Ionicons name="book-outline" size={52} color={theme.colors.muted} />
            <Text style={{ fontSize: 18, fontWeight: "900", color: theme.colors.text }}>No entries yet</Text>
            <Text style={{ color: theme.colors.muted, textAlign: "center", maxWidth: 280 }}>
              Add a journal entry to track cravings, wins, triggers, and progress.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() => router.push({ pathname: "/journal/[id]", params: { id: item.id } })}
            style={{
              backgroundColor: theme.colors.card,
              borderRadius: 18,
              padding: 14,
              marginBottom: 12,
              borderWidth: 1,
              borderColor: theme.colors.border,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: "900", color: theme.colors.text }} numberOfLines={1}>
                  {item.title}
                </Text>
                <Text style={{ color: theme.colors.muted, marginTop: 4 }} numberOfLines={1}>
                  {item.date} • {item.tags.slice(0, 3).join(", ") || "general"}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={theme.colors.muted} />
            </View>
          </Pressable>
        )}
      />
    </Screen>
  );
}
