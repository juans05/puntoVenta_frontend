import { useEffect, useState } from "react";
import { toast } from "sonner";
import styles from "./compras.module.css";
import axiosInstance from "../../../../../../utils/axios";
import { useAppDispatch, useAppSelector } from "../../../../../../redux/store";
import { RootState } from "../../../../../../redux/rootState";
import { getProveedores, getProductosCompra } from "../../../../../../redux/reducers/Admin/compras/compra.reducer";
import { getSucursales } from "../../../../../../redux/reducers/extensiones/extensiones..reducer";

// Flujo completo de compras: Orden -> Recepcion (sube el stock) -> Factura con cruce.
// Solo se muestra cuando Configuracion > Flujo de compras = COMPLETO.

const ESTADOS: Record<string, { label: string; color: string; bg: string }> = {
  BORRADOR: { label: "Borrador", color: "#6b7280", bg: "#f3f4f6" },
  PENDIENTE_APROBACION: { label: "Pendiente de aprobación", color: "#b45309", bg: "#fef3c7" },
  EMITIDA: { label: "Emitida", color: "#1d4ed8", bg: "#dbeafe" },
  RECIBIDA_PARCIAL: { label: "Recibida parcial", color: "#7c3aed", bg: "#ede9fe" },
  RECIBIDA: { label: "Recibida", color: "#0f766e", bg: "#ccfbf1" },
  CERRADA: { label: "Cerrada", color: "#17B26A", bg: "#E8F9EE" },
  ANULADA: { label: "Anulada", color: "#F24B89", bg: "#FDECEE" },
};

const overlay: React.CSSProperties = {
  position: "fixed", inset: 0, background: "rgba(0,0,0,.4)", zIndex: 1000,
  display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
};
const modal: React.CSSProperties = {
  background: "#fff", borderRadius: 12, padding: 20, width: "min(760px, 100%)", maxHeight: "90vh", overflow: "auto",
};
const input: React.CSSProperties = { border: "1px solid #d1d5db", borderRadius: 8, padding: "6px 8px", width: "100%" };

const formatSoles = (n: number) => `S/ ${Number(n).toFixed(2)}`;
const mensajeError = (e: any, def: string) => e?.response?.data?.message ?? def;

type Linea = { productoId: number; cantidad: number; costoUnitario: number };
type Dialogo = null | { tipo: "nueva" } | { tipo: "recibir" | "facturar" | "ver" | "cerrar"; orden: any };

