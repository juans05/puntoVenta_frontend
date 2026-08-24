import { createReducer, Dispatch, AnyAction } from "@reduxjs/toolkit";

import * as types from "./types";
import { ILayoutClientsProvidersAnfitriona } from "./interfaces";
import axiosInstance from "../../../../utils/axios";
import { toast } from 'sonner'
const initialState: ILayoutClientsProvidersAnfitriona = {
    clients: [],
    totalClients: 0,
  
    activeClients: null,
    providers: [],
    totalProviders: 0,
    anfitrionas: [],
    totalAnfitrionas: 0,
    activeProviders: null,
    activeAnfitrionas: null,
    modalAnfitriona:false,
    modalProveedor:false,
};
export const clientesProveedoresAnfitrionas = createReducer(initialState, (builder) => {
  builder
   
  .addCase(
    "OPEN_MODAL_ANFITRIONA",
    (state: ILayoutClientsProvidersAnfitriona): ILayoutClientsProvidersAnfitriona => {
      return {
        ...state,
        modalAnfitriona: true,
      };
    }
  )
  .addCase(
    "CLOSE_MODAL_ANFITRIONA",
    (state: ILayoutClientsProvidersAnfitriona): ILayoutClientsProvidersAnfitriona => {
      return {
        ...state,
        modalAnfitriona: false,
      };
    }
  )
    .addCase(
      "GET_ALL_CLIENTS",
      (
        state: ILayoutClientsProvidersAnfitriona,
        action: types.IGetAllClients
      ): ILayoutClientsProvidersAnfitriona => {
        return {
          ...state,
          clients: action.payload.items,
          totalClients: action.payload.total,
        };
      }
    )
    .addCase(
      "CREATE_CLIENTS",
      (
        state: ILayoutClientsProvidersAnfitriona,
        action: types.ICreateClients
      ): ILayoutClientsProvidersAnfitriona => {
        const newState = {
          ...state,
          clients: [action.payload, ...state.clients],
        };
        const newArray = newState.clients.map((element, index) => {
          return { ...element, index: index + 1 };
        });
        return {
          ...state,
          clients: newArray,
        };
      }
    )
    .addCase(
      "ACTIVE_CLIENTS",
      (
        state: ILayoutClientsProvidersAnfitriona,
        action: types.IActiveClients
      ): ILayoutClientsProvidersAnfitriona => {
        return {
          ...state,
          activeClients: {
            ...action.payload,
          }
        }
      }
    )
    .addCase(
      "CLEAR_ACTIVE_CLIENTS",
      (
        state: ILayoutClientsProvidersAnfitriona,

      ): ILayoutClientsProvidersAnfitriona => {
        return {
          ...state,
          activeClients: null,
        };
      }
    )
    .addCase(
      "UPDATE_CLIENTS",
      (
        state: ILayoutClientsProvidersAnfitriona,
        action: types.IUpdateClients
      ): ILayoutClientsProvidersAnfitriona => {
        return {
          ...state,
          clients: state.clients.map((clients) =>
          clients.id === action.payload.id
              ? action.payload
              : clients
          ),
        };
      }
    )
    .addCase(
      "DELETE_CLIENTS",
      (
        state: ILayoutClientsProvidersAnfitriona,
        action: types.IDeleteClients
      ): ILayoutClientsProvidersAnfitriona => {
        return {
          ...state,
          activeClients: null,
          clients: state.clients.filter(
            (clients) => clients.id !== action.payload
          ),
        };
      }
    )
    /* Anfitrionas */
    .addCase(
      "GET_ALL_ANFITRIONAS",
      (
        state: ILayoutClientsProvidersAnfitriona,
        action: types.IGetAllAnfitrionas
      ): ILayoutClientsProvidersAnfitriona => {
        return {
          ...state,
          anfitrionas: action.payload.items,
          totalAnfitrionas: action.payload.total,
        };
      }
    )
    .addCase(
      "CREATE_ANFITRIONAS",
      (
        state: ILayoutClientsProvidersAnfitriona,
        action: types.ICreateAnfitrionas
      ): ILayoutClientsProvidersAnfitriona => {
        const newState = {
          ...state,
          anfitrionas: [action.payload, ...state.anfitrionas],
        };
        const newArray = newState.anfitrionas.map((element, index) => {
          return { ...element, index: index + 1 };
        });
        return {
          ...state,
          anfitrionas: newArray,
        };
      }
    )
    .addCase(
      "ACTIVE_ANFITRIONAS",
      (
        state: ILayoutClientsProvidersAnfitriona,
        action: types.IActiveAnfitrionas
      ): ILayoutClientsProvidersAnfitriona => {
        return {
          ...state,
          activeAnfitrionas: {
            ...action.payload,
          }
        }
      }
    )
    .addCase(
      "CLEAR_ACTIVE_ANFITRIONAS",
      (
        state: ILayoutClientsProvidersAnfitriona,

      ): ILayoutClientsProvidersAnfitriona => {
        return {
          ...state,
          activeAnfitrionas: null,
        };
      }
    )
    .addCase(
      "UPDATE_ANFITRIONAS",
      (
        state: ILayoutClientsProvidersAnfitriona,
        action: types.IUpdateAnfitrionas
      ): ILayoutClientsProvidersAnfitriona => {
        return {
          ...state,
          anfitrionas: state.anfitrionas.map((anfitrionas) =>
          anfitrionas.anfitrionaId === action.payload.anfitrionaId
              ? action.payload
              : anfitrionas
          ),
        };
      }
    )
    .addCase(
      "DELETE_ANFITRIONAS",
      (
        state: ILayoutClientsProvidersAnfitriona,
        action: types.IDeleteAnfitrionas
      ): ILayoutClientsProvidersAnfitriona => {
        return {
          ...state,
          activeAnfitrionas: null,
          anfitrionas: state.anfitrionas.filter(
            (anfitrionas) => anfitrionas.anfitrionaId !== action.payload
          ),
        };
      }
    )

    /* Providers */
    .addCase(
      "GET_ALL_PROVIDERS",
      (
        state: ILayoutClientsProvidersAnfitriona,
        action: types.IGetAllProviders
      ): ILayoutClientsProvidersAnfitriona => {
        return {
          ...state,
          providers: action.payload.items,
          totalProviders: action.payload.total,
        };
      }
    )
    .addCase(
      "CREATE_PROVIDERS",
      (
        state: ILayoutClientsProvidersAnfitriona,
        action: types.ICreateProviders
      ): ILayoutClientsProvidersAnfitriona => {
        const newState = {
          ...state,
          providers: [action.payload, ...state.providers],
        };
        const newArray = newState.providers.map((element, index) => {
          return { ...element, index: index + 1 };
        });
        return {
          ...state,
          providers: newArray,
        };
      }
    )
    .addCase(
      "ACTIVE_PROVIDERS",
      (
        state: ILayoutClientsProvidersAnfitriona,
        action: types.IActiveProviders
      ): ILayoutClientsProvidersAnfitriona => {
        return {
          ...state,
          activeProviders: {
            ...action.payload,
          }
        }
      }
    )
    .addCase(
      "CLEAR_ACTIVE_PROVIDERS",
      (
        state: ILayoutClientsProvidersAnfitriona,

      ): ILayoutClientsProvidersAnfitriona => {
        return {
          ...state,
          activeProviders: null,
        };
      }
    )
    .addCase(
      "UPDATE_PROVIDERS",
      (
        state: ILayoutClientsProvidersAnfitriona,
        action: types.IUpdateProviders
      ): ILayoutClientsProvidersAnfitriona => {
        return {
          ...state,
          providers: state.providers.map((providers) =>
          providers.proveedorId === action.payload.proveedorId
              ? action.payload
              : providers
          ),
        };
      }
    )
    .addCase(
      "DELETE_PROVIDERS",
      (
        state: ILayoutClientsProvidersAnfitriona,
        action: types.IDeleteProviders
      ): ILayoutClientsProvidersAnfitriona => {
        return {
          ...state,
          activeProviders: null,
          providers: state.providers.filter(
            (providers) => providers.proveedorId !== action.payload
          ),
        };
      }
    )
    .addCase(types.OPEN_MODAL_PROVEEDOR, (state: ILayoutClientsProvidersAnfitriona): ILayoutClientsProvidersAnfitriona => {
      return { ...state, modalProveedor: true };
    })
    .addCase(types.CLOSE_MODAL_PROVEEDOR, (state: ILayoutClientsProvidersAnfitriona): ILayoutClientsProvidersAnfitriona => {
      return { ...state, modalProveedor: false };
    })

});

