import { useEffect, useState } from "react";
import { Toaster, toast } from "sonner";
import { Icon } from "@iconify/react/dist/iconify.js";
import { getToken } from "../../../helpers/auth-helpers";
import { cambiarEmpresa, IEmpresaAcceso, listarEmpresas } from "../../../utils/empresas";

// Pantalla posterior al login cuando el usuario tiene acceso a mas de una empresa.
const SeleccionarEmpresa = () => {
  const [empresas, setEmpresas] = useState<IEmpresaAcceso[]>([]);
  const [cargando, setCargando] = useState(true);
  const [entrando, setEntrando] = useState<number | null>(null);

  useEffect(() => {
    if (!getToken()) {
      window.location.href = "/";
      return;
    }
    listarEmpresas()
      .then(setEmpresas)
      .catch(() => toast.error("No se pudieron cargar tus empresas"))
      .finally(() => setCargando(false));
  }, []);

  const entrar = async (tenantId: number) => {
    setEntrando(tenantId);
    try {
      await cambiarEmpresa(tenantId);
    } catch (error: any) {
      toast.error(error?.response?.data?.message ?? "No se pudo entrar a la empresa");
      setEntrando(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <Toaster position="top-right" richColors />
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-bold text-gray-900">Elige una empresa</h2>
        <p className="text-sm text-gray-500 mt-1">Podrás cambiar de empresa luego desde la parte superior.</p>

        <div className="mt-5 flex flex-col gap-2">
          {cargando ? (
            <p className="text-sm text-gray-400 py-6 text-center">Cargando...</p>
          ) : empresas.length === 0 ? (
            <p className="text-sm text-gray-400 py-6 text-center">No tienes empresas asignadas.</p>
          ) : (
            empresas.map((e) => (
              <button
                key={e.tenantId}
                type="button"
                disabled={entrando !== null}
                onClick={() => entrar(e.tenantId)}
                className="flex items-center gap-3 text-left border border-gray-200 rounded-xl px-4 py-3 hover:border-indigo-400 hover:bg-indigo-50 disabled:opacity-60"
              >
                <Icon icon="mdi:office-building-outline" width={26} className="text-indigo-500" />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-900 truncate">{e.nombre}</div>
                  <div className="text-xs text-gray-500">
                    {e.ruc ? `RUC ${e.ruc}` : "Sin RUC"}
                    {e.esPropietario ? " · Propietario" : ""}
                  </div>
                </div>
                {entrando === e.tenantId ? (
                  <span className="text-xs text-indigo-600">Entrando...</span>
                ) : (
                  <Icon icon="mdi:chevron-right" width={22} className="text-gray-400" />
                )}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default SeleccionarEmpresa;
