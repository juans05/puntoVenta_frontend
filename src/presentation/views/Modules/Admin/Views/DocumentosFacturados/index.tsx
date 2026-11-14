import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Input from "../../../../../../components/Input";
// Mismo diseño que Compras > Facturación: se reutiliza su hoja de estilos.
import styles from "../Compras/compras.module.css";
import local from "./documentosFacturados.module.css";
import { TableSkeleton } from "../../../../../../components/Skeleton";
import { RootState } from "../../../../../../redux/rootState";
import { useAppDispatch, useAppSelector } from "../../../../../../redux/store";
import { Card, Title, LineChart, DonutChart } from "@tremor/react";
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
import ExportExcel from "../../../../../../components/ExportExcel/ExportExcel";
import { EmitirNotaModal } from "../../../../../../components/Modal/Admin/Notas/EmitirNotaModal";
import { toast } from "sonner";
import { VentasSunatModal } from "./VentasSunatModal";
moment.locale("es");
interface IDataHistory {
  dateStart: string;
  dateEnd: string;
}

// Rango por defecto de 30 dias (igual que la pantalla de Notas de Credito/Debito) -- antes
// arrancaba en "solo hoy", asi que un documento creado ayer no aparecia hasta que el
// usuario ajustara el filtro de fecha a mano.
const dataHistory: IDataHistory = {
  dateStart: moment(new Date()).subtract(30, "days").format("DD/MM/YYYY"),
  dateEnd: moment(new Date()).format("DD/MM/YYYY"),
};

