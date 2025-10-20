import { useEffect, useRef, useState } from "react";
import { View, StyleSheet, Platform, Pressable, Text } from "react-native";
import MapView, { Marker, MapPressEvent, Region } from "react-native-maps";
import * as Location from "expo-location";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";

type Props = {
  initialLat?: number;
  initialLng?: number;
  onChange: (data: {
    lat: number;
    lng: number;
    calle?: string | null;
    numero?: string | null;
    barrio?: string | null;
    formattedAddress?: string | null;
  }) => void;
};

const API_KEY =
  (process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY as string) ||
  // fallback si tu entorno no expone process.env en runtime
  // @ts-ignore
  ((global as any).__expo?.manifest?.extra?.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY as string) ||
  "";

/** Reverse geocoding local (sin Google billing extra) */
async function reverseGeocode(lat: number, lng: number) {
  try {
    const arr = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
    const g = arr?.[0];
    if (!g) return { calle: null, numero: null, barrio: null, formattedAddress: null };

    const calle = g.street ?? null;
    const numero =
      (g as any).streetNumber ??
      (g.name && /^\d+$/.test(String(g.name)) ? String(g.name) : null);
    const barrio = (g.subregion || g.district || g.suburb || g.city || g.region) ?? null;
    const formattedAddress = [g.street, g.name, g.postalCode, g.city].filter(Boolean).join(" ");

    return { calle, numero, barrio, formattedAddress };
  } catch {
    return { calle: null, numero: null, barrio: null, formattedAddress: null };
  }
}

