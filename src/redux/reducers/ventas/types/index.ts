import { IProduct } from "../../productos/interfaces";
import { ISaleProduct } from "../interfaces";

export const GET_PRODUCTS_BY_SALE = 'GET_PRODUCTS_BY_SALE';
export const SALE_PRODUCTS = 'SALE_PRODUCTS'
export const RESET_PRODUCTS_BY_SALE = 'RESET_PRODUCTS_BY_SALE'
export const GET_TURNED = 'GET_TURNED'
export const DELETE_PRODUCT_IN_SALE = 'DELETE_PRODUCT_IN_SALE'
export const DECREMENT_PRODUCT_BY_SALE = 'DECREMENT_PRODUCT_BY_SALE'
export const LIST_PRODUCTS_WITH_ANFI = 'LIST_PRODUCTS_WITH_ANFI'
export const GET_PRODUCT_IS_CHECKED_WITH_FICHA = 'GET_PRODUCT_IS_CHECKED_WITH_FICHA'
export const DISABLED_PRODUCT_IS_CHECKED_WITH_FICHA = 'DISABLED_PRODUCT_IS_CHECKED_WITH_FICHA'
export const GET_CORRELATIVE = 'GET_CORRELATIVE';
export const GET_CORRELATIVE_FAIL = 'GET_CORRELATIVE_FAIL';
export const TIPO_VENTA = 'TIPO_VENTA'
export const EFECTIVO = 'EFECTIVO'
export const ELIMINAR_PRODUCTOS_FICHA = 'ELIMINAR_PRODUCTOS_FICHA'
export const OBTENER_CAJA_MONTO = 'OBTENER_CAJA_MONTO'
export const OBTENER_CAJA_MONTO_FAIL = 'OBTENER_CAJA_MONTO_FAIL'
export const ABRIR_CAJA = 'ABRIR_CAJA'
export const CERRAR_CAJA = 'CERRAR_CAJA'
export const CERRAR_REPORTE = 'CERRAR_REPORTE'
export const RETIRO = 'RETIRO'
export const RESET_RESPONSE = 'RESET_RESPONSE'
export const UPDATE_PRODUCT_BY_PRICE = 'UPDATE_PRODUCT_BY_PRICE'
export const GET_CLIENTS = 'GET_CLIENTS'
export const GET_CLIENT_FAIL = 'GET_CLIENT_FAIL'
export const SAVE_CLIENT_FAIL = 'SAVE_CLIENT_FAIL'
export const SAVE_CLIENT = 'SAVE_CLIENT'
export const GET_DNI = 'GET_DNI'
export const RESET_DNI = 'RESET_DNI'
export const UPDATE_CLIENT = 'UPDATE_CLIENT'
export const UPDATE_CLIENT_FAIL = 'UPDATE_CLIENT_FAIL'
export const RESET_CLIENTS = 'RESET_CLIENTS'

export interface IUpdateClient {
    type: typeof UPDATE_CLIENT,
    payload: any
}

export interface IUpdateClientFail {
    type: typeof UPDATE_CLIENT_FAIL,
    payload: any
}

export interface IGetDni {
    type: typeof GET_DNI,
    payload: any
}

export interface IResetDNI {
    type: typeof RESET_DNI,
    payload: any
}

export interface ISaveClientFail {
    type: typeof SAVE_CLIENT_FAIL,
    payload: any
}

export interface ISaveClient {
    type: typeof SAVE_CLIENT,
    payload: any
}

export interface IGetClientFail {
    type: typeof GET_CLIENT_FAIL,
    payload: any
}

export interface IGetClients {
    type: typeof GET_CLIENTS,
    payload: any
}


export interface IUpdateProductsByPrice {
    type: typeof UPDATE_PRODUCT_BY_PRICE,
    payload: any
}

export interface IResetResponse {
    type: typeof RESET_RESPONSE,
    payload: any
}

export interface IResetClients {
    type: typeof RESET_CLIENTS,
    payload: any
}

export interface IRetiro {
    type: typeof RETIRO,
    payload: any
}

export interface ICerrarReporte {
    type: typeof CERRAR_REPORTE,
    payload: any
}

export interface IGetCorrelativoFail {
    type: typeof GET_CORRELATIVE_FAIL,
    payload: any
}

export interface IGetMontoCajaFail {
    type: typeof OBTENER_CAJA_MONTO_FAIL,
    payload: any
}

export interface IGetMontoCaja {
    type: typeof OBTENER_CAJA_MONTO,
    payload: any
}

export interface IAbrirCaja {
    type: typeof ABRIR_CAJA,
    payload: any
}

export interface ICerrarCaja {
    type: typeof CERRAR_CAJA,
    payload: any
}


export interface IDeleteProductsFicha {
    type: typeof ELIMINAR_PRODUCTOS_FICHA,
    payload: any
}

export interface ITipoVenta {
    type: typeof TIPO_VENTA,
    payload: string
}

export interface IEfectivo {
    type: typeof EFECTIVO,
    payload: string
}


export interface IGetCorrelative {
    type: typeof GET_CORRELATIVE,
    payload: any
}

export interface IGetListProductsWithFicha {
    type: typeof LIST_PRODUCTS_WITH_ANFI,
    payload: any
}

export interface IGetProductsBySale {
    type: typeof GET_PRODUCTS_BY_SALE,
    payload: IProduct
}

export interface IGetSaleProducts {
    type: typeof SALE_PRODUCTS
    payload: ISaleProduct
}

export interface IResetProductsBySale {
    type: typeof RESET_PRODUCTS_BY_SALE
}

export interface IGetTurned {
    type: typeof GET_TURNED,
    payload: number
}

export interface IDeleteProductInSale {
    type: typeof DELETE_PRODUCT_IN_SALE
    payload: number
}

export interface IDecrementProductInSale {
    type: typeof DECREMENT_PRODUCT_BY_SALE
    payload: IProduct
}

export interface ICheckedProductByFicha {
    type: typeof GET_PRODUCT_IS_CHECKED_WITH_FICHA
    payload: IProduct
}

export interface IDischeckedProductByFicha {
    type: typeof DISABLED_PRODUCT_IS_CHECKED_WITH_FICHA
    payload: IProduct
}

