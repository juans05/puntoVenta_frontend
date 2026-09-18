export const GET_PAY_METHODS = 'GET_PAY_METHODS';
export const GET_NACIONALITIES = 'GET_NACIONALITIES';
export const GET_ALL_USERS = 'GET_ALL_USERS';
export const GET_UBIGEOS = 'GET_UBIGEOS'
export const GET_TIPO_DOCUMENTO = 'GET_TIPO_DOCUMENTO'
export const GET_TIPOS_IGV = 'GET_TIPOS_IGV'
export const GET_UNIDADES_MEDIDA = 'GET_UNIDADES_MEDIDA'
export const GET_TIPOS_OPERACION = 'GET_TIPOS_OPERACION'
export const GET_MONEDAS = 'GET_MONEDAS'
export const GET_SUCURSALES = 'GET_SUCURSALES'
export const GET_COLABORADORES = 'GET_COLABORADORES'

export interface IGetPayMethods {
    type: typeof GET_PAY_METHODS,
    payload: any
}

export interface IGetNacionalities {
    type: typeof GET_NACIONALITIES,
    payload: any
}

export interface IGetAllUsers {
    type: typeof GET_ALL_USERS,
    payload: any
}

export interface IGetAllUbigeos {
    type: typeof GET_UBIGEOS,
    payload: any
}


export interface IGetTipoDocumento {
    type: typeof GET_TIPO_DOCUMENTO,
    payload: any
}

export interface IGetTiposIgv {
    type: typeof GET_TIPOS_IGV,
    payload: any
}

export interface IGetUnidadesMedida {
    type: typeof GET_UNIDADES_MEDIDA,
    payload: any
}

export interface IGetTiposOperacion {
    type: typeof GET_TIPOS_OPERACION,
    payload: any
}

export interface IGetMonedas {
    type: typeof GET_MONEDAS,
    payload: any
}

export interface IGetSucursales {
    type: typeof GET_SUCURSALES,
    payload: any
}

export interface IGetColaboradores {
    type: typeof GET_COLABORADORES,
    payload: any
}