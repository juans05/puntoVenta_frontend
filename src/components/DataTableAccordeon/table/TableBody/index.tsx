import { FC, useState } from "react";
import ButtonTable, { ITableButton } from "../TableButton";
import { IInputCheckbox } from "../InputCheckBox";
import { IHeaderTable } from "../../interface";
import styles from "../../datatable.module.css";
import Input from "../../../Input";
import DataTable from "../..";
import { Icon } from "@iconify/react";
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
  dataState?: any;
  setRowOrder?: any;
  handleSort: (column: string) => void;
  sort: SortType;
  isAccordeonMain?: any;
  headerAccordeon?: any;
  dataAccordeon?: any;
  buttonsAccordeon?: any;
  idTableAccordeon?: any;
  withAvatar?: boolean;
}

const TableBody: FC<ITableBodyProps> = (props) => {
  const {
    columns,
    actions,
    border,

    dataState,
    sort,
    isAccordeonMain,
    headerAccordeon,
    buttonsAccordeon,
    withAvatar,
  } = props;

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

  /* const [acordeonVisible, setAcordeonVisible] = useState(false); */
  const [openAccordionIndex, setOpenAccordionIndex] = useState<number | null>(
    null
  );
  console.log(openAccordionIndex);
  const handleShowAcordeon = (index: number) => {
    /*     setRowOrder(row) */

    /* isAccordeonMain ?  setOpenAccordionIndex(openAccordionIndex === index ? null : index) :  false; */

    if (isAccordeonMain) {
      setOpenAccordionIndex(openAccordionIndex === index ? null : index);
    } else {
      return false;
    }
  };
  return (
    <>
      {sortedData?.length === 0 && (
        <tr>
          <th colSpan={col.length}>
            <div className="empty__div" style={{ marginTop: "1rem" }}>
              <div className={styles['empty-div']}>
                <img
                  width={230}
                  src="https://c.tenor.com/p2eovClgAMoAAAAd/designer-coffee-break.gif"
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
                  No se encontro datos en esta tabla, agregue una nueva
                  informacion
                </p>
              </div>
            </div>
          </th>
        </tr>
      )}
      {sortedData?.length > 0 &&
        sortedData?.map((row: any, index: number) => {
          const isAccordionOpen = index === openAccordionIndex;
          const showAccordion = isAccordionOpen; /* || index === 0; */
          return (
            <>
              <tr
                key={index}
                id={row.ticket}
                onClick={() => handleShowAcordeon(index)}
                style={{ width: "100%" }}
                className={`${showAccordion?`${styles['background-open']}`:``}`}
              
              >
                {col.map((head, pos) => {
                  return pos === 0 ? (
                    <td
                      style={{
                        /* @ts-ignore */
                        border: border == false && "none",
                      }}
                    >
                      <span>
                       {/*  {row.index} */} {index+1}{" "}
                      </span>
                    </td>
                  ) : pos === col.length - 1 ? (
                    <td
                      style={{
                        /* @ts-ignore */
                        border: border == false && "none",
                      }}
                    >
                      <div className={styles.btns}>
                        {actions?.length > 0 ? (
                          actions.map((button) => {
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
                        ) : (
                          <span>{row[head.type]}</span>
                        )}
                      </div>
                    </td>
                  ) : head?.type === "tiempoRespuesta" ? (
                    <td key={pos} className={styles.tdInput}>
                      <span>
                        {<Input onChange={() => undefined} name="tiempoRespuesta" />}
                      </span>
                    </td>
                  ) : head?.type === "cupo" ? (
                    <td key={pos} className={styles.cupo}>
                      <span>{<Input onChange={() => undefined} name="cupo" />}</span>
                    </td>
                  ) : head?.type === "sedes" ? (
                    <td key={pos}>
                      <span className={styles["sede-wrapper"]}>
                        {row[head.type]?.map((value: any, index: any) => {
                          return (
                            <div className={styles.sede} key={index}>
                              {/*    <Icon icon="ic:outline-location-on" /> */}
                              <p className={styles.nomSede}>{value?.nombre}</p>
                            </div>
                          );
                        })}
                      </span>
                    </td>
                  ) : withAvatar && head?.type === "paciente" ? (
                    <td key={pos}>
                      <div className={styles["information-patient"]}>
                        <div className={styles.avatar}>
                          <Icon icon="bxs:user" />
                        </div>
                        <div className={styles["avatar-text"]}>
                          <p>{row?.paciente}</p>
                          <div className={styles?.location}>
                            <Icon icon="ion:location-outline" />
                            <p> {row?.distrito}</p>
                          </div>
                        </div>
                      </div>
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

              {isAccordeonMain && showAccordion && (
                <tr
                  style={{ width: "100%" }}
                  className={styles["tr-accordeon"]}
                >
                  <td colSpan={col.length} className={styles["td-accordeon"]}>
                    <div>
                      <div>
                        <DataTable
                          header={headerAccordeon}
                          body={row?.comprobanteDetalles}
                          actions={buttonsAccordeon}
                          idTable={`${row?.comprobanteDetalles?.length}-${row?.comprobanteDetalles?.productoId}-${row?.fecha}`}
                        ></DataTable>
                      </div>

                      <div className={styles["card-pago"]}>
                        <table>
                          <thead>
                            <tr>
                              <th>
                                <div>Método de Pago</div>
                              </th>
                              <th>
                                <div>Tipo de Pago</div>
                              </th>
                              <th>
                                <div>Monto</div>
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {row?.pagos?.map((value: any, index: any) => {
                              return (
                                <tr
                                  key={
                                    index
                                  } /* className={styles['card-pago-item']} */
                                >
                                  <td>
                                    <span>
                                      {value?.metodoPagoId === 1 ? (
                                        <Icon
                                          icon="mingcute:receive-money-fill"
                                          color="#59CF64"
                                          width={40}
                                        />
                                      ) : value?.metodoPagoId === 2 ? (
                                        <Icon
                                          icon="logos:visa"
                                          width={70}
                                          height={40}
                                        />
                                      ) : (
                                        value?.metodoPagoId === 3 && (
                                          <img
                                            width={32}
                                            src="https://peruconnection.com.pe/wp-content/uploads/2021/11/9877sd.png"
                                          />
                                        )
                                      )}
                                    </span>
                                  </td>

                                  <td>
                                    <span>{value?.metodoPago}</span>
                                  </td>
                                  <td>
                                    <span>S/. {Number(value?.monto ?? 0).toFixed(2)}</span>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </>
          );
        })}
    </>
  );
};

export default TableBody;