export const openModalAnfitriona = () => {
  return async (dispatch: Dispatch<types.IOpenModalAnfitriona | any>) => {
    dispatch({
      type: types.OPEN_MODAL_ANFITRIONA,
    });
  };
};
export const closeModalAnfitriona = () => {
  return async (dispatch: Dispatch<types.ICloseModalAnfitriona | any>) => {
    dispatch({
      type: types.CLOSE_MODAL_ANFITRIONA,
    });
  };
};
export const getAllAnfitrionas = () => {
  return async (dispatch: Dispatch<types.IGetAllAnfitrionas | AnyAction>) => {
    try {
      const response: any = await axiosInstance.get(
        `/anfitriona/listar?Page=1&Amount=100`
      );
      const { status, data } = response;
      console.log(data);
      if (status === 200) {
        dispatch({
          type: types.GET_ALL_ANFITRIONAS,
          payload: data,
        });
      }
    } catch (error: any) {
      console.log(error);
    }
  };
};
export const getAllClientes = (value:string, page:number, amount:number) => {
  return async (dispatch: Dispatch<types.IGetAllClients | AnyAction>) => {
    try {
      const response: any = await axiosInstance.get(
        `/clientes/listar?Value=${value}&Page=${page}&Amount=${amount}`
      );
      const { status, data } = response;
      console.log(data);
      if (status === 200) {
        dispatch({
          type: types.GET_ALL_CLIENTS,
          payload: data?.data,
        });
      }else{
        dispatch({
          type: types.GET_ALL_CLIENTS,
          payload: {
            items:[],
            total:0
          },
        });
      }
    } catch (error: any) {
      console.log(error);
      dispatch({
        type: types.GET_ALL_CLIENTS,
        payload: {
          items:[],
          total:0
        },
      });
    }
  };
};




