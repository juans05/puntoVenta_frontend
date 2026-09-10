import { createReducer } from "@reduxjs/toolkit";
import { IPedidosState } from "./interfaces";
import * as types from "./types";

const initialState: IPedidosState = {
  pedidos: [],
  total: 0,
  pedidoSeleccionado: null,
  pedidoPublico: null,
  etiquetaEnvio: null,
  submitResult: null,
  pedidosCliente: [],
  totalCliente: 0,
  clienteToken: null,
  clienteLoginResult: null,
  message: '',
  code: 0,
  enviando: false,
};

export const pedidosReducer = createReducer(initialState, (builder) => {
  builder
    .addCase("GET_PEDIDOS", (state: IPedidosState, action: types.IGetPedidos): IPedidosState => {
      return {
        ...state,
        pedidos: action.payload.data.items,
        total: action.payload.data.total,
        code: action.payload.code,
        message: "",
        enviando: false,
      };
    })
    .addCase("GET_PEDIDO_BY_ID", (state: IPedidosState, action: types.IGetPedidoById): IPedidosState => {
      return {
        ...state,
        pedidoSeleccionado: action.payload,
        message: "",
        code: 0,
      };
    })
    .addCase("CREATE_PEDIDO", (state: IPedidosState, action: types.ICreatePedido): IPedidosState => {
      return {
        ...state,
        pedidoSeleccionado: action.payload,
        message: "Pedido creado exitosamente",
        code: 1,
        enviando: false,
      };
    })
    .addCase("UPDATE_PEDIDO_ESTADO", (state: IPedidosState, action: types.IUpdatePedidoEstado): IPedidosState => {
      return {
        ...state,
        pedidoSeleccionado: action.payload,
        message: "Estado actualizado",
        code: 1,
      };
    })
    .addCase("GET_ETIQUETA_ENVIO", (state: IPedidosState, action: types.IGetEtiquetaEnvio): IPedidosState => {
      return {
        ...state,
        etiquetaEnvio: action.payload,
        message: "",
        code: 0,
      };
    })
    .addCase("GET_PEDIDO_PUBLICO", (state: IPedidosState, action: types.IGetPedidoPublico): IPedidosState => {
      return {
        ...state,
        pedidoPublico: action.payload,
        message: "",
        code: 0,
      };
    })
    .addCase("SUBMIT_PEDIDO_PUBLICO", (state: IPedidosState, action: types.ISubmitPedidoPublico): IPedidosState => {
      return {
        ...state,
        submitResult: action.payload,
        message: action.payload.exito ? "Datos registrados exitosamente" : "Error al registrar datos",
        code: action.payload.exito ? 1 : 100,
      };
    })
    .addCase("GET_PEDIDOS_CLIENTE", (state: IPedidosState, action: types.IGetPedidosCliente): IPedidosState => {
      return {
        ...state,
        pedidosCliente: action.payload.data.items,
        totalCliente: action.payload.data.total,
        code: action.payload.code,
        message: "",
      };
    })
    .addCase("CLIENTE_LOGIN", (state: IPedidosState, action: types.IClienteLogin): IPedidosState => {
      return {
        ...state,
        clienteLoginResult: action.payload,
        clienteToken: action.payload.token,
        message: "Login exitoso",
        code: 1,
      };
    })
    .addCase("RESET_PEDIDOS", (state: IPedidosState): IPedidosState => {
      return {
        ...state,
        pedidos: [],
        total: 0,
        pedidoSeleccionado: null,
        pedidoPublico: null,
        etiquetaEnvio: null,
        submitResult: null,
        pedidosCliente: [],
        totalCliente: 0,
      };
    })
    .addCase("RESET_PEDIDO_RESPONSE", (state: IPedidosState): IPedidosState => {
      return {
        ...state,
        message: "",
        code: 0,
        submitResult: null,
      };
    });
});