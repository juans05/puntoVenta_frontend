import { createReducer, Dispatch, AnyAction } from "@reduxjs/toolkit";
import { IExtensionesState } from "./interfaces";
import { GET_ALL_USERS, GET_NACIONALITIES, GET_PAY_METHODS, GET_TIPO_DOCUMENTO, GET_UBIGEOS, IGetAllUsers, IGetNacionalities, IGetPayMethods, IGetTipoDocumento } from "./types";
import axiosInstance from "../../../utils/axios";
import { IGetUbigeos } from "../Admin/my-business/types";

const initialState: IExtensionesState = {
    payMethods: [],
    nacionality:[],
    allUsers:[],
    ubigeos: [],
    typeDocument: [],

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