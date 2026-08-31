import { FC, useEffect, useState } from "react";
import { IHeaderTable } from "../../../../../../../../application/models/Header/IHeaderTable";
import ButtonTable, {
  ITableButton,
} from "../../../../../../../../components/Datatable/table/TableButton";
import styles from "../usertable.module.css";
import dark from "../../../../../../../../assets/img/dark.png";

export interface ITableBodyProps {
  columns: IHeaderTable[];
  dataBody: any;

  actions: ITableButton[];
}

export const TableUserBody: FC<ITableBodyProps> = (props) => {
  const { columns, actions, dataBody } = props;

  const [col] = useState<any[]>(columns);
  const [rows, setRows] = useState<any[]>(dataBody);
  console.log(rows);

  const primeraLetra = (palabra: string) => {
    if (palabra && palabra.length > 0) {
      return palabra?.charAt(0);
    } else {
      return null;
    }
  };

  useEffect(() => {
    /*  if (checked === false) { */
    setRows(dataBody);

    /*    } */
  }, [dataBody]);

  console.log(rows)

  return (
    <>
      {rows?.length === 0 && (
        <tr className="bg-white border-b hover:bg-gray-50">
          <th colSpan={col.length}>
            <div
              className={`${styles["empty-img"]} empty__div`}
              style={{ marginTop: "1rem" }}
            >
              <div className={styles["empty-img-src"]}>
                <img
                  width={230}
                  /*  src="https://c.tenor.com/p2eovClgAMoAAAAd/designer-coffee-break.gif" */
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
      {rows?.length > 0 &&
        rows?.map((row: any, index: number) => {
          return (
            <tr
              className="bg-white border-b hover:bg-gray-50"
              key={index}
              id={row.ticket}
            >
              {col.map((head, pos) => {
                return pos === 0 ? (
                  <td key={pos} className="px-6 py-4">
                    <span>{row.index}</span>
                  </td>
                ) : pos === col.length - 1 ? (
                  <td className="px-6 py-4">
                    <div className={`${styles["btns-table"]}`}>
                      {actions?.length > 0
                        ? actions.map((button: any) => {
                          if (button.title === "Anular" && row.estadoComprobante === "CREADO") {
                            // No renderizar el botón "Anular" si estadoComprobante es "CREADO"
                            return (
                              <div key={button?.title}>
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
                          }
                          if (button.title === "Anular" && row.estadoComprobante === "ANULADO") {
                            // No renderizar el botón "Anular" si estadoComprobante es "ANULADO"
                            return null;
                          }
                          if (button.title === "Descargar Pdf" && row.estadoEnvioSunat === "PENDIENTE") {
                            // No renderizar el botón "Anular" si estadoComprobante es "ANULADO"
                            return null;
                          }
                          return (
                            <div key={button?.title}>
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
                ) : head?.type === "nameImage" ? (
                  <th
                    scope="row"
                    className="flex items-center px-6 py-4 text-gray-900 whitespace-nowrap dark:text-white"
                  >
                    {row["img"] === "" || row["img"] === null ? (
                      <div className={styles["avatar"]}>
                        <p> {primeraLetra(row["fullName"])}</p>
                      </div>
                    ) : (
                      <img
                        className="w-10 h-10 rounded-full object-cover"
                        src={`${row["img"]}`}
                        alt={row["fullName"]}
                      />
                    )}

                    <div className="pl-3">
                      <div
                        className={`text-md font-semibold ${row["email"] === ""
                          ? `${styles["font-fullName"]}`
                          : ""
                          }`}
                      >
                        {row["fullName"]}
                      </div>
                      <div className="font-normal text-gray-500">
                        {row["email"]}
                      </div>
                    </div>
                  </th>
                )
                  : head.type === "estadoSunat" ? (
                    row["estadoSunat"] === "ENVIADO" ? (
                      <td key={pos} className={`px-6 py-4 `}>
                        <div
                          className={`${styles["estado"]} ${styles["activo"]}`}
                        >
                          <span>{row["estadoSunat"]}</span>
                        </div>
                      </td>
                    ) : (
                      <td key={pos} className={`px-6 py-4 `}>
                        <div
                          className={row["estadoSunat"] === "PENDIENTE" ? `${styles["estado"]} ${styles["pending"]}` : `${styles["estado"]} ${styles["error"]}`}
                        >
                          <span>{row["estadoSunat"]}</span>
                        </div>
                      </td>
                    )
                  ) : head.type === "clienteNombre" ? (
                    row["clienteNombre"] === "" ? (
                      <td key={pos} className={`px-6 py-4 `}>
                        <span>SIN ESPECIFICAR</span>
                      </td>
                    ) : (
                      <td key={pos} className={`px-6 py-4 `}>
                        <span>{row["clienteNombre"]}</span>
                      </td>
                    )
                  )


                    : head.type === "estadoComprobante" ? (
                      row["estadoComprobante"] === "FACTURADO" ? (
                        <td key={pos} className={`px-6 py-4 `}>
                          <div
                            className={`${styles["estado"]} ${styles["activo"]}`}
                          >
                            <span>{row["estadoComprobante"]}</span>
                          </div>
                        </td>
                      ) : (
                        <td key={pos} className={`px-6 py-4 `}>
                          <div
                            className={row["estadoComprobante"] === "ANULADO" ? `${styles["estado"]} ${styles["error"]}` : `${styles["estado"]} ${styles["create"]}`}
                          >
                            <span>{row["estadoComprobante"]}</span>
                          </div>
                        </td>
                      )
                    )

                      : head.type === "estado" ? (
                        row["estado"] === true ? (
                          <td key={pos} className={`px-6 py-4 `}>
                            <div
                              className={`${styles["estado"]} ${styles["activo"]}`}
                            >
                              <span>Activo</span>
                            </div>
                          </td>
                        ) : (
                          <td key={pos} className={`px-6 py-4 `}>
                            <div
                              className={`${styles["estado"]} ${styles["inactivo"]}`}
                            >
                              <span>Inactivo</span>
                            </div>
                          </td>
                        )
                      ) : head.type === "stockBajo" ? (
                        row["stockBajo"] ? (
                          <td key={pos} className={`px-6 py-4 `}>
                            <div className={`${styles["estado"]} ${styles["error"]}`}>
                              <span>Bajo stock</span>
                            </div>
                          </td>
                        ) : (
                          <td key={pos} className={`px-6 py-4 `}>
                            <div className={`${styles["estado"]} ${styles["activo"]}`}>
                              <span>OK</span>
                            </div>
                          </td>
                        )
                      ) : (
                        <td key={pos} className="px-6 py-4">
                          <span>{row[head?.type]}</span>
                        </td>
                      );
              })}
            </tr>
          );
        })}
    </>
  );
};
