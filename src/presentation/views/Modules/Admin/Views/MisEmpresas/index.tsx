import { useEffect, useState } from "react";
import Modal from "react-modal";
import { toast } from "sonner";
import axiosInstance from "../../../../../../utils/axios";
import { cambiarEmpresa, IEmpresaAcceso, listarEmpresas } from "../../../../../../utils/empresas";

const PLANES = [
  { value: "DEFECTO", label: "Plan de cuentas por defecto (PCGE)", ayuda: "El plan contable general que trae el sistema." },
  { value: "BLANCO", label: "En blanco", ayuda: "Sin cuentas: las registras tú en Plan de cuentas." },
  { value: "COPIAR", label: "Copiar de otra empresa", ayuda: "Copia el plan de cuentas de una de tus empresas." },
];

const formVacio = { razonSocial: "", nombreComercial: "", ruc: "", direccion: "", planCuentas: "DEFECTO", copiarDeTenantId: "" };

const celda = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1";

// Empresas del dueño de la cuenta: crear nuevas y ver cuantos usuarios tiene cada una (se cobra por usuario).
export const MisEmpresas = () => {
  const [datos, setDatos] = useState<{ totalUsuarios: number; empresas: any[] }>({ totalUsuarios: 0, empresas: [] });
  const [accesos, setAccesos] = useState<IEmpresaAcceso[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(formVacio);
  const [guardando, setGuardando] = useState(false);

  const cargar = async () => {
    setLoading(true);
    try {
      const [{ data }, empresas]: any = await Promise.all([axiosInstance.get("/tenant/mis-empresas"), listarEmpresas()]);
      setDatos(data?.data ?? { totalUsuarios: 0, empresas: [] });
      setAccesos(empresas);
    } catch (error: any) {
      toast.error(error?.response?.data?.message ?? "Error al cargar tus empresas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const esPropietario = accesos.some((e) => e.esPropietario);
  const activa = accesos.find((e) => e.activa);

  const crear = async () => {
    if (!form.razonSocial.trim()) return toast.error("La razón social es obligatoria");
    if (form.planCuentas === "COPIAR" && !form.copiarDeTenantId) return toast.error("Elige de qué empresa copiar el plan");
    setGuardando(true);
    try {
      await axiosInstance.post("/tenant/mis-empresas", {
        ...form,
        ruc: form.ruc || undefined,
        copiarDeTenantId: form.planCuentas === "COPIAR" ? Number(form.copiarDeTenantId) : undefined,
      });
      toast.success("Empresa creada");
      setModalOpen(false);
      setForm(formVacio);
      cargar();
    } catch (error: any) {
      toast.error(error?.response?.data?.message ?? "No se pudo crear la empresa");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="w-full">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Mis empresas</h3>
          <p className="text-sm text-gray-500">Crea empresas y cambia entre ellas sin cerrar sesión.</p>
        </div>
        {esPropietario && (
          <button type="button" className="bg-indigo-600 text-white text-sm font-semibold rounded-lg px-4 py-2" onClick={() => setModalOpen(true)}>
            + Nueva empresa
          </button>
        )}
      </div>

      {esPropietario && (
        <div className="border-l-4 border-indigo-500 bg-white rounded-lg px-4 py-3 mb-4 inline-block">
          <div className="text-2xl font-bold text-gray-900">{datos.totalUsuarios}</div>
          <div className="text-xs text-gray-400 uppercase">Usuarios en tu cuenta</div>
        </div>
      )}

      <div className="bg-white border border-gray-100 rounded-2xl overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th className="px-4 py-3">Empresa</th>
              <th className="px-4 py-3">RUC</th>
              <th className="px-4 py-3">Usuarios</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className="px-4 py-8 text-center">Cargando...</td></tr>
            ) : accesos.length === 0 ? (
              <tr><td colSpan={4} className="px-4 py-8 text-center">No tienes empresas.</td></tr>
            ) : (
              accesos.map((e) => {
                const propia = datos.empresas.find((x: any) => x.tenantId === e.tenantId);
                return (
                  <tr key={e.tenantId} className="border-b">
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {e.nombre}
                      {e.esPropietario && <span className="ml-2 text-xs text-indigo-600">Propietario</span>}
                    </td>
                    <td className="px-4 py-3">{e.ruc ?? ""}</td>
                    <td className="px-4 py-3">{propia ? propia.usuarios : "—"}</td>
                    <td className="px-4 py-3 text-right">
                      {e.activa ? (
                        <span className="text-xs font-semibold text-green-600">Empresa activa</span>
                      ) : (
                        <button type="button" className="text-xs font-semibold text-indigo-600 hover:underline"
                          onClick={() => cambiarEmpresa(e.tenantId).catch(() => toast.error("No se pudo cambiar de empresa"))}>
                          Entrar
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={modalOpen}
        onRequestClose={() => setModalOpen(false)}
        ariaHideApp={false}
        className="bg-white rounded-2xl p-6 w-full max-w-[560px] max-h-[90vh] overflow-y-auto outline-none mx-4"
        overlayClassName="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Nueva empresa</h3>
        <p className="text-xs text-gray-500 mb-4">Se crea con el mismo rubro que {activa?.nombre ?? "la empresa activa"}.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="sm:col-span-2">
            <label className="text-xs font-semibold text-gray-500">Razón social *</label>
            <input className={celda} value={form.razonSocial} onChange={(e) => setForm({ ...form, razonSocial: e.target.value })} />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500">Nombre comercial</label>
            <input className={celda} value={form.nombreComercial} onChange={(e) => setForm({ ...form, nombreComercial: e.target.value })} />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500">RUC</label>
            <input className={celda} maxLength={11} value={form.ruc}
              onChange={(e) => setForm({ ...form, ruc: e.target.value.replace(/\D/g, "") })} />
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs font-semibold text-gray-500">Dirección</label>
            <input className={celda} value={form.direccion} onChange={(e) => setForm({ ...form, direccion: e.target.value })} />
          </div>
        </div>

        <div className="mt-4">
          <label className="text-xs font-semibold text-gray-700">Plan de cuentas</label>
          <div className="flex flex-col gap-2 mt-2">
            {PLANES.map((p) => (
              <label key={p.value} className={`flex gap-3 border rounded-lg px-3 py-2 cursor-pointer ${form.planCuentas === p.value ? "border-indigo-400 bg-indigo-50" : "border-gray-200"}`}>
                <input type="radio" name="planCuentas" checked={form.planCuentas === p.value}
                  onChange={() => setForm({ ...form, planCuentas: p.value })} />
                <span>
                  <span className="block text-sm font-semibold text-gray-800">{p.label}</span>
                  <span className="block text-xs text-gray-500">{p.ayuda}</span>
                </span>
              </label>
            ))}
          </div>
          {form.planCuentas === "COPIAR" && (
            <select className={celda} value={form.copiarDeTenantId} onChange={(e) => setForm({ ...form, copiarDeTenantId: e.target.value })}>
              <option value="">Elige la empresa de origen</option>
              {accesos.map((e) => <option key={e.tenantId} value={e.tenantId}>{e.nombre}</option>)}
            </select>
          )}
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <button type="button" className="border border-gray-300 rounded-lg px-4 py-2 text-sm" onClick={() => setModalOpen(false)}>Cancelar</button>
          <button type="button" className="bg-indigo-600 text-white text-sm font-semibold rounded-lg px-4 py-2 disabled:opacity-60"
            disabled={guardando} onClick={crear}>
            {guardando ? "Creando..." : "Crear empresa"}
          </button>
        </div>
      </Modal>
    </div>
  );
};
