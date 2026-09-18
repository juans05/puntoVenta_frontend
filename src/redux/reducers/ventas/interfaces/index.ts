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
    tipoDocumentoId?: number
    numeroDocumento?: string
    fechaVenta?: string
    total: number
    ruc: string
    razonSocial: string
    direccionCliente?: string
    ubigeoId?: string
    celular?: string
    email?: string
    efectivo: string
    tipoVenta?: string
    esEcommerce?: boolean
    tipoEnvio?: string
    distrito?: string
    esCredito?: boolean
    porcentajeDescuento?: number
    montoDescuento?: number
    montoRecibido?: number
    vuelto?: number
    observacion?: string
    modoEnvio?: "F" | "S" | "G"
    sucursalId?: number
    tipoOperacionId?: number
    placaVehiculo?: string
    guiaRemisionManual?: string
    guiaRemisionElectronica?: string
    etiquetas?: string
    fechaVencimiento?: string
    numeroOrden?: string
    colaboradorId?: string
    monedaId?: number
    tipoCambio?: number
    montoRetencion?: number
    montoAnticipo?: number
    fechaVigencia?: string
    cotizacionOrigenId?: number
    detalleComprobante: IDetalleComprobante[]
    detallePago: IDetallePago[]
}

export interface IDetalleComprobante {
    productoId: number
    cantidad: number
    valorUnitario: number
    costoReal?: number
    tipoIgvId?: number
    unidadMedidaId?: number
}

export interface IDetallePago {
    metodoPagoId: number
    monto: number
    referenciaOperacion: any
}
