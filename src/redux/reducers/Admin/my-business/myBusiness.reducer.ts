import { createReducer, Dispatch, AnyAction } from "@reduxjs/toolkit";

import * as types from "./types";

import { toast } from "sonner";
import { ILayoutTenant } from "./interfaces";
import axiosInstance, { baseUrl } from "../../../../utils/axios";
import axios from 'axios';
/* import { getToken } from "../../../../helpers/auth-helpers"; */


const initialState: ILayoutTenant = {
  tenants: [],
  activeTenant: null,
  modalTenant:false,
    rubros:[],
    ubigeos:[],
    sucursales:[],
    tenantEmpresa:null,
    recursos:null,
    tenantsResumen:[],
};
export const myBusinessReducer = createReducer(initialState, (builder) => {
  builder

    .addCase(
      "GET_ALL_TENANTS",
      (state: ILayoutTenant, action: types.IGetAllTenants): ILayoutTenant => {
        return {
          ...state,
          tenants: action.payload,
        };
      }
    )
    .addCase(
      "GET_RECURSOS",
      (state: ILayoutTenant, action: types.IGetRecursos): ILayoutTenant => {
        return {
          ...state,
          recursos: action.payload,
        };
      }
    )
    .addCase(
      "GET_TENANTS_RESUMEN",
      (state: ILayoutTenant, action: types.IGetTenantsResumen): ILayoutTenant => {
        return {
          ...state,
          tenantsResumen: action.payload,
        };
      }
    )
     .addCase(
      "GET_RUBROS",
      (state: ILayoutTenant, action: types.IGetRubros): ILayoutTenant => {
        return {
          ...state,
          rubros: action.payload,
        };
      }
    )
     .addCase(
      "GET_UBIGEOS",
      (state: ILayoutTenant, action: types.IGetUbigeos): ILayoutTenant => {
        return {
          ...state,
          ubigeos: action.payload,
        };
      }
    )
     .addCase(
      "GET_SUCURSALES",
      (state: ILayoutTenant, action: types.IGetSucursales): ILayoutTenant => {
        return {
          ...state,
          sucursales: action.payload,
        };
      }
    )
    .addCase(
      "GET_TENANT",
      (state: ILayoutTenant, action: types.IGetTenant): ILayoutTenant => {
        return {
          ...state,
          tenantEmpresa: action.payload,
          activeTenant: 
            action.payload,
          
        };
      }
    )
    .addCase(
      "CREATE_TENANTS",
      (state: ILayoutTenant, action: types.ICreateTenants): ILayoutTenant => {
        const newState = {
          ...state,
          tenants: [action.payload, ...state.tenants],
        };
        const newArray = newState.tenants.map((element, index) => {
          return { ...element, index: index + 1 };
        });
        return {
          ...state,
          tenants: newArray,
        };
      }
    )
    .addCase(
      "ACTIVE_TENANTS",
      (state: ILayoutTenant, action: types.IActiveTenants): ILayoutTenant => {
        return {
          ...state,
          activeTenant: {
            ...action.payload,
          },
        };
      }
    )
    .addCase("CLEAR_ACTIVE_TENANTS", (state: ILayoutTenant): ILayoutTenant => {
      return {
        ...state,
        activeTenant: null,
      };
    })
    .addCase(
      "UPDATE_TENANTS",
      (state: ILayoutTenant, action: types.IUpdateTenants): ILayoutTenant => {
        return {
          ...state,
          tenants: state.tenants.map((tenants) =>
            tenants.id === action.payload.id
              ? action.payload
              : tenants
          ),
        };
      }
    )
    .addCase(
      "OPEN_MODAL_TENANT",
      (state: ILayoutTenant): ILayoutTenant => {
        return {
          ...state,
          modalTenant: true,
        };
      }
    )
    .addCase(
      "CLOSE_MODAL_TENANT",
      (state: ILayoutTenant): ILayoutTenant => {
        return {
          ...state,
          modalTenant: false,
        };
      }
    )
    .addCase(
      "DELETE_TENANTS",
      (state: ILayoutTenant, action: types.IDeleteTenants): ILayoutTenant => {
        return {
          ...state,
          activeTenant: null,
          tenants: state.tenants.filter(
            (tenants) => tenants.productoId !== action.payload
          ),
        };
      }
    );
    
});

