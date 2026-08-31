import { createReducer, Dispatch, AnyAction } from "@reduxjs/toolkit";

import * as types from "./types";
import { ILayoutProducto } from "./interfaces";
import axiosInstance from "../../../../utils/axios";
import { toast } from 'sonner'
const initialState: ILayoutProducto = {
  modalProducts: false,
  modalGrupos: false,
  modalCategorias: false,
  products: [],
  totalProductos: 0,
  categorias: [],
  totalCategorias: 0,
  activeProducto: null,
  activeCategoria: null,
  activeGrupo: null,
  grupos: [],
  totalGrupos: 0,
  allGrupos: [],
  modalHistorial: false,
  historialProducto: null,
  movimientos: [],
  totalMovimientos: 0,
};
export const productoReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(
      "OPEN_MODAL_PRODUCTS",
      (state: ILayoutProducto): ILayoutProducto => {
        return {
          ...state,
          modalProducts: true,
        };
      }
    )
    .addCase(
      "CLOSE_MODAL_PRODUCTS",
      (state: ILayoutProducto): ILayoutProducto => {
        return {
          ...state,
          modalProducts: false,
        };
      }
    )

    .addCase("OPEN_MODAL_GRUPOS", (state: ILayoutProducto): ILayoutProducto => {
      return {
        ...state,
        modalGrupos: true,
      };
    })
    .addCase(
      "CLOSE_MODAL_GRUPOS",
      (state: ILayoutProducto): ILayoutProducto => {
        return {
          ...state,
          modalGrupos: false,
        };
      }
    )

    .addCase(
      "GET_ALL_PRODUCTS",
      (
        state: ILayoutProducto,
        action: types.IGetAllProducts
      ): ILayoutProducto => {
        return {
          ...state,
          products: action.payload.items,
          totalProductos: action.payload.total,
        };
      }
    )
    .addCase(
      types.OPEN_MODAL_HISTORIAL,
      (state: ILayoutProducto, action: any): ILayoutProducto => {
        return {
          ...state,
          modalHistorial: true,
          historialProducto: action.payload,
        };
      }
    )
    .addCase(
      types.CLOSE_MODAL_HISTORIAL,
      (state: ILayoutProducto): ILayoutProducto => {
        return {
          ...state,
          modalHistorial: false,
          historialProducto: null,
          movimientos: [],
          totalMovimientos: 0,
        };
      }
    )
    .addCase(
      types.GET_MOVIMIENTOS_PRODUCTO,
      (state: ILayoutProducto, action: any): ILayoutProducto => {
        return {
          ...state,
          movimientos: action.payload.items,
          totalMovimientos: action.payload.total,
        };
      }
    )
    .addCase(
      "CREATE_PRODUCTS",
      (
        state: ILayoutProducto,
        action: types.ICreateProducts
      ): ILayoutProducto => {
        const newState = {
          ...state,
          products: [action.payload, ...state.products],
        };
        const newArray = newState.products.map((element, index) => {
          return { ...element, index: index + 1 };
        });
        return {
          ...state,
          products: newArray,
        };
      }
    )
    .addCase(
      "ACTIVE_PRODUCTO",
      (
        state: ILayoutProducto,
        action: types.IActiveProducto
      ): ILayoutProducto => {
        return {
          ...state,
          activeProducto: {
            ...action.payload,
          },
        };
      }
    )
    .addCase(
      "CLEAR_ACTIVE_PRODUCTO",
      (
        state: ILayoutProducto,

      ): ILayoutProducto => {
        return {
          ...state,
          activeProducto: null,
        };
      }
    )
    .addCase(
      "UPDATE_PRODUCTS",
      (
        state: ILayoutProducto,
        action: types.IUpdateProducts
      ): ILayoutProducto => {
        return {
          ...state,
          products: state.products.map((products) =>
            products.productoId === action.payload.productoId
              ? action.payload
              : products
          ),
        };
      }
    )
    .addCase(
      "UPDATE_PRODUCT_IMAGE",
      (
        state: ILayoutProducto,
        action: types.IUpdateProductImage
      ): ILayoutProducto => {
        return {
          ...state,
          products: state.products.map((products) =>
            products.productoId === action.payload.productoId
              ? {
                  ...products,
                  rutaImagen: action.payload.rutaImagen,
                  cloudinaryPublicId: action.payload.cloudinaryPublicId,
                }
              : products
          ),
        };
      }
    )
    .addCase(
      "DELETE_PRODUCTS",
      (
        state: ILayoutProducto,
        action: types.IDeleteProducts
      ): ILayoutProducto => {
        return {
          ...state,
          activeProducto: null,
          products: state.products.filter(
            (products) => products.productoId !== action.payload
          ),
        };
      }
    )
    .addCase(
      "GET_ALL_CATEGORYS",
      (
        state: ILayoutProducto,
        action: types.IGetAllCategorys
      ): ILayoutProducto => {
        return {
          ...state,
          categorias: action.payload,
        };
      }
    )
    .addCase(
      "CREATE_CATEGORY",
      (
        state: ILayoutProducto,
        action: types.ICreateCategory
      ): ILayoutProducto => {
        const newState = {
          ...state,
          categorias: [action.payload, ...state.categorias],
        };
        const newArray = newState.categorias.map((element, index) => {
          return { ...element, index: index + 1 };
        });
        return {
          ...state,
          categorias: newArray,
        };
      }
    )
    /*  */

    .addCase(
      "GET_ALL_GROUPS",
      (
        state: ILayoutProducto,
        action: types.IGetAllGroups
      ): ILayoutProducto => {
        return {
          ...state,
          grupos: action.payload,
        };
      }
    )
    .addCase(
      "ALL_GROUPS",
      (
        state: ILayoutProducto,
        action: types.IAllGroups
      ): ILayoutProducto => {
        return {
          ...state,
          allGrupos: action.payload,
        };
      }
    )
    .addCase(
      "CREATE_GROUPS",
      (
        state: ILayoutProducto,
        action: types.ICreateGroups
      ): ILayoutProducto => {
        const newState = {
          ...state,
          grupos: [action.payload, ...state.grupos],
        };
        const newArray = newState.grupos.map((element, index) => {
          return { ...element, index: index + 1 };
        });
        return {
          ...state,
          grupos: newArray,
          allGrupos: [...state.allGrupos, action.payload]
        };
      }
    )
    .addCase(
      "UPDATE_CATEGORY",
      (
        state: ILayoutProducto,
        action: types.IUpdateCategory
      ): ILayoutProducto => {
        return {
          ...state,
          categorias: state.categorias.map((categoria) =>
            categoria.categoriaId === action.payload.categoriaId
              ? action.payload
              : categoria
          ),
        };
      }
    )
    .addCase(
      "DELETE_CATEGORY",
      (
        state: ILayoutProducto,
        action: types.IDeleteCategory
      ): ILayoutProducto => {
        return {
          ...state,
          activeCategoria: null,
          categorias: state.categorias.filter(
            (categoria) => categoria.categoriaId !== action.payload
          ),
        };
      }
    )
    .addCase(
      "OPEN_MODAL_CATEGORIAS",
      (state: ILayoutProducto): ILayoutProducto => {
        return {
          ...state,
          modalCategorias: true,
        };
      }
    )
    .addCase(
      "CLOSE_MODAL_CATEGORIAS",
      (state: ILayoutProducto): ILayoutProducto => {
        return {
          ...state,
          modalCategorias: false,
        };
      }
    )
    .addCase(
      "ACTIVE_CATEGORIA",
      (
        state: ILayoutProducto,
        action: types.IActiveCategoria
      ): ILayoutProducto => {
        return {
          ...state,
          activeCategoria: { ...action.payload },
        };
      }
    )
    .addCase(
      "CLEAR_ACTIVE_CATEGORIA",
      (state: ILayoutProducto): ILayoutProducto => {
        return {
          ...state,
          activeCategoria: null,
        };
      }
    )
    .addCase(
      "ACTIVE_GRUPO",
      (
        state: ILayoutProducto,
        action: types.IActiveGrupo
      ): ILayoutProducto => {
        return {
          ...state,
          activeGrupo: { ...action.payload },
        };
      }
    )
    .addCase(
      "CLEAR_ACTIVE_GRUPO",
      (state: ILayoutProducto): ILayoutProducto => {
        return {
          ...state,
          activeGrupo: null,
        };
      }
    )
    .addCase(
      "UPDATE_GRUPO",
      (
        state: ILayoutProducto,
        action: types.IUpdateGrupo
      ): ILayoutProducto => {
        const updateGrupos = state.grupos.map((grupo) =>
          grupo.grupoId === action.payload.grupoId ? action.payload : grupo
        );
        return {
          ...state,
          grupos: updateGrupos,
          allGrupos: state.allGrupos.map((grupo) =>
            grupo.grupoId === action.payload.grupoId ? action.payload : grupo
          ),
        };
      }
    )
    .addCase(
      "DELETE_GRUPO",
      (
        state: ILayoutProducto,
        action: types.IDeleteGrupo
      ): ILayoutProducto => {
        return {
          ...state,
          activeGrupo: null,
          grupos: state.grupos.filter(
            (grupo) => grupo.grupoId !== action.payload
          ),
          allGrupos: state.allGrupos.filter(
            (grupo) => grupo.grupoId !== action.payload
          ),
        };
      }
    )
});

