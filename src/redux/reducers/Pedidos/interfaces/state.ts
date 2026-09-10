import type {
  IPedido,
  IPedidoPublico,
  IEtiquetaEnvio,
  ISubmitPedidoResult,
  IClienteLoginResult,
} from ".";

export interface IPedidosState {
  pedidos: IPedido[];
  total: number;
  pedidoSeleccionado: IPedido | null;
  pedidoPublico: IPedidoPublico | null;
  etiquetaEnvio: IEtiquetaEnvio | null;
  submitResult: ISubmitPedidoResult | null;
  pedidosCliente: IPedido[];
  totalCliente: number;
  clienteToken: string | null;
  clienteLoginResult: IClienteLoginResult | null;
  message: string;
  code: number;
  enviando: boolean;
}