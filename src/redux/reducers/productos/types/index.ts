import { Data } from "../interfaces";


export const GET_ALL_PRODUCTS = 'GET_ALL_PRODUCTS';

export interface IGetAllProducts {
    type: typeof GET_ALL_PRODUCTS,
    payload: Data
}




