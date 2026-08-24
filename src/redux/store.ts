import { configureStore } from '@reduxjs/toolkit'
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import productsReducer from './reducers/productos/productos.reducer';
import authReducer from './reducers/auth/auth.reducer';
import salesReducer from './reducers/ventas/ventas.reducer';
import { productoReducer } from './reducers/Admin/productos/producto.reducer';
import { asistenciaReducer } from './reducers/Admin/asistencia/asistencia.reducer';
import { alertReducer } from './reducers/alert/alert.reducer';
import { extensionesReducer } from './reducers/extensiones/extensiones..reducer';
import { clientesProveedoresAnfitrionas } from './reducers/Admin/clientes-proveedores/clientesProveedoresAnfitrionas.reducer';
import { ventasRealizadas } from './reducers/Admin/ventas/ventasRealizadas.reducer';
import { reporteCierreCaja } from './reducers/Admin/reporte-caja/reporteCaja.reducer';
import { myBusinessReducer } from './reducers/Admin/my-business/myBusiness.reducer';
import { configuracionRentaReducer } from './reducers/Admin/configuracion-renta/configuracionRenta.reducer';
import { compraReducer } from './reducers/Admin/compras/compra.reducer';
import { gastoReducer } from './reducers/Admin/gastos/gasto.reducer';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        products: productsReducer,
        sales: salesReducer,
        adminProducts:productoReducer,
        asistencia:asistenciaReducer,
        alert: alertReducer,
        extentions: extensionesReducer,
        clientes:clientesProveedoresAnfitrionas,
        ventas:ventasRealizadas,
        reporteCaja:reporteCierreCaja,
        myBusiness:myBusinessReducer,
        configuracionRenta:configuracionRentaReducer,
        compras:compraReducer,
        gastos:gastoReducer,
    }
})


export const useAppDispatch: () => typeof store.dispatch = useDispatch;
export const useAppSelector:TypedUseSelectorHook<ReturnType<typeof store.getState>>=useSelector;