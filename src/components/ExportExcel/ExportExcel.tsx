import { FC } from "react";
//@ts-ignore
import ReactHTMLTableToExcel from "react-html-table-to-excel";
import { Button } from "@tremor/react";
import * as XLSX from "xlsx";

export interface IExportExcel {
  filename: string;
  refTable: string;
  booleanState?: boolean;
  handleClick?: any;
  xlsxRef?: any;
}

const ExportExcel: FC<IExportExcel> = (props) => {
  const { filename, refTable } = props;

  const exportToExcel = ({ tableId, filename }: any) => {
    const table = document.getElementById(tableId);

    if (table) {
      const wb = XLSX.utils.table_to_book(table, {sheet:`${filename}`});
      XLSX.writeFile(wb, `${filename}.xlsx`);
    } else {
      console.error(`No se encontró la tabla con el ID "${tableId}"`);
    }
  };

  const handleExportExcel = () => {
    exportToExcel({ tableId: refTable, filename: filename });
  };

  return (
    <>
      {/* <button onClick={handleExportExcel}>Exportar a Excel</button> */}
      <div >
        <Button
          // isIcon
          // icon={Icons.excel}
          // color="success"
          // onClick={handleExcelClick}
          onClick={handleExportExcel}
        >
          Descargar Excel
        </Button>
      </div>
      {/* <div className="filter__action pos-r flex-1">
        <ReactHTMLTableToExcel
          ref={xlsxFile}
          id="botonExportarExcel"
          className="button__hidden"
          table={refTable}
          filename={`${filename}`}
          sheet={filename}
          buttonText="Download as XLS"
        />
      </div> */}
    </>
  );
};

export default ExportExcel;
