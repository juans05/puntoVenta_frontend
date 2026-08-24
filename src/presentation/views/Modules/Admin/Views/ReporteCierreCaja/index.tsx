import { useEffect, useState } from "react";
import { printTable } from "../../../../../../helpers/functions/printTitle";
import { title } from "../../../../../../infraestructure/MData/MData";
import {
  getAllReporteMain,
  getAllReporteMainResumido,
} from "../../../../../../redux/reducers/Admin/reporte-caja/reporteCaja.reducer";
import { useAppDispatch, useAppSelector } from "../../../../../../redux/store";
/* import { IAuthState } from "../../../../../../redux/reducers/auth/interfaces"; */
import { RootState } from "../../../../../../redux/rootState";
import { Calendar } from "../../../../../../components/Date";
import moment from "moment";
import styles from "./reporteCierreCaja.module.css";
import { IHeaderTable } from "../../../../../../components/DataTableAccordeon/interface";
import { ITableButton } from "../../../../../../components/DataTableAccordeon/table/TableButton";
import { Icons } from "../../../../../../components/Svg/iconsPack";
import DataTableAccordeon from "../../../../../../components/DataTableAccordeon";
import SelectPro from "../../../../../../components/SelectPro";
import { Tabs } from "./Tabs";
import { getAllUser } from "../../../../../../redux/reducers/extensiones/extensiones..reducer";
import { IExtensionesState } from "../../../../../../redux/reducers/extensiones/interfaces";
import { Indicador } from "./Indicadores";

moment.locale("es");
interface IDataHistory {
  dateStart: string;
  dateEnd: string;
}

const dataHistory: IDataHistory = {
  dateStart: moment(new Date()).format("DD/MM/YYYY"),
  dateEnd: moment(new Date()).format("DD/MM/YYYY"),
};

