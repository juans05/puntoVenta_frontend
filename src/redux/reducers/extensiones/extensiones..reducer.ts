import { createReducer, Dispatch, AnyAction } from "@reduxjs/toolkit";
import { IExtensionesState } from "./interfaces";
import { GET_ALL_USERS, GET_NACIONALITIES, GET_PAY_METHODS, GET_TIPO_DOCUMENTO, GET_TIPOS_IGV, GET_UBIGEOS, GET_UNIDADES_MEDIDA, GET_TIPOS_OPERACION, GET_MONEDAS, GET_SUCURSALES, GET_COLABORADORES, IGetAllUsers, IGetNacionalities, IGetPayMethods, IGetTipoDocumento, IGetTiposIgv, IGetUnidadesMedida, IGetTiposOperacion, IGetMonedas, IGetSucursales, IGetColaboradores } from "./types";
import axiosInstance from "../../../utils/axios";
import { IGetUbigeos } from "../Admin/my-business/types";

const initialState: IExtensionesState = {
    payMethods: [],
    nacionality:[],
    allUsers:[],
    ubigeos: [],
    typeDocument: [],
    tiposIgv: [],
    unidadesMedida: [],
    tiposOperacion: [],
    monedas: [],
    sucursales: [],
    colaboradores: [],

};
export const extensionesReducer = createReducer(initialState, (builder) => {
    builder
        .addCase("GET_PAY_METHODS", (state: IExtensionesState, action: IGetPayMethods): IExtensionesState => {
            return {
                ...state,
                payMethods: action.payload
            }
        })
           .addCase("GET_NACIONALITIES", (state: IExtensionesState, action: IGetNacionalities): IExtensionesState => {
            return {
                ...state,
                nacionality: action.payload
            }
        })
        .addCase("GET_ALL_USERS", (state: IExtensionesState, action: IGetAllUsers): IExtensionesState => {
            return {
                ...state,
                allUsers: action.payload
            }
        })
        .addCase("GET_UBIGEOS", (state: IExtensionesState, action: IGetUbigeos): IExtensionesState => {
            return {
                ...state,
                ubigeos: action.payload
            }
        })
        .addCase("GET_TIPO_DOCUMENTO", (state: IExtensionesState, action: IGetTipoDocumento): IExtensionesState => {
            return {
                ...state,
                typeDocument: action.payload
            }
        })
        .addCase("GET_TIPOS_IGV", (state: IExtensionesState, action: IGetTiposIgv): IExtensionesState => {
            return {
                ...state,
                tiposIgv: action.payload
            }
        })
        .addCase("GET_UNIDADES_MEDIDA", (state: IExtensionesState, action: IGetUnidadesMedida): IExtensionesState => {
            return {
                ...state,
                unidadesMedida: action.payload
            }
        })
        .addCase("GET_TIPOS_OPERACION", (state: IExtensionesState, action: IGetTiposOperacion): IExtensionesState => {
            return {
                ...state,
                tiposOperacion: action.payload
            }
        })
        .addCase("GET_MONEDAS", (state: IExtensionesState, action: IGetMonedas): IExtensionesState => {
            return {
                ...state,
                monedas: action.payload
            }
        })
        .addCase("GET_SUCURSALES", (state: IExtensionesState, action: IGetSucursales): IExtensionesState => {
            return {
                ...state,
                sucursales: action.payload
            }
        })
        .addCase("GET_COLABORADORES", (state: IExtensionesState, action: IGetColaboradores): IExtensionesState => {
            return {
                ...state,
                colaboradores: action.payload
            }
        })
})

export const getPayMethods = () => {
    return async (dispatch: Dispatch<IGetPayMethods | AnyAction>) => {
        try {
            const response = await axiosInstance.get(`/extensiones/tipo-metodo-pago`);
            const { status, data } = response

            console.log(data);
            

            if (status === 200) {
                dispatch({
                    type: GET_PAY_METHODS,
                    payload: data?.data
                })
            }
        } catch (error: any) {
            console.log(error);
        }
    }
}

