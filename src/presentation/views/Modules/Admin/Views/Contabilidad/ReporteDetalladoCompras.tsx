import { ContabilidadReporte } from "./ContabilidadReporte";

export const ReporteDetalladoCompras = () => (
  <ContabilidadReporte
    titulo="Reporte Detallado de Compras"
    descripcion="Una fila por cada producto comprado — útil para analizar qué se compró a cada proveedor, no solo cuánto se pagó."
    endpoint="/contabilidad/reporte-detallado-compras"
    filename="reporte-detallado-compras"
    columnas={[
      { key: "fecha", label: "Fecha" },
      { key: "serieNumero", label: "Serie - Número" },
      { key: "proveedor", label: "Proveedor" },
      { key: "ruc", label: "RUC" },
      { key: "producto", label: "Producto" },
      { key: "cantidad", label: "Cantidad", align: "right" },
      { key: "costoUnitario", label: "Costo Unitario", align: "right" },
      { key: "subtotal", label: "Subtotal", align: "right" },
    ]}
  />
);