export const ReporteCierreCaja = () => {
 /*  const { me }: IAuthState = useAppSelector((state: RootState) => state.auth); */
  const { allUsers }: IExtensionesState = useAppSelector(
    (state: RootState) => state.extentions
  );
  console.log(allUsers);
  const header: IHeaderTable[] = [
    { type: "", alias: "#" },
    /*  { type: "index", alias: "#" }, */
    { type: "tipoDocumentoVenta", alias: "Tipo de Documento", sortable: true },
    { type: "valorSubtotal", alias: "Valor Sub Total" },
    { type: "valorIgv", alias: "IGV" },
    { type: "valorTotal", alias: "Valor Total", sortable: true },
    /*  { type: "distrito", alias: "Distrito" }, */
    { type: "serie", alias: "Serie" },
    { type: "nombreVendedor", alias: "Vendedor", sortable: true },
    { type: "fecha", alias: "Fecha y Hora" },

    /* { type: "acciones", alias: "Acciones" }, */
  ];
  const newCategorias = allUsers?.map((value: any) => {
    return {
      value: value?.usuario,
      id: value?.index,
    };
  });
  const initialForm = {
    userId: newCategorias[0]?.id,
    userName: newCategorias[0]?.value,
  };
  const [formValues, setFormValues] = useState<any>(initialForm);
  const { userName, userId } = formValues;
  console.log(userName, userId);
  useEffect(() => {
    setFormValues({
      userId: newCategorias[0]?.id,
      userName: newCategorias[0]?.value,
    });
  }, [newCategorias[0]?.id]);

  const headerAccordeon: IHeaderTable[] = [
    { type: "id", alias: "#" },
    { type: "producto", alias: "Producto" },
    { type: "cantidad", alias: "Cantidad" },
    { type: "valorUnitarioTotal", alias: "Valor Unitario SubTotal" },
    { type: "valorIgv", alias: "IGV" },
    { type: "valorUnitario", alias: "Valor Unitario Total" },
    { type: "acciones", alias: "Acciones" },
  ];

  const idTable = "reporte_cierre_caja";
  const [columns] = useState<any>(header);
  const [columnsAccordeon] = useState<any>(headerAccordeon);

  const { reporteCaja, reporteCajaResumido }: any = useAppSelector(
    (state: RootState) => state.reporteCaja
  );
  console.log(reporteCajaResumido);
  const dispatch = useAppDispatch();
  /* 
  const newReporteCaja=reporteCaja?.map((value:any, index:number)=>{
    return {
        ...value,
        valorSubtotal:` ${parseFloat(value?.valorSubtotal).toFixed(2)}`,
        valorIgv:` ${parseFloat(value?.valorIgv).toFixed(2)}`,
        valorTotal:` ${parseFloat(value?.valorTotal).toFixed(2)}`,
        comprobanteDetalles:value?.comprobanteDetalles?.map((item:any, i:number)=>{
          return ({
            ...item,
            valorUnitarioTotal:`S/. ${parseFloat(item?.valorUnitarioTotal).toFixed(2)}`,
            valorIgv:`S/. ${parseFloat(item?.valorIgv).toFixed(2)}`,
            valorUnitario:`S/. ${parseFloat(item?.valorUnitario).toFixed(2)}`,
          })

        })
    }
  }) */

  const [dateHistory, setDateHistory] = useState<IDataHistory>(dataHistory);
  const { dateStart } = dateHistory;
  const handleChangeDate = (value: string, name: string) => {
    setDateHistory({
      ...dateHistory,
      [name]: value,
    });
  };

  const handleEditTable = () => undefined;
  const buttonsAccordeon: ITableButton[] = [
    {
      type: "Edit",
      title: "Test",
      icon: Icons.exam,
      className: "btn__table editBtn",
      handleOnClick: handleEditTable,
    },
  ];

/*   const handleDate = (date: string) => {
    console.log(date);
  }; */
  /*  const newCategorias = [
    {
      id: 1,
      value: "Admin",
    },
    {
      id: 2,
      value: "Ventas1",
    },
  ]; */

  const boletas =
    reporteCajaResumido !== null && reporteCajaResumido["boletas"];
  const facturas =
    reporteCajaResumido !== null && reporteCajaResumido["facturas"];
 /*  const ticketInterno =
    reporteCajaResumido !== null && reporteCajaResumido["ticketInterno"]; */
  const total = reporteCajaResumido !== null && reporteCajaResumido["total"];

  const handleChangeSelect = (
    idValue: any,
    value: string,
    name: string,
    id: number
  ) => {
    console.log(idValue, id, name, value);

    setFormValues({
      ...formValues,
      [name]: value,
      [id]: idValue,
    });
  };

  const data = [
    { id: 1, value: "Reporte Resumido de cierre de caja" },
    { id: 2, value: "Reporte Detallado de Cierre de Caja" },
  ];

  const [activeTab, setActiveTab] = useState(data[0].id);
  const [loadingReporte, setLoadingReporte] = useState<boolean>(true);
  useEffect(() => {
    printTable(`${title.name}::REPORTE DE CIERRE DE CAJA`);
  }, []);
  /*  useEffect(() => {
    if (me?.userName) {
      dispatch(getAllReporteMain(newCategorias[0]?.value, dateStart));
    }
  }, [dispatch]); */
  useEffect(() => {
    setLoadingReporte(true);
    dispatch(getAllReporteMain(userName, dateStart)).finally(() => setLoadingReporte(false));
  }, [dispatch, userName, dateStart]);
  useEffect(() => {
    dispatch(getAllReporteMainResumido(userName, dateStart));
  }, [dispatch, userName, dateStart]);
  useEffect(() => {
    dispatch(getAllUser());
  }, [dispatch]);

  return (
    <div>
      <div>
        <Tabs data={data} activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>
      <div className={`${styles["encabezado-principal"]}`}>
        <div>
          <SelectPro
            isLabel
            label="Seleccione una usuario"
            isSearch
            id="userId"
            name="userName"
            defaultValue={newCategorias[0]?.value}
            options={newCategorias}
            onChange={handleChangeSelect}
          />
        </div>
        <div className={`${styles["date"]}`}>
          <Calendar onChange={handleChangeDate} name="dateStart" text="Fecha" />
        </div>
      </div>
      <div className={styles['indicador']}>
       
        <Indicador
          icon={"solar:bill-list-outline"}
          value={"Boletas"}
          amount={reporteCajaResumido !== null ? boletas?.cantidad : 0}
          colorBg={'#F1F7FE'}
          color={'#1658E9'}
        />
        <Indicador
          icon={"solar:bill-list-outline"}
          value={"Facturas"}
          amount={reporteCajaResumido !== null ? facturas?.cantidad : 0}
          colorBg={'#FEF9F3'}
          color={'#DD5408'}
        />
       {/*  <Indicador
          icon={"solar:bill-list-outline"}
          value={"Ticket Interno"}
          amount={reporteCajaResumido !== null ? ticketInterno?.cantidad : 0}
          colorBg={'#F1FCFD'}
          color={'#0F8BBE'}
        /> */}
        <Indicador
          icon={"entypo:documents" }
          value={"Total de Documentos"}
          amount={reporteCajaResumido !== null ? total?.cantidad : 0}
          colorBg={'#F5F5FE'}
          color={'#4344D0'}
        />
        <Indicador
          icon={"game-icons:money-stack" }
          value={"Total (S/.)"}
          amount={
            reporteCajaResumido !== null
              ? `S/. ${parseFloat(total?.total).toFixed(2)}`
              : "S/. 0.00"
          }
          colorBg={'#EDFEEA'}
          color={'#05c46b'}
        />
       
      </div>
      {activeTab === 1 ? (
        <div className={styles["list-resumido"]}>
          <h3>Reporte Resumido del día {dateStart}</h3>

          <div className={styles["table"]}>
            <table>
              <thead>
                <tr>
                  <th rowSpan={2}>
                    <div>Tipo de Documento</div>
                  </th>
                  <th colSpan={3}>
                    <div>Medio de pago</div>
                  </th>
                  <th rowSpan={2}>
                    <div>Total (S/.)</div>
                  </th>
                </tr>
                <tr>
                  <th>
                    <div>Efectivo</div>
                  </th>
                  <th>
                    <div>Tarjeta Visa</div>
                  </th>
                  <th>
                    <div>Yape</div>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <span>BOLETAS</span>
                  </td>
                  <td>
                    <span>
                      S/.{" "}
                      {reporteCajaResumido !== null
                        ? parseFloat(boletas?.efectivo).toFixed(2)
                        : "0.00"}
                    </span>
                  </td>
                  <td>
                    <span>
                      S/.{" "}
                      {reporteCajaResumido !== null
                        ? parseFloat(boletas?.tarjeta).toFixed(2)
                        : "0.00"}
                    </span>
                  </td>
                  <td>
                    <span>
                      S/.{" "}
                      {reporteCajaResumido !== null
                        ? parseFloat(boletas?.yape).toFixed(2)
                        : "0.00"}
                    </span>
                  </td>
                  <td>
                    <span>
                      S/.{" "}
                      {reporteCajaResumido !== null
                        ? parseFloat(boletas?.total).toFixed(2)
                        : "0.00"}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td>
                    <span>FACTURAS</span>
                  </td>
                  <td>
                    <span>
                      S/.{" "}
                      {reporteCajaResumido !== null
                        ? parseFloat(facturas?.efectivo).toFixed(2)
                        : "0.00"}
                    </span>
                  </td>
                  <td>
                    <span>
                      S/.{" "}
                      {reporteCajaResumido !== null
                        ? parseFloat(facturas?.tarjeta).toFixed(2)
                        : "0.00"}
                    </span>
                  </td>
                  <td>
                    <span>
                      S/.{" "}
                      {reporteCajaResumido !== null
                        ? parseFloat(facturas?.yape).toFixed(2)
                        : "0.00"}
                    </span>
                  </td>
                  <td>
                    <span>
                      S/.{" "}
                      {reporteCajaResumido !== null
                        ? parseFloat(facturas?.total).toFixed(2)
                        : "0.00"}
                    </span>
                  </td>
                </tr>
               {/*  <tr>
                  <td>
                    <span>TICKET INTERNO</span>
                  </td>
                  <td>
                    <span>
                      S/.{" "}
                      {reporteCajaResumido !== null
                        ? parseFloat(ticketInterno?.efectivo).toFixed(2)
                        : "0.00"}
                    </span>
                  </td>
                  <td>
                    <span>
                      S/.{" "}
                      {reporteCajaResumido !== null
                        ? parseFloat(ticketInterno?.tarjeta).toFixed(2)
                        : "0.00"}
                    </span>
                  </td>
                  <td>
                    <span>
                      S/.{" "}
                      {reporteCajaResumido !== null
                        ? parseFloat(ticketInterno?.yape).toFixed(2)
                        : "0.00"}
                    </span>
                  </td>
                  <td>
                    <span>
                      S/.{" "}
                      {reporteCajaResumido !== null
                        ? parseFloat(ticketInterno?.total).toFixed(2)
                        : "0.00"}
                    </span>
                  </td>
                </tr> */}
                <tr>
                  <td>
                    <span>TOTAL</span>
                  </td>
                  <td>
                    <span>
                      S/.{" "}
                      {reporteCajaResumido !== null
                        ? parseFloat(total?.efectivo).toFixed(2)
                        : "0.00"}
                    </span>
                  </td>
                  <td>
                    <span>
                      S/.{" "}
                      {reporteCajaResumido !== null
                        ? parseFloat(total?.tarjeta).toFixed(2)
                        : "0.00"}
                    </span>
                  </td>
                  <td>
                    <span>
                      S/.{" "}
                      {reporteCajaResumido !== null
                        ? parseFloat(total?.yape).toFixed(2)
                        : "0.00"}
                    </span>
                  </td>
                  <td>
                    <span>
                      S/.{" "}
                      {reporteCajaResumido !== null
                        ? parseFloat(total?.total).toFixed(2)
                        : "0.00"}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className={styles["table-list-cierre-caja"]}>
          <DataTableAccordeon
            header={columns}
            body={reporteCaja}
            /*      actions={buttons} */
            idTable={idTable}
            headerAccordeon={columnsAccordeon}
            buttonsAccordeon={buttonsAccordeon}
            isAccordeon
            withAvatar
            loading={loadingReporte}
          ></DataTableAccordeon>
        </div>
      )}
    </div>
  );
};
