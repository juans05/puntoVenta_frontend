import { AnyAction, createReducer, Dispatch } from "@reduxjs/toolkit";

import * as types from "./types";

import Swal from "sweetalert2";

import { ILayoutAsistencia } from "./interfaces";
import axiosInstance from "../../../../utils/axios";
const initialState: ILayoutAsistencia = {
  popoverAsistencia: false,
  room: null,

  activeRoom: null,
  listRenta: [],
  listCuartos: [],
  occupiedRoom: [],
  modalFichas: false,
  marcarSalida: null,
  listaReporteRentas:[],
  listFichasByRoom:[],
  completeRenta:null,
};
export const asistenciaReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(
      "OPEN_POPOVER_ASISTENCIA",
      (
        state: ILayoutAsistencia,
        action: types.IOpenPopoverAsistencia
      ): ILayoutAsistencia => {
        return {
          ...state,
          popoverAsistencia: true,
          room: action.payload,
        };
      }
    )
    .addCase(
      "CLOSE_POPOVER_ASISTENCIA",
      (state: ILayoutAsistencia): ILayoutAsistencia => {
        return {
          ...state,
          popoverAsistencia: false,
        };
      }
    )
    .addCase(
      "LIST_RENTA",
      (
        state: ILayoutAsistencia,
        action: types.IListRenta
      ): ILayoutAsistencia => {
        return {
          ...state,
          listRenta: action.payload,
        };
      }
    )
    .addCase(
      "LIST_REPORTE_RENTAS",
      (
        state: ILayoutAsistencia,
        action: types.IListReporteRentas
      ): ILayoutAsistencia => {
        return {
          ...state,
          listaReporteRentas: action.payload,
        };
      }
    )
    .addCase(
      "LIST_FICHAS_BY_ROOM",
      (
        state: ILayoutAsistencia,
        action: types.IListFichasByRoom
      ): ILayoutAsistencia => {
        return {
          ...state,
          listFichasByRoom: action.payload,
        };
      }
    )
    .addCase(
      "LIST_CUARTOS",
      (
        state: ILayoutAsistencia,
        action: types.IListCuartos
      ): ILayoutAsistencia => {
        return {
          ...state,
          listCuartos: action.payload,
        };
      }
    )
    .addCase(
      "CREATE_RENTA",
      (
        state: ILayoutAsistencia,
        action: types.ICreateRenta
      ): ILayoutAsistencia => {
        const newState = {
          ...state,
          listRenta: [action.payload, ...state.listRenta],
        };
        const newArray = newState.listRenta.map((element, index) => {
          return { ...element, index: index + 1 };
        });
        return {
          ...state,
          listRenta: newArray,
        };
      }
    )
    .addCase(
      "OPEN_MODAL_FICHAS",
      (state: ILayoutAsistencia): ILayoutAsistencia => {
        return {
          ...state,
          modalFichas: true,
        };
      }
    )
    .addCase(
      "CLOSE_MODAL_FICHAS",
      (state: ILayoutAsistencia): ILayoutAsistencia => {
        return {
          ...state,
          modalFichas: false,
        };
      }
    )
    .addCase(
      "MARCAR_SALIDA",
      (
        state: ILayoutAsistencia,
        action: types.IMarcarSalida
      ): ILayoutAsistencia => {
        return {
          ...state,
          marcarSalida: action.payload,
          listRenta:state.listRenta.filter((value:any)=>value?.anfitrionaId!=action.payload.anfitrionaId  )
        };
      }
    )
    .addCase(
      "COMPLETE_RENTA",
      (
        state: ILayoutAsistencia,
        action: types.ICompleteRenta
      ): ILayoutAsistencia => {
        return {
          ...state,
          completeRenta: action.payload,
          listaReporteRentas:state.listaReporteRentas.map((listaReporteRentas:any)=>listaReporteRentas.id===action.payload.id?action.payload:listaReporteRentas),
          listRenta:state.listRenta.map((listRenta:any)=>listRenta.id===action.payload.id?action.payload:listRenta),
        
    
        };
      }
    )
    .addCase(
      "ACTIVE_ROOM",
      (
        state: ILayoutAsistencia,
        action: types.IActiveRoom
      ): ILayoutAsistencia => {
        return {
          ...state,
          activeRoom: {
            ...action.payload,
          },
        };
      }
    )
    .addCase(
      "CLEAR_ACTIVE_ROOM",
      (state: ILayoutAsistencia): ILayoutAsistencia => {
        return {
          ...state,
          activeRoom: null,
        };
      }
    )
    .addCase(
      "GET_LIST_OCCUPIED_ROOMS",
      (state: ILayoutAsistencia, action: types.IListOccupiedRoom): ILayoutAsistencia => {
        return {
          ...state,
          occupiedRoom: action.payload,
        };
      }
    );
});
export const openModalFichas = () => {
  return async (dispatch: Dispatch<types.IOpenModalFichas | any>) => {
    dispatch({
      type: types.OPEN_MODAL_FICHAS,
    });
  };
};
export const closeModalFichas = () => {
  return async (dispatch: Dispatch<types.ICloseModalFichas | any>) => {
    dispatch({
      type: types.CLOSE_MODAL_FICHAS,
    });
  };
};
export const openPopoverAsistencia = (room: any) => {
  return async (dispatch: Dispatch<types.IAsistencia | any>) => {
    dispatch({
      type: types.OPEN_POPOVER_ASISTENCIA,
      payload: room,
    });
  };
};
export const closePopoverAsistencia = () => {
  return async (dispatch: Dispatch<types.IAsistencia | any>) => {
    dispatch({
      type: types.CLOSE_POPOVER_ASISTENCIA,
    });
  };
};

