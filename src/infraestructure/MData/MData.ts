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
    value: "Inicio",
    icon: "ic:round-dashboard",
    url: "dashboard",
  },

  // === ADMINISTRACIÓN ===
  {
    code: "200",
    id: 9,
    value: "Administración",
    icon: "mdi:cog-outline",
    url: "",
    children: [
      {
        code: "200",
        id: 9,
        value: "Usuarios",
        icon: "mdi:user",
        url: "dashboard/usuarios",
      },
      {
        code: "200",
        id: 10,
        value: "Sucursales",
        icon: "mdi:storefront",
        url: "dashboard/sucursales",
      },
      {
        code: "800",
        id: 5,
        value: "Mi Empresa",
        icon: "bxs:business",
        url: "dashboard/mi-empresa",
      },
      {
        code: "200",
        id: 15,
        value: "Roles y Permisos",
        icon: "mdi:shield-account-outline",
        url: "dashboard/roles-permisos",
      },
      {
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
          {
            code: "1300",
            id: 143,
            value: "Flujo de compras",
            icon: "mdi:swap-horizontal-bold",
            url: "dashboard/configuracion-flujo",
          },
          {
            code: "1300",
            id: 142,
            value: "Salones de recojo",
            icon: "mdi:office-building-marker-outline",
            url: "dashboard/pedidos/salones",
          },
        ],
      },
    ],
  },

  // === VENTA & COMPROBANTE ===
  {
    code: "300",
    id: 3,
    value: "Venta & Comprobante",
    icon: "mdi:file-document-multiple-outline",
    url: "",
    children: [
      {
        code: "900",
        id: 7,
        value: "Comprobante de Pago",
        icon: "healthicons:i-documents-accepted",
        url: "dashboard/documentos-facturados",
      },
      {
        code: "300",
        id: 16,
        value: "Emitir Factura",
        icon: "mdi:file-document-plus-outline",
        url: "dashboard/nueva-factura/factura",
      },
      {
        code: "300",
        id: 20,
        value: "Emitir Boleta",
        icon: "mdi:receipt-text-outline",
        url: "dashboard/nueva-factura/boleta",
      },
      {
        code: "300",
        id: 19,
        value: "Emitir NC",
        icon: "mdi:file-document-minus-outline",
        url: "dashboard/notas-credito-debito/credito",
      },
      {
        code: "300",
        id: 21,
        value: "Emitir ND",
        icon: "mdi:file-document-plus-outline",
        url: "dashboard/notas-credito-debito/debito",
      },
      {
        code: "300",
        id: 23,
        value: "Emitir Nota de Venta",
        icon: "mdi:note-outline",
        url: "dashboard/nueva-factura/nota-venta",
      },
      {
        code: "300",
        id: 24,
        value: "Emitir Cotización",
        icon: "mdi:file-chart-outline",
        url: "dashboard/cotizaciones",
      },
    ],
  },

  // === TU OPERACIÓN ===
  {
    code: "400",
    id: 4,
    value: "Tu Operación",
    icon: "mdi:briefcase-outline",
    url: "",
    children: [
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
        code: "400",
        id: 4,
        value: "Clientes / Proveedores",
        icon: "mdi:users-group",
        url: "dashboard/clientes",
      },
      {
        code: "200",
        id: 2,
        value: "Productos",
        icon: "solar:bag-4-bold",
        url: "dashboard/productos",
      },
      {
        code: "300",
        id: 121,
        value: "Pedidos",
        icon: "mdi:clipboard-list-outline",
        url: "dashboard/pedidos",
      },
      {
        code: "200",
        id: 17,
        value: "Inventario",
        icon: "healthicons:rdt-result-out-stock",
        url: "dashboard/inventario",
      },
    ],
  },

  // === REPORTES & ANÁLISIS ===
  {
    code: "900",
    id: 15,
    value: "Reportes & Análisis",
    icon: "mdi:chart-line",
    url: "",
    children: [
      {
        code: "700",
        id: 5,
        value: "Reporte de Cierre de Caja",
        icon: "solar:hand-money-bold",
        url: "dashboard/reporte-cierre-caja",
      },
      {
        code: "1300",
        id: 15,
        value: "ROI Publicidad",
        icon: "mdi:chart-line",
        url: "dashboard/publicidad",
      },
    ],
  },

  // === CONTABILIDAD ===
  {
    code: "1600",
    id: 25,
    value: "Contabilidad",
    icon: "mdi:book-open-variant-outline",
    url: "",
    children: [
      {
        code: "1600",
        id: 251,
        value: "Libro Electrónico de Ventas",
        icon: "mdi:book-outline",
        url: "dashboard/contabilidad/libro-ventas",
      },
      {
        code: "1600",
        id: 252,
        value: "Libro Electrónico de Compras",
        icon: "mdi:book-outline",
        url: "dashboard/contabilidad/libro-compras",
      },
      {
        code: "1600",
        id: 253,
        value: "Reporte Detallado de Ventas",
        icon: "mdi:file-chart-outline",
        url: "dashboard/contabilidad/reporte-ventas",
      },
      {
        code: "1600",
        id: 254,
        value: "Reporte Detallado de Compras",
        icon: "mdi:file-chart-outline",
        url: "dashboard/contabilidad/reporte-compras",
      },
    ],
  },
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