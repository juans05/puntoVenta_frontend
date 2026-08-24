
import { IAuthState } from "./reducers/auth/interfaces";
import { IExtensionesState } from "./reducers/extensiones/interfaces";
import { IAlert } from "./reducers/interfaces";
import { IProductsState } from "./reducers/productos/interfaces";
import { ISalesState } from "./reducers/ventas/interfaces";

export interface RootState {
    
    products: IProductsState,
    auth: IAuthState
    sales: ISalesState
    adminProducts:any,
    asistencia:any;
    alert: IAlert
    extentions: IExtensionesState
    clientes:any;
    ventas:any;
    reporteCaja:any;
    myBusiness:any;
    configuracionRenta:any;
    compras:any;

}