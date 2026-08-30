import { AnyAction, Dispatch, createReducer } from "@reduxjs/toolkit";
import { ISaleProduct, ISalesState } from "./interfaces";
import * as types from "./types";
import { IProduct } from "../productos/interfaces";
import axiosInstance from "../../../utils/axios";
import Swal from "sweetalert2";

const initialState: ISalesState = {
    productsBySale: [],
    total: 0,
    efectivo: '',
    turned: 0,
    productosFicha: [],
    correlative: '',
    tipoVenta: '',
    montosCaja: null,
    caja: null,
    message: '',
    code: 0,
    isReport: false,
    clientes: [],
    numeroDocumento: '',
    cliente: null
}

function addProduct(productsToSale: IProduct[], product: IProduct) {
    const products = JSON.parse(JSON.stringify(productsToSale))
    const productExist = products.find((p: any) => p.productoId === product.productoId);
    if (productExist) {
        // Si el producto ya existe, sumar la cantidad nueva al producto existente
        productExist.cantidad += product.cantidad;
    } else {
        // Si el producto no existe, agregar el nuevo objeto al array
        products.push(product);
    }

    return products;
}

function decrementProduct(productsToSale: IProduct[], product: IProduct) {
    const products = JSON.parse(JSON.stringify(productsToSale))
    const productExist = products.find((p: any) => p.productoId === product.productoId);
    if (productExist && productExist?.cantidad > 1) {
        // Si el producto ya existe, sumar la cantidad nueva al producto existente
        productExist.cantidad -= product.cantidad;
    } else {
        return products?.filter((item: IProduct) => item.productoId !== product?.productoId);
    }
    return products;
}

