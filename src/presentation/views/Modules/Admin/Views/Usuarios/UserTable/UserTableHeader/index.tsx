import  { FC, useEffect, useState } from "react";
import { IHeaderTable } from "../../../../../../../../application/models/Header/IHeaderTable";
export interface ITableHeaderProps {
  dataHeader: IHeaderTable[];
}
/* Header */
export const TableUserHeader: FC<ITableHeaderProps> = (props) => {
  const { dataHeader } = props;

  const [columns, setColumns] = useState<IHeaderTable[]>(dataHeader);

  useEffect(() => {
    setColumns(dataHeader);
  }, [dataHeader]);

  return (
    <tr>
      {columns.map((col: IHeaderTable, index: number) => {
        const renderHeader = () => {
          if (col.alias === "Checked") {
            return (
              <th scope="col" className="p-4">
                <div className="flex items-center">
                  <input
                    id="checkbox-all-search"
                    type="checkbox"
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  />
                  <label htmlFor="checkbox-all-search" className="sr-only">
                    checkbox
                  </label>
                </div>
              </th>
            );
          } else {
           return (<th key={index} scope="col" className="px-6 py-3 text-center">
           {col.alias}
         </th>) ;
          }
        };
        return renderHeader();
      })}
    </tr>
  );
};
