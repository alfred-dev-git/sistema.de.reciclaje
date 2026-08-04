import { Pressable, Text, StyleSheet, ActivityIndicator, ViewStyle } from "react-native";

type Props = {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
};

export function Button({ title, onPress, disabled, loading, style }: Props) {
  const isDisabled = disabled || loading;
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.btn,
        pressed && { opacity: 0.9 },
        isDisabled && { opacity: 0.6 },
        style,
      ]}
      disabled={isDisabled}
    >
      {loading ? <ActivityIndicator /> : <Text style={styles.text}>{title}</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    backgroundColor: '#2e7040',
    padding: 15,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 10,

  },
  text: { color: "#fff", fontSize: 16, fontWeight: "700" },
});