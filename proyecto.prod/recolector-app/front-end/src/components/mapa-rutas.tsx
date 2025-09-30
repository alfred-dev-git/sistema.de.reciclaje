import React, { useRef } from "react";
import MapView, { Marker, Polyline } from "react-native-maps";
import { StyleSheet } from "react-native";
import { RutaCalculada } from "../api/services/paradas-service";
import Constants from "expo-constants";

interface MapaRutasProps {
  rutas: RutaCalculada[];
  rutaSeleccionada: number | null;
  onToggleEstado?: (paradaIndex: number) => void;
}

export default function MapaRutas({
  rutas,
  rutaSeleccionada,
  onToggleEstado,
}: MapaRutasProps) {
  const mapRef = useRef<MapView | null>(null);

  const { googleMapsApiKey } =
    Constants.expoConfig?.extra || Constants.manifest?.extra || {};

  if (
    rutaSeleccionada === null ||
    rutas.length === 0 ||
    rutaSeleccionada < 0 ||
    rutaSeleccionada >= rutas.length
  ) {
    return null;
  }

  const ruta = rutas[rutaSeleccionada];

  // Función para centrar en una parada
  const confirmarCompletado = (parada: any) => {
    mapRef.current?.animateToRegion({
      latitude: parada.latitude,
      longitude: parada.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    });
  };

  return (
    <MapView
      key={ruta.paradas.map((p) => p.estado).join("-")}
      ref={mapRef}
      style={styles.map}
      provider="google" // ✅ Forzar proveedor Google
      initialRegion={{
        latitude: -27.3623,
        longitude: -55.9009,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }}
    >
      {ruta.paradas.map((parada, index) => (
        <Marker
          key={index}
          coordinate={{
            latitude: parada.latitude,
            longitude: parada.longitude,
          }}
          title={`${parada.calle} ${parada.numero}`}
          onPress={() => {
            onToggleEstado?.(index);
            confirmarCompletado(parada);
          }}
          pinColor={
            parada.estado === 1
              ? "green"
              : parada.estado === 2
              ? "orange"
              : "red"
          }
        />
      ))}

      <Polyline
        coordinates={ruta.coordenadas}
        strokeColor="blue"
        strokeWidth={4}
      />
    </MapView>
  );
}

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
});