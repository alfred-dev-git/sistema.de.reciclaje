// src/components/rutas/rutas-map.tsx
import React, { useCallback } from "react";
import {
  GoogleMap,
  Marker,
  InfoWindow,
  Polyline,
} from "@react-google-maps/api";
import { PedidoAsignado } from "../../api/services/paradas.service";
import { RutaAgrupada } from "../mapa/agrupador-rutas";
import { useGoogleMapsLoader } from "./use-google-maps-loader";
import { TipoReciclable } from "../../api/services/reciclables.service";

interface RutasMapProps {
  rutas: RutaAgrupada[];
  rutaActiva: number | null;
  puntoSeleccionado: PedidoAsignado | null;
  setPuntoSeleccionado: (punto: PedidoAsignado | null) => void;
  tiposReciclable: TipoReciclable[];
  center: { lat: number; lng: number };
}

const containerStyle = {
  width: "100%",
  height: "70vh",
};

const colores = [
  "red",
  "blue",
  "green",
  "orange",
  "purple",
  "pink",
  "yellow",
  "cyan",
  "magenta",
];

export default function RutasMap({
  rutas,
  rutaActiva,
  puntoSeleccionado,
  setPuntoSeleccionado,
  tiposReciclable,
  center,
}: RutasMapProps) {
  const { isLoaded } = useGoogleMapsLoader();

  const handleMapClick = useCallback(() => {
    setPuntoSeleccionado(null);
  }, [setPuntoSeleccionado]);

  if (!isLoaded) {
    return <p>Cargando mapa...</p>;
  }
  let descripcionReciclable = null;

if (rutaActiva) {
  const ruta = rutas.find(r => r.id === rutaActiva);

  if (ruta && ruta.paradas.length > 0) {
    const idTipo = ruta.paradas[0].tipo_reciclable_idtipo_reciclable;

    const tipo = tiposReciclable.find(t => t.idtipo_reciclable === idTipo);

    descripcionReciclable = tipo?.descripcion ?? "No especificado";
  }
}
  return (
    <div style={{
      position: "relative",
      borderRadius: "12px",
      overflow: "hidden",
      boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
    }}>
      {rutaActiva && (
      <div
        style={{
          position: "absolute",
          top: "8px",
          left: "8px",
          background: "#2e703ed8",
          color: "white",
          padding: "8px 12px",
          borderRadius: "8px",
          zIndex: 10
        }}
      >
        <div><b>Ruta {rutaActiva}</b></div>
        {descripcionReciclable && (
          <div>Reciclable: {descripcionReciclable}</div>
        )}
      </div>

      )
      }

      <GoogleMap
        key={rutaActiva ?? 0}
        mapContainerStyle={containerStyle}
        center={center}
        zoom={12}
        options={{ gestureHandling: "greedy" }}
        onClick={handleMapClick}
      >
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
    </div >
  );
}
