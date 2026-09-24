import { BrowserRouter as Router, Route, Routes, useLocation } from "react-router-dom";
import { LayoutView } from "../components/Sidebar";
import { DashboardMain } from "../presentation/views/Modules/Admin/Views/Dashboard";
import { Productos } from "../presentation/views/Modules/Admin/Views/Productos";
import { Inventario } from "../presentation/views/Modules/Admin/Views/Inventario";
/* import { Usuarios } from "../presentation/views/Modules/Admin/Views/Usuarios";
import { FormasPago } from "../presentation/views/Modules/Admin/Views/FormasPago";
import { MyBusiness } from "../presentation/views/Modules/Admin/Views/MyBusiness";
import { ClientesProveedores } from "../presentation/views/Modules/Admin/Views/ClientesProveedores"; */
import Login from "../presentation/views/Login";
import Facturacion from "../presentation/views/Modules/Facturacion";
import NuevaVenta from "../presentation/views/Modules/NuevaVenta";
import PagoExitoso from "../presentation/views/Modules/PagoExistoso";
import { Asistencia } from "../presentation/views/Modules/Admin/Views/Asistencia";
import { ClientesProveedores } from "../presentation/views/Modules/Admin/Views/ClientesProveedores";
import { ReporteAsistencia } from "../presentation/views/Modules/Admin/Views/reporte-asistencia";
import { VentasRealizadas } from "../presentation/views/Modules/Admin/Views/VentasRealizadas";
import { MyBusiness } from "../presentation/views/Modules/Admin/Views/MyBusiness";
import { ReporteCierreCaja } from "../presentation/views/Modules/Admin/Views/ReporteCierreCaja";
import { DocumentosFacturados } from "../presentation/views/Modules/Admin/Views/DocumentosFacturados";
import { ConfiguracionRenta } from "../presentation/views/Modules/Admin/Views/ConfiguracionRenta";
import { Usuarios } from "../presentation/views/Modules/Admin/Views/Usuarios";
import { Sucursales } from "../presentation/views/Modules/Admin/Views/Sucursales";
import { Cajas } from "../presentation/views/Modules/Admin/Views/Cajas";
import { Compras } from "../presentation/views/Modules/Admin/Views/Compras";
import { NotasCreditoDebito } from "../presentation/views/Modules/Admin/Views/NotasCreditoDebito";
import { Gastos } from "../presentation/views/Modules/Admin/Views/Gastos";
import { GastoPublicidad } from "../presentation/views/Modules/Admin/Views/GastoPublicidad";
import { CatalogosGasto } from "../presentation/views/Modules/Admin/Views/CatalogosGasto";
import { CatalogosDocumentos } from "../presentation/views/Modules/Admin/Views/CatalogosDocumentos";
import { RolesPermisos } from "../presentation/views/Modules/Admin/Views/RolesPermisos";
import { Cotizaciones } from "../presentation/views/Modules/Admin/Views/Cotizaciones";
import { Salones } from "../presentation/views/Modules/Admin/Views/Salones";
import { Empresas } from "../presentation/views/Modules/Admin/Views/Empresas";
import { LibroVentas } from "../presentation/views/Modules/Admin/Views/Contabilidad/LibroVentas";
import { LibroCompras } from "../presentation/views/Modules/Admin/Views/Contabilidad/LibroCompras";
import { ReporteDetalladoVentas } from "../presentation/views/Modules/Admin/Views/Contabilidad/ReporteDetalladoVentas";
import { ReporteDetalladoCompras } from "../presentation/views/Modules/Admin/Views/Contabilidad/ReporteDetalladoCompras";
import NuevaFactura from "../presentation/views/Modules/NuevaFactura";
import { ConfiguracionFlujo } from "../presentation/views/Modules/Admin/Views/ConfiguracionFlujo";
import { PedidosVenta } from "../presentation/views/Modules/Admin/Views/PedidosVenta";
import { CuentasPorCobrar, CuentasPorPagar } from "../presentation/views/Modules/Admin/Views/Cuentas/CuentasCorrientes";
import Pedidos from "../presentation/views/Modules/Pedidos";
import PedidoPublico from "../presentation/views/Public/Pedido/PedidoPublico";
import ClienteLogin from "../presentation/views/Public/Cliente/ClienteLogin";
import ClientePortal from "../presentation/views/Public/Cliente/ClientePortal";

