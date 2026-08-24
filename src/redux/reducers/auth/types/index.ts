import { IAuth, IMe } from "../interfaces";

export const SIGN_IN = 'SIGN_IN';
export const ME = 'ME'
export const GET_CUSTOMER = 'GET_CUSTOMER';
export const SIGN_IN_ERROR = 'SIGN_IN_ERROR'
export const RESET_CUSTOMER = 'RESET_CUSTOMER'

export interface ISignIn {
    type: typeof SIGN_IN,
    payload: IAuth
}

export interface IMeAuth {
    type: typeof ME,
    payload: IMe
}

export interface IGetCustomer {
    type: typeof GET_CUSTOMER,
    payload: string
}

export interface IResetCustomer {
    type: typeof RESET_CUSTOMER,
    payload: string
}


export interface ISignInError {
    type: typeof SIGN_IN_ERROR
    payload: string
}