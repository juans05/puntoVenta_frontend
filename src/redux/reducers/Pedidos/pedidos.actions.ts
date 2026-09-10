import { Dispatch } from "redux";
import axiosInstance from "../../../utils/axios";
import { toast } from "sonner";
import type {
  ICreatePedidoPayload,
  IUpdatePedidoEstadoPayload,
  IPedidoQueryParams,
  IPedidoPublicoSubmitPayload,
  IClienteLoginPayload,
} from "./interfaces";
import {
  getPedidos,
  getPedidoById,
  createPedido,
  updatePedidoEstado,
  getEtiquetaEnvio,
  getPedidoPublico,
  submitPedidoPublico,
  getPedidosCliente,
  clienteLogin,
  resetPedidos,
  resetPedidoResponse,
} from "./types";

export const fetchPedidos = (params: IPedidoQueryParams) => async (dispatch: Dispatch) => {
  try {
    const queryParams = new URLSearchParams();
    queryParams.append("page", params.page.toString());
    queryParams.append("amount", params.amount.toString());
    if (params.estadoPedido) {
      queryParams.append("estadoPedido", params.estadoPedido);
    }

    const { data }: any = await axiosInstance.get(`/pedidos?${queryParams.toString()}`);
    dispatch(getPedidos(data));
  } catch (error: any) {
    toast.error("Error al cargar pedidos");
    dispatch(getPedidos({ data: { items: [], total: 0, page: 1, pageSize: 10 }, code: 100 }));
  }
};

export const fetchPedidoById = (id: number) => async (dispatch: Dispatch) => {
  try {
    const { data }: any = await axiosInstance.get(`/pedidos/${id}`);
    dispatch(getPedidoById(data));
  } catch (error: any) {
    toast.error("Error al cargar pedido");
  }
};

export const crearPedidoAction = (payload: ICreatePedidoPayload) => async (dispatch: Dispatch) => {
  try {
    const { data }: any = await axiosInstance.post("/pedidos", payload);
    dispatch(createPedido(data));
    toast.success("Pedido creado exitosamente");
    return data;
  } catch (error: any) {
    toast.error(error.response?.data?.message || "Error al crear pedido");
    throw error;
  }
};

export const actualizarEstadoPedidoAction = (payload: IUpdatePedidoEstadoPayload) => async (dispatch: Dispatch) => {
  try {
    const { data }: any = await axiosInstance.put("/pedidos/estado", payload);
    dispatch(updatePedidoEstado(data));
    toast.success("Estado actualizado");
    return data;
  } catch (error: any) {
    toast.error(error.response?.data?.message || "Error al actualizar estado");
    throw error;
  }
};

export const fetchEtiquetaEnvioAction = (pedidoId: number) => async (dispatch: Dispatch) => {
  try {
    const { data }: any = await axiosInstance.get(`/pedidos/${pedidoId}/etiqueta`);
    dispatch(getEtiquetaEnvio(data));
    return data;
  } catch (error: any) {
    toast.error("Error al cargar etiqueta");
  }
};

export const fetchPedidoPublicoAction = (token: string) => async (dispatch: Dispatch) => {
  try {
    const { data }: any = await axiosInstance.get(`/pedidos/publico/${token}`);
    dispatch(getPedidoPublico(data));
    return data;
  } catch (error: any) {
    toast.error("Pedido no encontrado");
    throw error;
  }
};

export const submitPedidoPublicoAction = (token: string, payload: IPedidoPublicoSubmitPayload) => async (dispatch: Dispatch) => {
  try {
    const { data }: any = await axiosInstance.post(`/pedidos/publico/${token}`, payload);
    dispatch(submitPedidoPublico(data));
    if (data.exito) {
      toast.success("Datos registrados. Revisa tu WhatsApp para la contraseña.");
    } else {
      toast.error("Error al registrar datos");
    }
    return data;
  } catch (error: any) {
    toast.error(error.response?.data?.message || "Error al procesar formulario");
    throw error;
  }
};

export const fetchPedidosClienteAction = (params: { page: number; amount: number }) => async (dispatch: Dispatch) => {
  try {
    const queryParams = new URLSearchParams();
    queryParams.append("page", params.page.toString());
    queryParams.append("amount", params.amount.toString());

    const { data }: any = await axiosInstance.get(`/cliente/pedidos?${queryParams.toString()}`);
    dispatch(getPedidosCliente(data));
  } catch (error: any) {
    toast.error("Error al cargar pedidos");
  }
};

export const clienteLoginAction = (payload: IClienteLoginPayload) => async (dispatch: Dispatch) => {
  try {
    const { data }: any = await axiosInstance.post("/cliente/auth/login", payload);
    dispatch(clienteLogin(data));
    // Guardar token en localStorage
    localStorage.setItem("clienteToken", data.token);
    localStorage.setItem("clienteId", data.clienteId.toString());
    toast.success("Login exitoso");
    return data;
  } catch (error: any) {
    toast.error(error.response?.data?.message || "Credenciales inválidas");
    throw error;
  }
};

export const resetPedidosAction = () => (dispatch: Dispatch) => {
  dispatch(resetPedidos());
};

export const resetPedidoResponseAction = () => (dispatch: Dispatch) => {
  dispatch(resetPedidoResponse());
};