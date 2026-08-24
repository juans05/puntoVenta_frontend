import { IClient } from "../../../../presentation/views/Modules/Facturacion/ModalPay";
import { IProduct } from "../../productos/interfaces";

export interface ISalesState {
    productsBySale: IProduct[],
    total: number
    turned: number
    productosFicha: any[]
    correlative: string
    tipoVenta: string
    efectivo: string
    caja: any
    montosCaja: any
    message: string
    code: number
    clientes: any[]
    isReport: boolean
    cliente: IClient | null
    numeroDocumento: string
}

export interface ISaleProduct {
    clientId?: any
    tipoDocumentoVentaId: number
    numeroDocumento?: string
    total: number
    ruc: string
    razonSocial: string
    efectivo: string
    tipoVenta?: string
    esEcommerce?: boolean
    tipoEnvio?: string
    distrito?: string
    detalleComprobante: IDetalleComprobante[] 
    detallePago: IDetallePago[]
}

export interface IDetalleComprobante {
    productoId: number
    cantidad: number
    valorUnitario: number
}

export interface IDetallePago {
    metodoPagoId: number
    monto: number
    referenciaOperacion: any
}
