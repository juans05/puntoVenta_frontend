export interface IPedidoDetalle {
  id: number;
  pedidoId: number;
  productoId: number;
  productoNombre: string;
  productoImagen?: string;
  cantidad: number;
  valorUnitario: number;
  subtotal: number;
}

export interface IPedido {
  index: number;
  id: number;
  token: string;
  estadoPedido: string;
  estadoPedidoDescripcion: string;
  total: number;
  clienteId?: number;
  nombre?: string;
  dni?: string;
  celular?: string;
  ubigeoId?: string;
  ubigeoNombre?: string;
  tipoEnvio?: string;
  direccion?: string;
  referencia?: string;
  latitud?: number;
  longitud?: number;
  codigoSeguimiento?: string;
  fechaDespacho?: string;
  fechaEntrega?: string;
  passwordEnviado: boolean;
  comprobanteCabeceraId?: number;
  fechaCreacion?: string;
  usuarioCreacion?: string;
  pedidoDetalles: IPedidoDetalle[];
}

export interface IPedidoPublico {
  id: number;
  token: string;
  total: number;
  estadoPedido: string;
  pedidoDetalles: IPedidoDetallePublico[];
}

export interface IPedidoDetallePublico {
  productoId: number;
  productoNombre: string;
  productoImagen?: string;
  cantidad: number;
  valorUnitario: number;
}

export interface IEtiquetaEnvio {
  pedidoId: number;
  nombre: string;
  direccion: string;
  distrito: string;
  celular: string;
  tipoEnvio: string;
  codigoSeguimiento?: string;
}

export interface ICreatePedidoPayload {
  sucursalId: number;
  total: number;
  clienteId?: number;
  nombre?: string;
  dni?: string;
  celular?: string;
  detalles: ICreatePedidoDetallePayload[];
}

export interface ICreatePedidoDetallePayload {
  productoId: number;
  cantidad: number;
  valorUnitario: number;
}

export interface IUpdatePedidoEstadoPayload {
  id: number;
  estadoPedido: string;
  codigoSeguimiento?: string;
}

export interface IPedidoQueryParams {
  page: number;
  amount: number;
  value?: string;
  estadoPedido?: string;
}

export interface IPedidoPublicoSubmitPayload {
  nombre: string;
  dni: string;
  celular: string;
  ubigeoId: string;
  direccion?: string;
  referencia?: string;
  latitud?: number;
  longitud?: number;
}

export interface IClienteLoginPayload {
  email: string;
  password: string;
}

export interface IClienteLoginResult {
  token: string;
  clienteId: number;
  email: string;
  expiracion: string;
}

export interface ISubmitPedidoResult {
  exito: boolean;
  passwordGenerado?: string;
  pedidoId: number;
  celular?: string;
  cuentaExistia: boolean;
}

export type { IPedidosState } from "./state";