export const openModalProducto = () => {
  return async (dispatch: Dispatch<types.IOpenModalProducts | any>) => {
    dispatch({
      type: types.OPEN_MODAL_PRODUCTS,
    });
  };
};
export const closeModalProducto = () => {
  return async (dispatch: Dispatch<types.ICloseModalProducts | any>) => {
    dispatch({
      type: types.CLOSE_MODAL_PRODUCTS,
    });
  };
};

export const openModalGrupos = () => {
  return async (dispatch: Dispatch<types.IOpenModalGrupos | any>) => {
    dispatch({
      type: types.OPEN_MODAL_GRUPOS,
    });
  };
};
export const closeModalGrupos = () => {
  return async (dispatch: Dispatch<types.ICloseModalGrupos | any>) => {
    dispatch({
      type: types.CLOSE_MODAL_GRUPOS,
    });
  };
};

export const getProducts = (
  categoriaId: number,
  grupoId: any,
  value: string,
  page: number,
  amount: number,
  groupName?: string,

) => {
  return async (dispatch: Dispatch<types.IGetAllProducts | AnyAction>) => {
    // console.log(value)
    try {
      const response: any = await axiosInstance.get(
        `/productos/listar?${groupName != undefined && groupName !== 'Todos' ? `CategoriaId=${categoriaId}&GrupoId=${grupoId}&Value=${value}&Page=${page}&Amount=${amount}` : `CategoriaId=${categoriaId}&Value=${value}&Page=${page}&Amount=${amount}`}`
        /*  `/productos/listar?${groupName!=undefined && groupName!=='Todos' ?`CategoriaId=${categoriaId}&GrupoId=${grupoId}&Value=${value}&Page=${page}&Amount=${amount}`:`Value=${value}&Page=${page}&Amount=${amount}` }` */
      );
      const { status, data } = response;
      if (status === 200) {
        dispatch({
          type: types.GET_ALL_PRODUCTS,
          payload: data?.data,
        });
      }else{
        dispatch({
          type: types.GET_ALL_PRODUCTS,
          payload:{
            items:[],
            total:0,
          }
        });
      }
    } catch (error: any) {
      console.log(error);
      dispatch({
        type: types.GET_ALL_PRODUCTS,
        payload:{
          items:[],
          total:0,
        }
      });
    }
  };
};

