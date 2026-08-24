export const GET_CONFIGURACION_RENTA = "GET_CONFIGURACION_RENTA";
export const SAVE_CONFIGURACION_RENTA = "SAVE_CONFIGURACION_RENTA";
export const CLEAR_CONFIGURACION_RENTA = "CLEAR_CONFIGURACION_RENTA";
export const SET_LOADING_CONFIGURACION = "SET_LOADING_CONFIGURACION";

export interface IGetConfiguracionRenta {
  type: typeof GET_CONFIGURACION_RENTA;
  payload: any;
}
export interface ISaveConfiguracionRenta {
  type: typeof SAVE_CONFIGURACION_RENTA;
  payload: any;
}
export interface IClearConfiguracionRenta {
  type: typeof CLEAR_CONFIGURACION_RENTA;
}
export interface ISetLoadingConfiguracion {
  type: typeof SET_LOADING_CONFIGURACION;
  payload: boolean;
}

export type IConfiguracionRentaActions =
  | IGetConfiguracionRenta
  | ISaveConfiguracionRenta
  | IClearConfiguracionRenta
  | ISetLoadingConfiguracion;
