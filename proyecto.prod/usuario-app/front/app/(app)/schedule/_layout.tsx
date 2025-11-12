// app/(app)/schedule/_layout.tsx
import { Stack } from "expo-router";

export default function ScheduleLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="cronograma" options={{ title: "Cronograma" }} />
    </Stack>
  );
}
