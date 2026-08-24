import { useEffect, useState } from "react";
import { Tab } from "../../../../../../components/Layout";
/* import { Sidebar } from "../../../../../../components/Layout/Sidebar"; */
import styles from "./documentosFacturados.module.css";
/* import { HiOutlineUserGroup } from "react-icons/hi";
import { IoIosBusiness } from "react-icons/io"; */
import { ImWoman } from "react-icons/im";
import { IHeaderTable } from "../../../../../../application/models/Header/IHeaderTable";
import { ITableButton } from "../../../../../../components/Datatable/table/TableButton";
import { UserTable } from "../Usuarios/UserTable";
import { ITableHeaderProps } from "../Usuarios/UserTable/UserTableHeader";
import { RootState } from "../../../../../../redux/rootState";
import { useAppDispatch, useAppSelector } from "../../../../../../redux/store";
import { Button } from "@tremor/react";
import { Icon } from "@iconify/react";
import { Toaster } from "sonner";
import { printTable } from "../../../../../../helpers/functions/printTitle";
import { title } from "../../../../../../infraestructure/MData/MData";
import { getNacionalities } from "../../../../../../redux/reducers/extensiones/extensiones..reducer";
import {
  generarPDF,
  getAllVentas,
} from "../../../../../../redux/reducers/Admin/ventas/ventasRealizadas.reducer";
import { VentasModal } from "../../../../../../components/Modal/Admin/Ventas";
import moment from "moment";
import { Calendar } from "../../../../../../components/Date";
import { Indicadores } from "./Indicadores/Indicadores";
import ExportExcel from "../../../../../../components/ExportExcel/ExportExcel";
const header: IHeaderTable[] = [
  /*        { type: "seleccion", alias: "Seleccionar" }, */
  /*   { type: "checked", alias: "Checked" }, */
  { type: "id", alias: "N°" },
  { type: "clienteNombre", alias: "Nombres y Apellidos" },
  { type: "tipoDocumento", alias: "TipoDocumento" },
  { type: "serieCorrelativo", alias: "Serie - Correlativo" },
  { type: "nombreVendedor", alias: "Nombre Vendedor" },
  { type: "fechaRegistro", alias: "Fecha Registro" },
  { type: "total", alias: "Total" },
  { type: "estadoComprobante", alias: "Estado" },
  { type: "accion", alias: "Accion" },
];

moment.locale("es");
interface IDataHistory {
  dateStart: string;
  dateEnd: string;
}

const dataHistory: IDataHistory = {
  dateStart: moment(new Date()).format("DD/MM/YYYY"),
  dateEnd: moment(new Date()).format("DD/MM/YYYY"),
};

