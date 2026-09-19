import * as XLSX from "xlsx";

export async function excelArchivoACsv(archivo: File): Promise<string> {
  const buffer = await archivo.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  return XLSX.utils.sheet_to_csv(sheet);
}
