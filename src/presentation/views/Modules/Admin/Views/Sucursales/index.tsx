import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Modal from "react-modal";
import { toast } from "sonner";
import axiosInstance from "../../../../../../utils/axios";
import SelectUbigeo from "../../../../../../components/SelectPro/SelectUbigeo";
import { Button } from "@tremor/react";
import { TableSkeleton } from "../../../../../../components/Skeleton";
import { useAppSelector } from "../../../../../../redux/store";
import { RootState } from "../../../../../../redux/rootState";

Modal.setAppElement("#root");

interface ISucursal {
  id: number;
  value: string;
  direccion: string;
  ubigeoId: string;
  rubroId: number;
  serieFactura?: string;
  serieBoleta?: string;
}

const siguienteSerie = (prefijo: string, usadas: string[]) => {
  let n = 1;
  while (usadas.includes(`${prefijo}${String(n).padStart(3, "0")}`)) n++;
  return `${prefijo}${String(n).padStart(3, "0")}`;
};

// El sistema solo siembra moneda para estos 4 paises (ver Default/moneda.json) -- elegir un pais
// distinto de Peru cambia la moneda por defecto de la sucursal a la propia del pais.
const MONEDA_POR_PAIS: Record<number, number> = { 604: 1, 484: 2, 170: 3, 218: 4 };
const PAIS_PERU = 604;

const initialForm = {
  codigoEstablecimiento: "",
  nombre: "",
  direccion: "",
  urbanizacion: "",
  ubigeo: "",
  ubigeoId: "",
  telefono: "",
  correo: "",
  paisId: PAIS_PERU,
  monedaId: 1,
  serieFactura: "",
  empiezaEnFactura: "1",
  serieBoleta: "",
  empiezaEnBoleta: "1",
};

