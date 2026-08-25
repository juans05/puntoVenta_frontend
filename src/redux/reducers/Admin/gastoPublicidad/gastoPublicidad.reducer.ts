import { createReducer, Dispatch, AnyAction } from "@reduxjs/toolkit";
import * as types from "./types";
import { IGastoPublicidadState } from "./interfaces";
import axiosInstance from "../../../../utils/axios";
import { toast } from "sonner";

const initialState: IGastoPublicidadState = {
  roi: [],
};

export const gastoPublicidadReducer = createReducer(initialState, (builder) => {
  builder.addCase(
    types.GET_GASTO_PUBLICIDAD_ROI,
    (state: IGastoPublicidadState, action: any): IGastoPublicidadState => {
      return {
        ...state,
        roi: action.payload,
      };
    }
  );
});

export const getRoiPublicidad = (desde?: string, hasta?: string, productoId?: number) => {
  return async (dispatch: Dispatch<AnyAction>) => {
    try {
      const params = new URLSearchParams();
      if (desde) params.append("Desde", desde);
      if (hasta) params.append("Hasta", hasta);
      if (productoId) params.append("ProductoId", String(productoId));

      const response: any = await axiosInstance.get(`/gastopublicidad/roi?${params.toString()}`);
      const { status, data } = response;
      if (status === 200) {
        dispatch({ type: types.GET_GASTO_PUBLICIDAD_ROI, payload: data?.data ?? [] });
      }
    } catch (error: any) {
      console.log(error);
      toast.error(error?.response?.data?.message ?? "Error al calcular el ROI");
      dispatch({ type: types.GET_GASTO_PUBLICIDAD_ROI, payload: [] });
    }
  };
};

export const importarGastoPublicidad = async (payload: any) => {
  const response: any = await axiosInstance.post("/gastopublicidad/importar", payload);
  return response.data?.data;
};
