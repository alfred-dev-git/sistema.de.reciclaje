import { Text } from "react-native";

export function ErrorText({ children }: { children?: string }) {
  if (!children) return null;
  return <Text style={{ color: "#d33", marginBottom: 12 }}>{children}</Text>;
}
