export const GET_PAY_METHODS = 'GET_PAY_METHODS';
export const GET_NACIONALITIES = 'GET_NACIONALITIES';
export const GET_ALL_USERS = 'GET_ALL_USERS';
export const GET_UBIGEOS = 'GET_UBIGEOS'
export const GET_TIPO_DOCUMENTO = 'GET_TIPO_DOCUMENTO'

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