export const Ordenes = ({ config }: { config: any }) => {
  const dispatch = useAppDispatch();
  const { proveedores, productosCompra }: any = useAppSelector((s: RootState) => s.compras);
  const { sucursales }: any = useAppSelector((s: RootState) => s.extentions);

  const [ordenes, setOrdenes] = useState<any[]>([]);
  const [estadoFiltro, setEstadoFiltro] = useState("");
  const [cargando, setCargando] = useState(false);
  const [dialogo, setDialogo] = useState<Dialogo>(null);

  const cargar = async () => {
    setCargando(true);
    try {
      const params = new URLSearchParams({ Page: "1", Amount: "100" });
      if (estadoFiltro) params.set("Estado", estadoFiltro);
      const res: any = await axiosInstance.get(`/ordenes-compra/listar?${params}`);
      setOrdenes(res.data?.data?.items ?? []);
    } catch (e) {
      toast.error(mensajeError(e, "No se pudieron cargar las órdenes"));
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    dispatch(getProveedores() as any);
    dispatch(getProductosCompra() as any);
    dispatch(getSucursales() as any);
  }, []);
  useEffect(() => {
    cargar();
  }, [estadoFiltro]);

  // Ejecuta una accion sobre una orden, avisa y recarga.
  const accion = async (fn: () => Promise<any>, ok: string) => {
    try {
      await fn();
      toast.success(ok);
      setDialogo(null);
      cargar();
    } catch (e) {
      toast.error(mensajeError(e, "No se pudo completar la acción"));
    }
  };

  const abrirDetalle = async (orden: any, tipo: "recibir" | "facturar" | "ver" | "cerrar") => {
    try {
      const res: any = await axiosInstance.get(`/ordenes-compra/${orden.id}`);
      setDialogo({ tipo, orden: res.data?.data ?? orden });
    } catch (e) {
      toast.error(mensajeError(e, "No se pudo cargar la orden"));
    }
  };

  const puede = (o: any) => ({
    emitir: o.estadoOrden === "BORRADOR",
    aprobar: o.estadoOrden === "PENDIENTE_APROBACION",
    recibir: ["EMITIDA", "RECIBIDA_PARCIAL"].includes(o.estadoOrden),
    facturar: ["RECIBIDA_PARCIAL", "RECIBIDA"].includes(o.estadoOrden),
    cerrar: ["EMITIDA", "RECIBIDA_PARCIAL", "RECIBIDA"].includes(o.estadoOrden),
    anular: !["ANULADA", "CERRADA"].includes(o.estadoOrden),
  });

  return (
    <div>
      <div className={styles.toolbar}>
        <select className={styles.periodoSelect} value={estadoFiltro} onChange={(e) => setEstadoFiltro(e.target.value)}>
          <option value="">Todos los estados</option>
          {Object.entries(ESTADOS).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>
        <button className={styles.registrarBtn} onClick={() => setDialogo({ tipo: "nueva" })}>+ Nueva orden</button>
      </div>

      <div className={`${styles.tableWrap} ${styles.tableWrapTabbed}`}>
        {cargando ? (
          <div className={styles.emptyState}><p>Cargando órdenes...</p></div>
        ) : ordenes.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>🛒</div>
            <h4>Sin órdenes de compra</h4>
            <p>Crea una orden para empezar el flujo: orden → recepción → factura.</p>
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>N° Orden</th><th>Proveedor</th><th>Fecha</th><th>Total</th><th>Estado</th><th></th>
              </tr>
            </thead>
            <tbody>
              {ordenes.map((o) => {
                const est = ESTADOS[o.estadoOrden] ?? ESTADOS.BORRADOR;
                const p = puede(o);
                return (
                  <tr key={o.id}>
                    <td data-label="N° Orden">{o.numero}</td>
                    <td data-label="Proveedor">{o.proveedor ?? "Sin proveedor"}</td>
                    <td data-label="Fecha">{o.fechaEmision}</td>
                    <td data-label="Total">{formatSoles(o.total)}</td>
                    <td data-label="Estado">
                      <span className={styles.estado} style={{ color: est.color, background: est.bg }}>{est.label}</span>
                    </td>
                    <td className={styles.accionesCell}>
                      <button className={styles.verBtn} onClick={() => abrirDetalle(o, "ver")}>Ver</button>
                      {p.emitir && <button className={styles.editarBtn} onClick={() => accion(() => axiosInstance.put(`/ordenes-compra/${o.id}/emitir`), "Orden emitida")}>Emitir</button>}
                      {p.aprobar && <button className={styles.editarBtn} onClick={() => accion(() => axiosInstance.put(`/ordenes-compra/${o.id}/aprobar`), "Orden aprobada")}>Aprobar</button>}
                      {p.recibir && <button className={styles.editarBtn} onClick={() => abrirDetalle(o, "recibir")}>Recibir</button>}
                      {p.facturar && <button className={styles.editarBtn} onClick={() => abrirDetalle(o, "facturar")}>Facturar</button>}
                      {p.cerrar && <button className={styles.verBtn} onClick={() => abrirDetalle(o, "cerrar")}>Cerrar</button>}
                      {p.anular && (
                        <button
                          className={styles.anularBtn}
                          onClick={() => window.confirm("¿Anular esta orden?") && accion(() => axiosInstance.put(`/ordenes-compra/${o.id}/anular`), "Orden anulada")}
                        >
                          Anular
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {dialogo?.tipo === "nueva" && (
        <NuevaOrden proveedores={proveedores ?? []} productos={productosCompra ?? []} sucursales={sucursales ?? []}
          aprobacion={config?.montoAprobacionOc}
          onCerrar={() => setDialogo(null)}
          onGuardar={(payload: any) => accion(() => axiosInstance.post(`/ordenes-compra/crear`, payload), "Orden creada")} />
      )}
      {dialogo?.tipo === "ver" && <DetalleOrden orden={dialogo.orden} onCerrar={() => setDialogo(null)}
        onAnularRecepcion={(id: number) => window.confirm("¿Anular esta recepción? Se revierte el stock.") &&
          accion(() => axiosInstance.put(`/ordenes-compra/recepciones/${id}/anular`), "Recepción anulada")} />}
      {dialogo?.tipo === "recibir" && (
        <Recibir orden={dialogo.orden} onCerrar={() => setDialogo(null)}
          onGuardar={(payload: any) => accion(() => axiosInstance.post(`/ordenes-compra/${dialogo.orden.id}/recepciones`, payload), "Recepción registrada: el stock subió")} />
      )}
      {dialogo?.tipo === "facturar" && (
        <Facturar orden={dialogo.orden} onCerrar={() => setDialogo(null)}
          onGuardar={(payload: any) => facturarConCruce(dialogo.orden.id, payload, () => { setDialogo(null); cargar(); })} />
      )}
      {dialogo?.tipo === "cerrar" && (
        <CerrarOrden orden={dialogo.orden} onCerrar={() => setDialogo(null)}
          onGuardar={(motivo: string) => accion(() => axiosInstance.put(`/ordenes-compra/${dialogo.orden.id}/cerrar`, { motivo }), "Orden cerrada")} />
      )}
    </div>
  );
};

// La factura se manda primero sin confirmar: si el backend responde [DIFERENCIAS] (modo ADVERTIR)
// se muestran y, si el usuario acepta, se reenvia con confirmarDiferencias.
const facturarConCruce = async (ordenId: number, payload: any, alTerminar: () => void) => {
  try {
    await axiosInstance.post(`/ordenes-compra/${ordenId}/facturar`, payload);
    toast.success("Factura registrada");
    alTerminar();
  } catch (e: any) {
    const msg: string = e?.response?.data?.message ?? "";
    if (msg.startsWith("[DIFERENCIAS]")) {
      const detalle = msg.replace("[DIFERENCIAS]", "").trim().split("; ").join("\n• ");
      if (!window.confirm(`La factura no coincide con lo recibido:\n\n• ${detalle}\n\n¿Registrarla de todos modos?`)) return;
      try {
        await axiosInstance.post(`/ordenes-compra/${ordenId}/facturar`, { ...payload, confirmarDiferencias: true });
        toast.success("Factura registrada con diferencias");
        alTerminar();
      } catch (e2) {
        toast.error(mensajeError(e2, "No se pudo registrar la factura"));
      }
      return;
    }
    toast.error(msg || "No se pudo registrar la factura");
  }
};

const Modal = ({ titulo, onCerrar, children }: any) => (
  <div style={overlay} onClick={onCerrar}>
    <div style={modal} onClick={(e) => e.stopPropagation()}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
        <h3 style={{ margin: 0 }}>{titulo}</h3>
        <button onClick={onCerrar} aria-label="Cerrar">✕</button>
      </div>
      {children}
    </div>
  </div>
);

const NuevaOrden = ({ proveedores, productos, sucursales, aprobacion, onCerrar, onGuardar }: any) => {
  const [proveedorId, setProveedorId] = useState(0);
  const [sucursalId, setSucursalId] = useState(0);
  const [observacion, setObservacion] = useState("");
  const [lineas, setLineas] = useState<Linea[]>([{ productoId: 0, cantidad: 1, costoUnitario: 0 }]);

  const total = lineas.reduce((a, l) => a + l.cantidad * l.costoUnitario, 0);
  const setLinea = (i: number, cambio: Partial<Linea>) => setLineas(lineas.map((l, j) => (j === i ? { ...l, ...cambio } : l)));

  const guardar = (borrador: boolean) => {
    const validas = lineas.filter((l) => l.productoId > 0);
    if (validas.length === 0) return toast.error("Agrega al menos un producto");
    onGuardar({
      proveedorId: proveedorId || undefined, sucursalId: sucursalId || undefined, observacion: observacion || undefined,
      borrador, detalle: validas,
    });
  };

  return (
    <Modal titulo="Nueva orden de compra" onCerrar={onCerrar}>
      <div style={{ display: "grid", gap: 8, gridTemplateColumns: "1fr 1fr" }}>
        <select style={input} value={proveedorId} onChange={(e) => setProveedorId(Number(e.target.value))}>
          <option value={0}>Proveedor</option>
          {proveedores.map((p: any) => <option key={p.proveedorId ?? p.id} value={p.proveedorId ?? p.id}>{p.nombre}{p.ruc ? ` (${p.ruc})` : ""}</option>)}
        </select>
        <select style={input} value={sucursalId} onChange={(e) => setSucursalId(Number(e.target.value))}>
          <option value={0}>📍 Sucursal</option>
          {sucursales.map((s: any) => <option key={s.id} value={s.id}>{s.value}</option>)}
        </select>
      </div>
      <h4 style={{ margin: "14px 0 6px" }}>Productos</h4>
      {lineas.map((l, i) => (
        <div key={i} style={{ display: "grid", gap: 6, gridTemplateColumns: "3fr 1fr 1fr auto", marginBottom: 6 }}>
          <select style={input} value={l.productoId} onChange={(e) => setLinea(i, { productoId: Number(e.target.value) })}>
            <option value={0}>Producto</option>
            {productos.map((p: any) => <option key={p.productoId} value={p.productoId}>{p.nombre}</option>)}
          </select>
          <input style={input} type="number" min={1} value={l.cantidad} onChange={(e) => setLinea(i, { cantidad: Math.max(1, Math.floor(Number(e.target.value))) })} title="Cantidad" />
          <input style={input} type="number" min={0} step="0.01" value={l.costoUnitario} onChange={(e) => setLinea(i, { costoUnitario: Math.max(0, Number(e.target.value)) })} title="Costo unitario" />
          <button onClick={() => setLineas(lineas.filter((_, j) => j !== i))} disabled={lineas.length === 1}>✕</button>
        </div>
      ))}
      <button onClick={() => setLineas([...lineas, { productoId: 0, cantidad: 1, costoUnitario: 0 }])}>+ Agregar producto</button>
      <textarea style={{ ...input, marginTop: 10 }} placeholder="Observación (opcional)" value={observacion} onChange={(e) => setObservacion(e.target.value)} />
      <p style={{ marginTop: 10 }}>
        <strong>Total: {formatSoles(total)}</strong>
        {aprobacion != null && total > aprobacion && <span style={{ color: "#b45309" }}> · requiere aprobación (umbral {formatSoles(aprobacion)})</span>}
      </p>
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
        <button className={styles.verBtn} onClick={() => guardar(true)}>Guardar borrador</button>
        <button className={styles.registrarBtn} onClick={() => guardar(false)}>Emitir orden</button>
      </div>
    </Modal>
  );
};

const DetalleOrden = ({ orden, onCerrar, onAnularRecepcion }: any) => (
  <Modal titulo={`Orden ${orden.numero}`} onCerrar={onCerrar}>
    <p>{orden.proveedor ?? "Sin proveedor"} · {orden.sucursal ?? "—"} · {ESTADOS[orden.estadoOrden]?.label}
      {orden.aprobadoPor && ` · aprobada por ${orden.aprobadoPor}`}{orden.motivoCierre && ` · cierre: ${orden.motivoCierre}`}</p>
    <table className={styles.table}>
      <thead><tr><th>Producto</th><th>Pedido</th><th>Recibido</th><th>Facturado</th><th>Costo</th></tr></thead>
      <tbody>
        {orden.detalle.map((d: any) => (
          <tr key={d.id}><td>{d.producto}</td><td>{d.cantidadPedida}</td><td>{d.cantidadRecibida}</td><td>{d.cantidadFacturada}</td><td>{formatSoles(d.costoUnitario)}</td></tr>
        ))}
      </tbody>
    </table>
    <h4 style={{ margin: "14px 0 6px" }}>Recepciones</h4>
    {orden.recepciones.length === 0 ? <p>Aún no hay recepciones.</p> : orden.recepciones.map((r: any) => (
      <div key={r.id} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0" }}>
        <span>{r.numero} · {r.fecha} · {r.estadoRecepcion}</span>
        {r.estadoRecepcion === "ACTIVA" && <button className={styles.anularBtn} onClick={() => onAnularRecepcion(r.id)}>Anular</button>}
      </div>
    ))}
  </Modal>
);

const Recibir = ({ orden, onCerrar, onGuardar }: any) => {
  const [cant, setCant] = useState<Record<number, number>>(
    Object.fromEntries(orden.detalle.map((d: any) => [d.id, d.cantidadPedida - d.cantidadRecibida]))
  );
  const [observacion, setObservacion] = useState("");
  return (
    <Modal titulo={`Recibir mercadería · ${orden.numero}`} onCerrar={onCerrar}>
      <table className={styles.table}>
        <thead><tr><th>Producto</th><th>Pendiente</th><th>Recibo ahora</th></tr></thead>
        <tbody>
          {orden.detalle.map((d: any) => {
            const pendiente = d.cantidadPedida - d.cantidadRecibida;
            return (
              <tr key={d.id}>
                <td>{d.producto}</td><td>{pendiente}</td>
                <td><input style={{ ...input, width: 90 }} type="number" min={0} max={pendiente} disabled={pendiente === 0}
                  value={cant[d.id] ?? 0} onChange={(e) => setCant({ ...cant, [d.id]: Math.min(pendiente, Math.max(0, Math.floor(Number(e.target.value)))) })} /></td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <textarea style={{ ...input, marginTop: 10 }} placeholder="Observación (opcional)" value={observacion} onChange={(e) => setObservacion(e.target.value)} />
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 10 }}>
        <button className={styles.registrarBtn}
          onClick={() => {
            const detalle = Object.entries(cant).filter(([, c]) => c > 0).map(([id, c]) => ({ ordenCompraDetalleId: Number(id), cantidad: c }));
            if (detalle.length === 0) return toast.error("Indica al menos una cantidad recibida");
            onGuardar({ observacion: observacion || undefined, detalle });
          }}>
          Registrar recepción
        </button>
      </div>
    </Modal>
  );
};

const Facturar = ({ orden, onCerrar, onGuardar }: any) => {
  const [serie, setSerie] = useState("");
  const [numero, setNumero] = useState("");
  const [fechaEmision, setFechaEmision] = useState("");
  const [esCredito, setEsCredito] = useState(false);
  const pendientes = orden.detalle.filter((d: any) => d.cantidadRecibida - d.cantidadFacturada > 0);
  const [lineas, setLineas] = useState<Record<number, { cantidad: number; costo: number }>>(
    Object.fromEntries(pendientes.map((d: any) => [d.productoId, { cantidad: d.cantidadRecibida - d.cantidadFacturada, costo: d.costoUnitario }]))
  );
  return (
    <Modal titulo={`Factura del proveedor · ${orden.numero}`} onCerrar={onCerrar}>
      <div style={{ display: "grid", gap: 8, gridTemplateColumns: "1fr 1fr 1fr" }}>
        <input style={input} placeholder="Serie (F001)" value={serie} onChange={(e) => setSerie(e.target.value)} />
        <input style={input} placeholder="Número" value={numero} onChange={(e) => setNumero(e.target.value)} />
        <input style={input} type="date" value={fechaEmision} onChange={(e) => setFechaEmision(e.target.value)} />
      </div>
      <label style={{ display: "block", margin: "8px 0" }}>
        <input type="checkbox" checked={esCredito} onChange={(e) => setEsCredito(e.target.checked)} /> Compra a crédito
      </label>
      <table className={styles.table}>
        <thead><tr><th>Producto</th><th>Por facturar</th><th>Cant. factura</th><th>Precio factura</th><th>Precio orden</th></tr></thead>
        <tbody>
          {pendientes.map((d: any) => {
            const l = lineas[d.productoId];
            return (
              <tr key={d.id}>
                <td>{d.producto}</td><td>{d.cantidadRecibida - d.cantidadFacturada}</td>
                <td><input style={{ ...input, width: 80 }} type="number" min={1} value={l.cantidad} onChange={(e) => setLineas({ ...lineas, [d.productoId]: { ...l, cantidad: Math.max(1, Math.floor(Number(e.target.value))) } })} /></td>
                <td><input style={{ ...input, width: 90 }} type="number" min={0} step="0.01" value={l.costo} onChange={(e) => setLineas({ ...lineas, [d.productoId]: { ...l, costo: Math.max(0, Number(e.target.value)) } })} /></td>
                <td>{formatSoles(d.costoUnitario)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p style={{ color: "#6b7280", fontSize: 12 }}>Si algo no coincide con lo recibido o con el precio de la orden, se te mostrarán las diferencias antes de guardar. La factura no modifica el stock.</p>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button className={styles.registrarBtn}
          onClick={() => {
            if (!serie.trim() || !numero.trim()) return toast.error("Indica serie y número de la factura");
            onGuardar({
              serie: serie.trim(), numero: numero.trim(), fechaEmision: fechaEmision || undefined, esCredito,
              detalle: pendientes.map((d: any) => ({ productoId: d.productoId, cantidad: lineas[d.productoId].cantidad, costoUnitario: lineas[d.productoId].costo })),
            });
          }}>
          Registrar factura
        </button>
      </div>
    </Modal>
  );
};

const CerrarOrden = ({ orden, onCerrar, onGuardar }: any) => {
  const [motivo, setMotivo] = useState("");
  return (
    <Modal titulo={`Cerrar orden ${orden.numero}`} onCerrar={onCerrar}>
      <p>Cerrar una orden da por terminada la compra aunque falte mercadería. Indica el motivo.</p>
      <textarea style={input} value={motivo} onChange={(e) => setMotivo(e.target.value)} placeholder="Motivo del cierre" />
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 10 }}>
        <button className={styles.registrarBtn} onClick={() => (motivo.trim() ? onGuardar(motivo.trim()) : toast.error("Indica el motivo"))}>Cerrar orden</button>
      </div>
    </Modal>
  );
};