/* const dataFusionada = fusionarArreglos(dataCustomers, dataSuppliers); */
export const DocumentosFacturados = () => {
  const [dateHistory, setDateHistory] = useState<IDataHistory>(dataHistory);
  const { dateStart, dateEnd } = dateHistory;
  const handleChangeDate = (value: string, name: string) => {
    console.log("value", value);

    setDateHistory({
      ...dateHistory,
      [name]: value,
    });
  };

  const dispatch = useAppDispatch();
  const { ventas }: any = useAppSelector((state: RootState) => state.ventas);
  const [loadingDocs, setLoadingDocs] = useState<boolean>(true);

  const newDataVentas = ventas?.map((value: any) => {
    return {
      ...value,
      id: value?.anfitrionaId,
      // fullName: `${value?.nombres}`,
      nombre: value?.clienteId === null ? "SIN ESPECIFICAR" : value.clienteId,
      // img: value?.imagenProducto? 'https://dcuk1cxrnzjkh.cloudfront.net/imagesproducto/029832L.jpg' : value?.imagenProducto,
      email: "",
      nacionalidad: value?.nacionalidadDescripcion,
      movil:
        value?.celular === "" || value?.celular === null
          ? "Sin especificar"
          : value?.celular,
      direccion:
        value?.direccion === "" || value?.direccion === null
          ? "Sin especificar"
          : value?.direccion,
      nombreVendedor: value?.nombreVendedor,
      fechaRegistro: value?.fecha,
      serieCorrelativo: `${value?.serie} - ${value?.correlativo}`,
      total: value?.valorTotal,
      estadoComprobante: value?.estadoComprobante,
      tipoDocumento:
        value?.tipoDocumentoVentaId === 1
          ? "factura"
          : value?.tipoDocumentoVentaId === 2
          ? "Boleta"
          : "Ticket Interno",
    };
  });

  const verProductosMain = (data: any) => {
    dispatch(generarPDF(data?.idComprobante));
  };

  const buttonsVentas: ITableButton[] = [
    {
      title: "Descargar Pdf",
      icon: "",
      className: "body__btn-companyBtn",
      classNameIcon: "",
      handleOnClick: verProductosMain,
      iconify: "fa6-solid:file-pdf",

      /* ri:ball-pen-line */
    },
  ];

  const totalPrecio = ventas?.reduce((total: number, persona: any) => {
    return total + persona.valorTotal;
  }, 0);

  const totalVendido = totalPrecio ? totalPrecio : 0; //listRenta?.length;
  const totalRegistros = ventas?.length ? ventas?.length : 0;
  const indicadores = [
    {
      id: 1,
      icon: "grommet-icons:money",
      description: "Total Vendido",
      value: `S/. ${totalVendido}`,
      background: "red",
    },
    {
      id: 2,
      icon: "ic:baseline-discount",
      description: "Total de Registros",
      value: totalRegistros,
      background: "blue",
    },
  ];

  const tabs: Tab[] = [
    {
      id: 1,

      label: "Anfitrionas",
      icon: ImWoman,
      data: newDataVentas,
      dataBtns: buttonsVentas,
      // btnsHeader: btnsAnfitrionas,
    },
  ];

  const [headerClients] = useState<IHeaderTable[] | ITableHeaderProps[] | any>(
    header
  );
  console.log(headerClients);
  const [activeTab /* setActiveTab */] = useState(1);
  const selectedTab = tabs.find((tab) => tab.id === activeTab);
  const getButtons = selectedTab && selectedTab.dataBtns;
  const getData = selectedTab && selectedTab.data;
  // const getLabel = selectedTab && selectedTab.label;
  const getBtnsHeader = selectedTab && selectedTab.btnsHeader;

  useEffect(() => {
    setLoadingDocs(true);
    dispatch(getAllVentas(dateStart, dateEnd)).finally(() => setLoadingDocs(false));
  }, [dateStart, dispatch, dateEnd]);
  useEffect(() => {
    printTable(`${title.name}::ANFITRIONAS|CLIENTES|PROVEEDORES`);
  }, []);
  useEffect(() => {
    dispatch(getNacionalities());
  }, [dispatch]);

  const fileName = "Documentos_Facturados";
  const idTable = "documentos_facturados";
  const [downloaded] = useState(true);
  return (
    <>
      <div className={styles.main}>
        <div className={styles.outlet}>
          <div className={styles.content}>
            <div className={styles.title}>
              <h3>Documentos Facturados</h3>
            </div>

            <div className={`${styles["encabezado-principal"]}`}></div>

            <div>
              <div className={`${styles["indicador"]}`}>
                <Indicadores data={indicadores} />
                <div className={`${styles["leyenda"]}`}>
                  <div>
                    <div className={styles["toggle-date"]}>
                      <div className={`${styles["date"]}`}>
                        <Calendar
                          onChange={handleChangeDate}
                          name="dateStart"
                          text="Fecha Inicio"
                        />
                        <Calendar
                          onChange={handleChangeDate}
                          name="dateEnd"
                          text="Fecha Fin"
                        />
                        <ExportExcel
                          filename={fileName}
                          refTable={idTable}
                          booleanState={downloaded}
                        ></ExportExcel>
                      </div>
                      
                    </div>
                    
                  </div>
                </div>
              </div>
            </div>

            <div className={`${styles["btns-header"]}`}>
              {getBtnsHeader?.map((value: any) => {
                return (
                  <Button onClick={value?.onClick}>
                    {value?.icon != "" && <Icon icon={value?.icon} />}

                    <p>{value?.value}</p>
                  </Button>
                );
              })}
            </div>
            <div className="container__hidden">
                  <UserTable
                    header={headerClients}
                    body={getData}
                    actions={getButtons}
                    idTable={idTable} />
                </div>
            <UserTable
              header={headerClients}
              body={getData}
              actions={getButtons}
              idTable={idTable}
              loading={loadingDocs}
            />
          </div>
        </div>
      </div>
      <VentasModal />
      <Toaster richColors position="top-right" />
    </>
  );
};
