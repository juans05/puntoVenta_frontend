import { ContabilidadReporte } from "./ContabilidadReporte";

export const ReporteDetalladoVentas = () => (
  <ContabilidadReporte
    titulo="Reporte Detallado de Ventas"
    descripcion="Una fila por cada producto vendido, incluyendo Notas de Venta y Cotizaciones — útil para analizar qué se vendió, no solo cuánto se facturó."
    endpoint="/contabilidad/reporte-detallado-ventas"
    filename="reporte-detallado-ventas"
    columnas={[
      { key: "fecha", label: "Fecha" },
      { key: "serieCorrelativo", label: "Serie - Correlativo" },
      { key: "tipoComprobante", label: "Tipo Comprobante" },
      { key: "cliente", label: "Cliente" },
      { key: "numeroDocumento", label: "N° Documento" },
      { key: "producto", label: "Producto" },
      { key: "cantidad", label: "Cantidad", align: "right" },
      { key: "valorUnitario", label: "Valor Unitario", align: "right" },
      { key: "subtotal", label: "Subtotal", align: "right" },
      { key: "igv", label: "IGV", align: "right" },
      { key: "importe", label: "Importe", align: "right" },
    ]}
  />
);
