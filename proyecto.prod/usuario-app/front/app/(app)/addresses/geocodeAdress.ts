// utils/geocodeAddress.ts
export interface GeocodeParams {
  calle: string;
  numero: string | number;
  barrio?: string | null;
  ciudad?: string | null;
  provincia?: string | null;
  pais?: string | null;
}

export async function geocodeAddress({
  calle,
  numero,
  barrio,
  ciudad,
  provincia,
  pais,
}: GeocodeParams): Promise<{ lat: number | null; lng: number | null }> {
  try {
    const apiKey =
      process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ||
      // @ts-ignore Expo fallback
      ((global as any).__expo?.manifest?.extra?.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY as string);

    if (!apiKey) {
      console.warn("Google API KEY missing!");
      return { lat: null, lng: null };
    }

    // Construcción progresiva de dirección
    const parts = [
      `${calle} ${numero}`,
      barrio || "",
      ciudad || "",
      provincia || "",
      pais || "",
    ];

    // Crea una cadena limpia sin dobles espacios ni comas redundantes
    const address = parts
      .map((x) => x?.trim())
      .filter(Boolean)
      .join(", ");

    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
      address
    )}&key=${apiKey}`;

    const res = await fetch(url);
    const data = await res.json();

    if (data.status !== "OK" || !data.results?.length) {
      console.warn("Geocode no encontró resultados:", data.status);
      return { lat: null, lng: null };
    }

    const { lat, lng } = data.results[0].geometry.location;

    return { lat: lat ?? null, lng: lng ?? null };
  } catch (err) {
    console.warn("Error en geocodeAddress:", err);
    return { lat: null, lng: null };
  }
}