export default function MapAddressPicker({ initialLat, initialLng, onChange }: Props) {
  const mapRef = useRef<MapView | null>(null);

  // Guardamos región para controlar el mapa (y poder mantener el zoom)
  const [region, setRegion] = useState<Region>({
    latitude: initialLat ?? -31.4167, // Córdoba, AR
    longitude: initialLng ?? -64.1833,
    latitudeDelta: 0.015,
    longitudeDelta: 0.015,
  });

  const [marker, setMarker] = useState<{ lat: number; lng: number }>({
    lat: region.latitude,
    lng: region.longitude,
  });

  // Mantener zoom actual: actualizamos deltas cuando el usuario hace zoom/pan
  const onRegionChangeComplete = (r: Region) => {
    setRegion((prev) => ({
      ...prev,
      latitude: r.latitude,
      longitude: r.longitude,
      latitudeDelta: r.latitudeDelta,
      longitudeDelta: r.longitudeDelta,
    }));
  };

  // Init: centrarme si no hay coords iniciales
  useEffect(() => {
    (async () => {
      try {
        if (initialLat == null || initialLng == null) {
          const { status } = await Location.requestForegroundPermissionsAsync();
          if (status === "granted") {
            const loc = await Location.getCurrentPositionAsync({});
            const { latitude, longitude } = loc.coords;

            // NO tocamos deltas -> preserva zoom
            setRegion((prev) => ({ ...prev, latitude, longitude }));
            setMarker({ lat: latitude, lng: longitude });
            const extra = await reverseGeocode(latitude, longitude);
            onChange({ lat: latitude, lng: longitude, ...extra });

            // Animamos sin cambiar zoom
            const cam = await mapRef.current?.getCamera?.();
            if (cam) {
              cam.center = { latitude, longitude };
              mapRef.current?.animateCamera(cam, { duration: 300 });
            } else {
              mapRef.current?.animateToRegion({ ...region, latitude, longitude }, 300);
            }
          } else {
            onChange({ lat: region.latitude, lng: region.longitude });
          }
        } else {
          const extra = await reverseGeocode(initialLat, initialLng);
          onChange({ lat: initialLat, lng: initialLng, ...extra });
        }
      } catch {
        onChange({ lat: region.latitude, lng: region.longitude });
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    })();
  }, []);

  const animateTo = async (lat: number, lng: number) => {
    setMarker({ lat, lng });
    setRegion((prev) => ({ ...prev, latitude: lat, longitude: lng }));

    // Usamos animateCamera para NO tocar zoom
    const cam = await mapRef.current?.getCamera?.();
    if (cam) {
      cam.center = { latitude: lat, longitude: lng };
      mapRef.current?.animateCamera(cam, { duration: 250 });
    } else {
      mapRef.current?.animateToRegion({ ...region, latitude: lat, longitude: lng }, 250);
    }

    const extra = await reverseGeocode(lat, lng);
    onChange({ lat, lng, ...extra });
  };

  const onMapPress = (e: MapPressEvent) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    animateTo(latitude, longitude);
  };

  const centerOnMe = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;
      const loc = await Location.getCurrentPositionAsync({});
      animateTo(loc.coords.latitude, loc.coords.longitude);
    } catch {
      // noop
    }
  };

  return (
    <View style={styles.wrap}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        provider={Platform.OS === "android" ? "google" : undefined}
        initialRegion={region}
        region={region}
        onRegionChangeComplete={onRegionChangeComplete}
        onPress={onMapPress}
        showsUserLocation
        showsMyLocationButton
      >
        <Marker
          coordinate={{ latitude: marker.lat, longitude: marker.lng }}
          draggable
          onDragEnd={(e) => {
            const { latitude, longitude } = e.nativeEvent.coordinate;
            animateTo(latitude, longitude);
          }}
        />
      </MapView>

      {/* Buscador arriba */}
      {API_KEY ? (
        <View style={styles.searchBox}>
          <GooglePlacesAutocomplete
            placeholder="Buscar dirección"
            minLength={2}
            fetchDetails
            debounce={300}
            enablePoweredByContainer={false}
            keepResultsAfterBlur={false}
            query={{
              key: API_KEY,
              language: "es",
              // components: "country:ar", // descomentá si querés limitar a AR
            }}
            onPress={async (data, details) => {
              const lat = details?.geometry?.location?.lat;
              const lng = details?.geometry?.location?.lng;
              if (typeof lat === "number" && typeof lng === "number") {
                const comps = details?.address_components ?? [];
                const get = (type: string) =>
                  comps.find((c: any) => (c.types || []).includes(type))?.long_name ?? null;

                const street = get("route");
                const streetNumber = get("street_number");
                const neighborhood = get("sublocality") || get("neighborhood") || null;

                setMarker({ lat, lng });
                setRegion((prev) => ({ ...prev, latitude: lat, longitude: lng }));

                const cam = await mapRef.current?.getCamera?.();
                if (cam) {
                  cam.center = { latitude: lat, longitude: lng };
                  mapRef.current?.animateCamera(cam, { duration: 250 });
                } else {
                  mapRef.current?.animateToRegion({ ...region, latitude: lat, longitude: lng }, 250);
                }

                onChange({
                  lat,
                  lng,
                  calle: street,
                  numero: streetNumber,
                  barrio: neighborhood,
                  formattedAddress: details?.formatted_address ?? data?.description ?? null,
                });
              }
            }}
            onFail={(e) => console.warn("Places onFail:", e?.message ?? e)}
            textInputProps={{ placeholderTextColor: "#666", autoCapitalize: "none", autoCorrect: false }}
            styles={{ textInput: styles.input, container: styles.autoContainer, listView: styles.list }}
          />
        </View>
      ) : null}

      {/* FAB “centrar en mí” (útil también en iOS) */}
      <Pressable style={styles.fab} onPress={centerOnMe}>
        <Text style={styles.fabTxt}>◎</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { height: 320, borderRadius: 10, overflow: "hidden", backgroundColor: "#eee" },
  searchBox: { position: "absolute", top: 8, left: 8, right: 8 },
  autoContainer: { flex: 0 },
  input: {
    backgroundColor: "#fff",
    height: 44,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  list: { backgroundColor: "#fff" },
  fab: {
    position: "absolute",
    right: 10,
    bottom: 10,
    backgroundColor: "#fff",
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  fabTxt: { fontSize: 18, fontWeight: "700" },
});
