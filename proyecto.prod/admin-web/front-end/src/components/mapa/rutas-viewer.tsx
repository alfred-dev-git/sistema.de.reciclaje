import React, { useEffect, useState } from "react";
import {
  GoogleMap,
  Marker,
  useJsApiLoader,
  DirectionsRenderer,
  DirectionsService, InfoWindow,
} from "@react-google-maps/api";
import {
  obtenerParadas,
  PedidoAsignado,
} from "../../api/services/paradas.service";
import {
  obtenerOpcionesAgrupamiento,
  agruparParadasPorCercania,
  RutaAgrupada,
} from "../mapa/agrupador-rutas";

const containerStyle = {
  width: "100%",
  height: "70vh",
};

const colores = [
  "red", "blue", "green", "orange", "purple",
  "pink", "yellow", "cyan", "magenta",
];

export default function RutasViewer() {
  const [paradas, setParadas] = useState<PedidoAsignado[]>([]);
  const [rutas, setRutas] = useState<RutaAgrupada[]>([]);
  const [opciones, setOpciones] = useState<number[]>([]);
  const [opcionSeleccionada, setOpcionSeleccionada] = useState<number | null>(null);
  const [rutaActiva, setRutaActiva] = useState<number | null>(null);
  const [puntoSeleccionado, setPuntoSeleccionado] = useState<PedidoAsignado | null>(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });

  useEffect(() => {
    async function cargarParadas() {
      try {
        const data = await obtenerParadas();
        setParadas(data);
        setOpciones(obtenerOpcionesAgrupamiento(data.length));
      } catch (err) {
        console.error("❌ Error cargando paradas:", err);
      }
    }
    cargarParadas();
  }, []);

  const handleSeleccion = (valor: number) => {
    setOpcionSeleccionada(valor);
    const agrupadas = agruparParadasPorCercania(paradas, valor);
    console.log("🧭 Agrupamiento generado:", agrupadas);
    setRutas(agrupadas);
    setRutaActiva(null); // reiniciar selección
  };

  const handleMostrarRuta = (id: number) => {
    setRutaActiva(id);
  };

  const center =
    paradas.length > 0
      ? { lat: Number(paradas[0].latitud), lng: Number(paradas[0].longitud) }
      : { lat: -27.362159, lng: -55.950874 };

  if (!isLoaded) return <p>Cargando mapa...</p>;

  return (
    <div className="p-4 flex flex-col gap-4">
      {paradas.length > 0 ? (
        <>
          <div>
            <h3 className="text-lg font-semibold">
              Total de paradas: {paradas.length}
            </h3>
            <label className="font-medium">Elegí cómo agrupar las rutas:</label>
            <select
              className="border p-2 rounded w-64 ml-2"
              onChange={(e) => handleSeleccion(Number(e.target.value))}
              value={opcionSeleccionada ?? ""}
            >
              <option value="">Seleccioná una opción</option>
              {opciones.map((n) => (
                <option key={n} value={n}>
                  {n} rutas → {Math.ceil(paradas.length / n)} paradas por ruta
                </option>
              ))}
            </select>
          </div>

          {rutas.length > 0 && (
            <div className="flex gap-2 flex-wrap mt-2">
              {rutas.map((r) => (
                <button
                  key={r.id}
                  onClick={() => handleMostrarRuta(r.id)}
                  className={`px-4 py-2 rounded text-white font-medium ${
                    rutaActiva === r.id ? "bg-blue-600" : "bg-gray-500 hover:bg-gray-600"
                  }`}
                >
                  Ruta {r.id}
                </button>
              ))}
            </div>
          )}

          <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={12}>
            {rutaActiva &&
              rutas
                .filter((r) => r.id === rutaActiva)
                .map((ruta, index) => (
                  <React.Fragment key={ruta.id}>
                    {ruta.paradas.map((p) => (
                <Marker
                  key={p.idpedidos}
                  position={{
                    lat: Number(p.latitud),
                    lng: Number(p.longitud),
                  }}
                  label={{
                    text: ruta.id.toString(),
                    color: "white",
                    fontWeight: "bold",
                  }}
                  onClick={() => setPuntoSeleccionado(p)}
                  icon={{
                    path: google.maps.SymbolPath.CIRCLE,
                    scale: 8,
                    fillColor: colores[(ruta.id - 1) % colores.length],
                    fillOpacity: 1,
                    strokeColor: "white",
                    strokeWeight: 2,
                  }}
                />
              ))}

              {/* Mostrar InfoWindow cuando haya un punto seleccionado */}
              {puntoSeleccionado && (
                <InfoWindow
                  position={{
                    lat: Number(puntoSeleccionado.latitud),
                    lng: Number(puntoSeleccionado.longitud),
                  }}
                  onCloseClick={() => setPuntoSeleccionado(null)}
                >
                  <div>
                    <strong>{puntoSeleccionado.calle} {puntoSeleccionado.numero}</strong>
                    <br />
                    ID pedido: {puntoSeleccionado.idpedidos}
                  </div>
                </InfoWindow>
              )}

                    {/* Calculamos el trazo solo cuando se selecciona la ruta */}
                    {ruta.paradas.length > 1 && !ruta.directions && (
                      <DirectionsService
                        options={{
                          origin: {
                            lat: Number(ruta.paradas[0].latitud),
                            lng: Number(ruta.paradas[0].longitud),
                          },
                          destination: {
                            lat: Number(ruta.paradas[ruta.paradas.length - 1].latitud),
                            lng: Number(ruta.paradas[ruta.paradas.length - 1].longitud),
                          },
                          waypoints: ruta.paradas.slice(1, -1).map((p) => ({
                            location: {
                              lat: Number(p.latitud),
                              lng: Number(p.longitud),
                            },
                            stopover: true,
                          })),
                          travelMode: google.maps.TravelMode.DRIVING,
                        }}
                        callback={(res, status) => {
                          if (status === "OK" && res) {
                            const nuevas = rutas.map((r) =>
                              r.id === ruta.id ? { ...r, directions: res } : r
                            );
                            setRutas(nuevas);
                          }
                        }}
                      />
                    )}

                    {ruta.directions && (
                      <DirectionsRenderer
                        options={{
                          directions: ruta.directions,
                          polylineOptions: {
                            strokeColor: colores[(ruta.id - 1) % colores.length],
                            strokeOpacity: 0.8,
                            strokeWeight: 4,
                          },
                          suppressMarkers: true,
                        }}
                      />
                    )}
                  </React.Fragment>
                ))}
          </GoogleMap>

          {rutas.length > 0 && (
            <div>
              <h4 className="font-semibold mt-4">Rutas generadas:</h4>
              {rutas.map((ruta) => (
                <div key={ruta.id} className="border p-2 rounded mb-2">
                  <h5 className="font-bold">Ruta {ruta.id}</h5>
                  <ul className="ml-4 list-disc">
                    {ruta.paradas.map((p) => (
                      <li key={p.idpedidos}>
                        {p.calle} {p.numero} ({p.latitud}, {p.longitud})
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <p>Cargando paradas...</p>
      )}
    </div>
  );
}
