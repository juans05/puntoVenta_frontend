import { Fragment, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { baseUrl } from "../../../../utils/axios";

// Vista de la tienda: la usa tanto la ruta publica /tienda/:tenant como la vista previa del admin
// ("Mi tienda"), por eso recibe config/productos por props en vez de pedirlos siempre.
export const TiendaVista = ({ config, productos }: { config: any; productos: any[] }) => {
  const [busqueda, setBusqueda] = useState("");
  const [categoria, setCategoria] = useState("");
  const [detalle, setDetalle] = useState<any>(null);
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
                <button type="button" onClick={() => setDetalle(p)} className="text-left">
                  {p.imagen
                    ? <img src={p.imagen} alt={p.nombre} className="h-36 w-full object-cover" />
                    : <div className="h-36 bg-gray-100" />}
                </button>
                <div className="p-3 flex-1 flex flex-col">
                  <button type="button" onClick={() => setDetalle(p)} className="font-semibold text-sm text-left">{p.nombre}</button>
                  {p.videoUrl && <p className="text-[11px] text-gray-500">▶ Con video</p>}
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
      {detalle && <DetalleProducto p={detalle} config={config} onClose={() => setDetalle(null)} />}
    </div>
  );
};

const galeriaDe = (p: any): string[] => {
  let extra: string[] = [];
  try { extra = JSON.parse(p.galeria || "[]"); } catch { /* galeria invalida: se ignora */ }
  return [p.imagen, ...extra].filter(Boolean);
};

// Datos del producto que le sirven al comprador (no se exponen costos, margenes ni cuentas contables).
const ficha = (p: any): [string, string][] => ([
  ["Tipo", p.esServicio ? "Servicio" : "Producto"],
  ["Categoría", p.categoria],
  ["Grupo", p.grupo],
  ["Marca", p.marca],
  ["Código", p.codigo],
  ["Código de barras", p.codigoBarra],
  ["Unidad de medida", p.unidadMedida],
  ["Peso", p.pesoKg ? `${p.pesoKg} kg` : ""],
  ["Impuesto", p.tipoIgv],
  ["ICBPER", p.icbper ? "Aplica" : ""],
  ["Edad mínima", p.restriccionEdad > 0 ? `${p.restriccionEdad} años` : ""],
] as [string, string][]).filter(([, v]) => v);

// Detalle del producto: fotos (principal + galeria) y video, mas el mismo boton de WhatsApp.
const DetalleProducto = ({ p, config, onClose }: { p: any; config: any; onClose: () => void }) => {
  const fotos = galeriaDe(p);
  const [foto, setFoto] = useState(fotos[0]);
  const primario = config.colorPrimario;
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white text-gray-900 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-start p-4">
          <div>
            <h2 className="text-xl font-bold">{p.nombre}</h2>
            {p.marca && <p className="text-sm text-gray-500">{p.marca}</p>}
          </div>
          <button type="button" onClick={onClose} className="text-2xl leading-none text-gray-500">×</button>
        </div>
        <div className="px-4 pb-4 grid md:grid-cols-2 gap-4">
          <div>
            {foto ? <img src={foto} alt={p.nombre} className="w-full rounded-xl object-cover max-h-80" /> : <div className="h-60 bg-gray-100 rounded-xl" />}
            {fotos.length > 1 && (
              <div className="flex gap-2 mt-2 flex-wrap">
                {fotos.map((f) => (
                  <img key={f} src={f} alt="" onClick={() => setFoto(f)} className="h-14 w-14 object-cover rounded-lg cursor-pointer border-2"
                    style={{ borderColor: f === foto ? primario : "transparent" }} />
                ))}
              </div>
            )}
          </div>
          <div>
            <p className="text-2xl font-bold" style={{ color: primario }}>S/ {Number(p.precio).toFixed(2)}</p>
            {p.agotado
              ? <p className="text-sm text-red-500">Agotado</p>
              : !p.esServicio && p.stock != null && <p className="text-sm text-green-700">{p.stock <= 10 ? `Quedan ${p.stock} unidades` : "Disponible"}</p>}
            {p.descripcion && <p className="text-sm mt-2 whitespace-pre-line">{p.descripcion}</p>}
            {p.presentaciones?.length > 0 && (
              <div className="mt-3">
                <p className="text-xs font-semibold text-gray-500 mb-1">Presentaciones</p>
                {p.presentaciones.map((x: any) => (
                  <div key={x.nombre} className="flex justify-between text-sm border-b py-1">
                    <span>{x.nombre}{x.unidad ? ` (${x.unidad}${x.factor > 1 ? ` x${x.factor}` : ""})` : ""}</span>
                    <b style={{ color: primario }}>S/ {Number(x.precioVenta).toFixed(2)}</b>
                  </div>
                ))}
              </div>
            )}
            <dl className="mt-3 text-sm grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
              {ficha(p).map(([k, v]) => (<Fragment key={k}><dt className="text-gray-500">{k}</dt><dd>{v}</dd></Fragment>))}
            </dl>
            {p.videoUrl && <video src={p.videoUrl} controls preload="metadata" className="w-full rounded-xl mt-3" />}
            {config.whatsapp && !p.agotado && (
              <a className="mt-3 block text-center text-sm text-white rounded-lg py-2" style={{ backgroundColor: primario }} target="_blank" rel="noreferrer"
                href={`https://wa.me/${config.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(`Hola, me interesa: ${p.nombre}`)}`}>
                Consultar por WhatsApp
              </a>
            )}
          </div>
        </div>
      </div>
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
