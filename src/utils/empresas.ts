import axiosInstance, { SUCURSAL_ACTIVA_KEY } from "./axios";
import { setToken } from "../helpers/auth-helpers";

export interface IEmpresaAcceso {
  tenantId: number;
  nombre: string;
  ruc?: string;
  esPropietario: boolean;
  activa: boolean;
}

export const listarEmpresas = async (): Promise<IEmpresaAcceso[]> => {
  const { data }: any = await axiosInstance.get("/autenticacion/empresas");
  return data?.data ?? [];
};

// El token es por empresa: se pide uno nuevo y se recarga para que todas las pantallas vuelvan a
// pedir sus datos con la empresa elegida. La sede guardada era de la otra empresa, se descarta.
export const cambiarEmpresa = async (tenantId: number) => {
  const { data }: any = await axiosInstance.post(`/autenticacion/cambiar-empresa/${tenantId}`);
  setToken(data.data.token);
  localStorage.removeItem(SUCURSAL_ACTIVA_KEY);
  window.location.href = "/dashboard";
};
