import { ContabilidadReporte } from "./ContabilidadReporte";

export const LibroCompras = () => (
  <ContabilidadReporte
    titulo="Libro Electrónico de Compras"
    descripcion="Registro de Compras (Formato PLE 8.1 de SUNAT) — una fila por compra registrada."
    endpoint="/contabilidad/libro-compras"
    filename="libro-electronico-compras"
    columnas={[
      { key: "periodo", label: "Periodo" },
      { key: "cuo", label: "CUO" },
      { key: "fechaEmision", label: "Fecha Emisión" },
      { key: "tipoComprobante", label: "Tipo Comp." },
      { key: "serie", label: "Serie" },
      { key: "numero", label: "Número" },
      { key: "tipoDocProveedor", label: "Tipo Doc. Proveedor" },
      { key: "numeroDocProveedor", label: "N° Doc. Proveedor" },
      { key: "razonSocial", label: "Razón Social" },
      { key: "baseImponibleGravada", label: "Base Gravada", align: "right" },
      { key: "valorAdquisicionesNoGravadas", label: "Adq. No Gravadas", align: "right" },
      { key: "igv", label: "IGV", align: "right" },
      { key: "importeTotal", label: "Importe Total", align: "right" },
      { key: "moneda", label: "Moneda" },
      { key: "estado", label: "Estado" },
    ]}
  />
);
