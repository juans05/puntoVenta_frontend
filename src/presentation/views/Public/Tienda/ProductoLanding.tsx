import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import { baseUrl } from "../../../../utils/axios";

const galeriaDe = (p: any): string[] => {
  let extra: string[] = [];
  try { extra = JSON.parse(p.galeria || "[]"); } catch { /* galeria invalida: se ignora */ }
  return [p.imagen, ...extra].filter(Boolean);
};

// Datos que le sirven al comprador (no se exponen costos, margenes ni cuentas contables).
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

const wa = (config: any, texto: string) =>
  config.whatsapp ? `https://wa.me/${config.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(texto)}` : null;

// Landing publica de un producto: /tienda/:tenant/producto/:id. Es una vista del producto (no hay
// nada que "crear" por producto): existe mientras se venda y este disponible.
const ProductoLanding = () => {
  const { tenant, id } = useParams<{ tenant: string; id: string }>();
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState(false);
  const [foto, setFoto] = useState<string>();
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    setData(null);
    setError(false);
    // axios plano, sin el interceptor de sesion: es una ruta anonima.
    axios.get(`${baseUrl}/tienda/publica/${tenant}/producto/${id}`)
      .then((r) => {
        setData(r.data);
        setFoto(galeriaDe(r.data.producto)[0]);
        document.title = `${r.data.producto.nombre} | ${r.data.config.titulo}`;
      })
      .catch(() => setError(true));
  }, [tenant, id]);

  if (error) return (
    <div className="p-8 text-center text-gray-500">
      <p>Este producto no está disponible.</p>
      <Link to={`/tienda/${tenant}`} className="underline">Ver la tienda</Link>
    </div>
  );
  if (!data) return <p className="p-8 text-center text-gray-500">Cargando...</p>;

  const { config, producto: p, relacionados } = data;
  const primario = config.colorPrimario;
  const fotos = galeriaDe(p);
  const consultar = wa(config, `Hola, me interesa: ${p.nombre}`);
  const compartir = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch { /* sin permiso de portapapeles */ }
  };

  return (
    <div style={{ backgroundColor: config.colorFondo, color: config.colorTexto }} className="min-h-screen pb-20 md:pb-0">
      <header style={{ backgroundColor: primario }} className="text-white">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
          {config.logoUrl && <img src={config.logoUrl} alt="" className="h-9 w-9 rounded-full object-cover bg-white" />}
          <Link to={`/tienda/${tenant}`} className="font-bold">{config.titulo}</Link>
          <Link to={`/tienda/${tenant}`} className="ml-auto text-sm opacity-90">← Volver al catálogo</Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        <section className="grid md:grid-cols-2 gap-6">
          <div>
            {foto
              ? <img src={foto} alt={p.nombre} className="w-full rounded-2xl object-cover max-h-[28rem] bg-white" />
              : <div className="h-72 bg-gray-100 rounded-2xl" />}
            {fotos.length > 1 && (
              <div className="flex gap-2 mt-3 flex-wrap">
                {fotos.map((f) => (
                  <img key={f} src={f} alt="" loading="lazy" onClick={() => setFoto(f)}
                    className="h-16 w-16 object-cover rounded-lg cursor-pointer border-2"
                    style={{ borderColor: f === foto ? primario : "transparent" }} />
                ))}
              </div>
            )}
          </div>

          <div>
            {p.marca && <p className="text-sm opacity-70">{p.marca}</p>}
            <h1 className="text-3xl font-bold">{p.nombre}</h1>
            <p className="text-4xl font-extrabold mt-3" style={{ color: primario }}>S/ {Number(p.precio).toFixed(2)}</p>
            {!p.esServicio && p.stock != null && (
              <p className="text-sm mt-1 text-green-700">{p.stock <= 10 ? `¡Quedan solo ${p.stock} unidades!` : "Disponible"}</p>
            )}
            <div className="flex gap-2 mt-4">
              {consultar && (
                <a href={consultar} target="_blank" rel="noreferrer" style={{ backgroundColor: primario }}
                  className="flex-1 text-center text-white font-semibold rounded-xl py-3">Consultar por WhatsApp</a>
              )}
              <button type="button" onClick={compartir} className="border rounded-xl px-4 py-3 text-sm" style={{ borderColor: primario }}>
                {copiado ? "¡Copiado!" : "Compartir"}
              </button>
            </div>
            {p.descripcion && <p className="mt-5 whitespace-pre-line">{p.descripcion}</p>}
            {p.presentaciones?.length > 0 && (
              <div className="mt-5">
                <h2 className="font-semibold mb-1">Presentaciones</h2>
                {p.presentaciones.map((x: any) => (
                  <div key={x.nombre} className="flex justify-between border-b py-1.5 text-sm">
                    <span>{x.nombre}{x.unidad ? ` (${x.unidad}${x.factor > 1 ? ` x${x.factor}` : ""})` : ""}</span>
                    <b style={{ color: primario }}>S/ {Number(x.precioVenta).toFixed(2)}</b>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {p.videoUrl && (
          <section className="mt-8">
            <h2 className="text-xl font-bold mb-2">Míralo en acción</h2>
            <video src={p.videoUrl} controls preload="metadata" className="w-full max-w-3xl rounded-2xl" />
          </section>
        )}

        {ficha(p).length > 0 && (
          <section className="mt-8">
            <h2 className="text-xl font-bold mb-2">Ficha del producto</h2>
            <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-1 text-sm max-w-xl">
              {ficha(p).map(([k, v]) => (
                <div key={k} className="contents"><dt className="opacity-70">{k}</dt><dd>{v}</dd></div>
              ))}
            </dl>
          </section>
        )}

        {relacionados.length > 0 && (
          <section className="mt-10">
            <h2 className="text-xl font-bold mb-3">También te puede interesar</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {relacionados.map((r: any) => (
                <Link key={r.id} to={`/tienda/${tenant}/producto/${r.id}`} className="rounded-xl border bg-white text-gray-900 overflow-hidden">
                  {r.imagen
                    ? <img src={r.imagen} alt={r.nombre} loading="lazy" className="h-32 w-full object-cover" />
                    : <div className="h-32 bg-gray-100" />}
                  <div className="p-3">
                    <p className="text-sm font-semibold">{r.nombre}</p>
                    <p className="font-bold" style={{ color: primario }}>S/ {Number(r.precio).toFixed(2)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>

      {consultar && (
        <div className="md:hidden fixed bottom-0 inset-x-0 p-3 bg-white border-t flex items-center gap-3 z-40">
          <p className="font-bold flex-1" style={{ color: primario }}>S/ {Number(p.precio).toFixed(2)}</p>
          <a href={consultar} target="_blank" rel="noreferrer" style={{ backgroundColor: primario }}
            className="text-white font-semibold rounded-xl px-5 py-2.5">Consultar</a>
        </div>
      )}
    </div>
  );
};

export default ProductoLanding;
