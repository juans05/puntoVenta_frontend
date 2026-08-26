import * as XLSX from "xlsx";

export interface IFilaPublicidadParseada {
  nombreAnuncio: string;
  nombreConjuntoAnuncios: string | null;
  fechaInicio: string; // yyyy-MM-dd
  fechaFin: string;
  importeGastado: number;
  impresiones: number | null;
  alcance: number | null;
  resultados: number | null;
  costoPorResultado: number | null;
  grupoId: number | null;
}

export interface IParseoResultado {
  filas: IFilaPublicidadParseada[];
  errores: string[];
}

const COLUMNAS_REQUERIDAS = [
  "Inicio del informe",
  "Fin del informe",
  "Importe gastado (PEN)",
];

function tieneColumnaNombre(fila: any): boolean {
  return (
    Object.prototype.hasOwnProperty.call(fila, "Nombre del anuncio") ||
    Object.prototype.hasOwnProperty.call(fila, "Nombre de la campaña")
  );
}

function excelFechaAIso(valor: any): string | null {
  if (!valor) return null;
  const fecha = valor instanceof Date ? valor : new Date(valor);
  return isNaN(fecha.getTime()) ? null : fecha.toISOString().slice(0, 10);
}

export function parseGastoPublicidadExcel(arrayBuffer: ArrayBuffer): IParseoResultado {
  const workbook = XLSX.read(arrayBuffer, { type: "array" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const filasCrudas: any[] = XLSX.utils.sheet_to_json(sheet, { raw: false });

  if (filasCrudas.length === 0) {
    return { filas: [], errores: ["El archivo no tiene filas de datos."] };
  }

  const columnasFaltantes = COLUMNAS_REQUERIDAS.filter(
    (col) => !Object.prototype.hasOwnProperty.call(filasCrudas[0], col)
  );
  if (!tieneColumnaNombre(filasCrudas[0])) {
    columnasFaltantes.push("Nombre del anuncio (o Nombre de la campaña)");
  }
  if (columnasFaltantes.length > 0) {
    return {
      filas: [],
      errores: [`Faltan columnas requeridas en el Excel: ${columnasFaltantes.join(", ")}`],
    };
  }

  const filas: IFilaPublicidadParseada[] = [];
  const errores: string[] = [];

  filasCrudas.forEach((fila, index) => {
    const nombreAnuncio = fila["Nombre del anuncio"] ?? fila["Nombre de la campaña"];
    const fechaInicio = excelFechaAIso(fila["Inicio del informe"]);
    const fechaFin = excelFechaAIso(fila["Fin del informe"]);
    const importeGastado = parseFloat(fila["Importe gastado (PEN)"]);

    if (!nombreAnuncio || !fechaInicio || !fechaFin || isNaN(importeGastado)) {
      errores.push(`Fila ${index + 2} del Excel: datos incompletos, se descarta.`);
      return;
    }

    filas.push({
      nombreAnuncio,
      nombreConjuntoAnuncios: fila["Nombre del conjunto de anuncios"] ?? null,
      fechaInicio,
      fechaFin,
      importeGastado,
      impresiones: fila["Impresiones"] ? parseInt(fila["Impresiones"], 10) : null,
      alcance: fila["Alcance"] ? parseInt(fila["Alcance"], 10) : null,
      resultados: fila["Compras"] ? parseInt(fila["Compras"], 10) : null,
      costoPorResultado: fila["Costo por compra (PEN)"] ? parseFloat(fila["Costo por compra (PEN)"]) : null,
      grupoId: null,
    });
  });

  return { filas, errores };
}