export const activeRoom = (producto: any) => {
  return async (dispatch: Dispatch<types.IAsistencia | any>) => {
    dispatch({
      type: types.ACTIVE_ROOM,
      payload: producto,
    });
  };
};
export const clearActiveRoom = () => {
  return async (dispatch: Dispatch<types.IAsistencia | any>) => {
    dispatch({
      type: types.CLEAR_ACTIVE_ROOM,
    });
  };
};


export const getListRenta = (date: any, turno: string) => {
  return async (dispatch: Dispatch<types.IListRenta | AnyAction>) => {
    try {
      /*      const response: any = await axiosInstance.get(`/renta/listar-rentas`); */
      const response: any = await axiosInstance.get(
        `/renta/listar-rentas?fecha=${date}&turno=${turno}`
      );
      const { status, data } = response;
      console.log(data);
      if (status === 200) {
        dispatch({
          type: types.LIST_RENTA,
          payload: data?.data,
        });
      } else {
        dispatch({
          type: types.LIST_RENTA,
          payload: [],
        });
      }
    } catch (error: any) {
      console.log(error);
      dispatch({
        type: types.LIST_RENTA,
        payload: [],
      });
    }
  };
};

export const getListCuartos = () => {
  return async (dispatch: Dispatch<types.IListCuartos | AnyAction>) => {
    try {
      const response: any = await axiosInstance.get(`/renta/listar-cuartos`);
      const { status, data } = response;
      console.log(data);
      if (status === 200) {
        dispatch({
          type: types.LIST_CUARTOS,
          payload: data?.data,
        });
      }
    } catch (error: any) {
      console.log(error);
    }
  };
};

export const createRentaMain = (renta: any) => {
  return async (dispatch: Dispatch<types.ICreateRenta | AnyAction>) => {
    try {
      const response: any = await axiosInstance.post(
        `/renta/crear-renta`,
        renta
      );
      const { status, data } = response;
      console.log(data);
      if (status === 200) {
        dispatch({
          type: types.CREATE_RENTA,
          payload: data?.data,
        });
      }
    } catch (error: any) {
      console.log(error);
    }
  };
};

