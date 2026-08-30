import * as XLSX from "xlsx";

export interface IFilaGastoParseada {
  fechaGasto: string; // yyyy-MM-dd
  categoria: string;
  descripcion: string;
  metodoPago: string | null;
  monto: number;
}

export interface IParseoGastoResultado {
  filas: IFilaGastoParseada[];
  errores: string[];
}

const COLUMNAS_REQUERIDAS = ["Fecha", "Monto"];

function tieneColumnaCategoria(fila: any): boolean {
  return (
    Object.prototype.hasOwnProperty.call(fila, "Categoría") ||
    Object.prototype.hasOwnProperty.call(fila, "Categoria")
  );
}

function excelFechaAIso(valor: any): string | null {
  if (!valor) return null;
  const fecha = valor instanceof Date ? valor : new Date(valor);
  return isNaN(fecha.getTime()) ? null : fecha.toISOString().slice(0, 10);
}

export function parseGastoExcel(arrayBuffer: ArrayBuffer): IParseoGastoResultado {
  const workbook = XLSX.read(arrayBuffer, { type: "array" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const filasCrudas: any[] = XLSX.utils.sheet_to_json(sheet, { raw: false });

  if (filasCrudas.length === 0) {
    return { filas: [], errores: ["El archivo no tiene filas de datos."] };
  }

  const columnasFaltantes = COLUMNAS_REQUERIDAS.filter(
    (col) => !Object.prototype.hasOwnProperty.call(filasCrudas[0], col)
  );
  if (!tieneColumnaCategoria(filasCrudas[0])) {
    columnasFaltantes.push("Categoría");
  }
  if (columnasFaltantes.length > 0) {
    return {
      filas: [],
      errores: [`Faltan columnas requeridas en el Excel: ${columnasFaltantes.join(", ")}`],
    };
  }

  const filas: IFilaGastoParseada[] = [];
  const errores: string[] = [];

  filasCrudas.forEach((fila, index) => {
    const fechaGasto = excelFechaAIso(fila["Fecha"]);
    const categoria = fila["Categoría"] ?? fila["Categoria"];
    const monto = parseFloat(fila["Monto"]);
    const metodoPago = fila["Método de pago"] ?? fila["Metodo de pago"] ?? null;

    if (!fechaGasto || !categoria || isNaN(monto)) {
      errores.push(`Fila ${index + 2} del Excel: datos incompletos, se descarta.`);
      return;
    }

    filas.push({
      fechaGasto,
      categoria: String(categoria).trim(),
      descripcion: String(fila["Descripción"] ?? fila["Descripcion"] ?? "").trim(),
      metodoPago: metodoPago ? String(metodoPago).trim() : null,
      monto,
    });
  });

  return { filas, errores };
}