export const getCategorias = () => {
  return async (dispatch: Dispatch<types.IGetAllProducts | AnyAction>) => {
    try {
      const response: any = await axiosInstance.get(`/Category/listar`);
      const { status, data } = response;
      if (status === 200) {
        dispatch({
          type: types.GET_ALL_CATEGORYS,
          payload: data?.data,
        });
      }
    } catch (error: any) {
      console.log(error);
    }
  };
};

export const createProducto = (producto: any) => {
  return async (dispatch: Dispatch<types.ICreateProducts | AnyAction>) => {
    try {
      const response: any = await axiosInstance.post(
        `/productos/crear`,
        producto
      );
      const { status, data } = response;
      console.log(data);
      if (status === 200) {
        dispatch({
          type: types.CREATE_PRODUCTS,
          payload: data?.data,
        });
        return data?.data;
      }
      return null;
    } catch (error: any) {
      console.log(error);
      return null;
    }
  };
};

export const updateProducts = (productoUpdated: any) => {
  return async (dispatch: Dispatch<types.IUpdateProducts | AnyAction>) => {
    try {
      const response: any = await axiosInstance.put(
        `/productos/modificar`,
        productoUpdated
      );
      const { status, data } = response;
      console.log(data);
      if (status === 200) {
        dispatch({
          type: types.UPDATE_PRODUCTS,
          payload: data?.data,
        });
        return data?.data;
      }
      return null;
    } catch (error: any) {
      console.log(error);
      return null;
    }
  };
};

