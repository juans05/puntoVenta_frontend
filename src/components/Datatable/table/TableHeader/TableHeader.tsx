import  { FC, useEffect, useState } from "react";

import styles from '../../../Datatable/datatable.module.css'
import { Icon } from '@iconify/react';
import { IHeaderTable } from "../../../../application/models/Header/IHeaderTable";


export interface ITableHeaderProps {
  dataHeader: IHeaderTable[];
  colorFont?: string;
  handleSort: (column: string) => void;
  sort: {
    column: string;
    asc: boolean;
  };
}

const TableHeader: FC<ITableHeaderProps> = (props) => {
  const {
    dataHeader,
    colorFont,
    handleSort,
    sort
  } = props;

  const [columns, setColumns] = useState<IHeaderTable[]>(dataHeader);

  useEffect(() => {
    setColumns(dataHeader);
  }, [dataHeader]);

  return (
    <tr>
      {columns.map((col: IHeaderTable, index: number) => (
        <th key={index} style={{ color: `${colorFont}` }}>
          <div className={styles.colMain}>
            {col.alias}
            {col.sortable && (
              <span onClick={() => handleSort(col.type)} className={styles.sortable}>
                <Icon
                  icon={
                    sort.column === col.type
                      ? sort.asc
                        ? "cil:arrow-top"
                        : "cil:arrow-bottom"
                      : "carbon:chevron-sort"
                  }
                />
              </span>
            )}
          </div>
        </th>
      ))}
    </tr>
  );
};

export default TableHeader;
