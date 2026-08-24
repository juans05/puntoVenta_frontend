export const GET_ALL_CLIENTS = 'GET_ALL_CLIENTS';
export const CREATE_CLIENTS = 'CREATE_CLIENTS';
export const UPDATE_CLIENTS = 'UPDATE_CLIENTS';
export const DELETE_CLIENTS = 'DELETE_CLIENTS';
export const ACTIVE_CLIENTS = 'ACTIVE_CLIENTS';
export const CLEAR_ACTIVE_CLIENTS = 'CLEAR_ACTIVE_CLIENTS';

export const GET_ALL_PROVIDERS = 'GET_ALL_PROVIDERS';
export const CREATE_PROVIDERS = 'CREATE_PROVIDERS';
export const UPDATE_PROVIDERS = 'UPDATE_PROVIDERS';
export const DELETE_PROVIDERS = 'DELETE_PROVIDERS';
export const ACTIVE_PROVIDERS = 'ACTIVE_PROVIDERS';
export const CLEAR_ACTIVE_PROVIDERS = 'CLEAR_ACTIVE_PROVIDERS';

export const GET_ALL_ANFITRIONAS = 'GET_ALL_ANFITRIONAS';
export const CREATE_ANFITRIONAS = 'CREATE_ANFITRIONAS';
export const UPDATE_ANFITRIONAS= 'UPDATE_ANFITRIONAS';
export const DELETE_ANFITRIONAS = 'DELETE_ANFITRIONAS';
export const ACTIVE_ANFITRIONAS = 'ACTIVE_ANFITRIONAS';
export const CLEAR_ACTIVE_ANFITRIONAS = 'CLEAR_ACTIVE_ANFITRIONAS';

export const OPEN_MODAL_ANFITRIONA='OPEN_MODAL_ANFITRIONA'
export const CLOSE_MODAL_ANFITRIONA='CLOSE_MODAL_ANFITRIONA'

export const OPEN_MODAL_PROVEEDOR='OPEN_MODAL_PROVEEDOR'
export const CLOSE_MODAL_PROVEEDOR='CLOSE_MODAL_PROVEEDOR'

export interface IOpenModalProveedor{
    type: typeof OPEN_MODAL_PROVEEDOR,
}

export interface ICloseModalProveedor{
    type: typeof CLOSE_MODAL_PROVEEDOR,
}


export interface IOpenModalAnfitriona{
    type: typeof OPEN_MODAL_ANFITRIONA,
    payload: any
}

export interface ICloseModalAnfitriona{
    type: typeof CLOSE_MODAL_ANFITRIONA,
    payload: any
}

export interface IGetAllClients{
    type: typeof GET_ALL_CLIENTS,
    payload: any
}

export interface ICreateClients {
    type: typeof CREATE_CLIENTS,
    payload: any
}

export interface IActiveClients {
    type: typeof ACTIVE_CLIENTS,
    payload: any
}
export interface IClearActiveClients {
    type: typeof CLEAR_ACTIVE_CLIENTS,

}
export interface IUpdateClients{
    type: typeof UPDATE_CLIENTS,
    payload: any
}
export interface IDeleteClients {
    type: typeof DELETE_CLIENTS,
    payload: any
}


export interface IGetAllProviders{
    type: typeof GET_ALL_PROVIDERS,
    payload: any
}

export interface ICreateProviders {
    type: typeof CREATE_PROVIDERS,
    payload: any
}

export interface IActiveProviders {
    type: typeof ACTIVE_PROVIDERS,
    payload: any
}
export interface IClearActiveProviders {
    type: typeof CLEAR_ACTIVE_PROVIDERS,

}
export interface IUpdateProviders{
    type: typeof UPDATE_PROVIDERS,
    payload: any
}
export interface IDeleteProviders {
    type: typeof DELETE_PROVIDERS,
    payload: any
}

/* -------- */
export interface IGetAllAnfitrionas{
    type: typeof GET_ALL_ANFITRIONAS,
    payload: any
}

export interface ICreateAnfitrionas {
    type: typeof CREATE_ANFITRIONAS,
    payload: any
}

export interface IActiveAnfitrionas {
    type: typeof ACTIVE_ANFITRIONAS,
    payload: any
}
export interface IClearActiveAnfitrionas {
    type: typeof CLEAR_ACTIVE_ANFITRIONAS,

}
export interface IUpdateAnfitrionas{
    type: typeof UPDATE_ANFITRIONAS,
    payload: any
}
export interface IDeleteAnfitrionas {
    type: typeof DELETE_ANFITRIONAS,
    payload: any
}


export type IClientsProviders = IGetAllClients | ICreateClients | IActiveClients | IClearActiveClients | IUpdateClients | IDeleteClients | IGetAllProviders | ICreateProviders | IActiveProviders | IClearActiveProviders | IUpdateProviders | IDeleteProviders | IGetAllAnfitrionas | ICreateAnfitrionas | IActiveAnfitrionas | IClearActiveAnfitrionas | IUpdateAnfitrionas | IDeleteAnfitrionas | IOpenModalAnfitriona | ICloseModalAnfitriona | IOpenModalProveedor | ICloseModalProveedor