export const deleteProducts = (idProducto: any) => {
  return async (dispatch: Dispatch<types.IUpdateProducts | AnyAction>) => {
    try {
      const response: any = await axiosInstance.delete(
        `/productos/eliminar?IdProducto=${idProducto}`,
        {}
      );
      const { status, data } = response;
      console.log(data);
      if (status === 200) {
        dispatch({
          type: types.DELETE_PRODUCTS,
          payload: idProducto,
        });
      }
    } catch (error: any) {
      console.log(error);
      toast.error("Hubo un error al eliminar el producto");
    }
  };
};

export const subirImagenProducto = (productoId: any, archivo: File) => {
  return async (
    dispatch: Dispatch<types.IUpdateProductImage | AnyAction>
  ): Promise<any> => {
    try {
      const formData = new FormData();
      formData.append("productoId", productoId);
      formData.append("archivo", archivo);

      const response: any = await axiosInstance.post(
        `/productos/imagen/subir`,
        formData
      );
      const { status, data } = response;
      if (status === 200) {
        dispatch({
          type: types.UPDATE_PRODUCT_IMAGE,
          payload: {
            productoId,
            rutaImagen: data?.data?.rutaImagen,
            cloudinaryPublicId: data?.data?.cloudinaryPublicId,
          },
        });
        return data?.data;
      }
      return null;
    } catch (error: any) {
      const message =
        error?.response?.data?.message ?? "Hubo un error al subir la imagen";
      console.error(error);
      toast.error(message);
      throw error;
    }
  };
};

export const eliminarImagenProducto = (productoId: any) => {
  return async (
    dispatch: Dispatch<types.IUpdateProductImage | AnyAction>
  ): Promise<any> => {
    try {
      const response: any = await axiosInstance.delete(
        `/productos/imagen/eliminar?productoId=${productoId}`
      );
      const { status, data } = response;
      console.log(data);
      if (status === 200) {
        dispatch({
          type: types.UPDATE_PRODUCT_IMAGE,
          payload: {
            productoId,
            rutaImagen: null,
            cloudinaryPublicId: null,
          },
        });
        return data?.data;
      }
      return null;
    } catch (error: any) {
      const message =
        error?.response?.data?.message ?? "Hubo un error al eliminar la imagen";
      console.error(error);
      toast.error(message);
      throw error;
    }
  };
};

