import React, { useCallback } from "react";
import { GoogleMap, Marker, InfoWindow, Polyline } from "@react-google-maps/api";
import { PedidoAsignado } from "../../api/services/paradas.service";
import { RutaAgrupada } from "../mapa/agrupador-rutas";

interface RutasMapProps {
  rutas: RutaAgrupada[];
  rutaActiva: number | null;
  puntoSeleccionado: PedidoAsignado | null;
  setPuntoSeleccionado: (punto: PedidoAsignado | null) => void;
  center: { lat: number; lng: number };
}

const containerStyle = {
  width: "100%",
  height: "70vh",
};

const colores = [
  "red", "blue", "green", "orange", "purple",
  "pink", "yellow", "cyan", "magenta",
];

export default function RutasMap({
  rutas,
  rutaActiva,
  puntoSeleccionado,
  setPuntoSeleccionado,
  center,
}: RutasMapProps) {
  // 🔹 Limpiar selección al hacer click en el mapa vacío
  const handleMapClick = useCallback(() => {
    setPuntoSeleccionado(null);
  }, [setPuntoSeleccionado]);

  return (
    <div className="relative">
      {rutaActiva && (
        <div className="absolute top-2 left-2 bg-blue-600 text-white px-4 py-2 rounded shadow-md z-10">
          Ruta {rutaActiva} seleccionada
        </div>
      )}

      <GoogleMap
        key={rutaActiva ?? 0} // 🔹 fuerza a re-montar el mapa al cambiar de ruta
        mapContainerStyle={containerStyle}
        center={center}
        zoom={12}
        options={{ gestureHandling: "greedy" }}
        onClick={handleMapClick}
      >
        {/* 🔸 Marcadores de la ruta activa */}
        {rutaActiva &&
          rutas
            .filter((r) => r.id === rutaActiva)
            .flatMap((ruta) =>
              ruta.paradas.map((p) => {
                const duplicados = ruta.paradas.filter(
                  (o) =>
                    Number(o.latitud) === Number(p.latitud) &&
                    Number(o.longitud) === Number(p.longitud)
                );

                let lat = Number(p.latitud);
                let lng = Number(p.longitud);

                if (duplicados.length > 1) {
                  const pos = duplicados.findIndex(
                    (o) => o.idpedidos === p.idpedidos
                  );
                  const offset = 0.00005;
                  const angle =
                    (pos * 360) / duplicados.length * (Math.PI / 180);
                  lat += offset * Math.cos(angle);
                  lng += offset * Math.sin(angle);
                }

                const color = colores[(ruta.id - 1) % colores.length];

                return (
                  <Marker
                    key={p.idpedidos}
                    position={{ lat, lng }}
                    onClick={() => setPuntoSeleccionado(p)}
                    icon={{
                      url: `http://maps.google.com/mapfiles/ms/icons/${color}-dot.png`,
                      scaledSize: new google.maps.Size(40, 40),
                    }}
                  />
                );
              })
            )}

        {/* 🔹 Línea de la ruta activa */}
        {rutaActiva &&
          rutas
            .filter((r) => r.id === rutaActiva)
            .map((ruta) => (
              <Polyline
                key={ruta.id}
                path={ruta.paradas.map((p) => ({
                  lat: Number(p.latitud),
                  lng: Number(p.longitud),
                }))}
                options={{
                  strokeColor: colores[(ruta.id - 1) % colores.length],
                  strokeOpacity: 1,
                  strokeWeight: 4,
                }}
              />
            ))}

        {/* InfoWindow (tooltip del punto seleccionado) */}
        {puntoSeleccionado && (
          <InfoWindow
            position={{
              lat: Number(puntoSeleccionado.latitud),
              lng: Number(puntoSeleccionado.longitud),
            }}
            onCloseClick={() => setPuntoSeleccionado(null)}
            options={{ pixelOffset: new google.maps.Size(0, -10) }}
          >
            <div style={{ lineHeight: "1.4" }}>
              <strong>
                {puntoSeleccionado.nombre} {puntoSeleccionado.apellido}
              </strong>
              <br />
              {puntoSeleccionado.calle} {puntoSeleccionado.numero}
              <br />
              <b>N° Bolson:</b> {puntoSeleccionado.idusuario}
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  );
}
