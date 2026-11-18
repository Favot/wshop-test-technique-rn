import { Stack } from "expo-router";

export default function HomeLayout() {
  return (
    <Stack screenOptions={{ headerTransparent: false }}>
      <Stack.Screen name="index" options={{ title: "Magasins" }} />
      <Stack.Screen
        name="stores/[id]"
        options={{ title: "Détail du magasin" }}
      />
    </Stack>
  );
}
