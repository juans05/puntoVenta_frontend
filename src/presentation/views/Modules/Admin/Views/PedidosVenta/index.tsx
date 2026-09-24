import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Toaster, toast } from "sonner";
import styles from "../Compras/compras.module.css";
import axiosInstance from "../../../../../../utils/axios";
import { useAppDispatch, useAppSelector } from "../../../../../../redux/store";
import { RootState } from "../../../../../../redux/rootState";
import { getProductosCompra } from "../../../../../../redux/reducers/Admin/compras/compra.reducer";
import { getSucursales } from "../../../../../../redux/reducers/extensiones/extensiones..reducer";

// Flujo de ventas completo: Pedido de venta (reserva stock) -> Entrega (baja stock) -> Factura/Boleta
// de lo entregado. Solo aplica con Configuracion > Flujo de ventas = COMPLETO; la venta de mostrador
// (Ir a ventas / Venta rapida) no pasa por aqui.

const ESTADOS: Record<string, { label: string; color: string; bg: string }> = {
  BORRADOR: { label: "Borrador", color: "#6b7280", bg: "#f3f4f6" },
  CONFIRMADO: { label: "Confirmado", color: "#1d4ed8", bg: "#dbeafe" },
  ENTREGADO_PARCIAL: { label: "Entregado parcial", color: "#7c3aed", bg: "#ede9fe" },
  ENTREGADO: { label: "Entregado", color: "#0f766e", bg: "#ccfbf1" },
  CERRADO: { label: "Cerrado", color: "#17B26A", bg: "#E8F9EE" },
  ANULADO: { label: "Anulado", color: "#F24B89", bg: "#FDECEE" },
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

type Linea = { productoId: number; cantidad: number; valorUnitario: number };
type Dialogo = null | { tipo: "nuevo" } | { tipo: "ver" | "entregar" | "cerrar"; pedido: any };

export const PedidosVenta = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { productosCompra }: any = useAppSelector((s: RootState) => s.compras);
  const { sucursales }: any = useAppSelector((s: RootState) => s.extentions);

  const [completo, setCompleto] = useState<boolean | null>(null);
  const [pedidos, setPedidos] = useState<any[]>([]);
  const [estadoFiltro, setEstadoFiltro] = useState("");
  const [cargando, setCargando] = useState(false);
  const [dialogo, setDialogo] = useState<Dialogo>(null);

  const cargar = async () => {
    setCargando(true);
    try {
      const params = new URLSearchParams({ Page: "1", Amount: "100" });
      if (estadoFiltro) params.set("Estado", estadoFiltro);
      const res: any = await axiosInstance.get(`/pedidos-venta/listar?${params}`);
      setPedidos(res.data?.data?.items ?? []);
    } catch (e) {
      toast.error(mensajeError(e, "No se pudieron cargar los pedidos"));
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    dispatch(getProductosCompra() as any);
    dispatch(getSucursales() as any);
    axiosInstance
      .get("/configuracion-flujo")
      .then((r: any) => setCompleto(r.data?.data?.flujoVentas === "COMPLETO"))
      .catch(() => setCompleto(false));
  }, []);
  useEffect(() => {
    if (completo) cargar();
  }, [completo, estadoFiltro]);

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

  const abrirDetalle = async (pedido: any, tipo: "ver" | "entregar" | "cerrar") => {
    try {
      const res: any = await axiosInstance.get(`/pedidos-venta/${pedido.id}`);
      setDialogo({ tipo, pedido: res.data?.data ?? pedido });
    } catch (e) {
      toast.error(mensajeError(e, "No se pudo cargar el pedido"));
    }
  };

  const puede = (p: any) => ({
    confirmar: p.estadoPedidoVenta === "BORRADOR",
    entregar: ["CONFIRMADO", "ENTREGADO_PARCIAL"].includes(p.estadoPedidoVenta),
    facturar: ["ENTREGADO_PARCIAL", "ENTREGADO"].includes(p.estadoPedidoVenta)
      && p.detalle.some((d: any) => d.cantidadEntregada - d.cantidadFacturada > 0),
    cerrar: ["CONFIRMADO", "ENTREGADO_PARCIAL", "ENTREGADO"].includes(p.estadoPedidoVenta),
    anular: !["ANULADO", "CERRADO"].includes(p.estadoPedidoVenta),
  });

  if (completo === null) return <div className={styles.emptyState}><p>Cargando...</p></div>;
  if (!completo) {
    return (
      <div className={styles.panel}>
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>🧾</div>
          <h4>Flujo de ventas simplificado</h4>
          <p>Para usar pedidos de venta y entregas, actívalo en Configuraciones → Flujo de compras y ventas.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Toaster richColors position="top-right" />
      <div className={styles.headerTop}>
        <div>
          <h3>Pedidos de venta</h3>
          <p className={styles.subtitle}>Pedido → entrega → factura o boleta de lo entregado.</p>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.registrarBtn} onClick={() => setDialogo({ tipo: "nuevo" })}>+ Nuevo pedido</button>
        </div>
      </div>

      <div className={styles.toolbar}>
        <select className={styles.periodoSelect} value={estadoFiltro} onChange={(e) => setEstadoFiltro(e.target.value)}>
          <option value="">Todos los estados</option>
          {Object.entries(ESTADOS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
      </div>

      <div className={`${styles.tableWrap} ${styles.tableWrapTabbed}`}>
        {cargando ? (
          <div className={styles.emptyState}><p>Cargando pedidos...</p></div>
        ) : pedidos.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>🧾</div>
            <h4>Sin pedidos de venta</h4>
            <p>Crea un pedido, o conviértelo desde una cotización.</p>
          </div>
        ) : (
          <table className={styles.table}>
            <thead><tr><th>N° Pedido</th><th>Cliente</th><th>Fecha</th><th>Total</th><th>Estado</th><th></th></tr></thead>
            <tbody>
              {pedidos.map((p) => {
                const est = ESTADOS[p.estadoPedidoVenta] ?? ESTADOS.BORRADOR;
                const a = puede(p);
                return (
                  <tr key={p.id}>
                    <td data-label="N° Pedido">{p.numero}</td>
                    <td data-label="Cliente">{p.razonSocial ?? "Sin cliente"}</td>
                    <td data-label="Fecha">{p.fechaEmision}</td>
                    <td data-label="Total">{formatSoles(p.total)}</td>
                    <td data-label="Estado"><span className={styles.estado} style={{ color: est.color, background: est.bg }}>{est.label}</span></td>
                    <td className={styles.accionesCell}>
                      <button className={styles.verBtn} onClick={() => abrirDetalle(p, "ver")}>Ver</button>
                      {a.confirmar && <button className={styles.editarBtn} onClick={() => accion(() => axiosInstance.put(`/pedidos-venta/${p.id}/confirmar`), "Pedido confirmado: stock reservado")}>Confirmar</button>}
                      {a.entregar && <button className={styles.editarBtn} onClick={() => abrirDetalle(p, "entregar")}>Entregar</button>}
                      {a.facturar && <button className={styles.editarBtn} onClick={() => navigate(`/dashboard/nueva-factura/factura?pedidoVentaId=${p.id}`)}>Factura</button>}
                      {a.facturar && <button className={styles.editarBtn} onClick={() => navigate(`/dashboard/nueva-factura/boleta?pedidoVentaId=${p.id}`)}>Boleta</button>}
                      {a.cerrar && <button className={styles.verBtn} onClick={() => abrirDetalle(p, "cerrar")}>Cerrar</button>}
                      {a.anular && (
                        <button className={styles.anularBtn}
                          onClick={() => window.confirm("¿Anular este pedido?") && accion(() => axiosInstance.put(`/pedidos-venta/${p.id}/anular`), "Pedido anulado")}>
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

      {dialogo?.tipo === "nuevo" && (
        <NuevoPedido productos={productosCompra ?? []} sucursales={sucursales ?? []} onCerrar={() => setDialogo(null)}
          onGuardar={(payload: any) => accion(() => axiosInstance.post(`/pedidos-venta/crear`, payload), payload.borrador ? "Borrador guardado" : "Pedido confirmado: stock reservado")} />
      )}
      {dialogo?.tipo === "ver" && (
        <Modal titulo={`Pedido ${dialogo.pedido.numero}`} onCerrar={() => setDialogo(null)}>
          <Detalle pedido={dialogo.pedido} />
          <h4 style={{ margin: "14px 0 6px" }}>Entregas</h4>
          {dialogo.pedido.entregas.length === 0 ? <p>Aún no hay entregas.</p> : dialogo.pedido.entregas.map((e: any) => (
            <div key={e.id} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0" }}>
              <span>{e.numero} · {e.fecha} · {e.estadoEntrega}{e.placa ? ` · placa ${e.placa}` : ""}</span>
              {e.estadoEntrega === "ACTIVA" && (
                <button className={styles.anularBtn}
                  onClick={() => window.confirm("¿Anular esta entrega? Se devuelve el stock.") &&
                    accion(() => axiosInstance.put(`/pedidos-venta/entregas/${e.id}/anular`), "Entrega anulada")}>
                  Anular
                </button>
              )}
            </div>
          ))}
        </Modal>
      )}
      {dialogo?.tipo === "entregar" && (
        <Entregar pedido={dialogo.pedido} onCerrar={() => setDialogo(null)}
          onGuardar={(payload: any) => accion(() => axiosInstance.post(`/pedidos-venta/${dialogo.pedido.id}/entregas`, payload), "Entrega registrada: el stock bajó")} />
      )}
      {dialogo?.tipo === "cerrar" && (
        <Cerrar pedido={dialogo.pedido} onCerrar={() => setDialogo(null)}
          onGuardar={(motivo: string) => accion(() => axiosInstance.put(`/pedidos-venta/${dialogo.pedido.id}/cerrar`, { motivo }), "Pedido cerrado")} />
      )}
    </div>
  );
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

const Detalle = ({ pedido }: any) => (
  <>
    <p>{pedido.razonSocial ?? "Sin cliente"}{pedido.numeroDocumento ? ` · ${pedido.numeroDocumento}` : ""} · {ESTADOS[pedido.estadoPedidoVenta]?.label}
      {pedido.motivoCierre && ` · cierre: ${pedido.motivoCierre}`}</p>
    <table className={styles.table}>
      <thead><tr><th>Producto</th><th>Pedido</th><th>Entregado</th><th>Facturado</th><th>Precio</th></tr></thead>
      <tbody>
        {pedido.detalle.map((d: any) => (
          <tr key={d.id}><td>{d.producto}</td><td>{d.cantidadPedida}</td><td>{d.cantidadEntregada}</td><td>{d.cantidadFacturada}</td><td>{formatSoles(d.valorUnitario)}</td></tr>
        ))}
      </tbody>
    </table>
  </>
);

const NuevoPedido = ({ productos, sucursales, onCerrar, onGuardar }: any) => {
  const [sucursalId, setSucursalId] = useState(0);
  const [numeroDocumento, setNumeroDocumento] = useState("");
  const [razonSocial, setRazonSocial] = useState("");
  const [direccionCliente, setDireccionCliente] = useState("");
  const [observacion, setObservacion] = useState("");
  const [lineas, setLineas] = useState<Linea[]>([{ productoId: 0, cantidad: 1, valorUnitario: 0 }]);

  const total = lineas.reduce((a, l) => a + l.cantidad * l.valorUnitario, 0);
  const setLinea = (i: number, cambio: Partial<Linea>) => setLineas(lineas.map((l, j) => (j === i ? { ...l, ...cambio } : l)));
  const elegirProducto = (i: number, productoId: number) => {
    const p = productos.find((x: any) => x.productoId === productoId);
    setLinea(i, { productoId, valorUnitario: p ? Number(p.precioVentaConInpuesto || p.precio || 0) : 0 });
  };

  const guardar = (borrador: boolean) => {
    const validas = lineas.filter((l) => l.productoId > 0);
    if (validas.length === 0) return toast.error("Agrega al menos un producto");
    onGuardar({
      sucursalId: sucursalId || undefined, numeroDocumento: numeroDocumento.trim() || undefined,
      razonSocial: razonSocial.trim() || undefined, direccionCliente: direccionCliente.trim() || undefined,
      observacion: observacion || undefined, borrador, detalle: validas,
    });
  };

  return (
    <Modal titulo="Nuevo pedido de venta" onCerrar={onCerrar}>
      <div style={{ display: "grid", gap: 8, gridTemplateColumns: "1fr 2fr" }}>
        <input style={input} placeholder="RUC / DNI del cliente" value={numeroDocumento} onChange={(e) => setNumeroDocumento(e.target.value)} />
        <input style={input} placeholder="Razón social / Nombre" value={razonSocial} onChange={(e) => setRazonSocial(e.target.value)} />
        <input style={{ ...input, gridColumn: "1 / span 2" }} placeholder="Dirección (opcional)" value={direccionCliente} onChange={(e) => setDireccionCliente(e.target.value)} />
        <select style={input} value={sucursalId} onChange={(e) => setSucursalId(Number(e.target.value))}>
          <option value={0}>📍 Sucursal</option>
          {sucursales.map((s: any) => <option key={s.id} value={s.id}>{s.value}</option>)}
        </select>
      </div>
      <h4 style={{ margin: "14px 0 6px" }}>Productos</h4>
      {lineas.map((l, i) => (
        <div key={i} style={{ display: "grid", gap: 6, gridTemplateColumns: "3fr 1fr 1fr auto", marginBottom: 6 }}>
          <select style={input} value={l.productoId} onChange={(e) => elegirProducto(i, Number(e.target.value))}>
            <option value={0}>Producto</option>
            {productos.map((p: any) => <option key={p.productoId} value={p.productoId}>{p.nombre}</option>)}
          </select>
          <input style={input} type="number" min={1} value={l.cantidad} title="Cantidad"
            onChange={(e) => setLinea(i, { cantidad: Math.max(1, Math.floor(Number(e.target.value))) })} />
          <input style={input} type="number" min={0} step="0.01" value={l.valorUnitario} title="Precio unitario"
            onChange={(e) => setLinea(i, { valorUnitario: Math.max(0, Number(e.target.value)) })} />
          <button onClick={() => setLineas(lineas.filter((_, j) => j !== i))} disabled={lineas.length === 1}>✕</button>
        </div>
      ))}
      <button onClick={() => setLineas([...lineas, { productoId: 0, cantidad: 1, valorUnitario: 0 }])}>+ Agregar producto</button>
      <textarea style={{ ...input, marginTop: 10 }} placeholder="Observación (opcional)" value={observacion} onChange={(e) => setObservacion(e.target.value)} />
      <p style={{ marginTop: 10 }}><strong>Total: {formatSoles(total)}</strong></p>
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
        <button className={styles.verBtn} onClick={() => guardar(true)}>Guardar borrador</button>
        <button className={styles.registrarBtn} onClick={() => guardar(false)}>Confirmar pedido</button>
      </div>
    </Modal>
  );
};

const Entregar = ({ pedido, onCerrar, onGuardar }: any) => {
  const [cant, setCant] = useState<Record<number, number>>(
    Object.fromEntries(pedido.detalle.map((d: any) => [d.id, d.cantidadPedida - d.cantidadEntregada]))
  );
  const [placa, setPlaca] = useState("");
  const [direccion, setDireccion] = useState(pedido.direccionCliente ?? "");
  const [observacion, setObservacion] = useState("");
  return (
    <Modal titulo={`Entregar · ${pedido.numero}`} onCerrar={onCerrar}>
      <table className={styles.table}>
        <thead><tr><th>Producto</th><th>Pendiente</th><th>Entrego ahora</th></tr></thead>
        <tbody>
          {pedido.detalle.map((d: any) => {
            const pendiente = d.cantidadPedida - d.cantidadEntregada;
            return (
              <tr key={d.id}>
                <td>{d.producto}</td><td>{pendiente}</td>
                <td><input style={{ ...input, width: 90 }} type="number" min={0} max={pendiente} disabled={pendiente === 0}
                  value={cant[d.id] ?? 0}
                  onChange={(e) => setCant({ ...cant, [d.id]: Math.min(pendiente, Math.max(0, Math.floor(Number(e.target.value)))) })} /></td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div style={{ display: "grid", gap: 8, gridTemplateColumns: "1fr 2fr", marginTop: 10 }}>
        <input style={input} placeholder="Placa (opcional)" value={placa} onChange={(e) => setPlaca(e.target.value)} />
        <input style={input} placeholder="Dirección de entrega" value={direccion} onChange={(e) => setDireccion(e.target.value)} />
      </div>
      <textarea style={{ ...input, marginTop: 8 }} placeholder="Observación (opcional)" value={observacion} onChange={(e) => setObservacion(e.target.value)} />
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 10 }}>
        <button className={styles.registrarBtn}
          onClick={() => {
            const detalle = Object.entries(cant).filter(([, c]) => c > 0).map(([id, c]) => ({ pedidoVentaDetalleId: Number(id), cantidad: c }));
            if (detalle.length === 0) return toast.error("Indica al menos una cantidad a entregar");
            onGuardar({ placa: placa || undefined, direccion: direccion || undefined, observacion: observacion || undefined, detalle });
          }}>
          Registrar entrega
        </button>
      </div>
    </Modal>
  );
};

const Cerrar = ({ pedido, onCerrar, onGuardar }: any) => {
  const [motivo, setMotivo] = useState("");
  return (
    <Modal titulo={`Cerrar pedido ${pedido.numero}`} onCerrar={onCerrar}>
      <p>Cerrar un pedido lo da por terminado aunque falte mercadería por entregar o facturar. Indica el motivo.</p>
      <textarea style={input} value={motivo} onChange={(e) => setMotivo(e.target.value)} placeholder="Motivo del cierre" />
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 10 }}>
        <button className={styles.registrarBtn} onClick={() => (motivo.trim() ? onGuardar(motivo.trim()) : toast.error("Indica el motivo"))}>Cerrar pedido</button>
      </div>
    </Modal>
  );
};