/* const dataFusionada = fusionarArreglos(dataCustomers, dataSuppliers); */
export const DocumentosFacturados = () => {
  const navigate = useNavigate();
  const [ventasSunatOpen, setVentasSunatOpen] = useState(false);
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
      tipoDocumento: value?.tipoDocumentoVenta || "Ticket Interno",
      tipoDocumentoVentaId: value?.tipoDocumentoVentaId,
    };
  });

  // Filter by document type
  const filteredVentas = filterTipo === "todos"
    ? newDataVentas
    : newDataVentas?.filter((v: any) => {
        if (filterTipo === "1") return v.tipoDocumentoVentaId === 1;
        if (filterTipo === "2") return v.tipoDocumentoVentaId === 2;
        // "Otros" (tab 3) agrupa todo lo que no es Factura ni Boleta -- mismo criterio que
        // countOtros de abajo, que es lo que el numero del tab le promete al usuario.
        if (filterTipo === "3") return v.tipoDocumentoVentaId !== 1 && v.tipoDocumentoVentaId !== 2;
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
    setNotaComprobante({
      ...data,
      idComprobante: data?.idComprobante,
      // /facturacion/listar devuelve el detalle con "producto" como nombre plano (a diferencia
      // de /facturacion/buscar, que usa la entidad con producto.nombre) -- se normaliza aqui al
      // mismo shape {nombre, cantidad, valorUnitario, valorUnitarioTotal} que espera el modal.
      detalle: (data?.comprobanteDetalles || []).map((d: any) => ({
        nombre: d.producto ?? "Producto",
        cantidad: d.cantidad,
        valorUnitario: d.valorUnitario,
        valorUnitarioTotal: d.valorUnitarioTotal,
      })),
    });
  };

  const handleAnular = (data: any) => {
    if (estaAnulado(data)) return toast.error("El comprobante ya está anulado");
    dispatch(anularComprobante(data?.idComprobante, data?.serieCorrelativo) as any).finally(() =>
      dispatch(getAllVentas(dateStart, dateEnd, { numeroDocumento, fechaRegistroInicio, fechaRegistroFin }))
    );
  };

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
  const filas = filteredVentas ?? [];
  const buscar = () => {
    setLoadingDocs(true);
    dispatch(getAllVentas(dateStart, dateEnd, { numeroDocumento, fechaRegistroInicio, fechaRegistroFin })).finally(() => setLoadingDocs(false));
  };
  return (
    <>
      <div>
        <div className={styles.headerTop}>
          <div>
            <h3>Documentos Facturados</h3>
            <p className={styles.subtitle}>Comprobantes emitidos del {dateStart} al {dateEnd}</p>
          </div>
          <div className={styles.headerActions}>
            <button className={styles.historialBtn} onClick={() => setVentasSunatOpen(true)}>
              ☁️ Traer de SUNAT
            </button>
            <button className={styles.historialBtn} onClick={() => navigate("/dashboard/nueva-factura/boleta")}>
              🧾 Crear Boleta
            </button>
            <button className={styles.registrarBtn} onClick={() => navigate("/dashboard/nueva-factura/factura")}>
              + Crear Factura
            </button>
          </div>
        </div>

        <div className={styles.kpiGrid}>
          {indicadores.map((i) => (
            <div key={i.id} className={styles.kpiCard}>
              <div className={styles.kpiLabel}>{i.description}</div>
              <div className={styles.kpiValue}>{i.value}</div>
            </div>
          ))}
        </div>

        <div className={styles.toolbar} style={{ alignItems: "flex-end" }}>
          <Calendar onChange={handleChangeDate} name="dateStart" text="Fecha Documento Desde" />
          <Calendar onChange={handleChangeDate} name="dateEnd" text="Fecha Documento Hasta" />
          <span style={{ flex: 1 }} />
          <ExportExcel filename={fileName} refTable={idTable} booleanState={downloaded}></ExportExcel>
          <button className={styles.filtrosBtn} onClick={() => setOpcionesAvanzadas(!opcionesAvanzadas)}>
            🎚 Opciones avanzadas
          </button>
        </div>

        {opcionesAvanzadas && (
          <div className={styles.filtrosPanel}>
            <Calendar onChange={(v: string) => setFechaRegistroInicio(v)} name="fechaRegistroInicio" text="Fecha Registro Desde" />
            <Calendar onChange={(v: string) => setFechaRegistroFin(v)} name="fechaRegistroFin" text="Fecha Registro Hasta" />
            <div>
              <Input isLabel label="RUC / DNI" name="numeroDocumento" value={numeroDocumento} onChange={(e: any) => setNumeroDocumento(e.target.value)} />
            </div>
            <button className={styles.registrarBtn} onClick={buscar}>
              Buscar
            </button>
          </div>
        )}

        <div className={local.chartsRow}>
          <Card className={local.chartCard}>
            <Title>Facturas vs Boletas vs Notas (por fecha de registro)</Title>
            {serieDiaria.length === 0 ? (
              <p className={styles.subtitle}>No hay datos en el periodo seleccionado.</p>
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
          <div className={local.donutsCol}>
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
                <p className={styles.subtitle}>Sin pagos registrados.</p>
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

        <div className={styles.tabs}>
          {([
            ["todos", "📄 Todos", newDataVentas?.length || 0],
            ["1", "📄 Facturas", countFacturas],
            ["2", "🧾 Boletas", countBoletas],
            ["3", "📁 Otros", countOtros],
          ] as [string, string, number][]).map(([k, label, n]) => (
            <button key={k} className={`${styles.tab} ${filterTipo === k ? styles.tabActive : ""}`} onClick={() => setFilterTipo(k)}>
              {label} <span className={styles.tabBadge}>{n}</span>
            </button>
          ))}
        </div>

        {loadingDocs ? (
          <div className={styles.panel}><TableSkeleton columns={9} /></div>
        ) : filas.length === 0 ? (
          <div className={styles.panel}>
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>🔍</div>
              <h4>Nada por aquí</h4>
              <p>No hay comprobantes emitidos en este periodo con los filtros elegidos.</p>
            </div>
          </div>
        ) : (
          <div className={`${styles.tableWrap} ${styles.tableWrapTabbed}`}>
            <table className={styles.table} id={idTable}>
              <thead>
                <tr>
                  <th>N°</th>
                  <th>Nombres y Apellidos</th>
                  <th>Tipo Documento</th>
                  <th>Serie - Correlativo</th>
                  <th>Nombre Vendedor</th>
                  <th>Fecha Registro</th>
                  <th>Total</th>
                  <th>Estado</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filas.map((v: any, i: number) => (
                  <tr key={v.idComprobante ?? i}>
                    <td data-label="N°">{v.index}</td>
                    <td data-label="Nombres y Apellidos">{v.clienteNombre || "SIN ESPECIFICAR"}</td>
                    <td data-label="Tipo Documento">{v.tipoDocumento}</td>
                    <td data-label="Serie - Correlativo">{v.serieCorrelativo}</td>
                    <td data-label="Nombre Vendedor">{v.nombreVendedor ?? "-"}</td>
                    <td data-label="Fecha Registro">{v.fechaRegistro}</td>
                    <td data-label="Total">{formatSoles(v.total)}</td>
                    <td data-label="Estado">
                      <span className={`${styles.estado} ${estaAnulado(v) ? styles.anulado : styles.confirmado}`}>
                        {v.estadoComprobante}
                      </span>
                    </td>
                    <td className={styles.accionesCell}>
                      {v.estadoEnvioSunat !== "PENDIENTE" && (
                        <button className={styles.verBtn} title="Descargar Pdf" onClick={() => verProductosMain(v)}>
                          PDF
                        </button>
                      )}
                      <button className={styles.editarBtn} title="Nota de Crédito" onClick={() => abrirNota(v, 4)}>
                        NC
                      </button>
                      <button className={styles.editarBtn} title="Nota de Débito" onClick={() => abrirNota(v, 5)}>
                        ND
                      </button>
                      {!estaAnulado(v) && (
                        <button className={styles.anularBtn} onClick={() => handleAnular(v)}>
                          Anular
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <VentasModal />
      <VentasSunatModal isOpen={ventasSunatOpen} onClose={() => setVentasSunatOpen(false)} />
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
