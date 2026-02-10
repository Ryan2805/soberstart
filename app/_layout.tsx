// app/_layout.tsx
import { AppProvider, useApp } from "@/store/store";
import { Stack } from "expo-router";
import { useEffect } from "react";

function AppBootstrap() {
  const { actions } = useApp();

  useEffect(() => {
    actions.hydrateAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  );
}

export default function RootLayout() {
  return (
    <AppProvider>
      <AppBootstrap />
    </AppProvider>
  );
}