export const marcarSalidaAnfitriona = (anfitrionaId: any, turno: any) => {
  return async (
    dispatch: Dispatch<types.IMarcarSalida | AnyAction>,
    getState: any
  ) => {
    const { activeRoom } = getState().asistencia;
    console.log(activeRoom);
    Swal.fire({
      title: `¿Estás seguro de marcar salida para  ${activeRoom?.anfitriona} - Habitación N° ${activeRoom?.habitacion} ?`,
      text: "Recuerda:¡No podrás revertir esto!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, marcar salida",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response: any = await axiosInstance.put(
            `renta/marcar-salida?anfitrionaId=${anfitrionaId}&turno=${turno}`
          );
          const { status, data } = response;
          console.log(response);
          console.log(data);
          if (status === 200) {
            dispatch({
              type: types.MARCAR_SALIDA,
              payload: {
                anfitrionaId: anfitrionaId,
                turno: turno,
              },
            });
            Swal.fire(`¡Se liberó la habitación N° ${activeRoom?.habitacion}!`, "Se ha marcado correctamente la hora de salida.", "success");
          }
        } catch (error: any) {
          console.log(error);
        }
      }
    });
  };
};







export const completarRentaAnfitriona = (id:any) => {
  return async (
    dispatch: Dispatch<types.ICompleteRenta | AnyAction>,
    getState: any
  ) => {
    const { activeRoom } = getState().asistencia;
    console.log(activeRoom);
    Swal.fire({
      title: `¿Estás seguro de cancelar la deuda para  ${activeRoom?.anfitriona} - Habitación N° ${activeRoom?.habitacion} ?`,
      text: "Recuerda:¡No podrás revertir esto!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, cancelar deuda",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response: any = await axiosInstance.put(
            `renta/completar-renta?idRenta=${id}`
          );
          const { status, data } = response;
          console.log(response);
          console.log(data);
          if (status === 200) {
            dispatch({
              type: types.COMPLETE_RENTA,
              payload: data.data,
            });
            Swal.fire(`¡Deuda cancelada para el cuarto N° ${activeRoom?.habitacion}!`, "Se ha cancelado exitosamente la deuda", "success");
          }
        } catch (error: any) {
          console.log(error);
        }
      }
    });
  };
};










export const getListReporteRenta= (date: any, turno: string) => {
  return async (dispatch: Dispatch<types.IListReporteRentas | AnyAction>) => {
    try {
      /*      const response: any = await axiosInstance.get(`/renta/listar-rentas`); */
      const response: any = await axiosInstance.get(
        `/renta/reporte-rentas?fecha=${date}&turno=${turno}`
      );
      const { status, data } = response;
      console.log(data);
      if (status === 200) {
        dispatch({
          type: types.LIST_REPORTE_RENTAS,
          payload: data?.data,
        });
      } else {
        dispatch({
          type: types.LIST_REPORTE_RENTAS,
          payload: [],
        });
      }
    } catch (error: any) {
      console.log(error);
      dispatch({
        type: types.LIST_REPORTE_RENTAS,
        payload: [],
      });
    }
  };
};


export const getListFichasByRoom= (date: any) => {
  return async (dispatch: Dispatch<types.IListFichasByRoom | AnyAction>) => {
    try {
      /*      const response: any = await axiosInstance.get(`/renta/listar-rentas`); */
      const response: any = await axiosInstance.get(
        `/facturacion/listar-fichas?fecha=${date}`
      );
      const { status, data } = response;
      if (status === 200) {
        dispatch({
          type: types.LIST_FICHAS_BY_ROOM,
          payload: data?.data,
        });
      } else {
        dispatch({
          type: types.LIST_FICHAS_BY_ROOM,
          payload: [],
        });
      }
    } catch (error: any) {
      console.log(error);
      dispatch({
        type: types.LIST_FICHAS_BY_ROOM,
        payload: [],
      });
    }
  };
};