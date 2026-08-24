import { createReducer, Dispatch, AnyAction } from "@reduxjs/toolkit";
import * as types from "./types";
import { ILayoutConfiguracionRenta } from "./interfaces";
import axiosInstance from "../../../../utils/axios";
import { toast } from "sonner";

const initialState: ILayoutConfiguracionRenta = {
  configuracion: null,
  loading: false,
};

export const configuracionRentaReducer = createReducer(initialState, (builder) => {
  builder
    .addCase("SET_LOADING_CONFIGURACION", (state: ILayoutConfiguracionRenta, action: any): ILayoutConfiguracionRenta => {
      return {
        ...state,
        loading: action.payload,
      };
    })
    .addCase("GET_CONFIGURACION_RENTA", (state: ILayoutConfiguracionRenta, action: types.IGetConfiguracionRenta): ILayoutConfiguracionRenta => {
      return {
        ...state,
        configuracion: action.payload,
        loading: false,
      };
    })
    .addCase("SAVE_CONFIGURACION_RENTA", (state: ILayoutConfiguracionRenta, action: types.ISaveConfiguracionRenta): ILayoutConfiguracionRenta => {
      return {
        ...state,
        configuracion: action.payload,
        loading: false,
      };
    })
    .addCase("CLEAR_CONFIGURACION_RENTA", (): ILayoutConfiguracionRenta => {
      return {
        ...initialState,
      };
    });
});

export const getConfiguracionRubro = (rubroId: number) => {
  return async (dispatch: Dispatch<types.IGetConfiguracionRenta | AnyAction>) => {
    if (!rubroId) return;
    dispatch({
      type: types.SET_LOADING_CONFIGURACION,
      payload: true,
    });
    try {
      const response: any = await axiosInstance.get(
        `/tenant/configuracion-rubro?rubroId=${rubroId}`
      );
      const { status, data } = response;
      if (status === 200) {
        dispatch({
          type: types.GET_CONFIGURACION_RENTA,
          payload: data?.data,
        });
      } else {
        dispatch({
          type: types.SET_LOADING_CONFIGURACION,
          payload: false,
        });
      }
    } catch (error: any) {
      console.log(error);
      dispatch({
        type: types.SET_LOADING_CONFIGURACION,
        payload: false,
      });
    }
  };
};

export const saveConfiguracionRubro = (rubroId: number, payload: any) => {
  return async (dispatch: Dispatch<types.ISaveConfiguracionRenta | AnyAction>) => {
    if (!rubroId) return;
    dispatch({
      type: types.SET_LOADING_CONFIGURACION,
      payload: true,
    });
    try {
      const response: any = await axiosInstance.put(
        `/tenant/configuracion-rubro?rubroId=${rubroId}`,
        payload
      );
      const { status, data } = response;
      if (status === 200) {
        dispatch({
          type: types.SAVE_CONFIGURACION_RENTA,
          payload: data?.data,
        });
        toast.success(data?.message ?? "Configuración guardada correctamente");
      } else {
        dispatch({
          type: types.SET_LOADING_CONFIGURACION,
          payload: false,
        });
      }
    } catch (error: any) {
      console.log(error);
      dispatch({
        type: types.SET_LOADING_CONFIGURACION,
        payload: false,
      });
      toast.error("Hubo un error al guardar la configuración");
    }
  };
};

export const clearConfiguracionRubro = () => {
  return async (dispatch: Dispatch<types.IClearConfiguracionRenta | any>) => {
    dispatch({
      type: types.CLEAR_CONFIGURACION_RENTA,
    });
  };
};