export const Sucursales = () => {
  const navigate = useNavigate();
  const { activeTenant }: any = useAppSelector((state: RootState) => state.myBusiness);
  const [sucursales, setSucursales] = useState<ISucursal[]>([]);
  const [ubigeos, setUbigeos] = useState<any[]>([]);
  const [paises, setPaises] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [verIds, setVerIds] = useState(false);
  const [creando, setCreando] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [vista, setVista] = useState<"lista" | "nueva">("lista");
  const [verInfoCodigo, setVerInfoCodigo] = useState(false);

  // Peticiones independientes (no Promise.all): si una falla, no debe dejar la otra sin cargar --
  // el catalogo de ubigeos es pesado (~1800 filas) y es el que alimenta el buscador de distrito.
  const loadSucursales = async () => {
    setLoading(true);
    try {
      const { data }: any = await axiosInstance.get(`/extensiones/sucursales`);
      setSucursales(data?.data ?? []);
    } catch (error: any) {
      toast.error(error?.response?.data?.message ?? "Error al cargar las sucursales");
    } finally {
      setLoading(false);
    }
  };

  const loadUbigeos = async () => {
    try {
      const { data }: any = await axiosInstance.get(`/extensiones/ubigeos`);
      setUbigeos(data?.data ?? []);
    } catch (error: any) {
      toast.error(error?.response?.data?.message ?? "No se pudo cargar el catálogo de distritos");
    }
  };

  const loadPaises = async () => {
    try {
      const { data }: any = await axiosInstance.get(`/extensiones/paises`);
      setPaises(data?.data ?? []);
    } catch (error: any) {
      toast.error(error?.response?.data?.message ?? "No se pudo cargar el catálogo de países");
    }
  };

  useEffect(() => {
    loadSucursales();
    loadUbigeos();
    loadPaises();
  }, []);

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSelect = (idValue: any, value: string, name: string, id: string) => {
    setForm({ ...form, [name]: value, [id]: idValue });
  };

  const abrirNueva = () => {
    if (ubigeos.length === 0) loadUbigeos();
    const seriesFactura = sucursales.map((s) => s.serieFactura).filter(Boolean) as string[];
    const seriesBoleta = sucursales.map((s) => s.serieBoleta).filter(Boolean) as string[];
    setForm({
      ...initialForm,
      codigoEstablecimiento: String(sucursales.length).padStart(4, "0"),
      serieFactura: siguienteSerie("F", seriesFactura),
      serieBoleta: siguienteSerie("B", seriesBoleta),
    });
    setVerInfoCodigo(false);
    setVista("nueva");
  };

  const handleSubmit = async () => {
    if (!form.codigoEstablecimiento.trim()) return toast.error("El código del local ante SUNAT es obligatorio");
    if (!form.nombre.trim()) return toast.error("El nombre del local es obligatorio");
    if (!form.direccion.trim()) return toast.error("La dirección es obligatoria");
    if (!form.ubigeoId) return toast.error("Elige el departamento, provincia y distrito");

    setCreando(true);
    try {
      const { status }: any = await axiosInstance.post(`/extensiones/crear-sucursal`, {
        nombre: form.nombre,
        direccion: form.direccion,
        urbanizacion: form.urbanizacion || undefined,
        ubigeoId: form.ubigeoId,
        telefono: form.telefono || undefined,
        correo: form.correo || undefined,
        paisId: form.paisId,
        monedaId: form.monedaId,
        codigoEstablecimiento: form.codigoEstablecimiento,
        serieFactura: form.serieFactura.trim() || undefined,
        empiezaEnFactura: form.serieFactura.trim() ? Number(form.empiezaEnFactura) || 1 : undefined,
        serieBoleta: form.serieBoleta.trim() || undefined,
        empiezaEnBoleta: form.serieBoleta.trim() ? Number(form.empiezaEnBoleta) || 1 : undefined,
      });
      if (status === 200) {
        toast.success("Sucursal creada exitosamente");
        setVista("lista");
        setForm(initialForm);
        loadSucursales();
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message ?? "Error al crear la sucursal");
    } finally {
      setCreando(false);
    }
  };

  const nombreUbigeo = useMemo(() => form.ubigeo, [form.ubigeo]);

  if (vista === "nueva") {
    return (
      <div className="w-full max-w-5xl">
        <div className="flex items-start gap-3 mb-4">
          <button
            className="w-10 h-10 rounded-xl border border-gray-200 bg-white flex items-center justify-center shrink-0"
            onClick={() => setVista("lista")}
          >
            ←
          </button>
          <div>
            {activeTenant && (
              <p className="text-xs font-semibold text-gray-400 uppercase">
                {activeTenant.razonSocial} · RUC {activeTenant.ruc}
              </p>
            )}
            <h3 className="text-xl font-bold text-gray-900">Nueva sucursal</h3>
            <p className="text-sm text-gray-500 mt-1">
              Una sucursal es cada local desde el que emites: tu tienda, tu almacén o tu oficina.
            </p>
            <p className="text-sm text-gray-500">
              Empecemos por lo imprescindible; el resto lo configuras enseguida, sección por sección.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-4 items-start">
          <div className="bg-white border border-gray-100 rounded-xl p-4">
            <span className="text-xs font-bold text-gray-400 uppercase">Cómo va la sucursal</span>
            <hr className="my-3 border-gray-100" />
            <p className="text-sm font-semibold text-gray-800">Aún no existe.</p>
            <p className="text-sm text-gray-500">Se crea al guardar el paso de abajo.</p>
            <p className="text-xs text-gray-400 mt-4">
              Cada sección se guarda por su cuenta. Puedes irte y volver cuando quieras: lo que ya guardaste se queda.
            </p>
          </div>

          <div className="bg-white border border-gray-100 rounded-xl">
            <div className="p-5">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">🏪</span>
                <span className="font-bold text-gray-900">Lo imprescindible</span>
                <span className="bg-indigo-50 text-indigo-600 text-xs font-semibold px-2 py-0.5 rounded-full">Por crear</span>
              </div>
              <p className="text-sm text-gray-500 mt-3">
                Estos dos bloques van juntos porque la sucursal no puede existir sin ellos: su dirección sale impresa en los
                comprobantes y sus series viajan a SUNAT. Todo lo demás se puede dejar para después.
              </p>
            </div>

            <hr className="border-gray-100" />

            <div className="p-5">
              <p className="text-sm font-semibold text-gray-800 mb-3">
                <span className="inline-flex w-5 h-5 rounded-full bg-indigo-600 text-white items-center justify-center text-xs mr-2">
                  1
                </span>
                El local <span className="font-normal text-gray-400">Cómo se llama, dónde queda y con qué código lo declaraste ante SUNAT.</span>
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500">
                    Código del local ante SUNAT <span className="text-red-500">*</span>
                  </label>
                  <input
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1"
                    name="codigoEstablecimiento"
                    maxLength={4}
                    value={form.codigoEstablecimiento}
                    onChange={handleChange}
                  />
                  <p className="text-xs text-gray-400 mt-1">4 dígitos. Tu local principal es 0000.</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500">
                    Nombre del local <span className="text-red-500">*</span>{" "}
                    <span className="font-normal text-gray-400">solo lo ves tú y tu equipo</span>
                  </label>
                  <input
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1"
                    name="nombre"
                    placeholder="Por ejemplo: Tienda Mazamari"
                    value={form.nombre}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <button
                type="button"
                className="text-left text-sm text-indigo-600 bg-indigo-50 rounded-lg px-4 py-2 mt-3 w-full"
                onClick={() => setVerInfoCodigo(!verInfoCodigo)}
              >
                ⓘ ¿Qué es el código del local ante SUNAT y de dónde lo saco? {verInfoCodigo ? "▲" : "▼"}
              </button>
              {verInfoCodigo && (
                <p className="text-xs text-gray-500 bg-indigo-50 rounded-b-lg px-4 py-2 -mt-2">
                  Es el "código de establecimiento anexo" que SUNAT le asigna a cada local de tu RUC. El local principal
                  siempre es 0000; los demás los encuentras en tu ficha RUC, en SUNAT Operaciones en Línea.
                </p>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500">
                    Dirección <span className="text-red-500">*</span> <span className="font-normal text-gray-400">sale impresa en tus comprobantes</span>
                  </label>
                  <input
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1"
                    name="direccion"
                    value={form.direccion}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500">Urbanización o zona</label>
                  <input
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1"
                    name="urbanizacion"
                    value={form.urbanizacion}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500">País</label>
                  <select
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1"
                    name="paisId"
                    value={form.paisId}
                    onChange={(e) => {
                      const paisId = Number(e.target.value);
                      setForm({ ...form, paisId, monedaId: MONEDA_POR_PAIS[paisId] ?? form.monedaId });
                    }}
                  >
                    {paises.map((p: any) => (
                      <option key={p.id} value={p.id}>
                        {p.value}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500">
                    Departamento, provincia y distrito <span className="text-red-500">*</span>
                  </label>
                  <SelectUbigeo
                    isSearch
                    name="ubigeo"
                    id="ubigeoId"
                    defaultValue={nombreUbigeo}
                    options={ubigeos}
                    onChange={handleSelect}
                    placeholder="Escribe tu distrito o tu provincia"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    {ubigeos.length === 0 ? "Cargando distritos..." : "Escribe dos letras y elige de la lista. Se guarda el distrito que elijas."}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500">Teléfono</label>
                  <input
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1"
                    name="telefono"
                    value={form.telefono}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500">Correo del local</label>
                  <input
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1"
                    name="correo"
                    value={form.correo}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <p className="text-xs text-gray-500 bg-gray-50 rounded-lg px-4 py-3 mt-4">
                % El IGV de este local arranca en 18%, que es lo que corresponde a la mayoría de negocios. Más adelante
                podrás ajustarlo, junto con la página web y la información adicional del local, sin tocar más esta ficha.
              </p>
            </div>

            <hr className="border-gray-100" />

            <div className="p-5">
              <p className="text-sm font-semibold text-gray-800 mb-3">
                <span className="inline-flex w-5 h-5 rounded-full bg-indigo-600 text-white items-center justify-center text-xs mr-2">
                  2
                </span>
                Las series de tus comprobantes{" "}
                <span className="font-normal text-gray-400">Dos locales nunca pueden usar la misma serie: SUNAT las rechazaría.</span>
              </p>

              <p className="text-sm text-indigo-700 bg-indigo-50 rounded-lg px-4 py-2 mb-3">
                ✓ Ya te las propusimos. Están armadas con el mismo criterio que las de tus otros locales, así que puedes
                dejarlas como están. Si prefieres otras, cámbialas: te avisamos al guardar si alguna choca con otro local.
              </p>

              <div className="border border-gray-100 rounded-lg overflow-hidden">
                <div className="grid grid-cols-[1fr_110px_110px] gap-2 bg-gray-50 text-xs font-bold text-gray-400 uppercase px-4 py-2">
                  <span>Tipo de comprobante</span>
                  <span>Serie</span>
                  <span>Empieza en</span>
                </div>
                <div className="grid grid-cols-[1fr_110px_110px] gap-2 items-center px-4 py-3 border-t border-gray-100">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">Factura</p>
                    <p className="text-xs text-gray-400">La que emites a empresas con RUC.</p>
                  </div>
                  <input
                    className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm font-mono"
                    name="serieFactura"
                    value={form.serieFactura}
                    onChange={handleChange}
                  />
                  <input
                    className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm"
                    type="number"
                    name="empiezaEnFactura"
                    value={form.empiezaEnFactura}
                    onChange={handleChange}
                    disabled={!form.serieFactura.trim()}
                  />
                </div>
                <div className="grid grid-cols-[1fr_110px_110px] gap-2 items-center px-4 py-3 border-t border-gray-100">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">Boleta de venta</p>
                    <p className="text-xs text-gray-400">La que emites al público, con DNI o sin documento.</p>
                  </div>
                  <input
                    className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm font-mono"
                    name="serieBoleta"
                    value={form.serieBoleta}
                    onChange={handleChange}
                  />
                  <input
                    className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm"
                    type="number"
                    name="empiezaEnBoleta"
                    value={form.empiezaEnBoleta}
                    onChange={handleChange}
                    disabled={!form.serieBoleta.trim()}
                  />
                </div>
              </div>

              <p className="text-xs text-gray-400 mt-3">
                # Las notas de crédito y débito de este local usan la serie única del negocio.
              </p>

              <p className="text-xs text-amber-700 bg-amber-50 rounded-lg px-4 py-3 mt-3">
                ⚠ «Empieza en» no es el correlativo. Es el número que llevará el primer comprobante que emitas con esa serie.
                A partir de ahí el sistema numera solo. Si ya venías emitiendo en papel o en otro sistema, pon aquí el
                número siguiente al último que usaste.
              </p>
            </div>

            <hr className="border-gray-100" />

            <div className="flex flex-wrap items-center justify-between gap-3 p-5">
              <p className="text-xs text-gray-400">Al crear la sucursal ya podrás emitir desde ella. Lo demás lo ajustas después.</p>
              <div className="flex gap-3">
                <Button size="sm" variant="secondary" onClick={() => setVista("lista")}>
                  Cancelar
                </Button>
                <Button size="sm" onClick={handleSubmit} disabled={creando}>
                  {creando ? "Creando..." : "✓ Crear la sucursal"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1">
        <button
          className="w-10 h-10 rounded-xl border border-gray-200 bg-white flex items-center justify-center"
          onClick={() => navigate(-1)}
        >
          ←
        </button>
        <div className="flex gap-3">
          <Button size="sm" variant="secondary" onClick={() => setVerIds(!verIds)}>
            {"<>"} Ver IDs
          </Button>
          <Button size="sm" onClick={abrirNueva}>
            + Agregar sucursal
          </Button>
        </div>
      </div>

      {activeTenant && (
        <p className="text-xs font-semibold text-gray-400 uppercase mt-3">
          {activeTenant.razonSocial} · RUC {activeTenant.ruc}
        </p>
      )}
      <h3 className="text-xl font-bold text-gray-900 mt-1">Tus sucursales</h3>
      <p className="text-sm text-gray-500 mt-1 max-w-2xl">
        Cada sucursal es un local desde el que emites. Su dirección y su código de SUNAT salen impresos en los comprobantes
        que emites desde ahí, y cada una puede tener sus propias series.
      </p>

      <div className="mt-6 bg-white border border-gray-100 rounded-2xl">
        {loading ? (
          <div className="p-6">
            <TableSkeleton columns={5} />
          </div>
        ) : sucursales.length === 0 ? (
          <div className="flex flex-col items-center text-center px-6 py-14">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center text-3xl mb-4">🏪</div>
            <h4 className="text-lg font-bold text-gray-900">Todavía no tienes ninguna sucursal</h4>
            <p className="text-sm text-gray-500 max-w-md mt-2">
              La sucursal es el local desde el que vendes. Necesitas al menos una para poder emitir comprobantes: de ahí
              salen la dirección que ve tu cliente y las series con las que se numeran tus facturas y boletas.
            </p>
            <Button size="sm" className="mt-5" onClick={abrirNueva}>
              + Agregar mi primera sucursal
            </Button>

            <div className="w-full max-w-xl mt-8 bg-gray-50 border border-gray-100 rounded-xl p-5 text-left">
              <span className="text-xs font-bold text-gray-400 uppercase">Ten a mano</span>
              <ul className="mt-3 space-y-2 text-sm text-gray-600">
                <li>
                  ✔ <strong>La dirección exacta del local</strong>, con su departamento, provincia y distrito. Es la que verá
                  tu cliente en el comprobante.
                </li>
                <li>
                  ✔ <strong>El código que SUNAT le dio al local.</strong> Lo encuentras en tu ficha RUC.
                </li>
                <li>
                  ✔ <strong>Las series con las que va a emitir:</strong> la de facturas empieza con F (ej. F001), la de
                  boletas con B.
                </li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="relative overflow-x-auto sm:rounded-lg">
            <table className="w-full text-sm text-left text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                  {verIds && <th className="px-4 py-3">ID</th>}
                  <th className="px-4 py-3">Nombre</th>
                  <th className="px-4 py-3">Dirección</th>
                  <th className="px-4 py-3">Ubigeo</th>
                  <th className="px-4 py-3">Serie Factura</th>
                  <th className="px-4 py-3">Serie Boleta</th>
                </tr>
              </thead>
              <tbody>
                {sucursales.map((s) => (
                  <tr key={s.id} className="bg-white border-b hover:bg-gray-50">
                    {verIds && <td className="px-4 py-3 text-gray-400">{s.id}</td>}
                    <td className="px-4 py-3 font-medium text-gray-900">{s.value}</td>
                    <td className="px-4 py-3">{s.direccion}</td>
                    <td className="px-4 py-3">{s.ubigeoId}</td>
                    <td className="px-4 py-3">
                      {s.serieFactura ? (
                        <span className="font-mono bg-gray-100 rounded px-2 py-0.5">{s.serieFactura}</span>
                      ) : (
                        <span className="text-gray-400">serie del negocio</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {s.serieBoleta ? (
                        <span className="font-mono bg-gray-100 rounded px-2 py-0.5">{s.serieBoleta}</span>
                      ) : (
                        <span className="text-gray-400">serie del negocio</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
