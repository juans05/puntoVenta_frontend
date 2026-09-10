import { createAction } from "@reduxjs/toolkit";
import type {
  IPedido,
  IPedidoPublico,
  IEtiquetaEnvio,
  ISubmitPedidoResult,
  IClienteLoginResult,
} from "../interfaces";

export interface IGetPedidos {
  type: "GET_PEDIDOS";
  payload: {
    data: {
      items: IPedido[];
      total: number;
      page: number;
      pageSize: number;
    };
    code: number;
  };
}

export interface IGetPedidoById {
  type: "GET_PEDIDO_BY_ID";
  payload: IPedido;
}

export interface ICreatePedido {
  type: "CREATE_PEDIDO";
  payload: IPedido;
}

export interface IUpdatePedidoEstado {
  type: "UPDATE_PEDIDO_ESTADO";
  payload: IPedido;
}

export interface IGetEtiquetaEnvio {
  type: "GET_ETIQUETA_ENVIO";
  payload: IEtiquetaEnvio;
}

export interface IGetPedidoPublico {
  type: "GET_PEDIDO_PUBLICO";
  payload: IPedidoPublico;
}

export interface ISubmitPedidoPublico {
  type: "SUBMIT_PEDIDO_PUBLICO";
  payload: ISubmitPedidoResult;
}

export interface IGetPedidosCliente {
  type: "GET_PEDIDOS_CLIENTE";
  payload: {
    data: {
      items: IPedido[];
      total: number;
      page: number;
      pageSize: number;
    };
    code: number;
  };
}

export interface IClienteLogin {
  type: "CLIENTE_LOGIN";
  payload: IClienteLoginResult;
}

export interface IResetPedidos {
  type: "RESET_PEDIDOS";
  payload: undefined;
}

export interface IResetPedidoResponse {
  type: "RESET_PEDIDO_RESPONSE";
  payload: undefined;
}

export const getPedidos = createAction<IGetPedidos["payload"]>("GET_PEDIDOS");
export const getPedidoById = createAction<IGetPedidoById["payload"]>("GET_PEDIDO_BY_ID");
export const createPedido = createAction<ICreatePedido["payload"]>("CREATE_PEDIDO");
export const updatePedidoEstado = createAction<IUpdatePedidoEstado["payload"]>("UPDATE_PEDIDO_ESTADO");
export const getEtiquetaEnvio = createAction<IGetEtiquetaEnvio["payload"]>("GET_ETIQUETA_ENVIO");
export const getPedidoPublico = createAction<IGetPedidoPublico["payload"]>("GET_PEDIDO_PUBLICO");
export const submitPedidoPublico = createAction<ISubmitPedidoPublico["payload"]>("SUBMIT_PEDIDO_PUBLICO");
export const getPedidosCliente = createAction<IGetPedidosCliente["payload"]>("GET_PEDIDOS_CLIENTE");
export const clienteLogin = createAction<IClienteLogin["payload"]>("CLIENTE_LOGIN");
export const resetPedidos = createAction<IResetPedidos["payload"]>("RESET_PEDIDOS");
export const resetPedidoResponse = createAction<IResetPedidoResponse["payload"]>("RESET_PEDIDO_RESPONSE");