import { ContabilidadReporte } from "./ContabilidadReporte";

export const LibroVentas = () => (
  <ContabilidadReporte
    titulo="Libro Electrónico de Ventas"
    descripcion="Registro de Ventas e Ingresos (Formato PLE 14.1 de SUNAT) — una fila por Factura, Boleta, Nota de Crédito o Nota de Débito emitida."
    endpoint="/contabilidad/libro-ventas"
    filename="libro-electronico-ventas"
    columnas={[
      { key: "periodo", label: "Periodo" },
      { key: "cuo", label: "CUO" },
      { key: "fechaEmision", label: "Fecha Emisión" },
      { key: "tipoComprobante", label: "Tipo Comp." },
      { key: "serie", label: "Serie" },
      { key: "numero", label: "Número" },
      { key: "tipoDocCliente", label: "Tipo Doc. Cliente" },
      { key: "numeroDocCliente", label: "N° Doc. Cliente" },
      { key: "razonSocial", label: "Razón Social" },
      { key: "baseImponibleGravada", label: "Base Gravada", align: "right" },
      { key: "opExonerada", label: "Op. Exonerada", align: "right" },
      { key: "opInafecta", label: "Op. Inafecta", align: "right" },
      { key: "igv", label: "IGV", align: "right" },
      { key: "importeTotal", label: "Importe Total", align: "right" },
      { key: "moneda", label: "Moneda" },
      { key: "estado", label: "Estado" },
    ]}
  />
);