export const createCategory = (category: any) => {
  return async (dispatch: Dispatch<types.ICreateProducts | AnyAction>) => {
    try {
      const response: any = await axiosInstance.post(
        `/Category/crear`,
        category
      );
      const { status, data } = response;
      console.log(data);
      if (status === 200) {
        dispatch({
          type: types.CREATE_CATEGORY,
          payload: data?.data,
        });
      }
    } catch (error: any) {
      console.log(error);
    }
  };
};

export const activeProducto = (producto: any) => {
  return async (dispatch: Dispatch<types.IActiveProducto | any>) => {
    dispatch({
      type: types.ACTIVE_PRODUCTO,
      payload: producto,
    });
  };
};
export const clearActiveProducto = () => {
  return async (dispatch: Dispatch<types.IClearActiveProducto | any>) => {
    dispatch({
      type: types.CLEAR_ACTIVE_PRODUCTO,

    });
  };
};

export const getGrupos = (categoryId: number) => {
  return async (dispatch: Dispatch<types.IGetAllProducts | AnyAction>) => {
    try {
      const response: any = await axiosInstance.get(
        `/Grupo/listar?CategoriaId=${categoryId}`
      );
      const { status, data } = response;
      console.log(data);
      if (status === 200) {
        dispatch({
          type: types.GET_ALL_GROUPS,
          payload: data?.data,
        });
      }
    } catch (error: any) {
      console.log(error);
    }
  };
};
export const getAllGrupos = () => {
  return async (dispatch: Dispatch<types.IGetAllProducts | AnyAction>) => {
    try {
      const response: any = await axiosInstance.get(
        `/Grupo/listar`
      );
      const { status, data } = response;
      console.log(data);
      if (status === 200) {
        dispatch({
          type: types.ALL_GROUPS,
          payload: data?.data,
        });
      }
    } catch (error: any) {
      console.log(error);
    }
  };
};
export const createGroups = (grupos: any) => {
  return async (dispatch: Dispatch<types.ICreateProducts | AnyAction>) => {
    try {
      const response: any = await axiosInstance.post(`/Grupo/crear`, grupos);
      const { status, data } = response;
      console.log(data);
      if (status === 200) {
        dispatch({
          type: types.CREATE_GROUPS,
          payload: data?.data,
        });

      }
    } catch (error: any) {
      console.log(error);
      toast.error('Hubo un error al crear el producto')
    }
  };
};

export const updateCategory = (category: any) => {
  return async (dispatch: Dispatch<types.IUpdateCategory | AnyAction>) => {
    try {
      const response: any = await axiosInstance.put(
        `/Category/modificar`,
        category
      );
      const { status, data } = response;
      console.log(data);
      if (status === 200) {
        dispatch({
          type: types.UPDATE_CATEGORY,
          payload: data?.data,
        });
      }
    } catch (error: any) {
      console.log(error);
      toast.error('Hubo un error al actualizar la categoría');
    }
  };
};

export const deleteCategory = (idCategoria: any) => {
  return async (dispatch: Dispatch<types.IDeleteCategory | AnyAction>) => {
    try {
      const response: any = await axiosInstance.delete(
        `/Category/eliminar?IdCategoria=${idCategoria}`
      );
      const { status, data } = response;
      console.log(data);
      if (status === 200) {
        dispatch({
          type: types.DELETE_CATEGORY,
          payload: idCategoria,
        });
      }
    } catch (error: any) {
      console.log(error);
      toast.error('Hubo un error al eliminar la categoría');
    }
  };
};

export const openModalCategorias = () => {
  return async (dispatch: Dispatch<types.IOpenModalCategorias | any>) => {
    dispatch({
      type: types.OPEN_MODAL_CATEGORIAS,
    });
  };
};
export const closeModalCategorias = () => {
  return async (dispatch: Dispatch<types.ICloseModalCategorias | any>) => {
    dispatch({
      type: types.CLOSE_MODAL_CATEGORIAS,
    });
  };
};

