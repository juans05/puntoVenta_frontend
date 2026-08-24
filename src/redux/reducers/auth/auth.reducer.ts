import { createReducer } from "@reduxjs/toolkit";
import { Dispatch, AnyAction } from "redux";
import { IAuthState } from "./interfaces";
import * as types from "./types";
import { IResponseAuth, IResponseMe, IUser } from "./interfaces";
import axiosInstance from "../../../utils/axios";
import { setToken } from "../../../helpers/auth-helpers";
import { ALERT } from "../types";

const initialState: IAuthState = {
  login: null,
  me: null,
  customer: "",
  message: "",
};

export const authReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(
      "SIGN_IN",
      (state: IAuthState, action: types.ISignIn): IAuthState => {
        return {
          ...state,
          login: action.payload,
        };
      }
    )
    .addCase(
      "SIGN_IN_ERROR",
      (state: IAuthState, action: types.ISignInError): IAuthState => {
        return {
          ...state,
          message: action.payload,
        };
      }
    )
    .addCase("ME", (state: IAuthState, action: types.IMeAuth): IAuthState => {
      return {
        ...state,
        me: action.payload,
      };
    })
    .addCase(
      "GET_CUSTOMER",
      (state: IAuthState, action: types.IGetCustomer): IAuthState => {
        return {
          ...state,
          customer: action.payload,
        };
      }
    )
    .addCase(
      "RESET_CUSTOMER",
      (state: IAuthState, _action: types.IResetCustomer): IAuthState => {
        return {
          ...state,
          customer: ""
        };
      }
    );
});

export const signIn = (user: IUser) => {
  return async (dispatch: Dispatch<types.ISignIn | AnyAction>) => {
    try {
      dispatch({ type: ALERT, payload: { loading: true } });
      const { data } = await axiosInstance.post(`/autenticacion/token`, user);
      console.log(data)
      const { status, data: responseData }: IResponseAuth = data;

      if (status === 200) {
        dispatch({
          type: types.SIGN_IN,
          payload: responseData,
        });
        setToken(responseData.token);
      }
      dispatch({ type: ALERT, payload: { loading: false } });
    } catch (error: any) {
      dispatch({ type: ALERT, payload: { loading: false } });
      console.error('[signIn] /autenticacion/token failed', {
        url: error?.config?.baseURL + '' + error?.config?.url,
        status: error?.response?.status,
        code: error?.code,
        message: error?.message,
        responseData: error?.response?.data,
      });
      if (error?.response?.status === 400) {
        return dispatch({
          type: types.SIGN_IN_ERROR,
          payload: error?.response?.data?.message,
        });
      }
    }
  };
};

export const auhMe = () => {
  return async (dispatch: Dispatch<types.IMeAuth | AnyAction>) => {
    try {
      const response: IResponseMe = await axiosInstance.get(
        `/autenticacion/@me`
      );
      const { status, data } = response;
      if (status === 200) {
        dispatch({
          type: types.ME,
          payload: data,
        });
      }
    } catch (error: any) {
      console.log(error);
    }
  };
};

export const getCustomer = (customer: string) => {
  return async (dispatch: Dispatch<types.IGetCustomer | AnyAction>) => {
    try {
      dispatch({
        type: types.GET_CUSTOMER,
        payload: customer,
      });
    } catch (error: any) {
      console.log(error);
    }
  };
};

export const resetCustomer = () => {
  return async (dispatch: Dispatch<types.IResetCustomer | AnyAction>) => {
    try {
      dispatch({
        type: types.RESET_CUSTOMER
      });
    } catch (error: any) {
      console.log(error);
    }
  };
};

export default authReducer;
