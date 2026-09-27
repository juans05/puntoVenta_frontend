import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import axiosInstance from "../../../../../../utils/axios";
import { TableSkeleton } from "../../../../../../components/Skeleton";
import { useFormErrors, CampoError } from "../../../../../../components/FormError";

const TIPOS = ["Activo", "Pasivo", "Patrimonio", "Ingreso", "Gasto"];

const mensajeError = (e: any, def: string) => e?.response?.data?.message ?? def;

// Plan de cuentas (PCGE), sembrado al crear la empresa desde el catalogo oficial completo
// (Backend/Infrastructure/Data/Default/cuentacontable.json) y editable desde aca: agregar
// cuentas propias, renombrar o desactivar las que no se usan.
export const PlanDeCuentas = () => {
  const [cuentas, setCuentas] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [editando, setEditando] = useState<any>(null); // null = cerrado; {} = nueva; {id,...} = editar

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
  const nivel = (c: any): number => (c.cuentaPadreId != null && porId.has(c.cuentaPadreId) ? 1 + nivel(porId.get(c.cuentaPadreId)) : 0);

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
        <EditarCuenta cuenta={editando} cuentas={cuentas} onCerrar={() => setEditando(null)}
          onGuardar={(payload: any) => guardar(payload, editando.id)} />
      )}
    </div>
  );
};

const EditarCuenta = ({ cuenta, cuentas, onCerrar, onGuardar }: any) => {
  const [codigo, setCodigo] = useState(cuenta.codigo ?? "");
  const [nombre, setNombre] = useState(cuenta.nombre ?? "");
  const [tipo, setTipo] = useState(cuenta.tipo ?? "Activo");
  const [cuentaPadreId, setCuentaPadreId] = useState(cuenta.cuentaPadreId ?? 0);
  const [estado, setEstado] = useState(cuenta.estado ?? true);
  const { errors, setError, clearError } = useFormErrors();

  const guardar = () => {
    if (!codigo.trim()) { setError("codigo", "El código es obligatorio"); return toast.error("El código es obligatorio"); }
    if (!nombre.trim()) { setError("nombre", "El nombre es obligatorio"); return toast.error("El nombre es obligatorio"); }
    onGuardar({ codigo: codigo.trim(), nombre: nombre.trim(), tipo, cuentaPadreId: cuentaPadreId || undefined, estado });
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50" onClick={onCerrar}>
      <div className="bg-white rounded-xl p-5 w-full max-w-md max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
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