export const activeCategoria = (categoria: any) => {
  return async (dispatch: Dispatch<types.IActiveCategoria | any>) => {
    dispatch({
      type: types.ACTIVE_CATEGORIA,
      payload: categoria,
    });
  };
};
export const clearActiveCategoria = () => {
  return async (dispatch: Dispatch<types.IClearActiveCategoria | any>) => {
    dispatch({
      type: types.CLEAR_ACTIVE_CATEGORIA,
    });
  };
};

export const updateGrupo = (grupo: any) => {
  return async (dispatch: Dispatch<types.IUpdateGrupo | AnyAction>) => {
    try {
      const response: any = await axiosInstance.put(`/Grupo/modificar`, grupo);
      const { status, data } = response;
      console.log(data);
      if (status === 200) {
        dispatch({
          type: types.UPDATE_GRUPO,
          payload: data?.data,
        });
      }
    } catch (error: any) {
      console.log(error);
      toast.error('Hubo un error al actualizar el grupo');
    }
  };
};

export const deleteGrupo = (idGrupo: any) => {
  return async (dispatch: Dispatch<types.IDeleteGrupo | AnyAction>) => {
    try {
      const response: any = await axiosInstance.delete(
        `/Grupo/eliminar?IdGrupo=${idGrupo}`
      );
      const { status, data } = response;
      console.log(data);
      if (status === 200) {
        dispatch({
          type: types.DELETE_GRUPO,
          payload: idGrupo,
        });
      }
    } catch (error: any) {
      console.log(error);
      toast.error('Hubo un error al eliminar el grupo');
    }
  };
};

export const activeGrupo = (grupo: any) => {
  return async (dispatch: Dispatch<types.IActiveGrupo | any>) => {
    dispatch({
      type: types.ACTIVE_GRUPO,
      payload: grupo,
    });
  };
};
export const clearActiveGrupo = () => {
  return async (dispatch: Dispatch<types.IClearActiveGrupo | any>) => {
    dispatch({
      type: types.CLEAR_ACTIVE_GRUPO,
    });
  };
};

export const openModalHistorial = (producto: any) => {
  return async (dispatch: Dispatch<any>) => {
    dispatch({
      type: types.OPEN_MODAL_HISTORIAL,
      payload: producto,
    });
  };
};

export const closeModalHistorial = () => {
  return async (dispatch: Dispatch<any>) => {
    dispatch({
      type: types.CLOSE_MODAL_HISTORIAL,
    });
  };
};

export const ajustarStock = (
  producto: any,
  tipoMovimiento: number,
  cantidad: number,
  motivo?: string
) => {
  return async (dispatch: Dispatch<types.IUpdateProducts | AnyAction>) => {
    try {
      const response: any = await axiosInstance.post(`/inventario/ajustar-stock`, {
        productoId: producto.productoId,
        tipoMovimiento,
        cantidad,
        motivo,
      });
      const { status, data } = response;
      if (status === 200) {
        dispatch({
          type: types.UPDATE_PRODUCTS,
          payload: { ...producto, stock: data?.data?.stockPosterior },
        });
        return data?.data;
      }
      return null;
    } catch (error: any) {
      toast.error(error?.response?.data?.message ?? "Error al ajustar el stock");
      return null;
    }
  };
};

export const getMovimientosProducto = (
  productoId: number,
  page: number,
  amount: number
) => {
  return async (dispatch: Dispatch<any>) => {
    try {
      const response: any = await axiosInstance.get(
        `/inventario/movimientos?ProductoId=${productoId}&Page=${page}&Amount=${amount}`
      );
      const { status, data } = response;
      if (status === 200) {
        dispatch({
          type: types.GET_MOVIMIENTOS_PRODUCTO,
          payload: data?.data,
        });
      } else {
        dispatch({
          type: types.GET_MOVIMIENTOS_PRODUCTO,
          payload: { items: [], total: 0 },
        });
      }
    } catch (error: any) {
      console.log(error);
      dispatch({
        type: types.GET_MOVIMIENTOS_PRODUCTO,
        payload: { items: [], total: 0 },
      });
    }
  };
};