export const getTypeDocument = () => {
    return async (dispatch: Dispatch<IGetPayMethods | AnyAction>) => {
        try {
            const response = await axiosInstance.get(`/extensiones/tipo-documento`);
            const { status, data } = response

            if (status === 200) {
                dispatch({
                    type: GET_TIPO_DOCUMENTO,
                    payload: data?.data
                })
            }
        } catch (error: any) {
            console.log(error);
        }
    }
}
export const getTiposIgv = () => {
    return async (dispatch: Dispatch<IGetTiposIgv | AnyAction>) => {
        try {
            const response = await axiosInstance.get(`/extensiones/tipos-igv`);
            const { status, data } = response

            if (status === 200) {
                dispatch({
                    type: GET_TIPOS_IGV,
                    payload: data?.data
                })
            }
        } catch (error: any) {
            console.log(error);
        }
    }
}

export const getUnidadesMedida = () => {
    return async (dispatch: Dispatch<IGetUnidadesMedida | AnyAction>) => {
        try {
            const response = await axiosInstance.get(`/extensiones/unidades-medida`);
            const { status, data } = response

            if (status === 200) {
                dispatch({
                    type: GET_UNIDADES_MEDIDA,
                    payload: data?.data
                })
            }
        } catch (error: any) {
            console.log(error);
        }
    }
}

export const getNacionalities = () => {
    return async (dispatch: Dispatch<IGetPayMethods | AnyAction>) => {
        try {
            const response = await axiosInstance.get(`/extensiones/nacionalidad`);
            const { status, data } = response

            if (status === 200) {
                dispatch({
                    type: GET_NACIONALITIES,
                    payload: data?.data
                })
            }
        } catch (error: any) {
            console.log(error);
        }
    }
}


export const getAllUser = () => {
    return async (dispatch: Dispatch<IGetAllUsers | AnyAction>) => {
        try {
            const response = await axiosInstance.get(`/user/get-all-users`);
            console.log(response);
            const { status, data } = response

            if (status === 200) {
                dispatch({
                    type: GET_ALL_USERS,
                    payload: data?.data
                })
            }
        } catch (error: any) {
            console.log(error);
        }
    }
}

export const getTiposOperacion = () => {
    return async (dispatch: Dispatch<IGetTiposOperacion | AnyAction>) => {
        try {
            const response = await axiosInstance.get(`/extensiones/tipos-operacion`);
            const { status, data } = response

            if (status === 200) {
                dispatch({
                    type: GET_TIPOS_OPERACION,
                    payload: data?.data
                })
            }
        } catch (error: any) {
            console.log(error);
        }
    }
}

export const getMonedas = () => {
    return async (dispatch: Dispatch<IGetMonedas | AnyAction>) => {
        try {
            const response = await axiosInstance.get(`/extensiones/monedas`);
            const { status, data } = response

            if (status === 200) {
                dispatch({
                    type: GET_MONEDAS,
                    payload: data?.data
                })
            }
        } catch (error: any) {
            console.log(error);
        }
    }
}

export const getSucursales = () => {
    return async (dispatch: Dispatch<IGetSucursales | AnyAction>) => {
        try {
            const response = await axiosInstance.get(`/extensiones/sucursales`);
            const { status, data } = response

            if (status === 200) {
                dispatch({
                    type: GET_SUCURSALES,
                    payload: data?.data
                })
            }
        } catch (error: any) {
            console.log(error);
        }
    }
}

export const getColaboradores = () => {
    return async (dispatch: Dispatch<IGetColaboradores | AnyAction>) => {
        try {
            const response = await axiosInstance.get(`/user/listar-usuarios`);
            const { status, data } = response

            if (status === 200) {
                dispatch({
                    type: GET_COLABORADORES,
                    payload: data?.data
                })
            }
        } catch (error: any) {
            console.log(error);
        }
    }
}

export const getAllUbigeos = () => {
    return async (dispatch: Dispatch<IGetAllUsers | AnyAction>) => {
        try {
            const response = await axiosInstance.get(`/extensiones/ubigeos`);
            const { status, data } = response

            if (status === 200) {
                dispatch({
                    type: GET_UBIGEOS,
                    payload: data?.data
                })
            }
        } catch (error: any) {
            console.log(error);
        }
    }
}