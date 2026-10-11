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

  const inp = "w-full border border-gray-200 rounded-md px-2 py-1 text-sm mt-0.5";
  const lbl = "text-[11px] font-semibold text-gray-500 block";
  // Cuenta cierre y cargo/abono de destino: solo ultimo nivel (Nivel 5 = 8 digitos), la unica hoja que admite asientos.
  const cuentasUltimoNivel = otrasCuentas.filter((c: any) => c.nivel === 5);
  const cuentaSelect = (value: number, set: (n: number) => void, disabled = false) => (
    <select className={inp} value={value} disabled={disabled} onChange={(e) => set(Number(e.target.value))}>
      <option value={0}>Sin elegir</option>
      {cuentasUltimoNivel.map((c: any) => <option key={c.id} value={c.id}>{c.codigo} - {c.nombre}</option>)}
    </select>
  );
  const lineasDestino = [
    { n: 1, cargo: cuentaCargo1Id, setCargo: setCuentaCargo1Id, abono: cuentaAbono1Id, setAbono: setCuentaAbono1Id, pct: porcentajeDestino1, setPct: setPorcentajeDestino1 },
    { n: 2, cargo: cuentaCargo2Id, setCargo: setCuentaCargo2Id, abono: cuentaAbono2Id, setAbono: setCuentaAbono2Id, pct: porcentajeDestino2, setPct: setPorcentajeDestino2 },
    { n: 3, cargo: cuentaCargo3Id, setCargo: setCuentaCargo3Id, abono: cuentaAbono3Id, setAbono: setCuentaAbono3Id, pct: porcentajeDestino3, setPct: setPorcentajeDestino3 },
  ];

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl p-5 w-full max-w-5xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-bold text-lg">{cuenta.id ? "Editar cuenta" : "Nueva cuenta"}</h3>
          <button onClick={onCerrar} aria-label="Cerrar">✕</button>
        </div>

        <div className="grid grid-cols-4 gap-x-3 gap-y-2">
          <div>
            <label className={lbl}>Código</label>
            <input className={`${inp} ${errors.codigo ? "border-red-400" : ""}`} value={codigo}
              onChange={(e) => { setCodigo(e.target.value); clearError("codigo"); }} />
            <CampoError mensaje={errors.codigo} />
          </div>
          <div className="col-span-2">
            <label className={lbl}>Nombre</label>
            <input className={`${inp} ${errors.nombre ? "border-red-400" : ""}`} value={nombre}
              onChange={(e) => { setNombre(e.target.value); clearError("nombre"); }} />
            <CampoError mensaje={errors.nombre} />
          </div>
          <div>
            <label className={lbl}>Tipo</label>
            <select className={inp} value={tipo} onChange={(e) => setTipo(e.target.value)}>
              {TIPOS.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div className="col-span-2">
            <label className={lbl}>Cuenta padre (opcional)</label>
            <select className={inp} value={cuentaPadreId} onChange={(e) => setCuentaPadreId(Number(e.target.value))}>
              <option value={0}>Sin cuenta padre</option>
              {otrasCuentas.map((c: any) => <option key={c.id} value={c.id}>{c.codigo} — {c.nombre}</option>)}
            </select>
          </div>
          <div>
            <label className={lbl}>Nivel</label>
            <input disabled className={`${inp} bg-gray-100 text-gray-500`} value={nivelCalculado ? `0${nivelCalculado} (${codigoLimpio.length} dígitos)` : "—"} />
          </div>
          <div>
            <label className={lbl}>Clase Cuenta</label>
            <input disabled className={`${inp} bg-gray-100 text-gray-500`} value={claseCuentaCalculada || "—"} />
          </div>

          <div><label className={lbl}>Cód. EEFF</label><input className={inp} value={codigoEeff} onChange={(e) => setCodigoEeff(e.target.value)} /></div>
          <div><label className={lbl}>Cód. EEFF Trib.</label><input className={inp} value={codigoEeffTributario} onChange={(e) => setCodigoEeffTributario(e.target.value)} /></div>
          <div className="col-span-2">
            <label className={lbl}>Cód. EEFF NIIF</label>
            <select className={inp} value={codigoEeffNiifId} onChange={(e) => setCodigoEeffNiifId(Number(e.target.value))}>
              <option value={0}>Sin elegir</option>
              {(codigosEeffNiif ?? []).map((c: any) => <option key={c.id} value={c.id}>{c.codigo} - {c.nombre}</option>)}
            </select>
          </div>

          <div>
            <label className={lbl}>Clas. Bien o Servicio</label>
            <select className={inp} value={clasificacionBienServicio} onChange={(e) => setClasificacionBienServicio(e.target.value)}>
              <option value="">Sin elegir</option>
              <option value="BIEN">BIEN - Bien (Tangible)</option>
              <option value="SERV">SERV - Servicio (Intangible)</option>
              <option value="NO_APL">NO_APL - No aplica</option>
            </select>
          </div>
          <div>
            <label className={lbl}>Centros de Costos</label>
            <select className={inp} value={modoCentroCosto} onChange={(e) => setModoCentroCosto(e.target.value)}>
              {MODOS_CENTRO_COSTO.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
          </div>
          <div>
            <label className={lbl}>Tipo de Anexo</label>
            <div className="flex items-center gap-2 mt-0.5">
              <input type="checkbox" checked={tipoAnexo} onChange={(e) => setTipoAnexo(e.target.checked)} />
              <input className={`${inp} mt-0`} disabled={!tipoAnexo} placeholder="Clientes, Proveedores..."
                value={tipoAnexoClase} onChange={(e) => setTipoAnexoClase(e.target.value)} />
            </div>
          </div>
          <div>
            <label className={lbl}>Cta_cierre</label>
            {cuentaSelect(cuentaCierreId, setCuentaCierreId)}
          </div>

          <div className="col-span-4 flex flex-wrap items-center gap-x-6 gap-y-1 text-sm">
            <label className="flex items-center gap-2"><input type="checkbox" checked={cuentaMonetaria} onChange={(e) => setCuentaMonetaria(e.target.checked)} /> Cuenta Monetaria</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={ajusteDifCambio} onChange={(e) => setAjusteDifCambio(e.target.checked)} /> Ajuste Dif. Cambio</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={destino} onChange={(e) => { setDestino(e.target.checked); if (e.target.checked && porcentajeDestino1 === "") setPorcentajeDestino1(100); }} /> Destino</label>
            {cuenta.id && (
              <label className="flex items-center gap-2"><input type="checkbox" checked={estado} onChange={(e) => setEstado(e.target.checked)} /> Activa</label>
            )}
          </div>

          {lineasDestino.map((l) => (
            <div key={l.n} className="col-span-4 grid grid-cols-4 gap-x-3">
              <div className="col-span-2 grid grid-cols-2 gap-x-3">
                <div><label className={lbl}>Cargo {l.n}</label>{cuentaSelect(l.cargo, l.setCargo, !destino)}</div>
                <div><label className={lbl}>Abono {l.n}</label>{cuentaSelect(l.abono, l.setAbono, !destino)}</div>
              </div>
              <div><label className={lbl}>Porcent. {l.n}</label>
                <input type="number" disabled={!destino} className={inp} value={l.pct} onChange={(e) => l.setPct(e.target.value)} /></div>
            </div>
          ))}
        </div>

        <div className="flex justify-end mt-3">
          <button className="bg-indigo-600 text-white text-sm font-semibold rounded-lg px-4 py-2" onClick={guardar}>Guardar</button>
        </div>
      </div>
    </div>
  );
};
