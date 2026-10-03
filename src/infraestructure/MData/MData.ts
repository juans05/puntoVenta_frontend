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
    value: "Panel",
    icon: "ic:round-dashboard",
    url: "dashboard",
  },

  // === VENTAS ===
  {
    code: "300",
    id: 3,
    value: "Ventas",
    icon: "mdi:cash-register",
    url: "",
    children: [
      {
        code: "300",
        id: 31,
        value: "Facturación",
        icon: "mdi:file-document-multiple-outline",
        url: "",
        children: [
          {
            code: "900",
            id: 311,
            value: "Comprobantes emitidos",
            icon: "healthicons:i-documents-accepted",
            url: "dashboard/documentos-facturados",
          },
        ],
      },
      {
        code: "300",
        id: 32,
        value: "Nota de crédito",
        icon: "mdi:file-document-minus-outline",
        url: "dashboard/notas-credito-debito/credito",
      },
      {
        code: "300",
        id: 33,
        value: "Nota de débito",
        icon: "mdi:file-document-plus-outline",
        url: "dashboard/notas-credito-debito/debito",
      },
      {
        code: "300",
        id: 34,
        value: "Órdenes de venta",
        icon: "mdi:clipboard-check-outline",
        url: "dashboard/pedidos-venta",
      },
    ],
  },

  // === COMPRAS ===
  // Mismo code "400" que tenia el grupo antes de esta reorganizacion (no le quita acceso a nadie).
  {
    code: "400",
    id: 4,
    value: "Compras",
    icon: "mdi:truck-delivery-outline",
    url: "",
    children: [
      {
        code: "1100",
        id: 41,
        value: "Orden de compra",
        icon: "mdi:cart-outline",
        url: "dashboard/compras/ordenes",
      },
      {
        code: "1100",
        id: 42,
        value: "Nota de crédito",
        icon: "mdi:file-document-minus-outline",
        url: "dashboard/compras/notas-credito",
      },
      {
        code: "1100",
        id: 43,
        value: "Nota de débito",
        icon: "mdi:file-document-plus-outline",
        url: "dashboard/compras/notas-debito",
      },
      {
        code: "1100",
        id: 44,
        value: "Facturación",
        icon: "mdi:file-document-outline",
        url: "dashboard/compras",
      },
    ],
  },

  // === E-COMMERCE ===
  {
    code: "1700",
    id: 26,
    value: "E-commerce",
    icon: "mdi:storefront-outline",
    url: "",
    children: [
      {
        code: "1700",
        id: 256,
        value: "Mi tienda web",
        icon: "mdi:palette-outline",
        url: "dashboard/tienda",
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
        value: "Asientos contables",
        icon: "mdi:book-open-page-variant-outline",
        url: "dashboard/contabilidad/asientos-contables",
      },
      {
        code: "1600",
        id: 252,
        value: "Plan de cuentas",
        icon: "mdi:sitemap-outline",
        url: "dashboard/contabilidad/plan-de-cuentas",
      },
      {
        code: "1600",
        id: 255,
        value: "Cierre de año fiscal",
        icon: "mdi:calendar-check-outline",
        url: "dashboard/contabilidad/cierre-anual",
      },
      {
        code: "400",
        id: 253,
        value: "Clientes",
        icon: "mdi:users-group",
        url: "dashboard/clientes",
      },
      {
        code: "400",
        id: 254,
        value: "Proveedores",
        icon: "mdi:domain",
        url: "dashboard/compras/proveedores",
      },
    ],
  },

  // === INFORMES ===
  // Los libros electronicos ya son el PLE (14.1 ventas / 8.1 compras), no hay pantalla aparte.
  {
    code: "900",
    id: 15,
    value: "Informes",
    icon: "mdi:chart-line",
    url: "",
    children: [
      {
        code: "1600",
        id: 151,
        value: "Libro Electrónico de Ventas (PLE)",
        icon: "mdi:book-outline",
        url: "dashboard/contabilidad/libro-ventas",
      },
      {
        code: "1600",
        id: 152,
        value: "Libro Electrónico de Compras (PLE)",
        icon: "mdi:book-outline",
        url: "dashboard/contabilidad/libro-compras",
      },
      {
        code: "1600",
        id: 153,
        value: "Reporte Detallado de Ventas",
        icon: "mdi:file-chart-outline",
        url: "dashboard/contabilidad/reporte-ventas",
      },
      {
        code: "1600",
        id: 154,
        value: "Reporte Detallado de Compras",
        icon: "mdi:file-chart-outline",
        url: "dashboard/contabilidad/reporte-compras",
      },
      {
        code: "1600",
        id: 155,
        value: "Estado de Resultados",
        icon: "mdi:chart-line-variant",
        url: "dashboard/contabilidad/estado-resultados",
      },
      {
        code: "1600",
        id: 156,
        value: "Balance General",
        icon: "mdi:scale-balance",
        url: "dashboard/contabilidad/balance-general",
      },
      {
        code: "700",
        id: 157,
        value: "Reporte de Cierre de Caja",
        icon: "solar:hand-money-bold",
        url: "dashboard/reporte-cierre-caja",
      },
      {
        code: "1300",
        id: 158,
        value: "ROI Publicidad",
        icon: "mdi:chart-line",
        url: "dashboard/publicidad",
      },
    ],
  },

  // === INVENTARIO ===
  {
    code: "200",
    id: 17,
    value: "Inventario",
    icon: "healthicons:rdt-result-out-stock",
    url: "",
    children: [
      {
        code: "300",
        id: 171,
        value: "Guías de remisión",
        icon: "mdi:truck-outline",
        url: "dashboard/guias-remision",
      },
      {
        code: "200",
        id: 172,
        value: "Inventario",
        icon: "healthicons:rdt-result-out-stock",
        url: "dashboard/inventario",
      },
      {
        code: "200",
        id: 173,
        value: "Productos",
        icon: "solar:bag-4-bold",
        url: "dashboard/productos",
      },
    ],
  },

  // === BANCOS ===
  {
    code: "700",
    id: 7,
    value: "Bancos",
    icon: "mdi:bank-outline",
    url: "",
    children: [
      {
        code: "700",
        id: 71,
        value: "Caja",
        icon: "mdi:wallet-outline",
        url: "dashboard/cajas",
      },
      {
        code: "300",
        id: 72,
        value: "Pagos",
        icon: "mdi:cash-multiple",
        url: "",
        children: [
          {
            code: "300",
            id: 721,
            value: "Cuentas por cobrar",
            icon: "mdi:cash-plus",
            url: "dashboard/cuentas-por-cobrar",
          },
          {
            code: "300",
            id: 722,
            value: "Cuentas por pagar",
            icon: "mdi:cash-minus",
            url: "dashboard/cuentas-por-pagar",
          },
          {
            code: "1300",
            id: 723,
            value: "Gastos",
            icon: "mdi:cash-minus",
            url: "dashboard/gastos",
          },
        ],
      },
    ],
  },

]

// Administración: ya no vive en el sidebar, se muestra en el dropdown del nombre de la
// empresa en el Navbar (ver Navbar/index.tsx). code "1400" = "Configuración" en module.json
// (Usuarios/Sucursales/RolesPermisos/Departamentos viven ahi) -- se usa para ocultar todo el
// bloque a quien no tenga ese modulo, igual que antes se hacia con el grupo del sidebar.
export const adminMenu: IMenu = {
  code: "1400",
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
        {
          code: "1300",
          id: 144,
          value: "Departamentos",
          icon: "mdi:account-tie-outline",
          url: "dashboard/departamentos",
        },
      ],
    },
  ],
}

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