import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import axiosInstance from "../../../../../../utils/axios";
import { TableSkeleton } from "../../../../../../components/Skeleton";
import { useFormErrors, CampoError } from "../../../../../../components/FormError";

const TIPOS = ["Activo", "Pasivo", "Patrimonio", "Ingreso", "Gasto"];
const MODOS_CENTRO_COSTO = [
  { value: "NINGUNO", label: "No aplica" },
  { value: "OPCIONAL", label: "Opcional" },
  { value: "OBLIGATORIO", label: "Obligatorio" },
];
// Jerarquia PCGE de 5 niveles (ver "configuracion plan de cuentas ERPdocx.docx"): el nivel y la
// clase se calculan del Codigo, igual que en el backend (CuentaContableRepository.AplicarCampos)
// -- no se editan a mano.
const NIVEL_POR_LARGO_CODIGO: Record<number, number> = { 2: 1, 3: 2, 4: 3, 5: 4, 8: 5 };

const mensajeError = (e: any, def: string) => e?.response?.data?.message ?? def;

// Plan de cuentas (PCGE), sembrado al crear la empresa desde el catalogo oficial completo
// (Backend/Infrastructure/Data/Default/cuentacontable.json) y editable desde aca: agregar
// cuentas propias, renombrar o desactivar las que no se usan.
export const PlanDeCuentas = () => {
  const [cuentas, setCuentas] = useState<any[]>([]);
  const [codigosEeffNiif, setCodigosEeffNiif] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [editando, setEditando] = useState<any>(null); // null = cerrado; {} = nueva; {id,...} = editar

  useEffect(() => {
    axiosInstance.get("/cuentas-contables/codigos-eeff-niif").then((r: any) => setCodigosEeffNiif(r.data?.data ?? [])).catch(() => {});
  }, []);

  const cargar = async () => {
    setLoading(true);
    try {
      const { data }: any = await axiosInstance.get("/cuentas-contables/listar", { params: { incluirInactivas: true } });
      setCuentas(data?.data ?? []);
    } catch (e) {
      toast.error(mensajeError(e, "No se pudo cargar el plan de cuentas"));
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { cargar(); }, []);

  const porId = useMemo(() => new Map(cuentas.map((c) => [c.id, c])), [cuentas]);
  // Tope de profundidad: el backend ya bloquea ciclos al guardar (ver CuentaContableRepository.
  // FormaCiclo), pero esto evita que un ciclo preexistente en los datos cuelgue el navegador acá.
  const nivel = (c: any, vistos = new Set<number>()): number =>
    c.cuentaPadreId != null && porId.has(c.cuentaPadreId) && !vistos.has(c.id)
      ? 1 + nivel(porId.get(c.cuentaPadreId), new Set(vistos).add(c.id))
      : 0;

  const filtradas = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return cuentas;
    return cuentas.filter((c) => c.codigo.toLowerCase().includes(q) || c.nombre.toLowerCase().includes(q));
  }, [cuentas, busqueda]);

  const guardar = async (payload: any, id?: number) => {
    try {
      if (id) await axiosInstance.put(`/cuentas-contables/actualizar/${id}`, payload);
      else await axiosInstance.post("/cuentas-contables/crear", payload);
      toast.success("Cuenta guardada");
      setEditando(null);
      cargar();
    } catch (e) {
      toast.error(mensajeError(e, "No se pudo guardar la cuenta"));
    }
  };

  return (
    <div className="w-full">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Plan de Cuentas</h3>
          <p className="text-sm text-gray-500 mt-1 max-w-2xl">
            Catálogo PCGE editable: sirve de base a los asientos automáticos (recepción, factura y pago de compras).
          </p>
        </div>
        <button type="button" className="bg-indigo-600 text-white text-sm font-semibold rounded-lg px-4 py-2"
          onClick={() => setEditando({})}>
          + Nueva cuenta
        </button>
      </div>

      <div className="mt-5 bg-white border border-gray-100 rounded-xl p-4">
        <input type="text" placeholder="Buscar por código o nombre..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)}
          className="w-full max-w-sm border border-gray-200 rounded-lg px-3 py-2 text-sm" />
      </div>

      <div className="mt-4 bg-white border border-gray-100 rounded-2xl overflow-x-auto max-h-[70vh] overflow-y-auto">
        {loading ? (
          <div className="p-6"><TableSkeleton columns={4} /></div>
        ) : (
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 sticky top-0">
              <tr>
                <th className="px-4 py-3">Código</th>
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3">Tipo</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtradas.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-10 text-center text-gray-500">Sin resultados.</td></tr>
              ) : (
                filtradas.map((c) => (
                  <tr key={c.id} className={`bg-white border-b hover:bg-gray-50 ${!c.estado ? "opacity-50" : ""}`}>
                    <td className="px-4 py-2 whitespace-nowrap font-mono">{c.codigo}</td>
                    <td className="px-4 py-2" style={{ paddingLeft: 16 + nivel(c) * 16 }}>{c.nombre}</td>
                    <td className="px-4 py-2 whitespace-nowrap">{c.tipo}</td>
                    <td className="px-4 py-2 whitespace-nowrap">{c.estado ? "Activa" : "Inactiva"}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-right">
                      <button className="text-indigo-600 text-xs font-semibold" onClick={() => setEditando(c)}>Editar</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {editando && (
        <EditarCuenta cuenta={editando} cuentas={cuentas} codigosEeffNiif={codigosEeffNiif} onCerrar={() => setEditando(null)}
          onGuardar={(payload: any) => guardar(payload, editando.id)} />
      )}
    </div>
  );
};

const EditarCuenta = ({ cuenta, cuentas, codigosEeffNiif, onCerrar, onGuardar }: any) => {
  const [codigo, setCodigo] = useState(cuenta.codigo ?? "");
  const [nombre, setNombre] = useState(cuenta.nombre ?? "");
  const [tipo, setTipo] = useState(cuenta.tipo ?? "Activo");
  const [cuentaPadreId, setCuentaPadreId] = useState(cuenta.cuentaPadreId ?? 0);
  const [estado, setEstado] = useState(cuenta.estado ?? true);

  // Nivel y Clase Cuenta se calculan del Codigo (mismo criterio que el backend), no se editan.
  const codigoLimpio = codigo.trim();
  const nivelCalculado = NIVEL_POR_LARGO_CODIGO[codigoLimpio.length] ?? 0;
  const claseCuentaCalculada = codigoLimpio.slice(0, 2);

  // Metadata adicional (formato EEFF Peru) -- opcional, no la usa ningun asiento automatico todavia.
  const [tipoAnexo, setTipoAnexo] = useState(!!cuenta.tipoAnexo);
  const [tipoAnexoClase, setTipoAnexoClase] = useState(cuenta.tipoAnexoClase ?? "");
  const [cuentaMonetaria, setCuentaMonetaria] = useState(!!cuenta.cuentaMonetaria);
  const [ajusteDifCambio, setAjusteDifCambio] = useState(!!cuenta.ajusteDifCambio);
  const [modoCentroCosto, setModoCentroCosto] = useState(cuenta.modoCentroCosto ?? "NINGUNO");
  const [codigoEeff, setCodigoEeff] = useState(cuenta.codigoEeff ?? "");
  const [codigoEeffTributario, setCodigoEeffTributario] = useState(cuenta.codigoEeffTributario ?? "");
  const [codigoEeffNiifId, setCodigoEeffNiifId] = useState(cuenta.codigoEeffNiifId ?? 0);
  const [clasificacionBienServicio, setClasificacionBienServicio] = useState(cuenta.clasificacionBienServicio ?? "");
  const [destino, setDestino] = useState(!!cuenta.destino);
  const [cuentaCargo1Id, setCuentaCargo1Id] = useState(cuenta.cuentaCargo1Id ?? 0);
  const [cuentaAbono1Id, setCuentaAbono1Id] = useState(cuenta.cuentaAbono1Id ?? 0);
  const [porcentajeDestino1, setPorcentajeDestino1] = useState(cuenta.porcentajeDestino1 ?? "");
  const [cuentaCargo2Id, setCuentaCargo2Id] = useState(cuenta.cuentaCargo2Id ?? 0);
  const [cuentaAbono2Id, setCuentaAbono2Id] = useState(cuenta.cuentaAbono2Id ?? 0);
  const [porcentajeDestino2, setPorcentajeDestino2] = useState(cuenta.porcentajeDestino2 ?? "");
  const [cuentaCargo3Id, setCuentaCargo3Id] = useState(cuenta.cuentaCargo3Id ?? 0);
  const [cuentaAbono3Id, setCuentaAbono3Id] = useState(cuenta.cuentaAbono3Id ?? 0);
  const [porcentajeDestino3, setPorcentajeDestino3] = useState(cuenta.porcentajeDestino3 ?? "");
  const [cuentaCierreId, setCuentaCierreId] = useState(cuenta.cuentaCierreId ?? 0);
  const [avanzadoAbierto, setAvanzadoAbierto] = useState(false);

  const { errors, setError, clearError } = useFormErrors();

  // Selección de cuenta contable: cualquier cuenta menos la que se está editando.
  const otrasCuentas = (cuentas ?? []).filter((c: any) => c.id !== cuenta.id);

  const guardar = () => {
    if (!codigo.trim()) { setError("codigo", "El código es obligatorio"); return toast.error("El código es obligatorio"); }
    if (!/^\d+$/.test(codigoLimpio)) { setError("codigo", "El código solo puede contener dígitos"); return toast.error("El código solo puede contener dígitos"); }
    if (!nivelCalculado) {
      const msg = "El código debe tener 2, 3, 4, 5 u 8 dígitos (Niveles 01 a 05 del plan de cuentas)";
      setError("codigo", msg);
      return toast.error(msg);
    }
    if (!nombre.trim()) { setError("nombre", "El nombre es obligatorio"); return toast.error("El nombre es obligatorio"); }
    onGuardar({
      codigo: codigoLimpio, nombre: nombre.trim(), tipo, cuentaPadreId: cuentaPadreId || undefined, estado,
      tipoAnexo, tipoAnexoClase: tipoAnexo ? tipoAnexoClase.trim() || undefined : undefined,
      cuentaMonetaria, ajusteDifCambio,
      modoCentroCosto,
      codigoEeff: codigoEeff.trim() || undefined,
      codigoEeffTributario: codigoEeffTributario.trim() || undefined,
      codigoEeffNiifId: codigoEeffNiifId || undefined,
      clasificacionBienServicio: clasificacionBienServicio.trim() || undefined,
      destino,
      cuentaCargo1Id: cuentaCargo1Id || undefined,
      cuentaAbono1Id: cuentaAbono1Id || undefined,
      porcentajeDestino1: porcentajeDestino1 !== "" ? Number(porcentajeDestino1) : undefined,
      cuentaCargo2Id: cuentaCargo2Id || undefined,
      cuentaAbono2Id: cuentaAbono2Id || undefined,
      porcentajeDestino2: porcentajeDestino2 !== "" ? Number(porcentajeDestino2) : undefined,
      cuentaCargo3Id: cuentaCargo3Id || undefined,
      cuentaAbono3Id: cuentaAbono3Id || undefined,
      porcentajeDestino3: porcentajeDestino3 !== "" ? Number(porcentajeDestino3) : undefined,
      cuentaCierreId: cuentaCierreId || undefined,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50" onClick={onCerrar}>
      <div className="bg-white rounded-xl p-5 w-full max-w-xl max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-bold text-lg">{cuenta.id ? "Editar cuenta" : "Nueva cuenta"}</h3>
          <button onClick={onCerrar} aria-label="Cerrar">✕</button>
        </div>

        <label className="text-xs font-semibold text-gray-500">Código</label>
        <input className={`w-full border rounded-lg px-3 py-2 text-sm mt-1 ${errors.codigo ? "border-red-400" : "border-gray-200"}`}
          value={codigo} onChange={(e) => { setCodigo(e.target.value); clearError("codigo"); }} />
        <CampoError mensaje={errors.codigo} />

        <label className="text-xs font-semibold text-gray-500 mt-3 block">Nombre</label>
        <input className={`w-full border rounded-lg px-3 py-2 text-sm mt-1 ${errors.nombre ? "border-red-400" : "border-gray-200"}`}
          value={nombre} onChange={(e) => { setNombre(e.target.value); clearError("nombre"); }} />
        <CampoError mensaje={errors.nombre} />

        <label className="text-xs font-semibold text-gray-500 mt-3 block">Tipo</label>
        <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1" value={tipo} onChange={(e) => setTipo(e.target.value)}>
          {TIPOS.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>

        <label className="text-xs font-semibold text-gray-500 mt-3 block">Cuenta padre (opcional)</label>
        <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1" value={cuentaPadreId}
          onChange={(e) => setCuentaPadreId(Number(e.target.value))}>
          <option value={0}>Sin cuenta padre</option>
          {cuentas.filter((c: any) => c.id !== cuenta.id).map((c: any) => (
            <option key={c.id} value={c.id}>{c.codigo} — {c.nombre}</option>
          ))}
        </select>

        <button type="button" className="text-xs font-semibold text-indigo-600 mt-4"
          onClick={() => setAvanzadoAbierto(!avanzadoAbierto)}>
          {avanzadoAbierto ? "▾" : "▸"} Campos avanzados (EEFF)
        </button>

        {avanzadoAbierto && (
          <div className="grid grid-cols-2 gap-x-3 gap-y-3 mt-3 p-3 bg-gray-50 rounded-lg text-sm">
            <div>
              <label className="text-xs font-semibold text-gray-500 block">Nivel</label>
              <input disabled className="w-full border border-gray-200 bg-gray-100 rounded-lg px-3 py-2 text-sm mt-1 text-gray-500"
                value={nivelCalculado ? `0${nivelCalculado} (${codigoLimpio.length} dígitos)` : "—"} />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 block">Clase Cuenta</label>
              <input disabled className="w-full border border-gray-200 bg-gray-100 rounded-lg px-3 py-2 text-sm mt-1 text-gray-500" value={claseCuentaCalculada || "—"} />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 block">Cód. EEFF</label>
              <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1" value={codigoEeff} onChange={(e) => setCodigoEeff(e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 block">Cód. EEFF Trib.</label>
              <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1" value={codigoEeffTributario} onChange={(e) => setCodigoEeffTributario(e.target.value)} />
            </div>
            <div className="col-span-2">
              <label className="text-xs font-semibold text-gray-500 block">Cód. EEFF NIIF</label>
              <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1" value={codigoEeffNiifId} onChange={(e) => setCodigoEeffNiifId(Number(e.target.value))}>
                <option value={0}>Sin elegir</option>
                {(codigosEeffNiif ?? []).map((c: any) => <option key={c.id} value={c.id}>{c.codigo} - {c.nombre}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 block">Clas. Bien o Servicio</label>
              <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1" value={clasificacionBienServicio} onChange={(e) => setClasificacionBienServicio(e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 block">Centros de Costos</label>
              <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1" value={modoCentroCosto} onChange={(e) => setModoCentroCosto(e.target.value)}>
                {MODOS_CENTRO_COSTO.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
            </div>

            <div>
              <label className="flex items-center gap-2"><input type="checkbox" checked={tipoAnexo} onChange={(e) => setTipoAnexo(e.target.checked)} /> Tipo de Anexo</label>
              {tipoAnexo && (
                <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1" placeholder="Clientes, Proveedores, Empleados..."
                  value={tipoAnexoClase} onChange={(e) => setTipoAnexoClase(e.target.value)} />
              )}
            </div>
            <label className="flex items-center gap-2"><input type="checkbox" checked={cuentaMonetaria} onChange={(e) => setCuentaMonetaria(e.target.checked)} /> Cuenta Monetaria</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={ajusteDifCambio} onChange={(e) => setAjusteDifCambio(e.target.checked)} /> Ajuste Dif. Cambio</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={destino} onChange={(e) => setDestino(e.target.checked)} /> Destino</label>

            <div className="col-span-2 border-t border-gray-200 pt-3 grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-semibold text-gray-500 block">Cargo 1</label>
                <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1" value={cuentaCargo1Id} onChange={(e) => setCuentaCargo1Id(Number(e.target.value))}>
                  <option value={0}>Sin elegir</option>
                  {otrasCuentas.map((c: any) => <option key={c.id} value={c.id}>{c.codigo} - {c.nombre}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 block">Abono 1</label>
                <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1" value={cuentaAbono1Id} onChange={(e) => setCuentaAbono1Id(Number(e.target.value))}>
                  <option value={0}>Sin elegir</option>
                  {otrasCuentas.map((c: any) => <option key={c.id} value={c.id}>{c.codigo} - {c.nombre}</option>)}
                </select>
              </div>
              <div><label className="text-xs font-semibold text-gray-500 block">Porcent. 1</label><input type="number" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1" value={porcentajeDestino1} onChange={(e) => setPorcentajeDestino1(e.target.value)} /></div>
              <div>
                <label className="text-xs font-semibold text-gray-500 block">Cargo 2</label>
                <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1" value={cuentaCargo2Id} onChange={(e) => setCuentaCargo2Id(Number(e.target.value))}>
                  <option value={0}>Sin elegir</option>
                  {otrasCuentas.map((c: any) => <option key={c.id} value={c.id}>{c.codigo} - {c.nombre}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 block">Abono 2</label>
                <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1" value={cuentaAbono2Id} onChange={(e) => setCuentaAbono2Id(Number(e.target.value))}>
                  <option value={0}>Sin elegir</option>
                  {otrasCuentas.map((c: any) => <option key={c.id} value={c.id}>{c.codigo} - {c.nombre}</option>)}
                </select>
              </div>
              <div><label className="text-xs font-semibold text-gray-500 block">Porcent. 2</label><input type="number" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1" value={porcentajeDestino2} onChange={(e) => setPorcentajeDestino2(e.target.value)} /></div>
              <div>
                <label className="text-xs font-semibold text-gray-500 block">Cargo 3</label>
                <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1" value={cuentaCargo3Id} onChange={(e) => setCuentaCargo3Id(Number(e.target.value))}>
                  <option value={0}>Sin elegir</option>
                  {otrasCuentas.map((c: any) => <option key={c.id} value={c.id}>{c.codigo} - {c.nombre}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 block">Abono 3</label>
                <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1" value={cuentaAbono3Id} onChange={(e) => setCuentaAbono3Id(Number(e.target.value))}>
                  <option value={0}>Sin elegir</option>
                  {otrasCuentas.map((c: any) => <option key={c.id} value={c.id}>{c.codigo} - {c.nombre}</option>)}
                </select>
              </div>
              <div><label className="text-xs font-semibold text-gray-500 block">Porcent. 3</label><input type="number" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1" value={porcentajeDestino3} onChange={(e) => setPorcentajeDestino3(e.target.value)} /></div>
            </div>

            <div className="col-span-2">
              <label className="text-xs font-semibold text-gray-500 block">Cta_cierre</label>
              <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1" value={cuentaCierreId} onChange={(e) => setCuentaCierreId(Number(e.target.value))}>
                <option value={0}>Sin elegir</option>
                {otrasCuentas.map((c: any) => <option key={c.id} value={c.id}>{c.codigo} - {c.nombre}</option>)}
              </select>
            </div>
          </div>
        )}

        {cuenta.id && (
          <label className="flex items-center gap-2 mt-3 text-sm">
            <input type="checkbox" checked={estado} onChange={(e) => setEstado(e.target.checked)} /> Activa
          </label>
        )}

        <div className="flex justify-end mt-4">
          <button className="bg-indigo-600 text-white text-sm font-semibold rounded-lg px-4 py-2" onClick={guardar}>Guardar</button>
        </div>
      </div>
    </div>
  );
};