export const salesReducer = createReducer(initialState, (builder) => {
    builder
        .addCase("GET_PRODUCTS_BY_SALE", (state: ISalesState, action: types.IGetProductsBySale): ISalesState => {
            const products = addProduct(state.productsBySale, action.payload)
            return {
                ...state,
                productsBySale: products
            }
        })
        .addCase("UPDATE_PRODUCT_BY_PRICE", (state: ISalesState, action: types.IUpdateProductsByPrice): ISalesState => {
            return {
                ...state,
                productsBySale: action.payload
            }
        })
        .addCase("RESET_PRODUCTS_BY_SALE", (state: ISalesState,): ISalesState => {
            return {
                ...state,
                productsBySale: [],
                productosFicha: []
            }
        })
        .addCase("GET_TURNED", (state: ISalesState, action: types.IGetTurned): ISalesState => {
            return {
                ...state,
                turned: action.payload
            }
        })
        .addCase("DELETE_PRODUCT_IN_SALE", (state: ISalesState, action: types.IDeleteProductInSale): ISalesState => {
            return {
                ...state,
                productsBySale: state.productsBySale?.filter((item: IProduct) => item.productoId !== action.payload),
                productosFicha: state.productosFicha?.filter((item: any) => item?.productoId !== action.payload)
            }
        })
        .addCase("DECREMENT_PRODUCT_BY_SALE", (state: ISalesState, action: types.IDecrementProductInSale): ISalesState => {
            const products = decrementProduct(state.productsBySale, action.payload)
            return {
                ...state,
                productsBySale: products
            }
        })
        .addCase("GET_CORRELATIVE", (state: ISalesState, action: types.IGetCorrelative): ISalesState => {
            return {
                ...state,
                correlative: action.payload?.data?.serieCorrelativo,
                code: action.payload?.code
            }
        })
        .addCase("GET_CORRELATIVE_FAIL", (state: ISalesState, action: types.IGetCorrelativoFail): ISalesState => {
            return {
                ...state,
                message: action.payload.message,
                code: action.payload.code
            }
        })
        .addCase("TIPO_VENTA", (state: ISalesState, action: types.ITipoVenta): ISalesState => {
            return {
                ...state,
                tipoVenta: action.payload
            }
        })
        .addCase("EFECTIVO", (state: ISalesState, action: types.IEfectivo): ISalesState => {
            return {
                ...state,
                efectivo: action.payload
            }
        })
        .addCase("OBTENER_CAJA_MONTO", (state: ISalesState, action: types.IGetMontoCaja): ISalesState => {
            return {
                ...state,
                montosCaja: action.payload,
                caja: action.payload
            }
        })
        .addCase("OBTENER_CAJA_MONTO_FAIL", (state: ISalesState, _action: types.IGetMontoCajaFail): 
        ISalesState => {
            return {
                ...state,
                caja: _action.payload
            }
        })
        .addCase("ABRIR_CAJA", (state: ISalesState, action: types.IAbrirCaja): ISalesState => {
            return {
                ...state,
                montosCaja: action.payload?.data,
                caja: true
            }
        })
        .addCase("CERRAR_CAJA", (state: ISalesState, action: types.ICerrarCaja): ISalesState => {
            return {
                ...state,
                caja: null,
                montosCaja: action.payload,
                isReport: true
            }
        })
        .addCase("CERRAR_REPORTE", (state: ISalesState, _action: types.ICerrarReporte): ISalesState => {
            return {
                ...state,
                isReport: false
            }
        })
        .addCase("RETIRO", (state: ISalesState, action: types.IRetiro): ISalesState => {
            return {
                ...state,
                message: action.payload
            }
        })
        .addCase("GET_DNI", (state: ISalesState, action: types.IGetDni): ISalesState => {
            return {
                ...state,
                numeroDocumento: action.payload
            }
        })
        .addCase("SAVE_CLIENT_FAIL", (state: ISalesState, action: types.ISaveClientFail): ISalesState => {
            return {
                ...state,
                message: action.payload,
                code: 100
            }
        })
        .addCase("GET_CLIENT_FAIL", (state: ISalesState, action: types.IGetClientFail): ISalesState => {
            return {
                ...state,
                message: action.payload,
                clientes: [],
                code: 100
            }
        })
        .addCase("GET_CLIENTS", (state: ISalesState, action: types.IGetClients): ISalesState => {
            return {
                ...state,
                clientes: action.payload
            }
        })
        .addCase("SAVE_CLIENT", (state: ISalesState, action: types.ISaveClient): ISalesState => {
            return {
                ...state,
                message: "Se ha registrado correctamente el cliente",
                code: 1,
                cliente: action.payload,
                clientes: [action.payload]
            }
        })
        .addCase("RESET_DNI", (state: ISalesState, _action: types.IResetDNI): ISalesState => {
            return {
                ...state,
                numeroDocumento: ""
            }
        })
        .addCase("RESET_RESPONSE", (state: ISalesState, _action: types.IResetResponse): ISalesState => {
            return {
                ...state,
                turned: 0,
                message: '',
                code: 0
            }
        })
        .addCase("RESET_CLIENTS", (state: ISalesState, _action: types.IResetClients): ISalesState => {
            return {
                ...state,
                clientes: [],
                cliente: null
            }
        })
        .addCase("UPDATE_CLIENT", (state: ISalesState, action: types.IUpdateClient): ISalesState => {
            return {
                ...state,
                code: 1,
                message: action.payload,
            }
        })
}
)

export const getProductsBySale = (data: IProduct) => {
    return async (dispatch: Dispatch<types.IGetProductsBySale | AnyAction>) => {
        try {
            const agregandoCantidad = {
                ...data,
                cantidad: 1,
                isChecked: false
            }

            dispatch({
                type: types.GET_PRODUCTS_BY_SALE,
                payload: agregandoCantidad
            })
        } catch (error: any) {
            console.log(error);
        }
    }
}

export const saleProducts = (data: ISaleProduct) => {
    return async (dispatch: Dispatch<types.IGetProductsBySale | AnyAction>) => {
        try {
            const response: any = await axiosInstance.post(`/facturacion/crear`, data);
            dispatch({
                type: types.GET_CORRELATIVE,
                payload: response?.data
            })
            dispatch({
                type: types.TIPO_VENTA,
                payload: data?.tipoVenta !== "" ? data?.tipoVenta : 'TICKET INTERNO'
            })
            dispatch({
                type: types.EFECTIVO,
                payload: data?.efectivo
            })
        } catch (error: any) {
            if(error?.response?.data?.code === 100) {
                dispatch({
                    type: types.GET_CORRELATIVE_FAIL,
                    payload: error?.response?.data
                })
            }
            console.log(error);
        }
    }
}