export const getAllTenants = () => {
  return async (dispatch: Dispatch<types.IGetAllTenants | AnyAction>) => {

    try {
      const response: any = await axiosInstance.get(
        `/tenant/all-tenants`
        
      );
      const { status, data } = response;
      
  
      if (status === 200) {
        dispatch({
          type: types.GET_ALL_TENANTS,
          payload:data.data,
        });
      }
    } catch (error: any) {
      console.log(error);
    }
  };
};


export const getAllRecursos = () => {
  return async (dispatch: Dispatch<types.IGetRecursos | AnyAction>) => {
    const rutaActual=window.location.href
    const tenantMain=rutaActual==='http://127.0.0.1:5173/' || rutaActual==='http://localhost:5173/' ? 'spasolis' : null
  /*   const token = getToken(); */
    try {
      const response: any = await axios.get(
        `${baseUrl}/tenant/recursos`, {
          headers: {
            Tenant: tenantMain,
            /* Authorization: token ? `Bearer ${token}` : '' */
            
          },
        }
      
      );
      const { status, data } = response;
      
     
      if (status === 200) {
        dispatch({
          type: types.GET_RECURSOS,
          payload: data.data,
        });
      }
    } catch (error: any) {
      console.log(error);
    }
  };
};

export const getAllRubros = () => {
  return async (dispatch: Dispatch<types.IGetAllTenants | AnyAction>) => {
 
    try {
      const response: any = await axiosInstance.get(
        `/extensiones/rubros`
      
      );
      const { status, data } = response;
      
     
      if (status === 200) {
        dispatch({
          type: types.GET_RUBROS,
          payload: data.data,
        });
      }
    } catch (error: any) {
      console.log(error);
    }
  };
};

export const getTenantEmpresa = (tenantName:string) => {
  return async (dispatch: Dispatch<types.IGetTenant | AnyAction>) => {
   
    try {
      const response: any = await axiosInstance.get(
        `/tenant/empresa?tenantNombre=${tenantName}`
        /*  `/productos/listar?${groupName!=undefined && groupName!=='Todos' ?`CategoriaId=${categoriaId}&GrupoId=${grupoId}&Value=${value}&Page=${page}&Amount=${amount}`:`Value=${value}&Page=${page}&Amount=${amount}` }` */
      );
      const { status, data } = response;
      
     
      if (status === 200) {
        dispatch({
          type: types.GET_TENANT,
          payload: data.data,
        });
      }
    } catch (error: any) {
      console.log(error);
    }
  };
};


export const getAllSucursales = () => {
  return async (dispatch: Dispatch<types.IGetAllTenants | AnyAction>) => {

    try {
      const response: any = await axiosInstance.get(
        `/extensiones/sucursales`
        /*  `/productos/listar?${groupName!=undefined && groupName!=='Todos' ?`CategoriaId=${categoriaId}&GrupoId=${grupoId}&Value=${value}&Page=${page}&Amount=${amount}`:`Value=${value}&Page=${page}&Amount=${amount}` }` */
      );
      const { status, data } = response;
      
      
      if (status === 200) {
        dispatch({
          type: types.GET_SUCURSALES,
          payload: data.data,
        });
      }
    } catch (error: any) {
      console.log(error);
    }
  };
};





export const createTenants = (tenant: any) => {
  return async (dispatch: Dispatch<types.ICreateTenants | AnyAction>) => {
    try {
      const response: any = await axiosInstance.post(
        `/tenant/crear-tenant`,
        tenant
      );
      const { status, data } = response;

      if (status === 200) {
        const identificador = data.data;
        dispatch({
          type: types.CREATE_TENANTS,
          payload: { ...tenant, identificador },
        });
        toast.success('Se creó exitosamente el tenant.')
        return identificador;
      }
    } catch (error: any) {
      console.log(error);
      toast.error(error.response?.data?.message ?? 'Error al crear el tenant')
    }
    return null;
  };
};