export const createAnfitrionaMain = (anfitriona: any) => {
  return async (dispatch: Dispatch<types.ICreateAnfitrionas | AnyAction>) => {
    try {
      const response: any = await axiosInstance.post(
        `/anfitriona/crear`,
        anfitriona
      );
      const { status, data } = response;
      console.log(data);
      if (status === 200) {
        dispatch({
          type: types.CREATE_ANFITRIONAS,
          payload: data?.data,
        });
      }
    } catch (error: any) {
      console.log(error);
    }
  };
};

export const updateAnfitriona = (anfitrionaUpdated: any) => {
  return async (dispatch: Dispatch<types.IUpdateAnfitrionas | AnyAction>) => {
    try {
      const response: any = await axiosInstance.put(
        `/anfitriona/modificar`,
        anfitrionaUpdated
      );
      const { status, data } = response;
      console.log(data);
      if (status === 200) {
        dispatch({
          type: types.UPDATE_ANFITRIONAS,
          payload: data?.data,
        });
      }
    } catch (error: any) {
      console.log(error);
    }
  };
};

export const deleteAnfitriona= (idAnfitriona: any) => {
  return async (dispatch: Dispatch<types.IDeleteAnfitrionas | AnyAction>) => {
    try {
      const response: any = await axiosInstance.delete(
        `/anfitriona/eliminar?IdAnfitriona=${idAnfitriona}`,
        {}
      );
      const { status, data } = response;
      console.log(data);
      if (status === 200) {
        dispatch({
          type: types.DELETE_ANFITRIONAS,
          payload: idAnfitriona,
        });
      }
    } catch (error: any) {
      console.log(error);
    }
  };
};


export const activeAnfitriona = (anfitriona: any) => {
  return async (dispatch: Dispatch<types.IActiveAnfitrionas | any>) => {
    dispatch({
      type: types.ACTIVE_ANFITRIONAS,
      payload: anfitriona,
    });
  };
};
export const clearActiveAnfitriona = () => {
  return async (dispatch: Dispatch<types.IClearActiveAnfitrionas | any>) => {
    dispatch({
      type: types.CLEAR_ACTIVE_ANFITRIONAS,

    });
  };
};



export const activeClientes = (cliente: any) => {
  return async (dispatch: Dispatch<types.IActiveClients | any>) => {
    dispatch({
      type: types.ACTIVE_CLIENTS,
      payload: cliente,
    });
  };
};
export const clearActiveClientes = () => {
  return async (dispatch: Dispatch<types.IClearActiveClients | any>) => {
    dispatch({
      type: types.CLEAR_ACTIVE_CLIENTS,

    });
  };
};




export const createClienteMain = (cliente: any) => {
  return async (dispatch: Dispatch<types.ICreateClients | AnyAction>) => {
    try {
      const response: any = await axiosInstance.post(
        `/clientes/crear`,
        cliente
      );
      const { status, data } = response;
      console.log(data);
      if (status === 200) {
        dispatch({
          type: types.CREATE_CLIENTS,
          payload: data?.data,
        });
      }
    } catch (error: any) {
      console.log(error);
    }
  };
};

