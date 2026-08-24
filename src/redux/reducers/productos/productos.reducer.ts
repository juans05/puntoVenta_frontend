import { AnyAction, Dispatch, createReducer } from "@reduxjs/toolkit";
import { IProductsState, IResponseProduct } from "./interfaces";
import * as types from "./types";
import axiosInstance from "../../../utils/axios";
import {  } from "./interfaces";

const initialState: IProductsState = {
    products: [],
    total: 0
}

export const productsReducer = createReducer(initialState, (builder) => {
    builder
        .addCase("GET_ALL_PRODUCTS", (state: IProductsState, action: types.IGetAllProducts): IProductsState => {
            return {
                ...state,
                products: action.payload.items,
                total: action.payload.total
            }
        })
    }
)

export const getProducts = () => {
    return async (dispatch: Dispatch<types.IGetAllProducts | AnyAction>) => {
        try {
            const response : IResponseProduct = await axiosInstance.get(`productos/listar`);
            const { status, data } = response;
            const res = data.data
            if (status === 200) {
                dispatch({
                    type: types.GET_ALL_PRODUCTS,
                    payload: res
                })
            }
        } catch (error: any) {
            console.log(error);
        }
    }
}


export default productsReducer