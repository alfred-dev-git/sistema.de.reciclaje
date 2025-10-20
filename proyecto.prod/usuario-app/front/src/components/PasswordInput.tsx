import { useState, forwardRef } from "react";
import { View, TextInput, Text, Pressable, StyleSheet, TextInputProps } from "react-native";

type Props = TextInputProps & { label?: string; error?: string; };

export const PasswordInput = forwardRef<TextInput, Props>(({ label, error, style, ...rest }, ref) => {
  const [visible, setVisible] = useState(false);

  return (
    <View style={styles.wrapper}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={styles.row}>
        <TextInput
          ref={ref}
          secureTextEntry={!visible}
          style={[styles.input, error ? styles.inputError : null, style, { flex: 1 }]}
          placeholderTextColor="#999"
          {...rest}
        />
        <Pressable onPress={() => setVisible(v => !v)} style={styles.toggle}>
          <Text style={{ fontWeight: "600" }}>{visible ? "Ocultar" : "Ver"}</Text>
        </Pressable>
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
});

const styles = StyleSheet.create({
  wrapper: { width: "100%", marginBottom: 12 },
  label: { marginBottom: 6, fontSize: 14, color: "#333" },
  row: { flexDirection: "row", alignItems: "center" },
  input: {
    borderWidth: 1, borderColor: "#ccc", borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 12, fontSize: 16, backgroundColor: "#fff",
  },
  inputError: { borderColor: "#d33" },
  toggle: { marginLeft: 8, paddingHorizontal: 10, paddingVertical: 8, borderRadius: 8, backgroundColor: "#eee" },
  error: { marginTop: 6, color: "#d33", fontSize: 13 },
});
