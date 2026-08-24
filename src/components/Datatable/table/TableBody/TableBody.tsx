import { FC, useState } from "react";

import ButtonTable, { ITableButton } from "../TableButton";
import { IInputCheckbox } from "../InputCheckBox";

import styles from "../../../Datatable/datatable.module.css";

import { IHeaderTable } from "../../../../application/models/Header/IHeaderTable";
import dark from '../../../../assets/img/dark.png'
interface SortType {
  column: string;
  asc: boolean;
}
export interface ITableBodyProps {
  columns: IHeaderTable[];
  dataBody: any;
  color?: string;
  actions: ITableButton[];
  border?: boolean;
  colorFont?: string;
  colorIndex?: string;
  classNameRow?: string;
  checkbox?: IInputCheckbox;
  idFromDrownDown?: any;
  idTable?:any;

  dataState?: any;

  setRowOrder?: any;
  handleSort: (column: string) => void;
  sort: SortType;
}

const TableBody: FC<ITableBodyProps> = (props) => {
  const { columns, actions, border, dataState, setRowOrder, sort,idTable } = props;

  const [col] = useState<any[]>(columns);
  const rows = dataState?.List;

  const sortedData = [...rows];
  console.log(sortedData);
  console.log(sortedData);
  if (sort.column) {
    sortedData.sort((a: any, b: any) => {
      if (a[sort.column] < b[sort.column]) return sort.asc ? -1 : 1;
      if (a[sort.column] > b[sort.column]) return sort.asc ? 1 : -1;
      return 0;
    });
  }

  return (
    <>
      {sortedData?.length === 0 && (
        <tr>
          <th colSpan={col.length}>
            <div className={`${styles['empty-img']} empty__div`} style={{ marginTop: "1rem" }}>
              <div className={styles['empty-img-src']}>
                <img
                  width={230}
                  src={dark}
                  alt=""
                />
                <p
                  style={{
                    margin: "0 auto",
                    width: "300px",
                    fontSize: "12px",
                    textAlign: "center",
                    fontWeight: "800",
                    color: "#F24B89",
                  }}
                >
                  No se encontró datos en esta tabla, agregue una nueva
                  informacion
                </p>
              </div>
            </div>
          </th>
        </tr>
      )}
      {sortedData?.length > 0 &&
        sortedData?.map((row: any, index: number) => {
          return (
            <tr key={index} id={row.ticket} onClick={() => setRowOrder(row)} className={
              idTable === "asistenciaAnfitrionas"
                ? row?.estadoDeuda != 'Completado'
                  ? styles.inactiveRow
                  : ''
                : ""
            }>
              {col.map((head, pos) => {
                return pos === 0 ? (
                  <td
                    style={{
                      /* @ts-ignore */
                      border: border == false && "none",
                    }}
                  >
                    <span>{index+1}</span>
                  </td>
                ) : pos === col.length - 1 ? (
                  <td
                    style={{
                      /* @ts-ignore */ 
                      border: border == false && "none",
                    }}
                  >
                    <div className={styles.btns}>
                      {actions?.length > 0
                        ? actions.map((button) => {
                            return (
                              <div>
                                <ButtonTable
                                  type={button.type}
                                  title={button.title}
                                  icon={button.icon}
                                  className={button.className}
                                  classNameIcon={button.classNameIcon}
                                  handleOnClick={button.handleOnClick}
                                  fileNameModule={button.fileNameModule}
                                  disabledButton={button.disabledButton}
                                  texto={button.texto}
                                  iconify={button.iconify}
                                  data={row}
                                ></ButtonTable>
                              </div>
                            );
                          })
                        : null}
                    </div>
                  </td>
                ) : head?.type === "estadoDeuda" ? (
                  <td key={pos}>
                    <span  className={
                        head?.type === "estadoDeuda"
                          ? row?.estadoDeuda === 'Completado'
                            ? styles.stateActive
                            : styles.stateInactive
                          : ""
                      }>
                      {row[head.type]}
                    </span>
                  </td>
                ) : head?.type === "especialidades" ? (
                  <td key={pos}>
                    <span className={styles["sede-wrapper"]}>
                      {row[head.type]?.map((value: any, index: any) => {
                        return (
                          <div className={styles.sede} key={index}>
                            {/*     <Icon icon="fluent-emoji:health-worker-light" /> */}
                            <p className={styles.nomSede}>{value?.nombre}</p>
                          </div>
                        );
                      })}
                    </span>
                  </td>
                ) : (
                  <td key={pos}>
                    <span
                      className={
                        head?.type === "estado"
                          ? row?.estado === true
                            ? styles.stateActive
                            : styles.stateInactive
                          : ""
                      }
                    >
                      {
                        /*   row[head.type] */
                        (row[head.type] === false && "INACTIVO") ||
                          (row[head.type] === true && "ACTIVO") ||
                          row[head.type]
                      }
                    </span>
                  </td>
                ) /* ------- */;
              })}
            </tr>
          );
        })}
    </>
  );
};

export default TableBody;
