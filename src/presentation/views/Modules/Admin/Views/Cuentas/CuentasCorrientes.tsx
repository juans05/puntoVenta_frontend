import { useEffect, useMemo, useState } from "react";
import { Toaster, toast } from "sonner";
import styles from "../Compras/compras.module.css";
import axiosInstance from "../../../../../../utils/axios";
import { useAppDispatch, useAppSelector } from "../../../../../../redux/store";
import { RootState } from "../../../../../../redux/rootState";
import { getPayMethods } from "../../../../../../redux/reducers/extensiones/extensiones..reducer";

// Cuentas por cobrar (clientes) y por pagar (proveedores), estilo SAP Business One:
//  - Documentos abiertos: socios con saldo -> sus documentos -> columna "Pagar" + medio de pago (Pagos recibidos/efectuados).
//  - Pagos realizados: historial con opcion de anular.
//  - Antiguedad de saldos: por vencer, 1-30, 31-60, 61-90 y mas de 90 dias.
// El saldo lo calcula el backend (total - pagos aplicados).

type Lado = "cobrar" | "pagar";

const CONFIG = {
  cobrar: {
    titulo: "Cuentas por cobrar", socio: "Cliente", accion: "Registrar cobro", pagos: "Cobros realizados",
    base: "/cuentas-por-cobrar", ruta: "cliente", crear: "/cobranzas/crear", listar: "/cobranzas/listar", anular: "/cobranzas",
    ok: "Cobro registrado",
  },
  pagar: {
    titulo: "Cuentas por pagar", socio: "Proveedor", accion: "Registrar pago", pagos: "Pagos realizados",
    base: "/cuentas-por-pagar", ruta: "proveedor", crear: "/pagos-proveedor/crear", listar: "/pagos-proveedor/listar", anular: "/pagos-proveedor",
    ok: "Pago registrado",
  },
} as const;

const formatSoles = (n: number) => `S/ ${Number(n).toFixed(2)}`;
const mensajeError = (e: any, def: string) => e?.response?.data?.message ?? def;
const input: React.CSSProperties = { border: "1px solid #d1d5db", borderRadius: 8, padding: "6px 8px" };

type Tab = "abiertos" | "pagos" | "antiguedad";

