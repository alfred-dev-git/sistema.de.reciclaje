import { forwardRef } from "react";
import { TextInput, TextInputProps, View, Text, StyleSheet } from "react-native";

type Props = TextInputProps & {
  label?: string;
  error?: string;
};

export const Input = forwardRef<TextInput, Props>(({ label, error, style, ...rest }, ref) => {
  return (
    <View style={styles.wrapper}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        ref={ref}
        style={[styles.input, error ? styles.inputError : null, style]}
        placeholderTextColor="#999"
        {...rest}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
});

const styles = StyleSheet.create({
  wrapper: { width: "100%", marginBottom: 12 },
  label: { marginBottom: 6, fontSize: 14, color: "#333" },
  input: {
    borderWidth: 1, borderColor: "#ccc", borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 12, fontSize: 16, backgroundColor: "#fff",
  },
  inputError: { borderColor: "#d33" },
  error: { marginTop: 6, color: "#d33", fontSize: 13 },
});
