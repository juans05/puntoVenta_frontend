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

  if (valor instanceof Date) {
    return isNaN(valor.getTime()) ? null : valor.toISOString().slice(0, 10);
  }

  const texto = String(valor).trim();

  // dd/mm/yyyy (formato con el que Excel exporta las fechas en este template) --
  // new Date(texto) asume mm/dd/yyyy y arruina cualquier dia > 12.
  const match = texto.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (match) {
    const dia = Number(match[1]);
    const mes = Number(match[2]);
    const anio = Number(match[3]);
    if (mes < 1 || mes > 12 || dia < 1 || dia > 31) return null;
    return `${anio}-${String(mes).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
  }

  const fecha = new Date(texto);
  return isNaN(fecha.getTime()) ? null : fecha.toISOString().slice(0, 10);
}

function excelMontoANumero(valor: any): number {
  if (typeof valor === "number") return valor;
  // Quita el simbolo de moneda ("S/") y espacios; conserva digitos, "," y "."
  const soloNumero = String(valor ?? "")
    .replace(/[^0-9.,-]/g, "")
    .replace(/,/g, "");
  return parseFloat(soloNumero);
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
    const monto = excelMontoANumero(fila["Monto"]);
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
