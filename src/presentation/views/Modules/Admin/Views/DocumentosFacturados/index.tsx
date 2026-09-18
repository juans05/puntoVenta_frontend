import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Tab } from "../../../../../../components/Layout";
import { Toggle } from "../../../../../../components/Toggle";
import Input from "../../../../../../components/Input";
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
import { Button, Card, Title, LineChart, DonutChart } from "@tremor/react";
import { Icon } from "@iconify/react";
import { Toaster } from "sonner";
import { printTable } from "../../../../../../helpers/functions/printTitle";
import { title } from "../../../../../../infraestructure/MData/MData";
import { getNacionalities } from "../../../../../../redux/reducers/extensiones/extensiones..reducer";
import {
  generarPDF,
  getAllVentas,
  anularComprobante,
} from "../../../../../../redux/reducers/Admin/ventas/ventasRealizadas.reducer";
import { VentasModal } from "../../../../../../components/Modal/Admin/Ventas";
import moment from "moment";
import { Calendar } from "../../../../../../components/Date";
import { Indicadores } from "./Indicadores/Indicadores";
import ExportExcel from "../../../../../../components/ExportExcel/ExportExcel";
import { EmitirNotaModal } from "../../../../../../components/Modal/Admin/Notas/EmitirNotaModal";
import { toast } from "sonner";
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
  const navigate = useNavigate();
  const [dateHistory, setDateHistory] = useState<IDataHistory>(dataHistory);
  const { dateStart, dateEnd } = dateHistory;
  const [filterTipo, setFilterTipo] = useState<string>("todos");

  const [opcionesAvanzadas, setOpcionesAvanzadas] = useState(false);
  const [numeroDocumento, setNumeroDocumento] = useState("");
  const [fechaRegistroInicio, setFechaRegistroInicio] = useState("");
  const [fechaRegistroFin, setFechaRegistroFin] = useState("");

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
      tipoDocumentoVentaId: value?.tipoDocumentoVentaId,
    };
  });

  // Filter by document type
  const filteredVentas = filterTipo === "todos"
    ? newDataVentas
    : newDataVentas?.filter((v: any) => {
        if (filterTipo === "1") return v.tipoDocumentoVentaId === 1;
        if (filterTipo === "2") return v.tipoDocumentoVentaId === 2;
        if (filterTipo === "3") return v.tipoDocumentoVentaId === 3;
        return true;
      });

  // Count by type
  const countFacturas = newDataVentas?.filter((v: any) => v.tipoDocumentoVentaId === 1)?.length || 0;
  const countBoletas = newDataVentas?.filter((v: any) => v.tipoDocumentoVentaId === 2)?.length || 0;
  const countOtros = newDataVentas?.filter((v: any) => v.tipoDocumentoVentaId !== 1 && v.tipoDocumentoVentaId !== 2)?.length || 0;

  // Totales por tipo de documento (Notas de Credito restan del Total Neto: reducen la venta)
  const sumarPorTipo = (tipo: number) =>
    newDataVentas?.filter((v: any) => v.tipoDocumentoVentaId === tipo)?.reduce((acc: number, v: any) => acc + (v.total || 0), 0) || 0;
  const totalFacturas = sumarPorTipo(1);
  const totalBoletas = sumarPorTipo(2);
  const totalNotasVenta = sumarPorTipo(3);
  const totalNotasCredito = sumarPorTipo(4);
  const totalNotasDebito = sumarPorTipo(5);
  const totalNeto = totalFacturas + totalBoletas + totalNotasVenta + totalNotasDebito - totalNotasCredito;
  const formatSoles = (n: number) => `S/ ${Intl.NumberFormat("es-PE", { minimumFractionDigits: 2 }).format(n || 0)}`;

  // Serie diaria para el grafico de lineas: agrupa por fecha de registro (dd/mm/yyyy)
  const serieDiaria = useMemo(() => {
    const porDia: Record<string, any> = {};
    (newDataVentas || []).forEach((v: any) => {
      const dia = v.fechaRegistro ? String(v.fechaRegistro).split(" ")[0] : "Sin fecha";
      if (!porDia[dia]) {
        porDia[dia] = { fecha: dia, Facturas: 0, Boletas: 0, "Notas Crédito": 0, "Notas Débito": 0, "Notas Venta": 0, Total: 0 };
      }
      const monto = v.total || 0;
      if (v.tipoDocumentoVentaId === 1) porDia[dia].Facturas += monto;
      else if (v.tipoDocumentoVentaId === 2) porDia[dia].Boletas += monto;
      else if (v.tipoDocumentoVentaId === 4) porDia[dia]["Notas Crédito"] += monto;
      else if (v.tipoDocumentoVentaId === 5) porDia[dia]["Notas Débito"] += monto;
      else if (v.tipoDocumentoVentaId === 3) porDia[dia]["Notas Venta"] += monto;
      porDia[dia].Total += monto;
    });
    return Object.values(porDia).sort(
      (a: any, b: any) => moment(a.fecha, "DD/MM/YYYY").valueOf() - moment(b.fecha, "DD/MM/YYYY").valueOf()
    );
  }, [newDataVentas]);

  // Dona 1: comprobantes pagados vs al credito (EsCredito, no depende de metodo de pago)
  const dataCreditoContado = useMemo(() => {
    const alCredito = newDataVentas?.filter((v: any) => v.esCredito)?.length || 0;
    const pagado = (newDataVentas?.length || 0) - alCredito;
    return [
      { nombre: "Pagado", cantidad: pagado },
      { nombre: "Al Crédito", cantidad: alCredito },
    ];
  }, [newDataVentas]);

  // Dona 2: monto cobrado por metodo de pago (Efectivo/Tarjeta/Transferencia/etc.)
  const dataMetodosPago = useMemo(() => {
    const porMetodo: Record<string, number> = {};
    (ventas || []).forEach((v: any) => {
      (v.pagos || []).forEach((p: any) => {
        const key = p.metodoPago || "Otro";
        porMetodo[key] = (porMetodo[key] || 0) + (p.monto || 0);
      });
    });
    return Object.entries(porMetodo).map(([nombre, monto]) => ({ nombre, monto }));
  }, [ventas]);

  const [notaComprobante, setNotaComprobante] = useState<any>(null);
  const [tipoNotaElegido, setTipoNotaElegido] = useState<number>(4);

  const verProductosMain = (data: any) => {
    dispatch(generarPDF(data?.idComprobante));
  };

  const esFacturaOBoleta = (data: any) => data?.tipoDocumentoVentaId === 1 || data?.tipoDocumentoVentaId === 2;
  const estaAnulado = (data: any) => data?.estadoComprobante === "ANULADO";

  const abrirNota = (data: any, tipoNota: number) => {
    if (estaAnulado(data)) return toast.error("El comprobante ya está anulado");
    if (!esFacturaOBoleta(data)) return toast.error("Solo se puede emitir una nota contra una Factura o Boleta");
    setTipoNotaElegido(tipoNota);
    setNotaComprobante(data);
  };

  const handleAnular = (data: any) => {
    if (estaAnulado(data)) return toast.error("El comprobante ya está anulado");
    dispatch(anularComprobante(data?.idComprobante, data?.serieCorrelativo) as any).finally(() =>
      dispatch(getAllVentas(dateStart, dateEnd, { numeroDocumento, fechaRegistroInicio, fechaRegistroFin }))
    );
  };

  const buttonsVentas: ITableButton[] = [
    {
      title: "Descargar Pdf",
      icon: "",
      className: "body__btn-companyBtn",
      classNameIcon: "",
      handleOnClick: verProductosMain,
      iconify: "fa6-solid:file-pdf",
    },
    {
      title: "Anular",
      icon: "",
      className: "body__btn-companyBtn",
      classNameIcon: "",
      handleOnClick: handleAnular,
      iconify: "mdi:cancel",
    },
    {
      title: "Nota de Crédito",
      icon: "",
      className: "body__btn-companyBtn",
      classNameIcon: "",
      texto: "NC",
      handleOnClick: (data: any) => abrirNota(data, 4),
      iconify: "mdi:file-document-minus-outline",
    },
    {
      title: "Nota de Débito",
      icon: "",
      className: "body__btn-companyBtn",
      classNameIcon: "",
      texto: "ND",
      handleOnClick: (data: any) => abrirNota(data, 5),
      iconify: "mdi:file-document-plus-outline",
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
    {
      id: 3,
      icon: "mdi:file-document-plus-outline",
      description: "Total con Facturas",
      value: formatSoles(totalFacturas),
      background: "blue",
    },
    {
      id: 4,
      icon: "mdi:receipt-text-outline",
      description: "Total en Boletas",
      value: formatSoles(totalBoletas),
      background: "light-blue",
    },
    {
      id: 5,
      icon: "mdi:file-document-minus-outline",
      description: "Total en Notas Crédito",
      value: `- ${formatSoles(totalNotasCredito)}`,
      background: "red",
    },
    {
      id: 6,
      icon: "mdi:file-document-plus-outline",
      description: "Total con Notas Débito",
      value: formatSoles(totalNotasDebito),
      background: "green",
    },
    {
      id: 7,
      icon: "mdi:note-outline",
      description: "Total con Notas de Venta",
      value: formatSoles(totalNotasVenta),
      background: "orange",
    },
    {
      id: 8,
      icon: "mdi:cash-multiple",
      description: "Total Neto",
      value: formatSoles(totalNeto),
      background: "green",
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
  const getData = filterTipo === "todos" ? selectedTab?.data : filteredVentas;
  // const getLabel = selectedTab && selectedTab.label;
  const getBtnsHeader = selectedTab && selectedTab.btnsHeader;

  useEffect(() => {
    setLoadingDocs(true);
    dispatch(getAllVentas(dateStart, dateEnd, { numeroDocumento, fechaRegistroInicio, fechaRegistroFin })).finally(() => setLoadingDocs(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

            <div className={styles.toolbar}>
              <div className={styles.toolbarActions}>
                <button className={styles.toolbarLink} style={{ color: "#2997FE" }} onClick={() => navigate("/dashboard/nueva-factura/factura")}>
                  <Icon icon="mdi:file-document-plus-outline" /> Crear Factura
                </button>
                <button className={styles.toolbarLink} style={{ color: "#17C653" }} onClick={() => navigate("/dashboard/nueva-factura/boleta")}>
                  <Icon icon="mdi:receipt-text-outline" /> Crear Boleta
                </button>
              </div>
              <label className={styles.advancedToggle}>
                Opciones avanzada
                <Toggle isOn={opcionesAvanzadas} handleToggle={() => setOpcionesAvanzadas(!opcionesAvanzadas)} colorOne="#2997FE" colorTwo="#ccc" id="toggleOpcionesAvanzadas" />
              </label>
            </div>

            {opcionesAvanzadas && (
              <div className={styles.advancedPanel}>
                <p className={styles.advancedTitle}>Opciones Avanzadas</p>
                <p className={styles.advancedSubtitle}>A continuación puedes filtrar por fecha de registro o buscar un cliente por su RUC/DNI.</p>
                <div className={styles.advancedGrid}>
                  <Calendar onChange={(v: string) => setFechaRegistroInicio(v)} name="fechaRegistroInicio" text="Fecha Registro Desde" />
                  <Calendar onChange={(v: string) => setFechaRegistroFin(v)} name="fechaRegistroFin" text="Fecha Registro Hasta" />
                  <div>
                    <Input isLabel label="RUC / DNI" name="numeroDocumento" value={numeroDocumento} onChange={(e: any) => setNumeroDocumento(e.target.value)} />
                  </div>
                  <button
                    className={styles.buscarBtn}
                    onClick={() => {
                      setLoadingDocs(true);
                      dispatch(getAllVentas(dateStart, dateEnd, { numeroDocumento, fechaRegistroInicio, fechaRegistroFin })).finally(() => setLoadingDocs(false));
                    }}
                  >
                    Buscar
                  </button>
                </div>
              </div>
            )}

            <div className={styles.filterTabs}>
              <button
                className={`${styles.tab} ${filterTipo === "todos" ? styles.active : ""}`}
                onClick={() => setFilterTipo("todos")}
              >
                Todos ({newDataVentas?.length || 0})
              </button>
              <button
                className={`${styles.tab} ${filterTipo === "1" ? styles.active : ""}`}
                onClick={() => setFilterTipo("1")}
              >
                Facturas ({countFacturas})
              </button>
              <button
                className={`${styles.tab} ${filterTipo === "2" ? styles.active : ""}`}
                onClick={() => setFilterTipo("2")}
              >
                Boletas ({countBoletas})
              </button>
              <button
                className={`${styles.tab} ${filterTipo === "3" ? styles.active : ""}`}
                onClick={() => setFilterTipo("3")}
              >
                Otros ({countOtros})
              </button>
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
                          text="Fecha Documento Desde"
                        />
                        <Calendar
                          onChange={handleChangeDate}
                          name="dateEnd"
                          text="Fecha Documento Hasta"
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

            <div className={styles.chartsRow}>
              <Card className={styles.chartCard}>
                <Title>Facturas vs Boletas vs Notas (por fecha de registro)</Title>
                {serieDiaria.length === 0 ? (
                  <p className={styles.advancedSubtitle}>No hay datos en el periodo seleccionado.</p>
                ) : (
                  <LineChart
                    className="mt-4 h-72"
                    data={serieDiaria}
                    index="fecha"
                    categories={["Facturas", "Boletas", "Notas Crédito", "Notas Débito", "Notas Venta", "Total"]}
                    colors={["cyan", "violet", "rose", "emerald", "amber", "slate"]}
                    valueFormatter={formatSoles}
                  />
                )}
              </Card>
              <div className={styles.donutsCol}>
                <Card>
                  <Title>Pagado vs Al Crédito</Title>
                  <DonutChart
                    className="mt-4 h-40"
                    data={dataCreditoContado}
                    category="cantidad"
                    index="nombre"
                    colors={["emerald", "violet"]}
                  />
                </Card>
                <Card>
                  <Title>Métodos de Pago</Title>
                  {dataMetodosPago.length === 0 ? (
                    <p className={styles.advancedSubtitle}>Sin pagos registrados.</p>
                  ) : (
                    <DonutChart
                      className="mt-4 h-40"
                      data={dataMetodosPago}
                      category="monto"
                      index="nombre"
                      valueFormatter={formatSoles}
                      colors={["rose", "cyan", "amber", "violet", "slate"]}
                    />
                  )}
                </Card>
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
      <EmitirNotaModal
        isOpen={!!notaComprobante}
        comprobante={notaComprobante}
        tipoInicial={tipoNotaElegido}
        onClose={() => setNotaComprobante(null)}
        onSuccess={() => dispatch(getAllVentas(dateStart, dateEnd, { numeroDocumento, fechaRegistroInicio, fechaRegistroFin }))}
      />
      <Toaster richColors position="top-right" />
    </>
  );
};
