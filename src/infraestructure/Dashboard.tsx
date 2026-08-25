import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { LayoutView } from "../components/Sidebar";
import { DashboardMain } from "../presentation/views/Modules/Admin/Views/Dashboard";
import { Productos } from "../presentation/views/Modules/Admin/Views/Productos";
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
import { Gastos } from "../presentation/views/Modules/Admin/Views/Gastos";
import { GastoPublicidad } from "../presentation/views/Modules/Admin/Views/GastoPublicidad";
import { CatalogosGasto } from "../presentation/views/Modules/Admin/Views/CatalogosGasto";
import { Empresas } from "../presentation/views/Modules/Admin/Views/Empresas";

export const Dashboard = () => {

  return (
    <Router>
      {" "}
      {/* Add the Router component here */}

      <div>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/facturacion" element={<Facturacion />} />
          <Route path="/nueva-venta" element={<NuevaVenta />} />
          <Route path="/pago-exitoso" element={<PagoExitoso />} />
          <Route path="/dashboard" element={<LayoutView />}>
            <Route index element={<DashboardMain />} />
            <Route path="productos" element={<Productos />} />
            <Route path="ventas-realizadas" element={<VentasRealizadas />}/>
            <Route path="documentos-facturados" element={<DocumentosFacturados />}/>
            {/* <Route path="alarmas" element={<>Alarmas</>}/> */}

   {/*          <Route path="usuarios" element={<Usuarios />} /> */}
 {/*            <Route path="formas-pago" element={<FormasPago />} /> */}
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
            <Route path="gastos" element={<Gastos />}/>
            <Route path="publicidad" element={<GastoPublicidad />}/>
            <Route path="gastos/catalogos" element={<CatalogosGasto />}/>
            <Route path="empresas" element={<Empresas />}/>
{/*             <Route path="my-business" element={<MyBusiness />} /> */}
          </Route>
        </Routes>
      </div>
    </Router>
  );
};
