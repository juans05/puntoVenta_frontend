export interface IMenu {
  code: string
  id: number;
  value: string;
  icon: string;
  url: string;
  children?: IMenu[];
}

export const menuSidebar = [

  {
    code: "100",
    id: 1,
    value: "Dashboard",
    icon: "ic:round-dashboard",
    url: "dashboard",
  },
  /* {
    code: "701",
    id: 2,
    value: "Documentos",
    icon: "mingcute:document-fill",
    url: "documentos",
  }, */
  {
    code: "200",
    id: 2,
    value: "Productos",
    icon: "solar:bag-4-bold",
    url: "dashboard/productos",
  },
  {
    // Comparte el code de "Productos" a propósito (mismo patrón que "Nueva
    // Factura"/"ROI Publicidad" más abajo): evita crear un módulo/submódulo
    // nuevo en AspNetModule/AspNetSubModule y reasignar permisos por tenant.
    code: "200",
    id: 17,
    value: "Inventario",
    icon: "healthicons:rdt-result-out-stock",
    url: "dashboard/inventario",
  },
  /* {
    code: "701",
    id: 4,
    value: "Usuarios",
    icon: "mdi:user",
    url: "dashboard/usuarios",
  },
  {
    code: "701",
    id: 5,
    value: "Formas de pago",
    icon: "ic:round-payments",
    url: "dashboard/formas-pago",
  }, */
  {
    code: "300",
    id: 3,
    value: "Ventas del día",
    icon: "ic:outline-point-of-sale",
    url: "dashboard/ventas-realizadas",
  },
  {
    code: "400",
    id: 4,
    value: "Clientes / Proveedores",
    icon: "mdi:users-group",
    url: "dashboard/clientes",
  }, {
    code: "500",
    id: 5,
    value: "Asistencia",
    icon: "zondicons:calendar",
    url: "dashboard/asistencia",
  },
  {
    code: "600",
    id: 6,
    value: "Reporte de asistencia",
    icon: "mdi:report-pie",
    url: "dashboard/reporte-asistencia",
  },
  {
    code: "700",
    id: 5,
    value: "Reporte cierre de caja",
    icon: "solar:hand-money-bold",
    url: "dashboard/reporte-cierre-caja",
  },
  {
    code: "800",
    id: 5,
    value: "Mi empresa",
    icon: "bxs:business",
    url: "dashboard/mi-empresa",
  },
  {
    code: "900",
    id: 7,
    value: "Documentos Facturados",
    icon: "healthicons:i-documents-accepted",
    url: "dashboard/documentos-facturados",
  },
  {
    code: "950",
    id: 8,
    value: "Configuración de renta",
    icon: "mdi:home-currency-usd",
    url: "dashboard/configuracion-renta",
  },
  {
    code: "200",
    id: 9,
    value: "Usuarios",
    icon: "mdi:user",
    url: "dashboard/usuarios",
  },
  {
    code: "800",
    id: 10,
    value: "Sucursales",
    icon: "mdi:storefront",
    url: "dashboard/sucursales",
  },
  {
    code: "700",
    id: 11,
    value: "Cajas",
    icon: "mdi:wallet-outline",
    url: "dashboard/cajas",
  },
  {
    code: "1100",
    id: 12,
    value: "Compras",
    icon: "mdi:truck-delivery-outline",
    url: "dashboard/compras",
  },
  {
    code: "1300",
    id: 13,
    value: "Gastos",
    icon: "mdi:cash-minus",
    url: "dashboard/gastos",
  },
  {
    // Comparte el code de "Ventas del día" a propósito (mismo patrón que "ROI
    // Publicidad"/"Configuraciones" más abajo): evita crear un módulo/submódulo
    // nuevo en AspNetModule/AspNetSubModule y reasignar permisos por tenant.
    code: "300",
    id: 16,
    value: "Nueva Factura",
    icon: "mdi:file-document-plus-outline",
    url: "dashboard/nueva-factura",
  },
  {
    // Comparte el code de Gastos a propósito (mismo patrón que "Configuraciones"
    // más abajo): evita crear un módulo/submódulo nuevo en AspNetModule/
    // AspNetSubModule y reasignar permisos por tenant solo para esta pantalla.
    code: "1300",
    id: 15,
    value: "ROI Publicidad",
    icon: "mdi:chart-line",
    url: "dashboard/publicidad",
  },
  {
    // Comparte el code de Gastos a propósito: así aparece para cualquier
    // usuario que ya tenga acceso a Gastos, sin necesitar un módulo/submódulo
    // nuevo en AspNetModule/AspNetSubModule ni reasignar permisos por tenant.
    code: "1300",
    id: 14,
    value: "Configuraciones",
    icon: "mdi:cog-outline",
    url: "",
    children: [
      {
        code: "1300",
        id: 141,
        value: "Categorías y métodos de pago",
        icon: "mdi:tag-multiple-outline",
        url: "dashboard/gastos/catalogos",
      },
    ],
  }
  // ,
  // {
  //   code: "1000",
  //   id: 7,
  //   value: "Alarmas",
  //   icon: "ep:bell-filled" ,
  //   url: "dashboard/alarmas",
  // },
]

// No forma parte del sistema de módulos por tenant (AspNetModule/rutas): se agrega
// manualmente en el Sidebar solo cuando me.isSuperAdmin es true.
export const superAdminMenu: IMenu = {
  code: "999",
  id: 999,
  value: "Empresas",
  icon: "mdi:office-building-cog",
  url: "dashboard/empresas",
}

export const title = {
  name: 'Spa'
}