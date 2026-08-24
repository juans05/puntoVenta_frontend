import { createReducer, Dispatch, AnyAction } from "@reduxjs/toolkit";

import * as types from "./types";

import axiosInstance from "../../../../utils/axios";
import { IReporteCaja } from "./interfaces";
/* import { toast } from 'sonner' */
const initialState: IReporteCaja = {
    reporteCaja: [],
    reporteCajaResumido:null,
    
};
export const reporteCierreCaja = createReducer(initialState, (builder) => {
  builder
   

    .addCase(
      "GET_ALL_REPORTES",
      (
        state: IReporteCaja,
        action: types.IGetAllReportes
      ): IReporteCaja => {
        return {
          ...state,
          reporteCaja: action.payload,
      
        };
      }
    )
    .addCase(
      "GET_ALL_REPORTES_RESUMIDO",
      (
        state: IReporteCaja,
        action: types.IGetAllReportesResumido
      ): IReporteCaja => {
        return {
          ...state,
          reporteCajaResumido: action.payload,
      
        };
      }
    )
   
});


export const getAllReporteMain = (username:string, date:string) => {
  return async (dispatch: Dispatch<types.IGetAllReportes | AnyAction>) => {
    try {
      const response: any = await axiosInstance.get(
        `/caja/reporte-caja?usuario=${username}&fecha=${date}`
      );
      const { status, data } = response;
      console.log(data);
      if (status === 200) {
        dispatch({
          type: types.GET_ALL_REPORTES,
          payload: data?.data,
        });
      }else{
        dispatch({
          type: types.GET_ALL_REPORTES,
          payload: [],
        });
      }
    } catch (error: any) {
      console.log(error);
      dispatch({
        type: types.GET_ALL_REPORTES,
        payload: [],
      });
    }
  };
};




export const getAllReporteMainResumido = (username:string, date:string) => {
  return async (dispatch: Dispatch<types.IGetAllReportesResumido | AnyAction>) => {
    try {
      const response: any = await axiosInstance.get(
        `/caja/reporte-caja-resumido?usuario=${username}&fecha=${date}`
      );
      const { status, data } = response;
      console.log(data);
      if (status === 200) {
        dispatch({
          type: types.GET_ALL_REPORTES_RESUMIDO,
          payload: data?.data,
        });
      }else{
        dispatch({
          type: types.GET_ALL_REPORTES_RESUMIDO,
          payload: null,
        });
      }
    } catch (error: any) {
      console.log(error);
      dispatch({
        type: types.GET_ALL_REPORTES_RESUMIDO,
        payload: null,
      });
    }
  };
};


