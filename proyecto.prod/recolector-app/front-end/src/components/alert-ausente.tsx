import { Alert } from "react-native";
import { marcarUserAusente } from "../api/services/recoleccion-service";

export default async function AlertNoEstuvo(item: any, rutaSeleccionada: number, setRutas: Function) {
  Alert.alert(
    "Usuario no encontrado",
    "Usuario no encontrado en el domicilio, ¿Está seguro?",
    [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Aceptar",
        onPress: async () => {
          try {
            const response = await marcarUserAusente({
              idsolicitud_recoleccion: item.idsolicitud_recoleccion,
            });
            if (!response.success) {
              throw new Error(response.message);
            }

            Alert.alert("Éxito", response.message);

            // Actualizar estado local
            setRutas((prevRutas: any) =>
              prevRutas.map((ruta: any, idx: number) =>
                idx === rutaSeleccionada
                  ? {
                      ...ruta,
                      paradas: ruta.paradas.map((p: any) =>
                        p.idsolicitud_recoleccion === item.idsolicitud_recoleccion
                          ? { ...p, estado: "Ausente" }
                          : p
                      ),
                    }
                  : ruta
              )
            );
          } catch (error: any) {
            Alert.alert("Error", error.message || "No se pudo registrar ausencia");
          }
        },
      },
    ]
  );
}
