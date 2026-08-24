import { createReducer, Dispatch, AnyAction } from "@reduxjs/toolkit";

import * as types from "./types";
import { ILayoutVentasRealizadasProviders } from "./interfaces";
import axiosInstance from "../../../../utils/axios";
import Swal from "sweetalert2";
/* import { toast } from 'sonner' */
const initialState: ILayoutVentasRealizadasProviders = {
  ventas: [],
  totalVentas: 0,
  activeVentas: null,
  providers: [],
  totalProviders: 0,
  anfitrionas: [],
  totalAnfitrionas: 0,
  activeProviders: null,
  activeAnfitrionas: null,
  modalVentas: false,
  pdf: ''
};
export const ventasRealizadas = createReducer(initialState, (builder) => {
  builder
    .addCase(
      "OPEN_MODAL_VENTAS",
      (
        state: ILayoutVentasRealizadasProviders
      ): ILayoutVentasRealizadasProviders => {
        return {
          ...state,
          modalVentas: true,
        };
      }
    )
    .addCase(
      "CLOSE_MODAL_VENTAS",
      (
        state: ILayoutVentasRealizadasProviders
      ): ILayoutVentasRealizadasProviders => {
        return {
          ...state,
          modalVentas: false,
        };
      }
    )
    .addCase(
      "GET_ALL_VENTAS",
      (
        state: ILayoutVentasRealizadasProviders,
        action: types.IGetAllVentas
      ): ILayoutVentasRealizadasProviders => {
        return {
          ...state,
          ventas: action.payload.items,
          totalVentas: action.payload.total,
        };
      }
    )
    .addCase(
      "ACTIVE_VENTAS",
      (
        state: ILayoutVentasRealizadasProviders,
        action: types.IActiveVentas
      ): ILayoutVentasRealizadasProviders => {
        return {
          ...state,
          activeVentas: {
            ...action.payload,
          },
        };
      }
    )
    .addCase(
      "CLEAR_ACTIVE_VENTAS",
      (
        state: ILayoutVentasRealizadasProviders
      ): ILayoutVentasRealizadasProviders => {
        return {
          ...state,
          activeVentas: null,
        };
      }
    )
    .addCase(
      "DELETE_VENTAS",
      (
        state: ILayoutVentasRealizadasProviders,
        action: types.IDeleteVentas
      ): ILayoutVentasRealizadasProviders => {
        return {
          ...state,
          activeVentas: null,
          ventas: state.ventas.filter(
            (ventas) => ventas.productoId !== action.payload
          ),
        };
      }
    )
    .addCase(
      "ANULAR_VENTAS",
      (
        state: ILayoutVentasRealizadasProviders,
        action: types.IAnularVentas
      ): ILayoutVentasRealizadasProviders => {
        return {
          ...state,
          ventas: state.ventas.map((item: any) => {
            if(item?.idComprobante === action.payload?.idComprobante) {
              return {
                ...item,
                estadoComprobante: 'ANULADO'
              }
            } else {
              return item
            }
          }),
          // caja: false,
        };
      }
    )
    .addCase(
      "PDF_BY_DOCUMENT",
      (
        state: ILayoutVentasRealizadasProviders,
        action: types.IDocumentPDF
      ): ILayoutVentasRealizadasProviders => {
        return {
          ...state,
          pdf: action.payload,
          // caja: false,
        };
      }
    )
});



export const openModalVentas = () => {
  return async (dispatch: Dispatch<types.IOpenModalVentas | any>) => {
    dispatch({
      type: types.OPEN_MODAL_VENTAS,
    });
  };
};
export const closeModalVentas = () => {
  return async (dispatch: Dispatch<types.ICloseModalVentas | any>) => {
    dispatch({
      type: types.CLOSE_MODAL_VENTAS,
    });
  };
};
export const getAllVentas = (startDate: string, endDate:string) => {
  return async (dispatch: Dispatch<types.IGetAllVentas | AnyAction>) => {
    try {
      const response: any = await axiosInstance.get(
        `/facturacion/listar?Page=1&Amount=10000&StartDate=${startDate}&EndDate=${endDate}`
        // `/facturacion/listar?Page=1&Amount=100`
      );
      const { status, data } = response;
    

      console.log(response);
      console.log(data);

      if (status === 200) {
        dispatch({
          type: types.GET_ALL_VENTAS,
          payload: data?.data,
        });
      } else {
        console.log("404");
        dispatch({
          type: types.GET_ALL_VENTAS,
          payload: null,
        });
      }
    } catch (error: any) {
      console.log("error", error);
      dispatch({
        type: types.GET_ALL_VENTAS,
        payload: [],
      });
    }
  };
};

export const deleteVentas = (idComprobante: any) => {
  return async (dispatch: Dispatch<types.IAnularVentas | AnyAction>) => {
    try {
      const response: any = await axiosInstance.delete(
        `/facturacion/anular?idComprobante=${idComprobante}`,
        {}
      );
      const { status, data } = response;
      console.log(data);
      if (status === 200) {
        dispatch({
          type: types.DELETE_VENTAS,
          payload: idComprobante,
        });
      }
    } catch (error: any) {
      console.log(error);
    }
  };
};

export const generarPDF = (idComprobante: any) => {
  return async (dispatch: Dispatch<types.IAnularVentas | AnyAction>) => {
    try {
      const response: any = await axiosInstance.get(
        `/facturacion/generar-pdf?idComprobante=${idComprobante}`,
        {}
      );
      const { status, data } = response;
      if (status === 200) {
        const binary_string = window.atob(data.data);
        const len = binary_string.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binary_string.charCodeAt(i);
        }
  
        const newBlob = new Blob([bytes.buffer]);
  
        const fileURL = window.URL.createObjectURL(newBlob);
        // Setting various property values
        const alink = document.createElement('a');
        alink.href = fileURL;
        alink.download = `comprobante-${idComprobante}.pdf`;
        alink.click();
        dispatch({
          type: types.PDF_BY_DOCUMENT,
          payload: data?.data,
        });
      }
    } catch (error: any) {
      console.log(error);
    }
  };
};

export const AnularVenta = (dataAnular: any) => {
  return async (dispatch: Dispatch<types.IAnularVentas | AnyAction>) => {
    Swal.fire({
      title: `¿Estás seguro que desea anular el comprobante ?`,
      text: "Recuerda:¡No podrás revertir esto!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, anular Venta",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const { data }: any = await axiosInstance.post(`/facturacion/anular`,dataAnular);
          if (data?.code === 1) {
            return dispatch({
              type: types.ANULAR_VENTAS,
              payload: dataAnular,
            });
          }
          Swal.fire(`¡Se anulo correctamente la venta.", "success"`);
        } catch (error: any) {
          console.log(error);
        }
      }
    });
  };
};

export const activeVentas = (ventas: any) => {
  return async (dispatch: Dispatch<types.IActiveVentas | any>) => {
    dispatch({
      type: types.ACTIVE_VENTAS,
      payload: ventas,
    });
  };
};
export const clearActiveVentas = () => {
  return async (dispatch: Dispatch<types.IClearActiveVentas | any>) => {
    dispatch({
      type: types.CLEAR_ACTIVE_VENTAS,
    });
  };
};
