import { DefaultTheme, Stack, ThemeProvider } from "expo-router";
import * as SplashScreen from "expo-splash-screen";

import { AnimatedSplashOverlay } from "@/components/animated-icon";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const queryClient = new QueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider value={DefaultTheme}>
        <AnimatedSplashOverlay />
        <Stack screenOptions={{ headerTransparent: false }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="stores/[id]"
            options={{
              title: "Détail du magasin",
              headerBackButtonDisplayMode: "minimal",
            }}
          />
        </Stack>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