export const updateCliente = (clienteUpdated: any) => {
  return async (dispatch: Dispatch<types.IUpdateClients | AnyAction>) => {
    try {
      const response: any = await axiosInstance.put(
        `/clientes/modificar`,
        clienteUpdated
      );
      const { status, data } = response;
      console.log(data);
      if (status === 200) {
        dispatch({
          type: types.UPDATE_CLIENTS,
          payload: data?.data,
        });
      }
    } catch (error: any) {
      console.log(error);
    }
  };
};

export const deleteCliente= (idCliente: any) => {
  return async (dispatch: Dispatch<types.IDeleteClients | AnyAction>) => {
    try {
      const response: any = await axiosInstance.delete(
        `/clientes/eliminar?idCliente=${idCliente}`,
        {}
      );
      const { status, data } = response;
      console.log(data);
      if (status === 200) {
        dispatch({
          type: types.DELETE_CLIENTS,
          payload: idCliente,
        });
      }
    } catch (error: any) {
      console.log(error);
    }
  };
};

export const openModalProveedor = () => {
  return async (dispatch: Dispatch<types.IOpenModalProveedor | any>) => {
    dispatch({
      type: types.OPEN_MODAL_PROVEEDOR,
    });
  };
};
export const closeModalProveedor = () => {
  return async (dispatch: Dispatch<types.ICloseModalProveedor | any>) => {
    dispatch({
      type: types.CLOSE_MODAL_PROVEEDOR,
    });
  };
};

export const getAllProveedores = (value: string, page: number, amount: number) => {
  return async (dispatch: Dispatch<types.IGetAllProviders | AnyAction>) => {
    try {
      const response: any = await axiosInstance.get(
        `/proveedor/listar?Value=${value}&Page=${page}&Amount=${amount}`
      );
      const { status, data } = response;
      if (status === 200) {
        dispatch({
          type: types.GET_ALL_PROVIDERS,
          payload: data?.data,
        });
      } else {
        dispatch({
          type: types.GET_ALL_PROVIDERS,
          payload: { items: [], total: 0 },
        });
      }
    } catch (error: any) {
      console.log(error);
      dispatch({
        type: types.GET_ALL_PROVIDERS,
        payload: { items: [], total: 0 },
      });
    }
  };
};

export const activeProveedorMain = (proveedor: any) => {
  return async (dispatch: Dispatch<types.IActiveProviders | any>) => {
    dispatch({
      type: types.ACTIVE_PROVIDERS,
      payload: proveedor,
    });
  };
};
export const clearActiveProveedor = () => {
  return async (dispatch: Dispatch<types.IClearActiveProviders | any>) => {
    dispatch({
      type: types.CLEAR_ACTIVE_PROVIDERS,
    });
  };
};

export const createProveedorMain = (proveedor: any) => {
  return async (dispatch: Dispatch<types.ICreateProviders | AnyAction>) => {
    try {
      const response: any = await axiosInstance.post(`/proveedor/crear`, proveedor);
      const { status, data } = response;
      if (status === 200) {
        dispatch({
          type: types.CREATE_PROVIDERS,
          payload: data?.data,
        });
      }
    } catch (error: any) {
      console.log(error);
      toast.error(error?.response?.data?.message ?? "Error al crear el proveedor");
    }
  };
};

export const updateProveedorMain = (proveedor: any) => {
  return async (dispatch: Dispatch<types.IUpdateProviders | AnyAction>) => {
    try {
      const response: any = await axiosInstance.put(`/proveedor/modificar`, proveedor);
      const { status, data } = response;
      if (status === 200) {
        dispatch({
          type: types.UPDATE_PROVIDERS,
          payload: data?.data,
        });
      }
    } catch (error: any) {
      console.log(error);
      toast.error(error?.response?.data?.message ?? "Error al actualizar el proveedor");
    }
  };
};

export const deleteProveedorMain = (idProveedor: any) => {
  return async (dispatch: Dispatch<types.IDeleteProviders | AnyAction>) => {
    try {
      const response: any = await axiosInstance.delete(
        `/proveedor/eliminar?IdProducto=${idProveedor}`
      );
      const { status } = response;
      if (status === 200) {
        dispatch({
          type: types.DELETE_PROVIDERS,
          payload: idProveedor,
        });
      }
    } catch (error: any) {
      console.log(error);
      toast.error(error?.response?.data?.message ?? "Error al eliminar el proveedor");
    }
  };
};