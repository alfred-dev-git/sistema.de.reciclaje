//use-google-maps-loader.ts
import { useJsApiLoader } from "@react-google-maps/api";

export const useGoogleMapsLoader = () => {
  return useJsApiLoader({
    id: "google-map-script", // mantener siempre igual
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string,
    libraries: ["places"], // o ["geometry"] si usás direcciones o distancias
    version: "weekly",
  });
};
