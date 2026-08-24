

export const OPEN_MODAL_PRODUCTS = 'OPEN_MODAL_PRODUCTS'
export const CLOSE_MODAL_PRODUCTS = 'CLOSE_MODAL_PRODUCTS'

export const OPEN_MODAL_GRUPOS = 'OPEN_MODAL_GRUPOS'
export const CLOSE_MODAL_GRUPOS = 'CLOSE_MODAL_GRUPOS'

export const GET_ALL_PRODUCTS = 'GET_ALL_PRODUCTS';
export const CREATE_PRODUCTS = 'CREATE_PRODUCTS';
export const UPDATE_PRODUCTS = 'UPDATE_PRODUCTS';
export const UPDATE_PRODUCT_IMAGE = 'UPDATE_PRODUCT_IMAGE';
export const DELETE_PRODUCTS = 'DELETE_PRODUCTS';
export const ACTIVE_PRODUCTO = 'ACTIVE_PRODUCTO';
export const CLEAR_ACTIVE_PRODUCTO = 'CLEAR_ACTIVE_PRODUCTO';

export const GET_ALL_CATEGORYS = 'GET_ALL_CATEGORYS';
export const CREATE_CATEGORY = 'CREATE_CATEGORY';
export const UPDATE_CATEGORY = 'UPDATE_CATEGORY';
export const DELETE_CATEGORY = 'DELETE_CATEGORY';

export const OPEN_MODAL_CATEGORIAS = 'OPEN_MODAL_CATEGORIAS'
export const CLOSE_MODAL_CATEGORIAS = 'CLOSE_MODAL_CATEGORIAS'

export const ACTIVE_CATEGORIA = 'ACTIVE_CATEGORIA';
export const CLEAR_ACTIVE_CATEGORIA = 'CLEAR_ACTIVE_CATEGORIA';

export const GET_ALL_GROUPS = 'GET_ALL_GROUPS';
export const ALL_GROUPS = 'ALL_GROUPS';
export const CREATE_GROUPS = 'CREATE_GROUPS';
export const UPDATE_GRUPO = 'UPDATE_GRUPO';
export const DELETE_GRUPO = 'DELETE_GRUPO';

export const ACTIVE_GRUPO = 'ACTIVE_GRUPO';
export const CLEAR_ACTIVE_GRUPO = 'CLEAR_ACTIVE_GRUPO';

export const OPEN_MODAL_HISTORIAL = 'OPEN_MODAL_HISTORIAL';
export const CLOSE_MODAL_HISTORIAL = 'CLOSE_MODAL_HISTORIAL';
export const GET_MOVIMIENTOS_PRODUCTO = 'GET_MOVIMIENTOS_PRODUCTO';

export interface IOpenModalProducts {
    type: typeof OPEN_MODAL_PRODUCTS,

}
export interface ICloseModalProducts {
    type: typeof CLOSE_MODAL_PRODUCTS,

}

export interface IOpenModalGrupos {
    type: typeof OPEN_MODAL_GRUPOS,

}
export interface ICloseModalGrupos {
    type: typeof CLOSE_MODAL_GRUPOS,

}

export interface IGetAllProducts {
    type: typeof GET_ALL_PRODUCTS,
    payload: any
}
export interface ICreateProducts {
    type: typeof CREATE_PRODUCTS,
    payload: any
}
export interface IActiveProducto {
    type: typeof ACTIVE_PRODUCTO,
    payload: any
}
export interface IClearActiveProducto {
    type: typeof CLEAR_ACTIVE_PRODUCTO,

}
export interface IUpdateProducts {
    type: typeof UPDATE_PRODUCTS,
    payload: any
}
export interface IUpdateProductImage {
    type: typeof UPDATE_PRODUCT_IMAGE,
    payload: any
}
export interface IDeleteProducts {
    type: typeof DELETE_PRODUCTS,
    payload: any
}


export interface IGetAllCategorys{
    type: typeof GET_ALL_CATEGORYS,
    payload: any
}
export interface ICreateCategory {
    type: typeof CREATE_CATEGORY,
    payload: any
}
export interface IUpdateCategory {
    type: typeof UPDATE_CATEGORY,
    payload: any
}
export interface IDeleteCategory {
    type: typeof DELETE_CATEGORY,
    payload: any
}

export interface IOpenModalCategorias {
    type: typeof OPEN_MODAL_CATEGORIAS,
}
export interface ICloseModalCategorias {
    type: typeof CLOSE_MODAL_CATEGORIAS,
}

export interface IActiveCategoria {
    type: typeof ACTIVE_CATEGORIA,
    payload: any
}
export interface IClearActiveCategoria {
    type: typeof CLEAR_ACTIVE_CATEGORIA,
}

export interface IGetAllGroups{
    type: typeof GET_ALL_GROUPS,
    payload: any
}
export interface IAllGroups{
    type: typeof ALL_GROUPS,
    payload: any
}
export interface ICreateGroups{
    type: typeof CREATE_GROUPS,
    payload: any
}
export interface IUpdateGrupo {
    type: typeof UPDATE_GRUPO,
    payload: any
}
export interface IDeleteGrupo {
    type: typeof DELETE_GRUPO,
    payload: any
}
export interface IActiveGrupo {
    type: typeof ACTIVE_GRUPO,
    payload: any
}
export interface IClearActiveGrupo {
    type: typeof CLEAR_ACTIVE_GRUPO,
}

export type IProductos = IOpenModalProducts | IGetAllProducts | IGetAllCategorys | ICreateProducts | IUpdateProducts | IDeleteProducts | ICreateCategory | IUpdateCategory | IDeleteCategory | IActiveProducto | ICloseModalProducts | IOpenModalGrupos | ICloseModalGrupos | ICreateGroups | IUpdateGrupo | IDeleteGrupo | IGetAllGroups | IAllGroups | IClearActiveProducto | IOpenModalCategorias | ICloseModalCategorias | IActiveCategoria | IClearActiveCategoria | IActiveGrupo | IClearActiveGrupo | IUpdateProductImage