export const CuentasCorrientes = ({ lado }: { lado: Lado }) => {
  const c = CONFIG[lado];
  const dispatch = useAppDispatch();
  const { payMethods }: any = useAppSelector((s: RootState) => s.extentions);

  const [tab, setTab] = useState<Tab>("abiertos");
  const [socios, setSocios] = useState<any[]>([]);
  const [socioSel, setSocioSel] = useState<any>(null);
  const [docs, setDocs] = useState<any[]>([]);
  const [aPagar, setAPagar] = useState<Record<number, string>>({});
  const [metodoPagoId, setMetodoPagoId] = useState(0);
  const [referencia, setReferencia] = useState("");
  const [pagos, setPagos] = useState<any[]>([]);
  const [antiguedad, setAntiguedad] = useState<any[]>([]);
  const [cargando, setCargando] = useState(false);

  const cargarSocios = async () => {
    setCargando(true);
    try {
      const r: any = await axiosInstance.get(`${c.base}/resumen`);
      setSocios(r.data?.data ?? []);
    } catch (e) {
      toast.error(mensajeError(e, "No se pudo cargar el resumen"));
    } finally {
      setCargando(false);
    }
  };

  const cargarDocs = async (socio: any) => {
    try {
      const r: any = await axiosInstance.get(`${c.base}/${c.ruta}/${socio.id}/documentos`);
      setDocs(r.data?.data ?? []);
      setAPagar({});
    } catch (e) {
      toast.error(mensajeError(e, "No se pudieron cargar los documentos"));
    }
  };

  const cargarPagos = async () => {
    try {
      const r: any = await axiosInstance.get(`${c.listar}?Page=1&Amount=100`);
      setPagos(r.data?.data?.items ?? []);
    } catch (e) {
      toast.error(mensajeError(e, "No se pudo cargar el historial"));
    }
  };

  const cargarAntiguedad = async () => {
    try {
      const r: any = await axiosInstance.get(`${c.base}/antiguedad`);
      setAntiguedad(r.data?.data ?? []);
    } catch (e) {
      toast.error(mensajeError(e, "No se pudo cargar la antigüedad"));
    }
  };

  useEffect(() => {
    dispatch(getPayMethods() as any);
    cargarSocios();
  }, [lado]);
  useEffect(() => {
    if (tab === "pagos") cargarPagos();
    if (tab === "antiguedad") cargarAntiguedad();
  }, [tab, lado]);

  const seleccionar = (s: any) => {
    setSocioSel(s);
    cargarDocs(s);
  };

  const totalAPagar = useMemo(() => Object.values(aPagar).reduce((a, v) => a + (Number(v) || 0), 0), [aPagar]);

  const setMonto = (d: any, valor: string) => {
    const n = Math.min(d.saldo, Math.max(0, Number(valor) || 0));
    setAPagar({ ...aPagar, [d.id]: valor === "" ? "" : String(Math.round(n * 100) / 100) });
  };

  const registrar = async () => {
    const detalle = Object.entries(aPagar).filter(([, v]) => Number(v) > 0).map(([id, v]) => ({ documentoId: Number(id), monto: Number(v) }));
    if (detalle.length === 0) return toast.error("Indica el monto a pagar en al menos un documento");
    if (!metodoPagoId) return toast.error("Elige el medio de pago");
    try {
      await axiosInstance.post(c.crear, { socioId: socioSel.id, metodoPagoId, referencia: referencia || undefined, detalle });
      toast.success(c.ok);
      setReferencia("");
      await cargarSocios();
      const restantes = (await axiosInstance.get(`${c.base}/${c.ruta}/${socioSel.id}/documentos`) as any).data?.data ?? [];
      setDocs(restantes);
      setAPagar({});
      if (restantes.length === 0) setSocioSel(null);
    } catch (e) {
      toast.error(mensajeError(e, "No se pudo registrar"));
    }
  };

  const anular = async (p: any) => {
    if (!window.confirm(`¿Anular ${p.numero}? La deuda de los documentos se reabre.`)) return;
    try {
      await axiosInstance.put(`${c.anular}/${p.id}/anular`);
      toast.success("Anulado");
      cargarPagos();
      cargarSocios();
    } catch (e) {
      toast.error(mensajeError(e, "No se pudo anular"));
    }
  };

  const totalSaldo = socios.reduce((a, s) => a + s.saldo, 0);
  const totalVencido = socios.reduce((a, s) => a + s.vencido, 0);

  return (
    <div>
      <Toaster richColors position="top-right" />
      <div className={styles.headerTop}>
        <div>
          <h3>{c.titulo}</h3>
          <p className={styles.subtitle}>Saldo total {formatSoles(totalSaldo)} · vencido {formatSoles(totalVencido)}</p>
        </div>
      </div>

      <div className={styles.tabs}>
        {([["abiertos", "📄 Documentos abiertos"], ["pagos", `💵 ${c.pagos}`], ["antiguedad", "📊 Antigüedad de saldos"]] as [Tab, string][]).map(([k, label]) => (
          <button key={k} className={`${styles.tab} ${tab === k ? styles.tabActive : ""}`} onClick={() => setTab(k)}>{label}</button>
        ))}
      </div>

      {tab === "abiertos" && (
        <div style={{ display: "grid", gap: 16, gridTemplateColumns: "minmax(240px, 1fr) 2fr" }}>
          <div className={styles.tableWrap}>
            {cargando ? <div className={styles.emptyState}><p>Cargando...</p></div> : socios.length === 0 ? (
              <div className={styles.emptyState}><div className={styles.emptyIcon}>🎉</div><h4>Sin deudas pendientes</h4></div>
            ) : (
              <table className={styles.table}>
                <thead><tr><th>{c.socio}</th><th>Saldo</th><th>Vencido</th></tr></thead>
                <tbody>
                  {socios.map((s) => (
                    <tr key={s.id} onClick={() => seleccionar(s)} style={{ cursor: "pointer", background: socioSel?.id === s.id ? "#eff6ff" : undefined }}>
                      <td>{s.nombre}<div style={{ fontSize: 11, color: "#6b7280" }}>{s.documento} · {s.documentos} doc.</div></td>
                      <td>{formatSoles(s.saldo)}</td>
                      <td style={{ color: s.vencido > 0 ? "#F24B89" : undefined }}>{formatSoles(s.vencido)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className={styles.tableWrap} style={{ padding: 12 }}>
            {!socioSel ? (
              <div className={styles.emptyState}><p>Elige un {c.socio.toLowerCase()} para ver sus documentos.</p></div>
            ) : (
              <>
                <h4 style={{ marginBottom: 8 }}>{socioSel.nombre}</h4>
                <table className={styles.table}>
                  <thead><tr><th>Documento</th><th>Fecha</th><th>Vence</th><th>Total</th><th>Saldo</th><th>Atraso</th><th>Pagar</th></tr></thead>
                  <tbody>
                    {docs.map((d) => (
                      <tr key={d.id}>
                        <td>{d.numero}</td><td>{d.fecha}</td><td>{d.vencimiento}</td>
                        <td>{formatSoles(d.total)}</td><td>{formatSoles(d.saldo)}</td>
                        <td style={{ color: d.diasVencido > 0 ? "#F24B89" : undefined }}>{d.diasVencido > 0 ? `${d.diasVencido} d` : "—"}</td>
                        <td>
                          <input style={{ ...input, width: 100 }} type="number" min={0} max={d.saldo} step="0.01"
                            value={aPagar[d.id] ?? ""} placeholder="0.00" onChange={(e) => setMonto(d, e.target.value)} />
                          <button style={{ marginLeft: 4 }} title="Pagar el saldo completo" onClick={() => setMonto(d, String(d.saldo))}>Todo</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginTop: 12 }}>
                  <select style={input} value={metodoPagoId} onChange={(e) => setMetodoPagoId(Number(e.target.value))}>
                    <option value={0}>Medio de pago</option>
                    {(payMethods as any[] | undefined)?.map((m) => <option key={m.id} value={m.id}>{m.value}</option>)}
                  </select>
                  <input style={{ ...input, flex: 1, minWidth: 160 }} placeholder="Referencia / N° operación (opcional)" value={referencia} onChange={(e) => setReferencia(e.target.value)} />
                  <strong>Total: {formatSoles(totalAPagar)}</strong>
                  <button className={styles.registrarBtn} onClick={registrar}>{c.accion}</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {tab === "pagos" && (
        <div className={`${styles.tableWrap} ${styles.tableWrapTabbed}`}>
          {pagos.length === 0 ? <div className={styles.emptyState}><p>Aún no hay registros.</p></div> : (
            <table className={styles.table}>
              <thead><tr><th>N°</th><th>{c.socio}</th><th>Fecha</th><th>Medio</th><th>Monto</th><th>Documentos</th><th>Estado</th><th></th></tr></thead>
              <tbody>
                {pagos.map((p) => (
                  <tr key={p.id}>
                    <td>{p.numero}</td><td>{p.socio}</td><td>{p.fecha}</td>
                    <td>{p.metodoPago}{p.referencia ? ` · ${p.referencia}` : ""}</td><td>{formatSoles(p.monto)}</td>
                    <td>{p.detalle.map((d: any) => `${d.documento} (${formatSoles(d.montoAplicado)})`).join(", ")}</td>
                    <td><span className={`${styles.estado} ${p.estado === "ANULADO" ? styles.anulado : styles.confirmado}`}>{p.estado}</span></td>
                    <td className={styles.accionesCell}>{p.estado === "ACTIVO" && <button className={styles.anularBtn} onClick={() => anular(p)}>Anular</button>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {tab === "antiguedad" && (
        <div className={`${styles.tableWrap} ${styles.tableWrapTabbed}`}>
          {antiguedad.length === 0 ? <div className={styles.emptyState}><p>Sin saldos pendientes.</p></div> : (
            <table className={styles.table}>
              <thead><tr><th>{c.socio}</th><th>Por vencer</th><th>1–30</th><th>31–60</th><th>61–90</th><th>+90</th><th>Total</th></tr></thead>
              <tbody>
                {antiguedad.map((a) => (
                  <tr key={a.id}>
                    <td>{a.nombre}</td><td>{formatSoles(a.porVencer)}</td><td>{formatSoles(a.dias1a30)}</td><td>{formatSoles(a.dias31a60)}</td>
                    <td>{formatSoles(a.dias61a90)}</td><td style={{ color: a.mas90 > 0 ? "#F24B89" : undefined }}>{formatSoles(a.mas90)}</td>
                    <td><strong>{formatSoles(a.total)}</strong></td>
                  </tr>
                ))}
                <tr>
                  <td><strong>Total</strong></td>
                  {(["porVencer", "dias1a30", "dias31a60", "dias61a90", "mas90", "total"] as const).map((k) => (
                    <td key={k}><strong>{formatSoles(antiguedad.reduce((s, a) => s + a[k], 0))}</strong></td>
                  ))}
                </tr>
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

export const CuentasPorCobrar = () => <CuentasCorrientes lado="cobrar" />;
export const CuentasPorPagar = () => <CuentasCorrientes lado="pagar" />;
