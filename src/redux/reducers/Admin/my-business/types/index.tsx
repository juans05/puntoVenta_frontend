


export const GET_ALL_TENANTS = 'GET_ALL_TENANTS';
export const CREATE_TENANTS = 'CREATE_TENANTS';
export const UPDATE_TENANTS = 'UPDATE_TENANTS';
export const DELETE_TENANTS = 'DELETE_TENANTS';
export const ACTIVE_TENANTS = 'ACTIVE_TENANTS';
export const CLEAR_ACTIVE_TENANTS = 'CLEAR_ACTIVE_TENANTS';
export const OPEN_MODAL_TENANT = 'OPEN_MODAL_TENANT'
export const CLOSE_MODAL_TENANT = 'CLOSE_MODAL_TENANT'
export const GET_RUBROS='GET_RUBROS'
export const GET_UBIGEOS='GET_UBIGEOS'
export const GET_SUCURSALES='GET_SUCURSALES'
export const GET_TENANT='GET_TENANT'
export const GET_RECURSOS='GET_RECURSOS'
export const GET_TENANTS_RESUMEN='GET_TENANTS_RESUMEN'


export interface IGetAllTenants {
    type: typeof GET_ALL_TENANTS,
    payload: any
}
export interface ICreateTenants{
    type: typeof CREATE_TENANTS,
    payload: any
}
export interface IActiveTenants {
    type: typeof ACTIVE_TENANTS,
    payload: any
}
export interface IClearActiveTenants {
    type: typeof CLEAR_ACTIVE_TENANTS,

}
export interface IUpdateTenants {
    type: typeof UPDATE_TENANTS,
    payload: any
}
export interface IDeleteTenants{
    type: typeof DELETE_TENANTS,
    payload: any
}
/* --------- */
export interface IGetRubros {
    type: typeof GET_RUBROS,
    payload: any
}
export interface IGetUbigeos {
    type: typeof GET_UBIGEOS,
    payload: any
}
export interface IGetSucursales{
    type: typeof GET_SUCURSALES,
    payload: any
}
/* --------- */
export interface IGetTenant {
    type: typeof GET_TENANT,
    payload: any
}
export interface IGetRecursos {
    type: typeof GET_RECURSOS,
    payload: any
}
export interface IGetTenantsResumen {
    type: typeof GET_TENANTS_RESUMEN,
    payload: any
}
export interface IOpenModalTenant{
    type: typeof OPEN_MODAL_TENANT,

}
export interface ICloseModalTenant {
    type: typeof CLOSE_MODAL_TENANT,

}

export type IProductos = IGetAllTenants | ICreateTenants | IActiveTenants | IClearActiveTenants | IUpdateTenants | IUpdateTenants | IDeleteTenants | IOpenModalTenant | ICloseModalTenant | IGetRubros | IGetUbigeos | IGetSucursales | IGetTenant | IGetRecursos | IGetTenantsResumen