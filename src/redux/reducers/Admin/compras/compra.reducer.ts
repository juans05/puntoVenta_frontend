import { createReducer, Dispatch, AnyAction } from "@reduxjs/toolkit";

import * as types from "./types";
import { IComprasState } from "./interfaces";
import axiosInstance from "../../../../utils/axios";
import { toast } from "sonner";

const initialState: IComprasState = {
  compras: [],
  totalCompras: 0,
  proveedores: [],
  productosCompra: [],
  loadingCompras: false,
};

export const compraReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(
      types.GET_COMPRAS,
      (state: IComprasState, action: any): IComprasState => {
        return {
          ...state,
          compras: action.payload.items,
          totalCompras: action.payload.total,
        };
      }
    )
    .addCase(
      types.GET_PROVEEDORES,
      (state: IComprasState, action: any): IComprasState => {
        return { ...state, proveedores: action.payload };
      }
    )
    .addCase(
      types.GET_PRODUCTOS_COMPRA,
      (state: IComprasState, action: any): IComprasState => {
        return { ...state, productosCompra: action.payload };
      }
    );
});

export const getCompras =(page: number, amount: number) => {
  return async (dispatch: Dispatch<AnyAction>) => {
    try {
      const response: any = await axiosInstance.get(
        `/compras/listar?Page=${page}&Amount=${amount}`
      );
      const { status, data } = response;
      if (status === 200) {
        dispatch({ type: types.GET_COMPRAS, payload: data?.data });
      } else {
        dispatch({ type: types.GET_COMPRAS, payload: { items: [], total: 0 } });
      }
    } catch (error: any) {
      console.log(error);
      dispatch({ type: types.GET_COMPRAS, payload: { items: [], total: 0 } });
    }
  };
};

export const getProveedores = () => {
  return async (dispatch: Dispatch<AnyAction>) => {
    try {
      const response: any = await axiosInstance.get(
        `/proveedor/listar?Page=1&Amount=100`
      );
      const { status, data } = response;
      if (status === 200) {
        dispatch({ type: types.GET_PROVEEDORES, payload: data?.data?.items ?? [] });
      } else {
        dispatch({ type: types.GET_PROVEEDORES, payload: [] });
      }
    } catch (error: any) {
      dispatch({ type: types.GET_PROVEEDORES, payload: [] });
    }
  };
};

export const getProductosCompra = () => {
  return async (dispatch: Dispatch<AnyAction>) => {
    try {
      const response: any = await axiosInstance.get(
        `/productos/listar?CategoriaId=0&Value=&Page=1&Amount=200`
      );
      const { status, data } = response;
      if (status === 200) {
        dispatch({
          type: types.GET_PRODUCTOS_COMPRA,
          payload: data?.data?.items ?? [],
        });
      } else {
        dispatch({ type: types.GET_PRODUCTOS_COMPRA, payload: [] });
      }
    } catch (error: any) {
      dispatch({ type: types.GET_PRODUCTOS_COMPRA, payload: [] });
    }
  };
};

export const crearCompra = (payload: any, onSuccess?: () => void) => {
  return async (dispatch: Dispatch<AnyAction>) => {
    try {
      const response: any = await axiosInstance.post(`/compras/crear`, payload);
      const { status } = response;
      if (status === 200) {
        toast.success("Compra registrada correctamente");
        dispatch(getCompras(1, 20) as any);
        onSuccess?.();
      }
    } catch (error: any) {
      console.log(error);
      toast.error(error?.response?.data?.message ?? "Error al registrar la compra");
    }
  };
};

export const actualizarCompra = (id: number, payload: any, onSuccess?: () => void) => {
  return async (dispatch: Dispatch<AnyAction>) => {
    try {
      const response: any = await axiosInstance.put(`/compras/actualizar/${id}`, payload);
      const { status } = response;
      if (status === 200) {
        toast.success("Compra actualizada correctamente");
        dispatch(getCompras(1, 20) as any);
        onSuccess?.();
      }
    } catch (error: any) {
      console.log(error);
      toast.error(error?.response?.data?.message ?? "Error al editar la compra");
    }
  };
};

export const anularCompra = (id: number) => {
  return async (dispatch: Dispatch<AnyAction>) => {
    try {
      const response: any = await axiosInstance.put(`/compras/anular?id=${id}`);
      const { status } = response;
      if (status === 200) {
        toast.success("Compra anulada correctamente");
        dispatch(getCompras(1, 20) as any);
      }
    } catch (error: any) {
      console.log(error);
      toast.error(error?.response?.data?.message ?? "Error al anular la compra");
    }
  };
};