export const resetSale = () => {
    return async (dispatch: Dispatch<types.IResetProductsBySale | AnyAction>) => {
        try {
            dispatch({
                type: types.RESET_PRODUCTS_BY_SALE,
            })
        } catch (error) {
            console.log(error)
        }
    }
}

export const getTurnedBilling = (turned: number) => {
    return async (dispatch: Dispatch<types.IGetTurned | AnyAction>) => {
        try {
            dispatch({
                type: types.GET_TURNED,
                payload: turned
            })
        } catch (error) {
            console.log(error)
        }
    }
}

export const deleteProductInSale = (productId: number) => {
    return async (dispatch: Dispatch<types.IDeleteProductInSale | AnyAction>) => {
        try {
            dispatch({
                type: types.DELETE_PRODUCT_IN_SALE,
                payload: productId
            })
        } catch (error) {
            console.log(error)
        }
    }
}

export const decrementProductInSale = (data: IProduct) => {
    return async (dispatch: Dispatch<types.IGetProductsBySale | AnyAction>) => {
        try {
            const quitandoCantidad = {
                ...data,
                cantidad: 1
            }
            dispatch({
                type: types.DECREMENT_PRODUCT_BY_SALE,
                payload: quitandoCantidad
            })
        } catch (error: any) {
            console.log(error);
        }
    }
}

export const obtenerMontoCaja = (username: string) => {
    return async (dispatch: Dispatch<types.IGetMontoCaja | AnyAction>) => {
        try {
            const { data }: any = await axiosInstance.get(`/caja/monto-actual?usuario=${username}`);
            if (data?.code === 1) {
                localStorage.setItem('caja', JSON.stringify(data?.data))
                localStorage.setItem('isCaja', 'false')
                return dispatch({
                    type: types.OBTENER_CAJA_MONTO,
                    payload: data?.data
                })
            }
        } catch (error: any) {
            if (error?.response?.data?.code === 105) {
                localStorage.removeItem('caja');
                const caja = {
                    cajaAbierta: false
                }
                return dispatch({
                    type: types.OBTENER_CAJA_MONTO_FAIL,
                    payload: caja
                })
            }
        }
    }
}

export const abrirCaja = (amount: number) => {
    return async (dispatch: Dispatch<types.IAbrirCaja | AnyAction>) => {
        try {
            const { data }: any = await axiosInstance.post(`/caja/abrir-caja?monto=${amount}`);
            if (data?.code === 1) {
                localStorage.setItem('isCaja',data?.data?.cajaAbierta);
                localStorage.setItem('caja', JSON.stringify(data?.data))
                return dispatch({
                    type: types.ABRIR_CAJA,
                    payload: data
                })
            }
        } catch (error: any) {
            console.log(error);
        }
    }
}

export const cerrarCaja = () => {
    return async (dispatch: Dispatch<types.ICerrarCaja | AnyAction>) => {

        Swal.fire({
            title: `¿Estás seguro que deseas cerrar la caja ?`,
            text: "Recuerda:¡No podrás revertir esto!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Sí, cerrar caja",
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const { data }: any = await axiosInstance.post(`/caja/cerrar-caja`);
                    console.log(data)
                    if (data?.code === 1) {
                        localStorage.removeItem('isCaja')
                        localStorage.removeItem('caja')
                        return dispatch({
                            type: types.CERRAR_CAJA,
                            payload: data?.data
                        })
                    }
                    Swal.fire(`¡Se cerro correctamente la caja.", "success"`);
                } catch (error: any) {
                    console.log(error);
                }
            }
        });
    }
}

export const cerrarReporte = () => {
    return async (dispatch: Dispatch<types.ICerrarReporte | AnyAction>) => {
        try {
            dispatch({
                type: types.CERRAR_REPORTE
            });
        } catch (error: any) {
            console.log(error);
        }
    };
}

