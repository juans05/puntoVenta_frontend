import { useEffect, useMemo, useState } from "react";
import { Toaster, toast } from "sonner";
import styles from "../Compras/compras.module.css";
import axiosInstance from "../../../../../../utils/axios";
import { useFormErrors, estiloError, CampoError } from "../../../../../../components/FormError";
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

// Documentos con el mismo numero (ej. una factura registrada en dos compras) se muestran como una
// sola fila con total y saldo sumados; `partes` guarda los documentos reales para repartir el pago.
const agruparPorNumero = (lista: any[]) => {
  const grupos: Record<string, any> = {};
  for (const d of lista) {
    const g = grupos[d.numero];
    if (!g) grupos[d.numero] = { ...d, partes: [{ id: d.id, saldo: d.saldo }] };
    else {
      g.total += d.total;
      g.saldo = Math.round((g.saldo + d.saldo) * 100) / 100;
      g.diasVencido = Math.max(g.diasVencido, d.diasVencido);
      g.partes.push({ id: d.id, saldo: d.saldo });
    }
  }
  return Object.values(grupos);
};

// Reparte el monto de una fila agrupada entre sus documentos reales, en orden de vencimiento.
const repartir = (partes: { id: number; saldo: number }[], monto: number) => {
  let resto = monto;
  return partes.map((p) => {
    const m = Math.round(Math.min(p.saldo, resto) * 100) / 100;
    resto = Math.round((resto - m) * 100) / 100;
    return { documentoId: p.id, monto: m };
  }).filter((x) => x.monto > 0);
};

