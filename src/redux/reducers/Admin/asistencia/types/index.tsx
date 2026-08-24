export const ACTIVE_ROOM = 'ACTIVE_ROOM';
export const CLEAR_ACTIVE_ROOM = 'CLEAR_ACTIVE_ROOM';

export const OPEN_POPOVER_ASISTENCIA='OPEN_POPOVER_ASISTENCIA'
export const CLOSE_POPOVER_ASISTENCIA='CLOSE_POPOVER_ASISTENCIA'

export const LIST_RENTA='LIST_RENTA'
export const LIST_FICHAS_BY_ROOM='LIST_FICHAS_BY_ROOM'
export const LIST_REPORTE_RENTAS='LIST_REPORTE_RENTAS'
export const LIST_CUARTOS='LIST_CUARTOS'
export const CREATE_RENTA='CREATE_RENTA'
export const COMPLETE_RENTA='COMPLETE_RENTA'

export const GET_LIST_OCCUPIED_ROOMS = 'GET_LIST_OCCUPIED_ROOMS'
export const OPEN_MODAL_FICHAS = 'OPEN_MODAL_FICHAS'
export const CLOSE_MODAL_FICHAS = 'CLOSE_MODAL_FICHAS'

export const MARCAR_SALIDA='MARCAR_SALIDA'

export interface IActiveRoom{
    type: typeof ACTIVE_ROOM,
    payload: any;
}
export interface IClearActiveRoom {
    type: typeof CLEAR_ACTIVE_ROOM,
}

export interface IOpenPopoverAsistencia{
    type: typeof OPEN_POPOVER_ASISTENCIA,
    payload: any
}
export interface IClosePopoverAsistencia{
    type: typeof CLOSE_POPOVER_ASISTENCIA,

}
export interface IListRenta{
    type: typeof LIST_RENTA,
    payload: any
}
export interface IListReporteRentas{
    type: typeof LIST_REPORTE_RENTAS,
    payload: any
}
export interface IListFichasByRoom{
    type: typeof LIST_FICHAS_BY_ROOM,
    payload: any
}
export interface IListCuartos{
    type: typeof LIST_CUARTOS,
    payload: any
}

export interface ICreateRenta {
    type: typeof CREATE_RENTA,
    payload: any
}

export interface IListOccupiedRoom {
    type: typeof GET_LIST_OCCUPIED_ROOMS,
    payload: any
}

export interface IOpenModalFichas {
    type: typeof OPEN_MODAL_FICHAS,

}
export interface ICloseModalFichas {
    type: typeof CLOSE_MODAL_FICHAS,

}
export interface IMarcarSalida{
    type: typeof MARCAR_SALIDA,
    payload: any
}
export interface ICompleteRenta{
    type: typeof COMPLETE_RENTA,
    payload: any
}
export type IAsistencia= IActiveRoom | IClearActiveRoom | IOpenPopoverAsistencia | IClosePopoverAsistencia | IListCuartos | IListRenta | ICreateRenta | IOpenModalFichas | ICloseModalFichas | IMarcarSalida | IListReporteRentas | IListFichasByRoom | ICompleteRenta
