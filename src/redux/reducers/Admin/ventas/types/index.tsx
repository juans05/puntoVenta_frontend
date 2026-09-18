
export const GET_ALL_VENTAS = 'GET_ALL_VENTAS';
export const DELETE_VENTAS = 'DELETE_VENTAS';
export const ANULAR_VENTAS = 'ANULAR_VENTAS';
export const ACTIVE_VENTAS = 'ACTIVE_VENTAS';
export const CLEAR_ACTIVE_VENTAS = 'CLEAR_ACTIVE_VENTAS';

export const OPEN_MODAL_VENTAS='OPEN_MODAL_VENTAS'
export const CLOSE_MODAL_VENTAS='CLOSE_MODAL_VENTAS'
export const PDF_BY_DOCUMENT = 'PDF_BY_DOCUMENT'

export const GET_MOTIVOS_NOTA = 'GET_MOTIVOS_NOTA'
export const GET_COMPROBANTE_BUSCADO = 'GET_COMPROBANTE_BUSCADO'
export const CLEAR_COMPROBANTE_BUSCADO = 'CLEAR_COMPROBANTE_BUSCADO'

export interface IGetMotivosNota{
    type: typeof GET_MOTIVOS_NOTA,
    payload: any
}

export interface IGetComprobanteBuscado{
    type: typeof GET_COMPROBANTE_BUSCADO,
    payload: any
}

export interface IClearComprobanteBuscado{
    type: typeof CLEAR_COMPROBANTE_BUSCADO,
}

export interface IDocumentPDF{
    type: typeof PDF_BY_DOCUMENT,
    payload: string
}

export interface IOpenModalVentas{
    type: typeof OPEN_MODAL_VENTAS,
    payload: any
}

export interface ICloseModalVentas{
    type: typeof CLOSE_MODAL_VENTAS,
    payload: any
}

export interface IGetAllVentas{
    type: typeof GET_ALL_VENTAS,
    payload: any
}

export interface IActiveVentas {
    type: typeof ACTIVE_VENTAS,
    payload: any
}
export interface IClearActiveVentas {
    type: typeof CLEAR_ACTIVE_VENTAS,

}

export interface IDeleteVentas {
    type: typeof DELETE_VENTAS,
    payload: any
}
export interface IAnularVentas {
    type: typeof ANULAR_VENTAS,
    payload: any
}


export type IClientsProviders = IGetAllVentas | IActiveVentas | IClearActiveVentas | IDeleteVentas | IAnularVentas | IOpenModalVentas | ICloseModalVentas | IGetMotivosNota | IGetComprobanteBuscado | IClearComprobanteBuscado