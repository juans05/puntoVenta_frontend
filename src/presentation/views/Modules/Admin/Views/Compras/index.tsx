import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./compras.module.css";
import { useAppDispatch, useAppSelector } from "../../../../../../redux/store";
import { RootState } from "../../../../../../redux/rootState";
import {
  anularCompra,
  getCompras,
  importarXmlCompra,
} from "../../../../../../redux/reducers/Admin/compras/compra.reducer";
import { getSucursales } from "../../../../../../redux/reducers/extensiones/extensiones..reducer";
import { CompraVerModal } from "../../../../../../components/Modal/Admin/Compra/CompraVerModal";
import { FormularioCompra } from "./FormularioCompra";
import { Toaster, toast } from "sonner";
import { printTable } from "../../../../../../helpers/functions/printTitle";
import { title } from "../../../../../../infraestructure/MData/MData";

const PAGE_SIZE = 200;
const formatSoles = (n: number) => `S/ ${Number(n).toFixed(2)}`;
const MESES_CORTOS = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "set", "oct", "nov", "dic"];
const formatCorto = (d: Date) => `${d.getDate()} ${MESES_CORTOS[d.getMonth()]}`;
const toISO = (d: Date) => d.toISOString().slice(0, 10);

type Periodo = "hoy" | "semana" | "mes" | "todo";
type Tab = "cpe" | "ordenes" | "sindoc";

const rangoPorPeriodo = (periodo: Periodo): { start?: Date; end: Date } => {
  const end = new Date();
  if (periodo === "todo") return { end };
  const start = new Date();
  if (periodo === "hoy") return { start, end };
  if (periodo === "semana") start.setDate(start.getDate() - 7);
  if (periodo === "mes") start.setDate(1);
  return { start, end };
};

