import { FC, useEffect, useState } from "react";
import { IHeaderTable } from "../../interface";
import styles from '../../datatable.module.css'
import Icon from "../../../Icon";
import { Icons } from "../../../Svg/iconsPack";



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
  const { dataHeader, colorFont, handleSort, sort } = props;

  const [columns, setColumns] = useState<IHeaderTable[]>(dataHeader);

  useEffect(() => {
    setColumns(dataHeader);
  }, [dataHeader]);

  console.log(sort);

  return (
    <tr>
      {columns.map((col: IHeaderTable, index: number) => {
        console.log(index);
        return (
          <>
            <th
              className={
                col.alias === "" && index === 0 ? styles.destroyCell : ""
              }
              key={index}
              style={{ color: `${colorFont}` }}
            >
              <div className={styles.colMain}>
                {col.alias}
                {col.sortable && (
                  <span
                    onClick={() => handleSort(col.type)}
                    className={styles.sortable}
                  >
                    {sort.column === col.type ? (
                      sort.asc ? (
                        <Icon icon={Icons.ascTable} />
                      ) : (
                        <Icon icon={Icons.descTable} />
                      )
                    ) : (
                      <Icon icon={Icons.sort} />
                    )}
                  </span>
                )}
              </div>
            </th>
          </>
        );
      })}
    </tr>
  );
};

export default TableHeader;
