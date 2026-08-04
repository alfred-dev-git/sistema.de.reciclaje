import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type Props = {
  pagina: number;
  totalPaginas: number;
  onChange: (pagina: number) => void;
};

export default function Paginacion({ pagina, totalPaginas, onChange }: Props) {
  if (totalPaginas <= 1) return null;

  const paginas = Array.from({ length: totalPaginas }, (_, index) => index + 1);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        disabled={pagina === 1}
        onPress={() => onChange(pagina - 1)}
        style={[styles.button, pagina === 1 && styles.disabled]}
      >
        <Text style={styles.text}>{"<"}</Text>
      </TouchableOpacity>

      {paginas.map((numero) => (
        <TouchableOpacity
          key={numero}
          onPress={() => onChange(numero)}
          style={[styles.button, numero === pagina && styles.active]}
        >
          <Text style={[styles.text, numero === pagina && styles.activeText]}>
            {numero}
          </Text>
        </TouchableOpacity>
      ))}

      <TouchableOpacity
        disabled={pagina === totalPaginas}
        onPress={() => onChange(pagina + 1)}
        style={[styles.button, pagina === totalPaginas && styles.disabled]}
      >
        <Text style={styles.text}>{">"}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 6,
    marginVertical: 14,
    paddingHorizontal: 16,
  },
  button: {
    minWidth: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#eef4ec",
    alignItems: "center",
    justifyContent: "center",
  },
  active: { backgroundColor: "#307043" },
  disabled: { opacity: 0.35 },
  text: { color: "#307043", fontWeight: "700" },
  activeText: { color: "#fff" },
});
