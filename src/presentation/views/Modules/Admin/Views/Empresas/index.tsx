import { useEffect, useState } from "react";
import { Button } from "@tremor/react";
import { Toaster } from "sonner";
import { useAppDispatch, useAppSelector } from "../../../../../../redux/store";
import { RootState } from "../../../../../../redux/rootState";
import {
  getTenantsResumen,
  reasignarModulos,
  setTenantActivo,
} from "../../../../../../redux/reducers/Admin/my-business/myBusiness.reducer";
import { NuevaEmpresaModal } from "../MyBusiness/NuevaEmpresa";

export const Empresas = () => {
  const dispatch = useAppDispatch();
  const { tenantsResumen }: any = useAppSelector((state: RootState) => state.myBusiness);
  const [showNuevaEmpresa, setShowNuevaEmpresa] = useState(false);

  useEffect(() => {
    dispatch(getTenantsResumen() as any);
  }, [dispatch]);

  const handleToggle = (tenant: any) => {
    const accion = tenant.activo ? "deshabilitar" : "habilitar";
    if (!window.confirm(`¿Seguro que deseas ${accion} la empresa "${tenant.name}"? ${tenant.activo ? "Sus usuarios no podrán iniciar sesión mientras esté deshabilitada." : ""}`))
      return;
    dispatch(setTenantActivo(tenant.identificador, !tenant.activo) as any);
  };

  const handleReasignarModulos = (tenant: any) => {
    if (!window.confirm(`¿Reasignar todos los módulos a los usuarios de "${tenant.name}"?`))
      return;
    dispatch(reasignarModulos(tenant.identificador) as any);
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Empresas</h3>
          <p className="text-sm text-gray-500">Empresas registradas en la plataforma. Habilita o deshabilita el acceso de cada una.</p>
        </div>
        <Button size="sm" onClick={() => setShowNuevaEmpresa(true)}>Nueva empresa</Button>
      </div>

      <NuevaEmpresaModal
        isOpen={showNuevaEmpresa}
        onClose={() => {
          setShowNuevaEmpresa(false);
          dispatch(getTenantsResumen() as any);
        }}
      />

      <div className="relative overflow-x-auto sm:rounded-lg border border-gray-200">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th scope="col" className="px-4 py-3">Tenant</th>
              <th scope="col" className="px-4 py-3">Empresa</th>
              <th scope="col" className="px-4 py-3">RUC</th>
              <th scope="col" className="px-4 py-3">Rubro</th>
              <th scope="col" className="px-4 py-3">Estado</th>
              <th scope="col" className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {tenantsResumen?.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-6 text-center">No hay empresas registradas</td></tr>
            )}
            {tenantsResumen?.map((t: any) => (
              <tr key={t.identificador} className="bg-white border-b hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{t.tenantKey}</td>
                <td className="px-4 py-3">{t.nombreComercial ?? "-"}</td>
                <td className="px-4 py-3">{t.ruc ?? "-"}</td>
                <td className="px-4 py-3">{t.rubroNombre ?? "-"}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${t.activo ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                    {t.activo ? "Habilitada" : "Deshabilitada"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <Button size="xs" variant={t.activo ? "secondary" : "primary"} onClick={() => handleToggle(t)}>
                      {t.activo ? "Deshabilitar" : "Habilitar"}
                    </Button>
                    <Button size="xs" variant="secondary" onClick={() => handleReasignarModulos(t)}>
                      Reasignar módulos
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Toaster richColors position="top-right" duration={2000} />
    </div>
  );
};