// Componente separado (en vez de leer useLocation directo en Dashboard) porque useLocation
// necesita estar DENTRO del <Router>, y Dashboard es quien lo crea.
const DashboardRoutes = () => {
  // React Router reusa la misma instancia de NuevaFactura/NotasCreditoDebito al navegar entre
  // "/nueva-factura/factura" y "/nueva-factura/boleta" (mismo path, solo cambia el param), asi
  // que el estado inicializado con useState nunca se resetea solo. La key={location.pathname}
  // fuerza un remount completo cuando cambia el :tipo, limpiando todos los campos del formulario.
  const location = useLocation();

  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/facturacion" element={<Facturacion />} />
      <Route path="/venta-rapida" element={<Facturacion requiereCaja={false} />} />
      <Route path="/nueva-venta" element={<NuevaVenta />} />
      <Route path="/pago-exitoso" element={<PagoExitoso />} />

      {/* Rutas públicas */}
      <Route path="/pedido/:token" element={<PedidoPublico />} />
      <Route path="/mi-cuenta/login" element={<ClienteLogin />} />
      <Route path="/mi-cuenta/pedidos" element={<ClientePortal />} />

      <Route path="/dashboard" element={<LayoutView />}>
        <Route index element={<DashboardMain />} />
        <Route path="productos" element={<Productos />} />
        <Route path="inventario" element={<Inventario />} />
        <Route path="ventas-realizadas" element={<VentasRealizadas />}/>
        <Route path="documentos-facturados" element={<DocumentosFacturados />}/>
        <Route path="notas-credito-debito/:tipo" element={<NotasCreditoDebito key={location.pathname} />}/>
        {/* <Route path="alarmas" element={<>Alarmas</>}/> */}
        <Route path="asistencia" element={<Asistencia />} />
        <Route path="reporte-asistencia" element={<ReporteAsistencia />} />
        <Route path="clientes" element={<ClientesProveedores />}/>
        <Route path="reporte-cierre-caja" element={<ReporteCierreCaja />}/>
        <Route path="mi-empresa" element={<MyBusiness />}/>
        <Route path="configuracion-renta" element={<ConfiguracionRenta />}/>
        <Route path="usuarios" element={<Usuarios />}/>
        <Route path="sucursales" element={<Sucursales />}/>
        <Route path="cajas" element={<Cajas />}/>
        <Route path="compras" element={<Compras />}/>
        <Route path="configuracion-flujo" element={<ConfiguracionFlujo />}/>
        <Route path="gastos" element={<Gastos />}/>
        <Route path="publicidad" element={<GastoPublicidad />}/>
        <Route path="gastos/catalogos" element={<CatalogosGasto />}/>
        <Route path="catalogos-documentos" element={<CatalogosDocumentos />}/>
        <Route path="roles-permisos" element={<RolesPermisos />}/>
        <Route path="cotizaciones" element={<Cotizaciones />}/>
        <Route path="nueva-factura/:tipo" element={<NuevaFactura key={location.pathname} />}/>
        <Route path="pedidos" element={<Pedidos />}/>
        <Route path="pedidos-venta" element={<PedidosVenta />}/>
        <Route path="cuentas-por-cobrar" element={<CuentasPorCobrar />}/>
        <Route path="cuentas-por-pagar" element={<CuentasPorPagar />}/>
        <Route path="pedidos/salones" element={<Salones />}/>
        <Route path="empresas" element={<Empresas />}/>
        <Route path="contabilidad/libro-ventas" element={<LibroVentas />}/>
        <Route path="contabilidad/libro-compras" element={<LibroCompras />}/>
        <Route path="contabilidad/reporte-ventas" element={<ReporteDetalladoVentas />}/>
        <Route path="contabilidad/reporte-compras" element={<ReporteDetalladoCompras />}/>
{/*             <Route path="my-business" element={<MyBusiness />} /> */}
      </Route>
    </Routes>
  );
};

export const Dashboard = () => {

  return (
    <Router>
      {" "}
      {/* Add the Router component here */}

      <div>
        <DashboardRoutes />
      </div>
    </Router>
  );
};