export const Compras = () => {
  const dispatch = useAppDispatch();
  const { compras }: any = useAppSelector((state: RootState) => state.compras);
  const { me }: any = useAppSelector((state: RootState) => state.auth);

  const [compraEditandoId, setCompraEditandoId] = useState<number | undefined>(undefined);
  const [compraViendoId, setCompraViendoId] = useState<number | undefined>(undefined);
  const [prefillXml, setPrefillXml] = useState<any>(null);
  const [importandoXml, setImportandoXml] = useState(false);
  const xmlInputRef = useRef<HTMLInputElement>(null);

  const [vista, setVista] = useState<"lista" | "registrar" | "formulario">("lista");
  const [metodoTraer, setMetodoTraer] = useState<"sunat" | "xml" | "pdf" | "manual" | null>(null);
  const [sucursalRegistroId, setSucursalRegistroId] = useState<number>(0);
  const [usuarioSol, setUsuarioSol] = useState("");
  const [claveSol, setClaveSol] = useState("");
  const [verClaveSol, setVerClaveSol] = useState(false);

  const [busqueda, setBusqueda] = useState("");
  const [periodo, setPeriodo] = useState<Periodo>("mes");
  const [filtrosAbiertos, setFiltrosAbiertos] = useState(false);
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [sucursalIdFiltro, setSucursalIdFiltro] = useState<number>(0);
  const [tabActiva, setTabActiva] = useState<Tab>("cpe");
  const { sucursales }: any = useAppSelector((state: RootState) => state.extentions);

  const { start, end } = useMemo(() => rangoPorPeriodo(periodo), [periodo]);
  const startDate = fechaDesde || (start ? toISO(start) : "");
  const endDate = fechaHasta || toISO(end);

  const recargar = () => {
    dispatch(
      getCompras(1, PAGE_SIZE, {
        value: busqueda.trim() || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        sucursalId: sucursalIdFiltro || undefined,
      }) as any
    );
  };

  useEffect(() => {
    recargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [periodo, fechaDesde, fechaHasta, sucursalIdFiltro]);

  useEffect(() => {
    const timeout = setTimeout(recargar, 350);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [busqueda]);

  useEffect(() => {
    printTable(`${title.name}::COMPRAS`);
    dispatch(getSucursales() as any);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totalComprado = compras?.reduce((sum: number, c: any) => sum + (Number(c.total) || 0), 0) || 0;
  const documentos = compras?.length || 0;
  const topProveedor = compras?.reduce(
    (max: any, c: any) => (!max || (Number(c.total) || 0) > (Number(max.total) || 0) ? c : max),
    null
  )?.proveedor;

  const confirmarAnular = (id: number) => {
    if (!window.confirm("¿Seguro que deseas anular esta compra? Se revertirá el stock ingresado.")) return;
    dispatch(anularCompra(id) as any);
  };

  const abrirRegistrar = () => {
    setMetodoTraer(null);
    setVista("registrar");
  };

  const abrirManual = () => {
    setCompraEditandoId(undefined);
    setPrefillXml(null);
    setVista("formulario");
  };

  const abrirPdf = () => {
    toast("Traer factura desde PDF: próximamente. Por ahora usa XML o Llenado Manual.");
  };

  const abrirSelectorXml = () => {
    xmlInputRef.current?.click();
  };

  const handleXmlSeleccionado = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const archivo = e.target.files?.[0];
    e.target.value = ""; // permite volver a elegir el mismo archivo despues
    if (!archivo) return;

    setImportandoXml(true);
    try {
      const preview = await importarXmlCompra(archivo);
      setPrefillXml(preview);
      setCompraEditandoId(undefined);
      setVista("formulario");
      toast.success("XML leído correctamente, revisa los datos antes de guardar");
    } catch (error: any) {
      toast.error(error?.response?.data?.message ?? "No se pudo leer el XML");
    } finally {
      setImportandoXml(false);
    }
  };

  const abrirEditar = (id: number) => {
    setPrefillXml(null);
    setCompraEditandoId(id);
    setVista("formulario");
  };

  const rangoTexto = start ? `${formatCorto(start)} – ${formatCorto(end)}` : "Todo el historial";
  const nombreUsuario = (me?.nombre || "").toString().toUpperCase();

  if (vista === "registrar") {
    return (
      <div>
        <div className={styles.registrarHeader}>
          <button className={styles.backBtn} onClick={() => setVista("lista")}>
            ←
          </button>
          <div>
            <h3>Registrar Factura de Compra</h3>
            <p className={styles.subtitle}>Registra la factura de tu proveedor en segundos.</p>
          </div>
          <div className={styles.headerActions}>
            <button className={styles.historialBtn} onClick={() => { setPeriodo("todo"); setVista("lista"); }}>
              🕐 Historial
            </button>
          </div>
        </div>

        <div className={styles.registrarTabsRow}>
          <select
            className={styles.periodoSelect}
            value={sucursalRegistroId}
            onChange={(e) => setSucursalRegistroId(Number(e.target.value))}
          >
            <option value={0}>📍 Sucursal</option>
            {(sucursales ?? []).map((s: any) => (
              <option key={s.id} value={s.id}>
                {s.value}
              </option>
            ))}
          </select>
          <div className={styles.docTabs}>
            <button className={`${styles.docTab} ${styles.docTabActive}`}>📄 Factura</button>
            <button className={styles.docTab} onClick={() => toast("Próximamente")}>🧾 Boleta</button>
            <button className={styles.docTab} onClick={() => toast("Próximamente")}>🛒 Orden Compra</button>
            <button className={styles.docTab} onClick={() => toast("Próximamente")}>📁 Otro doc.</button>
            <button className={styles.docTab} onClick={() => toast("Próximamente")}>📝 N. Crédito</button>
            <button className={styles.docTab} onClick={() => toast("Próximamente")}>📝 N. Débito</button>
          </div>
        </div>

        <div className={styles.comoTraerCard}>
          <div className={styles.comoTraerTitle}>
            <span className={styles.comoTraerIcon}>⬇️</span> ¿Cómo quieres traer la factura?
          </div>
          <div className={styles.opcionesGrid}>
            <button
              type="button"
              className={`${styles.opcionCard} ${metodoTraer === "sunat" ? styles.opcionCardActive : ""}`}
              onClick={() => setMetodoTraer("sunat")}
            >
              <span className={styles.opcionIcon}>🔍</span>
              <span className={styles.opcionTitle}>Buscar en SUNAT</span>
              <span className={styles.opcionDesc}>Con RUC, serie y correlativo</span>
            </button>
            <button
              type="button"
              className={`${styles.opcionCard} ${metodoTraer === "xml" ? styles.opcionCardActive : ""}`}
              onClick={() => {
                setMetodoTraer("xml");
                abrirSelectorXml();
              }}
            >
              <span className={styles.opcionIcon}>📄</span>
              <span className={styles.opcionTitle}>Subir XML</span>
              <span className={styles.opcionDesc}>Archivo .xml del comprobante</span>
            </button>
            <button
              type="button"
              className={`${styles.opcionCard} ${metodoTraer === "pdf" ? styles.opcionCardActive : ""}`}
              onClick={() => {
                setMetodoTraer("pdf");
                abrirPdf();
              }}
            >
              <span className={styles.opcionIcon}>
                📷 <span className={styles.iaBadge}>+ IA</span>
              </span>
              <span className={styles.opcionTitle}>Foto o PDF</span>
              <span className={styles.opcionDesc}>La leemos automáticamente</span>
            </button>
            <button
              type="button"
              className={`${styles.opcionCard} ${metodoTraer === "manual" ? styles.opcionCardActive : ""}`}
              onClick={() => {
                setMetodoTraer("manual");
                abrirManual();
              }}
            >
              <span className={styles.opcionIcon}>✏️</span>
              <span className={styles.opcionTitle}>Llenar manual</span>
              <span className={styles.opcionDesc}>Escribir los datos</span>
            </button>
          </div>

          {metodoTraer === "sunat" && (
            <>
              <div className={styles.solBanner}>
                ⚠️ Para traer comprobantes desde SUNAT, primero registra tu acceso a Operaciones en Línea (Clave SOL).
              </div>
              <div className={styles.solFields}>
                <div>
                  <label>USUARIO SOL</label>
                  <input value={usuarioSol} onChange={(e) => setUsuarioSol(e.target.value)} />
                </div>
                <div>
                  <label>CLAVE SOL</label>
                  <div className={styles.claveSolWrap}>
                    <input
                      type={verClaveSol ? "text" : "password"}
                      value={claveSol}
                      onChange={(e) => setClaveSol(e.target.value)}
                    />
                    <button type="button" onClick={() => setVerClaveSol(!verClaveSol)}>
                      {verClaveSol ? "🙈" : "👁"}
                    </button>
                  </div>
                </div>
                <button
                  type="button"
                  className={styles.registrarBtn}
                  onClick={() => toast("Buscar en SUNAT: próximamente. Por ahora usa Subir XML o Llenar manual.")}
                >
                  💾 Guardar acceso
                </button>
              </div>
            </>
          )}
        </div>

        <input ref={xmlInputRef} type="file" accept=".xml" hidden onChange={handleXmlSeleccionado} />
        <Toaster richColors position="top-right" duration={2000} />
      </div>
    );
  }

  if (vista === "formulario") {
    return (
      <div>
        <div className={styles.registrarHeader}>
          <button className={styles.backBtn} onClick={() => setVista("lista")}>
            ←
          </button>
          <div>
            <h3>{compraEditandoId ? "Editar compra" : "Registrar Factura de Compra"}</h3>
            <p className={styles.subtitle}>
              {compraEditandoId ? "Corrige los productos, cantidades o datos de la compra." : "Completa los datos del comprobante y del proveedor."}
            </p>
          </div>
        </div>

        <FormularioCompra
          compraId={compraEditandoId}
          prefillXml={prefillXml}
          sucursalIdInicial={sucursalRegistroId || undefined}
          onGuardado={() => {
            setVista("lista");
            setCompraEditandoId(undefined);
            setPrefillXml(null);
            recargar();
          }}
          onCancelar={() => {
            setVista("lista");
            setCompraEditandoId(undefined);
            setPrefillXml(null);
          }}
        />
        <Toaster richColors position="top-right" duration={2000} />
      </div>
    );
  }

  return (
    <div>
      <div className={styles.headerTop}>
        <div>
          <h3>Gestión de compras</h3>
          <p className={styles.subtitle}>
            Resumen de {periodo === "mes" ? "este mes" : periodo === "hoy" ? "hoy" : periodo === "semana" ? "esta semana" : "todo el periodo"} ({rangoTexto})
            {nombreUsuario && ` · ${nombreUsuario}`}
          </p>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.versionBtn} disabled>
            ← Versión anterior
          </button>
          <button className={styles.historialBtn} onClick={() => setPeriodo("todo")}>
            🕐 Historial
          </button>
          <button className={styles.registrarBtn} disabled={importandoXml} onClick={abrirRegistrar}>
            {importandoXml ? "Leyendo XML..." : "+ Registrar compra"}
          </button>
        </div>
      </div>

      <div className={styles.kpiGrid}>
        <div className={styles.kpiCard}>
          <div className={styles.kpiLabel}>Total Comprado</div>
          <div className={styles.kpiValue}>{formatSoles(totalComprado)}</div>
          <div className={styles.kpiSubtext}>sin periodo anterior para comparar</div>
        </div>
        <div className={styles.kpiCard}>
          <div className={styles.kpiLabel}>Documentos</div>
          <div className={styles.kpiValue}>{documentos}</div>
          <div className={styles.kpiSubtext}>{documentos === 0 ? "sin documentos en el periodo" : "compras registradas"}</div>
        </div>
        <div className={styles.kpiCard}>
          <div className={styles.kpiLabel}>Crédito por Pagar</div>
          <div className={styles.kpiValue}>S/ 0.00</div>
          <div className={styles.kpiSubtext}>sin deudas pendientes 🎉</div>
        </div>
        <div className={styles.kpiCard}>
          <div className={styles.kpiLabel}>Top Proveedor</div>
          <div className={styles.kpiValue}>{topProveedor || "—"}</div>
          <div className={styles.kpiSubtext}>{topProveedor ? "mayor monto" : "sin compras en el periodo"}</div>
        </div>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.searchBox}>
          <span>🔍</span>
          <input
            placeholder="Busca por proveedor, RUC o serie-número..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
        <select className={styles.periodoSelect} value={periodo} onChange={(e) => setPeriodo(e.target.value as Periodo)}>
          <option value="hoy">Hoy</option>
          <option value="semana">Última semana</option>
          <option value="mes">Este mes</option>
          <option value="todo">Todo</option>
        </select>
        <button className={styles.filtrosBtn} onClick={() => setFiltrosAbiertos(!filtrosAbiertos)}>
          🎚 Filtros
        </button>
      </div>

      {filtrosAbiertos && (
        <div className={styles.filtrosPanel}>
          <div>
            <label>Desde</label>
            <input type="date" value={fechaDesde} onChange={(e) => setFechaDesde(e.target.value)} />
          </div>
          <div>
            <label>Hasta</label>
            <input type="date" value={fechaHasta} onChange={(e) => setFechaHasta(e.target.value)} />
          </div>
          <div>
            <label>Sucursal</label>
            <select
              className={styles.periodoSelect}
              value={sucursalIdFiltro}
              onChange={(e) => setSucursalIdFiltro(Number(e.target.value))}
            >
              <option value={0}>Todas</option>
              {(sucursales ?? []).map((s: any) => (
                <option key={s.id} value={s.id}>
                  {s.value}
                </option>
              ))}
            </select>
          </div>
          <button
            className={styles.limpiarFiltrosBtn}
            onClick={() => {
              setFechaDesde("");
              setFechaHasta("");
              setSucursalIdFiltro(0);
            }}
          >
            Limpiar filtros
          </button>
        </div>
      )}

      <div className={styles.tabs}>
        <button className={`${styles.tab} ${tabActiva === "cpe" ? styles.tabActive : ""}`} onClick={() => setTabActiva("cpe")}>
          📄 CPE de compra <span className={styles.tabBadge}>{documentos}</span>
        </button>
        <button className={`${styles.tab} ${tabActiva === "ordenes" ? styles.tabActive : ""}`} onClick={() => setTabActiva("ordenes")}>
          🛒 Órdenes
        </button>
        <button className={`${styles.tab} ${tabActiva === "sindoc" ? styles.tabActive : ""}`} onClick={() => setTabActiva("sindoc")}>
          📃 Sin documento
        </button>
      </div>

      {tabActiva !== "cpe" ? (
        <div className={styles.panel}>
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>🔍</div>
            <h4>Nada por aquí</h4>
            <p>Esta sección todavía no está disponible.</p>
          </div>
        </div>
      ) : !compras || compras.length === 0 ? (
        <div className={styles.panel}>
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>🔍</div>
            <h4>Nada por aquí</h4>
            <p>No hay comprobantes de compra en este periodo con los filtros elegidos.</p>
          </div>
        </div>
      ) : (
        <div className={`${styles.tableWrap} ${styles.tableWrapTabbed}`}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>N° Compra</th>
                  <th>Sucursal</th>
                  <th>Fecha</th>
                  <th>Proveedor</th>
                  <th>Método de pago</th>
                  <th>Total</th>
                  <th>Estado</th>
                  <th>Usuario</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {compras.map((c: any) => (
                  <tr key={c.id}>
                    <td data-label="N° Compra">{c.numeroCompra}</td>
                    <td data-label="Sucursal">{c.sucursal ?? "-"}</td>
                    <td data-label="Fecha">{c.fechaCompra}</td>
                    <td data-label="Proveedor">{c.proveedor ?? "Sin proveedor"}</td>
                    <td data-label="Método de pago">{c.metodoPago ?? "-"}</td>
                    <td data-label="Total">S/ {Number(c.total).toFixed(2)}</td>
                    <td data-label="Estado">
                      <span className={`${styles.estado} ${c.estado === "ANULADO" ? styles.anulado : styles.confirmado}`}>
                        {c.estado}
                      </span>
                    </td>
                    <td data-label="Usuario">{c.usuario ?? "-"}</td>
                    <td className={styles.accionesCell}>
                      <button className={styles.verBtn} onClick={() => setCompraViendoId(c.id)}>
                        Ver
                      </button>
                      {c.estado !== "ANULADO" && (
                        <>
                          <button className={styles.editarBtn} onClick={() => abrirEditar(c.id)}>
                            Editar
                          </button>
                          <button className={styles.anularBtn} onClick={() => confirmarAnular(c.id)}>
                            Anular
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
        </div>
      )}

      <CompraVerModal isOpen={!!compraViendoId} onClose={() => setCompraViendoId(undefined)} compraId={compraViendoId} />
      <Toaster richColors position="top-right" duration={2000} />
    </div>
  );
};
