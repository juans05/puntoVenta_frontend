import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { baseUrl } from "../../../../utils/axios";

// Vista de la tienda: la usa tanto la ruta publica /tienda/:tenant como la vista previa del admin
// ("Mi tienda"), por eso recibe config/productos por props en vez de pedirlos siempre.
export const TiendaVista = ({ config, productos }: { config: any; productos: any[] }) => {
  const [busqueda, setBusqueda] = useState("");
  const [categoria, setCategoria] = useState("");
  const categorias = useMemo(() => Array.from(new Set(productos.map((p) => p.categoria).filter(Boolean))), [productos]);
  const visibles = productos.filter((p) =>
    (!categoria || p.categoria === categoria) && p.nombre.toLowerCase().includes(busqueda.toLowerCase()));

  const tema = { backgroundColor: config.colorFondo, color: config.colorTexto } as React.CSSProperties;
  const primario = config.colorPrimario;

  return (
    <div style={tema} className="min-h-full">
      <header style={{ backgroundColor: primario }} className="text-white">
        {config.bannerUrl && <img src={config.bannerUrl} alt="" className="w-full h-40 object-cover" />}
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-3">
          {config.logoUrl && <img src={config.logoUrl} alt="" className="h-12 w-12 rounded-full object-cover bg-white" />}
          <div>
            <h1 className="text-2xl font-bold">{config.titulo}</h1>
            {config.descripcion && <p className="text-sm opacity-90">{config.descripcion}</p>}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-5">
        <div className="flex flex-wrap gap-2 mb-4 items-center">
          <input className="border rounded-lg px-3 py-2 text-sm bg-white text-gray-900" placeholder="Buscar producto..."
            value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
          {["", ...categorias].map((c) => (
            <button key={c} onClick={() => setCategoria(c)} className="text-sm rounded-full px-3 py-1 border"
              style={categoria === c ? { backgroundColor: primario, color: "#fff", borderColor: primario } : { borderColor: primario }}>
              {c || "Todos"}
            </button>
          ))}
        </div>

        {visibles.length === 0 ? <p className="opacity-70">No hay productos para mostrar.</p> : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {visibles.map((p) => (
              <div key={p.id} className="rounded-xl border bg-white text-gray-900 overflow-hidden flex flex-col">
                {p.imagen
                  ? <img src={p.imagen} alt={p.nombre} className="h-36 w-full object-cover" />
                  : <div className="h-36 bg-gray-100" />}
                <div className="p-3 flex-1 flex flex-col">
                  <p className="font-semibold text-sm">{p.nombre}</p>
                  {p.marca && <p className="text-xs text-gray-500">{p.marca}</p>}
                  <p className="font-bold mt-1" style={{ color: primario }}>S/ {Number(p.precio).toFixed(2)}</p>
                  {p.agotado && <p className="text-xs text-red-500">Agotado</p>}
                  {config.whatsapp && !p.agotado && (
                    <a className="mt-2 text-center text-xs text-white rounded-lg py-1.5" style={{ backgroundColor: primario }}
                      target="_blank" rel="noreferrer"
                      href={`https://wa.me/${config.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(`Hola, me interesa: ${p.nombre}`)}`}>
                      Consultar
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

const TiendaPublica = () => {
  const { tenant } = useParams<{ tenant: string }>();
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    // axios plano, sin el interceptor de sesion de axiosInstance: es una ruta anonima.
    axios.get(`${baseUrl}/tienda/publica/${tenant}`).then((r) => setData(r.data)).catch(() => setError(true));
  }, [tenant]);

  if (error) return <p className="p-8 text-center text-gray-500">Esta tienda no está disponible.</p>;
  if (!data) return <p className="p-8 text-center text-gray-500">Cargando...</p>;
  return <TiendaVista config={data.config} productos={data.productos} />;
};

export default TiendaPublica;
