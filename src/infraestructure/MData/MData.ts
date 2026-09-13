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
            id: 142,
            value: "Salones de recojo",
            icon: "mdi:office-building-marker-outline",
            url: "dashboard/pedidos/salones",
          },
        ],
      },
    ],
  },

  // === VENTAS & COMPROBANTES ===
  {
    code: "300",
    id: 3,
    value: "Ventas & Comprobantes",
    icon: "mdi:file-document-multiple-outline",
    url: "",
    children: [
      {
        code: "300",
        id: 16,
        value: "Nueva Factura",
        icon: "mdi:file-document-plus-outline",
        url: "dashboard/nueva-factura",
      },
      {
        code: "300",
        id: 3,
        value: "Ventas del Día",
        icon: "ic:outline-point-of-sale",
        url: "dashboard/ventas-realizadas",
      },
      {
        code: "900",
        id: 7,
        value: "Documentos Facturados",
        icon: "healthicons:i-documents-accepted",
        url: "dashboard/documentos-facturados",
      },
      {
        code: "300",
        id: 18,
        value: "Pedidos",
        icon: "mdi:package-variant-closed",
        url: "dashboard/pedidos",
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
        code: "200",
        id: 17,
        value: "Inventario",
        icon: "healthicons:rdt-result-out-stock",
        url: "dashboard/inventario",
      },
    ],
  },

  // === RECURSOS HUMANOS ===
  {
    code: "500",
    id: 5,
    value: "Recursos Humanos",
    icon: "mdi:account-multiple-outline",
    url: "",
    children: [
      {
        code: "500",
        id: 5,
        value: "Asistencia",
        icon: "zondicons:calendar",
        url: "dashboard/asistencia",
      },
      {
        code: "600",
        id: 6,
        value: "Reporte de Asistencia",
        icon: "mdi:report-pie",
        url: "dashboard/reporte-asistencia",
      },
      {
        code: "950",
        id: 8,
        value: "Configuración de Renta",
        icon: "mdi:home-currency-usd",
        url: "dashboard/configuracion-renta",
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