// Que datos pide cada medio de pago (se detecta por el nombre del metodo configurado).
const tipoMedio = (nombre = "") => {
  const n = nombre.toLowerCase();
  if (n.includes("transf") || n.includes("deposito") || n.includes("depósito")) return "transferencia";
  if (n.includes("efectivo")) return "efectivo";
  if (n.includes("yape") || n.includes("plin")) return "billetera";
  return "otro";
};

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
  const [descripcion, setDescripcion] = useState("");
  const [banco, setBanco] = useState("");
  const [nroCuenta, setNroCuenta] = useState("");
  const [nroOperacion, setNroOperacion] = useState("");
  const [montoEntregado, setMontoEntregado] = useState("");
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
      setDocs(agruparPorNumero(r.data?.data ?? []));
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

  const { errors, setError, clearError, limpiarErrores } = useFormErrors();

  // Check por documento: marcarlo propone pagar todo su saldo (editable); desmarcarlo lo quita.
  const marcados = docs.filter((d) => aPagar[d.id] !== undefined);
  const toggleDoc = (d: any) => {
    const sig = { ...aPagar };
    if (sig[d.id] !== undefined) delete sig[d.id];
    else sig[d.id] = String(d.saldo);
    setAPagar(sig);
    clearError("monto");
  };
  // Un documento: la descripcion es la de la factura. Varios: el usuario escribe una general.
  const descripcionAuto = marcados.length === 1 ? `${lado === "pagar" ? "Pago" : "Cobro"} de ${marcados[0].numero}` : "";
  useEffect(() => { setDescripcion(descripcionAuto); }, [descripcionAuto]);

  const medio = tipoMedio((payMethods as any[] | undefined)?.find((m) => m.id === metodoPagoId)?.value);

  const registrar = async () => {
    limpiarErrores();
    const detalle = docs.filter((d) => Number(aPagar[d.id]) > 0).flatMap((d) => repartir(d.partes, Number(aPagar[d.id])));
    if (detalle.length === 0) {
      setError("monto", "Indica el monto a pagar en al menos un documento");
      return toast.error("Indica el monto a pagar en al menos un documento");
    }
    if (!metodoPagoId) {
      setError("metodoPagoId", "Elige el medio de pago");
      return toast.error("Elige el medio de pago");
    }
    if (marcados.length > 1 && !descripcion.trim()) {
      setError("descripcion", "Escribe una descripción general del pago");
      return toast.error("Escribe una descripción general del pago");
    }
    if (medio === "transferencia" && (!banco.trim() || !nroOperacion.trim())) {
      setError("medio", "Indica el banco y el N° de operación");
      return toast.error("Indica el banco y el N° de operación");
    }
    if (medio === "billetera" && !nroOperacion.trim()) {
      setError("medio", "Indica el código de operación");
      return toast.error("Indica el código de operación");
    }
    if (medio === "efectivo" && montoEntregado !== "" && Number(montoEntregado) < totalAPagar) {
      setError("medio", "El monto entregado no cubre el total");
      return toast.error("El monto entregado no cubre el total");
    }
    // El backend guarda una sola referencia (150 caracteres): se arma con los datos del medio.
    const ref = medio === "transferencia" ? [`Banco ${banco}`, nroCuenta && `Cta ${nroCuenta}`, `Op ${nroOperacion}`].filter(Boolean).join(" · ")
      : medio === "billetera" ? `Cód. ${nroOperacion}`
      : medio === "efectivo" ? (montoEntregado ? `Entregado ${formatSoles(Number(montoEntregado))}` : "")
      : referencia;
    try {
      await axiosInstance.post(c.crear, {
        socioId: socioSel.id, metodoPagoId, referencia: ref.slice(0, 150) || undefined,
        observacion: descripcion.trim().slice(0, 150) || undefined, detalle,
      });
      toast.success(c.ok);
      setReferencia(""); setBanco(""); setNroCuenta(""); setNroOperacion(""); setMontoEntregado("");
      await cargarSocios();
      const restantes = (await axiosInstance.get(`${c.base}/${c.ruta}/${socioSel.id}/documentos`) as any).data?.data ?? [];
      setDocs(agruparPorNumero(restantes));
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
                  <thead><tr><th></th><th>Documento</th><th>Fecha</th><th>Vence</th><th>Total</th><th>Saldo</th><th>Atraso</th><th>Pagar</th></tr></thead>
                  <tbody>
                    {docs.map((d) => (
                      <tr key={d.id}>
                        <td><input type="checkbox" checked={aPagar[d.id] !== undefined} onChange={() => toggleDoc(d)} /></td>
                        <td>{d.numero}</td><td>{d.fecha}</td><td>{d.vencimiento}</td>
                        <td>{formatSoles(d.total)}</td><td>{formatSoles(d.saldo)}</td>
                        <td style={{ color: d.diasVencido > 0 ? "#F24B89" : undefined }}>{d.diasVencido > 0 ? `${d.diasVencido} d` : "—"}</td>
                        <td>
                          <input style={{ ...input, width: 100 }} type="number" min={0} max={d.saldo} step="0.01" disabled={aPagar[d.id] === undefined}
                            value={aPagar[d.id] ?? ""} placeholder="0.00" onChange={(e) => setMonto(d, e.target.value)} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {marcados.length > 0 && (
                  <input style={{ ...input, width: "100%", marginTop: 12, ...estiloError(!!errors.descripcion) }} maxLength={150}
                    placeholder={marcados.length > 1 ? `Descripción general del pago (${marcados.length} documentos)` : "Descripción"}
                    value={descripcion} onChange={(e) => { setDescripcion(e.target.value); clearError("descripcion"); }} />
                )}
                <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginTop: 12 }}>
                  <select style={{ ...input, ...estiloError(!!errors.metodoPagoId) }} value={metodoPagoId}
                    onChange={(e) => { setMetodoPagoId(Number(e.target.value)); clearError("metodoPagoId"); clearError("medio"); }}>
                    <option value={0}>Medio de pago</option>
                    {(payMethods as any[] | undefined)?.map((m) => <option key={m.id} value={m.id}>{m.value}</option>)}
                  </select>
                  {medio === "transferencia" && (<>
                    <input style={{ ...input, width: 130, ...estiloError(!!errors.medio && !banco) }} placeholder="Banco" value={banco} onChange={(e) => { setBanco(e.target.value); clearError("medio"); }} />
                    <input style={{ ...input, width: 170 }} placeholder="N° de cuenta" value={nroCuenta} onChange={(e) => setNroCuenta(e.target.value)} />
                    <input style={{ ...input, width: 150, ...estiloError(!!errors.medio && !nroOperacion) }} placeholder="N° de operación" value={nroOperacion} onChange={(e) => { setNroOperacion(e.target.value); clearError("medio"); }} />
                  </>)}
                  {medio === "billetera" && (
                    <input style={{ ...input, width: 180, ...estiloError(!!errors.medio) }} placeholder="Código de operación" value={nroOperacion} onChange={(e) => { setNroOperacion(e.target.value); clearError("medio"); }} />
                  )}
                  {medio === "efectivo" && (<>
                    <input style={{ ...input, width: 150, ...estiloError(!!errors.medio) }} type="number" min={0} step="0.01" placeholder="Monto entregado"
                      value={montoEntregado} onChange={(e) => { setMontoEntregado(e.target.value); clearError("medio"); }} />
                    {Number(montoEntregado) > totalAPagar && <span style={{ fontSize: 12 }}>Vuelto: {formatSoles(Number(montoEntregado) - totalAPagar)}</span>}
                  </>)}
                  {medio === "otro" && (
                    <input style={{ ...input, flex: 1, minWidth: 160 }} placeholder="Referencia / N° operación (opcional)" value={referencia} onChange={(e) => setReferencia(e.target.value)} />
                  )}
                  <span style={{ flex: 1 }} />
                  <strong>Total: {formatSoles(totalAPagar)}</strong>
                  <button className={styles.registrarBtn} onClick={registrar} disabled={Object.keys(errors).length > 0}>{c.accion}</button>
                  <CampoError mensaje={errors.metodoPagoId ?? errors.monto ?? errors.descripcion ?? errors.medio} />
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