export const createEmpresa = (empresa: any) => {
  return async (dispatch: Dispatch<any>) => {
    try {
      const response: any = await axiosInstance.post(
        `/tenant/crear-empresa`,
        empresa
      );
      const { status } = response;

      if (status === 200) {
        toast.success('Se creó exitosamente la empresa.')
        dispatch(getAllTenants() as any)
      }
    } catch (error: any) {
      console.log(error);
      toast.error(error.response?.data?.message ?? 'Error al crear la empresa')
    }
  };
};

export const getTenantsResumen = () => {
  return async (dispatch: Dispatch<types.IGetTenantsResumen | AnyAction>) => {
    try {
      const response: any = await axiosInstance.get(
        `/tenant/superadmin/listar`
      );
      const { status, data } = response;

      if (status === 200) {
        dispatch({
          type: types.GET_TENANTS_RESUMEN,
          payload: data.data,
        });
      }
    } catch (error: any) {
      console.log(error);
      toast.error(error.response?.data?.message ?? 'Error al listar las empresas')
    }
  };
};

export const setTenantActivo = (identificador: number, activo: boolean) => {
  return async (dispatch: Dispatch<any>) => {
    try {
      const response: any = await axiosInstance.put(
        `/tenant/superadmin/${identificador}/estado`,
        { activo }
      );
      const { status } = response;

      if (status === 200) {
        toast.success(activo ? 'Empresa habilitada.' : 'Empresa deshabilitada.')
        dispatch(getTenantsResumen() as any)
      }
    } catch (error: any) {
      console.log(error);
      toast.error(error.response?.data?.message ?? 'Error al actualizar el estado de la empresa')
    }
  };
};

export const reasignarModulos = (identificador: number) => {
  return async (dispatch: Dispatch<any>) => {
    try {
      const response: any = await axiosInstance.post(
        `/tenant/superadmin/${identificador}/reasignar-modulos`
      );
      const { status } = response;

      if (status === 200) {
        toast.success('Módulos reasignados exitosamente.')
        dispatch(getTenantsResumen() as any)
      }
    } catch (error: any) {
      console.log(error);
      toast.error(error.response?.data?.message ?? 'Error al reasignar los módulos')
    }
  };
};

export const createSucursal = (sucursal: any) => {
  return async (dispatch: Dispatch<any>) => {
    try {
      const response: any = await axiosInstance.post(
        `/extensiones/crear-sucursal`,
        sucursal
      );
      const { status } = response;

      if (status === 200) {
        toast.success('Se creó exitosamente la sede.')
        dispatch(getAllSucursales() as any)
      }
    } catch (error: any) {
      console.log(error);
      toast.error(error.response?.data?.message ?? 'Error al crear la sede')
    }
  };
};

export const updateTenant = (tenantUpdated: any) => {
  return async (dispatch: Dispatch<types.IUpdateTenants | AnyAction>) => {
    try {
      const response: any = await axiosInstance.put(
        `/tenant/modificar`,
        tenantUpdated
      );
      const { status, data } = response;
    
      if (status === 200) {
        dispatch({
          type: types.UPDATE_TENANTS,
          payload: data?.data,
        });
        toast.success('Se actualizó exitosamente el tenant.')
      }
    } catch (error: any) {
      console.log(error);
      toast.success(error.response.data.message)
    }
  };
};



export const activeTenant = (tenant: any) => {
  return async (dispatch: Dispatch<types.IActiveTenants | any>) => {
    dispatch({
      type: types.ACTIVE_TENANTS,
      payload: tenant,
    });
  };
};
export const clearTenant = () => {
  return async (dispatch: Dispatch<types.IClearActiveTenants | any>) => {
    dispatch({
      type: types.CLEAR_ACTIVE_TENANTS,
    });
  };
};


export const openModalTenant = () => {
  return async (dispatch: Dispatch<types.IOpenModalTenant | any>) => {
    dispatch({
      type: types.OPEN_MODAL_TENANT,
    });
  };
};
export const closeModalTenant = () => {
  return async (dispatch: Dispatch<types.ICloseModalTenant | any>) => {
    dispatch({
      type: types.CLOSE_MODAL_TENANT,
    });
  };
};