export const resetResponse = () => {
    return async (dispatch: Dispatch<types.IResetResponse | AnyAction>) => {
        try {
            dispatch({
                type: types.RESET_RESPONSE
            });
        } catch (error: any) {
            console.log(error);
        }
    };
}

export const resetClients = () => {
    return async (dispatch: Dispatch<types.IResetClients | AnyAction>) => {
        try {
            dispatch({
                type: types.RESET_CLIENTS
            });
        } catch (error: any) {
            console.log(error);
        }
    };
}

export const retirarCaja = (retiroData: any) => {
    return async (dispatch: Dispatch<types.IAbrirCaja | AnyAction>) => {
        try {
            const { data }: any = await axiosInstance.post(`/caja/retiro`, retiroData);
            console.log(data);
            if (data?.code === 1) {
                localStorage.setItem('caja', JSON.stringify(data?.data))
                return dispatch({
                    type: types.RETIRO,
                    payload: 'Se hizo el retiro correctamente'
                })
            }
        } catch (error: any) {
            console.log(error);
        }
    }
}

export const getClients = (searchDni: string) => {
    return async (dispatch: Dispatch<types.IGetClients | AnyAction>) => {
        try {
            const { data }: any = await axiosInstance.get(`/clientes/listar?value=${searchDni}&Amount=20`);
            if (data?.code === 1) {
                return dispatch({
                    type: types.GET_CLIENTS,
                    payload: data?.data?.items
                })
            }
        } catch (error: any) {
            console.log(error?.response?.data)
            if (error?.response?.data?.code === 100) {
                return dispatch({
                    type: types.GET_CLIENT_FAIL,
                    payload: "Este cliente no esta registrado, puedes agregarlo si deseas"
                })
            }
        }
    }
}

export const saveClient = (dataClient: any) => {
    return async (dispatch: Dispatch<types.ISaveClient | AnyAction>) => {
        try {
            const { data }: any = await axiosInstance.post(`/clientes/crear`,dataClient);
            console.log(data);
            if (data?.code === 1) {
                return dispatch({
                    type: types.SAVE_CLIENT,
                    payload: data?.data
                })
            }
        } catch (error: any) {
            console.log(error?.response?.data)
            if (error?.response?.data?.code === 100) {
                return dispatch({
                    type: types.SAVE_CLIENT_FAIL,
                    payload: "Este cliente ya ha sido guardado en su punto de venta, intentelo de nuevo"
                })
            }
        }
    }
}

export const updateClient = (dataClient: any) => {
    return async (dispatch: Dispatch<types.IUpdateClient | AnyAction>) => {
        try {
            const { data }: any = await axiosInstance.put(`/clientes/modificar`,dataClient);
            console.log(data);
            if (data?.code === 1) {
                return dispatch({
                    type: types.UPDATE_CLIENT,
                    payload: "Cliente editado correctamente"
                })
            }
        } catch (error: any) {
            console.log(error?.response?.data)
            if (error?.response?.data?.code === 100) {
                return dispatch({
                    type: types.UPDATE_CLIENT_FAIL,
                    payload: "No se pudo editar el cliente, intentelo de nuevo"
                })
            }
        }
    }
}



export const updateProductByPrice = (products: any) => {
    return async (dispatch: Dispatch<types.IAbrirCaja | AnyAction>) => {
        try {
            dispatch({
                type: types.UPDATE_PRODUCT_BY_PRICE,
                payload: products
            });
        } catch (error: any) {
            console.log(error);
        }
    }
}

export const getDni = (dni: any) => {
    return async (dispatch: Dispatch<types.IGetDni | AnyAction>) => {
        try {
            dispatch({
                type: types.GET_DNI,
                payload: dni
            });
        } catch (error: any) {
            console.log(error);
        }
    }
}

export const resetDni = () => {
    return async (dispatch: Dispatch<types.IResetDNI | AnyAction>) => {
        try {
            dispatch({
                type: types.RESET_DNI
            });
        } catch (error: any) {
            console.log(error);
        }
    }
}


export default salesReducer