import { createReducer, Dispatch, AnyAction } from "@reduxjs/toolkit";

import * as types from "./types";
import { IGastosState } from "./interfaces";
import axiosInstance from "../../../../utils/axios";
import { toast } from "sonner";

const initialState: IGastosState = {
  gastos: [],
  totalGastos: 0,
};

export const gastoReducer = createReducer(initialState, (builder) => {
  builder.addCase(
    types.GET_GASTOS,
    (state: IGastosState, action: any): IGastosState => {
      return {
        ...state,
        gastos: action.payload.items,
        totalGastos: action.payload.total,
      };
    }
  );
});

export const getGastos = (page: number, amount: number) => {
  return async (dispatch: Dispatch<AnyAction>) => {
    try {
      const response: any = await axiosInstance.get(
        `/gastos/listar?Page=${page}&Amount=${amount}`
      );
      const { status, data } = response;
      if (status === 200) {
        dispatch({ type: types.GET_GASTOS, payload: data?.data });
      } else {
        dispatch({ type: types.GET_GASTOS, payload: { items: [], total: 0 } });
      }
    } catch (error: any) {
      console.log(error);
      dispatch({ type: types.GET_GASTOS, payload: { items: [], total: 0 } });
    }
  };
};

export const crearGasto = (payload: any, onSuccess?: () => void) => {
  return async (dispatch: Dispatch<AnyAction>) => {
    try {
      const response: any = await axiosInstance.post(`/gastos/crear`, payload);
      const { status } = response;
      if (status === 200) {
        toast.success("Gasto registrado correctamente");
        dispatch(getGastos(1, 20) as any);
        onSuccess?.();
      }
    } catch (error: any) {
      console.log(error);
      toast.error(error?.response?.data?.message ?? "Error al registrar el gasto");
    }
  };
};

export const importarGastos = (filas: any[], onSuccess?: () => void) => {
  return async (dispatch: Dispatch<AnyAction>) => {
    try {
      const response: any = await axiosInstance.post(`/gastos/importar`, { filas });
      const { status, data } = response;
      if (status === 200) {
        toast.success(data?.message ?? "Gastos importados correctamente");
        dispatch(getGastos(1, 20) as any);
        onSuccess?.();
      }
    } catch (error: any) {
      console.log(error);
      toast.error(error?.response?.data?.message ?? "Error al importar los gastos");
    }
  };
};

export const anularGasto = (id: number) => {
  return async (dispatch: Dispatch<AnyAction>) => {
    try {
      const response: any = await axiosInstance.put(`/gastos/anular?id=${id}`);
      const { status } = response;
      if (status === 200) {
        toast.success("Gasto eliminado correctamente");
        dispatch(getGastos(1, 20) as any);
      }
    } catch (error: any) {
      console.log(error);
      toast.error(error?.response?.data?.message ?? "Error al eliminar el gasto");
    }
  };
};
