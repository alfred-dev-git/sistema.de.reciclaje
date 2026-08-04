import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { Ionicons } from "@expo/vector-icons";
import BackgorundContainer from "../../components/layout";
import HeaderRecolector from "../../components/headerComponent";
import Paginacion from "../../components/paginacion";
import { getHistorialCompleto } from "../../api/services/historial-service";

const meses = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

const fechaCorta = (valor: string) => {
  const fecha = new Date(valor);
  return Number.isNaN(fecha.getTime()) ? "Fecha no disponible" : fecha.toLocaleDateString("es-AR");
};

export default function HistorialRecoleccionesScreen() {
  const [items, setItems] = useState<any[]>([]);
  const [pagina, setPagina] = useState(1);
  const [total, setTotal] = useState(0);
  const [mes, setMes] = useState(0);
  const [anio, setAnio] = useState(0);
  const [tipo, setTipo] = useState("");
  const [anios, setAnios] = useState<number[]>([]);
  const [tipos, setTipos] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const cargar = useCallback(async (esRefresh = false) => {
    esRefresh ? setRefreshing(true) : setLoading(true);
    setError("");
    const respuesta = await getHistorialCompleto({
      pagina,
      mes: mes || undefined,
      anio: anio || undefined,
      tipo: tipo || undefined,
    });

    if (respuesta.success && respuesta.data) {
      setItems(respuesta.data.items ?? []);
      setTotal(Number(respuesta.data.total ?? 0));
      setAnios(respuesta.data.anios ?? []);
      setTipos(respuesta.data.tipos ?? []);
    } else {
      setItems([]);
      setTotal(0);
      setError(respuesta.message);
    }
    setLoading(false);
    setRefreshing(false);
  }, [pagina, mes, anio, tipo]);

  useEffect(() => { cargar(); }, [cargar]);

  const cambiarFiltro = (setter: (valor: any) => void, valor: any) => {
    setter(valor);
    setPagina(1);
  };

  return (
    <BackgorundContainer>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => cargar(true)} />}
      >
        <HeaderRecolector />
        <View style={styles.container}>
          <Text style={styles.title}>Historial de recolecciones</Text>
          <Text style={styles.subtitle}>Consultá todas tus recolecciones realizadas.</Text>

          <View style={styles.filtersCard}>
            <Text style={styles.filtersTitle}>Filtrar resultados</Text>
            <View style={styles.pickerBox}>
              <Picker selectedValue={mes} onValueChange={(value) => cambiarFiltro(setMes, Number(value))}>
                <Picker.Item label="Todos los meses" value={0} />
                {meses.map((nombre, index) => <Picker.Item key={nombre} label={nombre} value={index + 1} />)}
              </Picker>
            </View>
            <View style={styles.pickerBox}>
              <Picker selectedValue={anio} onValueChange={(value) => cambiarFiltro(setAnio, Number(value))}>
                <Picker.Item label="Todos los años" value={0} />
                {anios.map((valor) => <Picker.Item key={valor} label={String(valor)} value={valor} />)}
              </Picker>
            </View>
            <View style={styles.pickerBox}>
              <Picker selectedValue={tipo} onValueChange={(value) => cambiarFiltro(setTipo, String(value))}>
                <Picker.Item label="Todos los reciclables" value="" />
                {tipos.map((valor) => <Picker.Item key={valor} label={valor} value={valor} />)}
              </Picker>
            </View>
          </View>

          {loading ? (
            <ActivityIndicator size="large" color="#307043" style={styles.loading} />
          ) : error ? (
            <View style={styles.emptyCard}><Text style={styles.error}>{error}</Text></View>
          ) : items.length === 0 ? (
            <View style={styles.emptyCard}>
              <Ionicons name="search-outline" size={34} color="#307043" />
              <Text style={styles.emptyTitle}>No existen recolecciones</Text>
              <Text style={styles.emptyText}>No encontramos resultados para los filtros seleccionados.</Text>
            </View>
          ) : (
            items.map((item) => (
              <View key={item.idsolicitud_recoleccion} style={styles.card}>
                <View style={styles.cardIcon}>
                  <Ionicons name="leaf" size={24} color="#307043" />
                </View>
                <View style={styles.cardContent}>
                  <Text style={styles.cardTitle}>{item.tipo_reciclable}</Text>
                  <Text style={styles.cardText}>{item.calle} {item.numero}</Text>
                  <Text style={styles.cardText}>{fechaCorta(item.fecha_entrega)} · Ruta #{item.id_ruta}</Text>
                  <Text style={styles.detail}>{item.cant_bolson} bolsones · {item.estado}</Text>
                  {!!item.observaciones && <Text style={styles.observation}>{item.observaciones}</Text>}
                </View>
              </View>
            ))
          )}

          <Paginacion pagina={pagina} totalPaginas={Math.ceil(total / 8)} onChange={setPagina} />
        </View>
      </ScrollView>
    </BackgorundContainer>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 30 },
  title: { fontSize: 24, fontWeight: "800", color: "#173d25", textAlign: "center" },
  subtitle: { color: "#5c6d62", textAlign: "center", marginTop: 4, marginBottom: 16 },
  filtersCard: { backgroundColor: "#edf5eb", padding: 14, borderRadius: 18, marginBottom: 16 },
  filtersTitle: { color: "#234f31", fontWeight: "700", marginBottom: 8 },
  pickerBox: { backgroundColor: "#fff", borderRadius: 12, marginTop: 8, overflow: "hidden" },
  loading: { marginVertical: 40 },
  card: { flexDirection: "row", backgroundColor: "#fff", padding: 15, borderRadius: 18, marginBottom: 10, elevation: 2 },
  cardIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: "#edf5eb", alignItems: "center", justifyContent: "center" },
  cardContent: { flex: 1, marginLeft: 12 },
  cardTitle: { color: "#234f31", fontSize: 16, fontWeight: "800" },
  cardText: { color: "#46544b", marginTop: 3 },
  detail: { color: "#307043", fontWeight: "700", marginTop: 5 },
  observation: { color: "#68756c", fontStyle: "italic", marginTop: 4 },
  emptyCard: { backgroundColor: "#f4f8f1", borderWidth: 1, borderColor: "#d7e7d5", padding: 24, borderRadius: 18, alignItems: "center" },
  emptyTitle: { color: "#234f31", fontSize: 17, fontWeight: "700", marginTop: 8 },
  emptyText: { color: "#52645a", textAlign: "center", marginTop: 4 },
  error: { color: "#a52929", textAlign: "center" },
});
