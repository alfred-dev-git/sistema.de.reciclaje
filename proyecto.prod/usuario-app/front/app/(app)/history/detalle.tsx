// import { useLocalSearchParams, router } from "expo-router";
// import { useEffect, useState } from "react";
// import { View, Text, ActivityIndicator, Button, StyleSheet } from "react-native";
// import { getDetallePedido } from "@/services/api/requests";

// export default function DetallePedido() {
//   const { id } = useLocalSearchParams();
//   const [detalle, setDetalle] = useState<any>(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     if (id) {
//       getDetallePedido(Number(id)).then((data) => {
//         setDetalle(data);
//         setLoading(false);
//       });
//     }
//   }, [id]);

//   if (loading) return <ActivityIndicator style={{ marginTop: 40 }} />;

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Pedido #{detalle.pedido.idpedidos}</Text>
//       <Text>Fecha emisión: {detalle.pedido.fecha_emision}</Text>
//       <Text>Estado: {detalle.pedido.estado}</Text>
//       <Text>Tipo: {detalle.pedido.tipo_descripcion}</Text>

//       <Text style={styles.sub}>Detalle:</Text>
//       {detalle.detalles.map((d: any) => (
//         <View key={d.iddetalle_pedido}>
//           <Text>Fecha entrega: {d.fecha_entrega}</Text>
//           <Text>Bolsón: {d.cant_bolson}</Text>
//           <Text>Puntos: {d.total_puntos}</Text>
//         </View>
//       ))}
 
//       <Button title="Cerrar" onPress={() => router.back()} />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { padding: 20, backgroundColor: "#fff", flex: 1 },
//   title: { fontSize: 20, fontWeight: "bold", color: "#1f7a44", marginBottom: 10 },
//   sub: { marginTop: 10, fontWeight: "600" },
// });
