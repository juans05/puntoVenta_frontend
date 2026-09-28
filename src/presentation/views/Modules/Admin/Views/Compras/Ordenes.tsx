import { useEffect, useState } from "react";
import { toast } from "sonner";
import styles from "./compras.module.css";
import axiosInstance from "../../../../../../utils/axios";
import { useFormErrors, estiloError, CampoError } from "../../../../../../components/FormError";
import { Ayuda } from "../../../../../../components/Ayuda";
import { useAppDispatch, useAppSelector } from "../../../../../../redux/store";
import { RootState } from "../../../../../../redux/rootState";
import { getProveedores, getProductosCompra } from "../../../../../../redux/reducers/Admin/compras/compra.reducer";
import { getSucursales, getMonedas, getTiposIgv } from "../../../../../../redux/reducers/extensiones/extensiones..reducer";

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
const label: React.CSSProperties = { display: "flex", alignItems: "center", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 4 };
const campo: React.CSSProperties = { display: "flex", flexDirection: "column" };

const formatSoles = (n: number) => `S/ ${Number(n).toFixed(2)}`;
const mensajeError = (e: any, def: string) => e?.response?.data?.message ?? def;

type Linea = { productoId: number; descripcion: string; cantidad: number; costoUnitario: number };
type Dialogo = null | { tipo: "nueva" } | { tipo: "recibir" | "facturar" | "ver" | "cerrar"; orden: any };

export const Ordenes = ({ config }: { config: any }) => {
  const dispatch = useAppDispatch();
  const { proveedores, productosCompra }: any = useAppSelector((s: RootState) => s.compras);
  const { sucursales, monedas, tiposIgv }: any = useAppSelector((s: RootState) => s.extentions);

  const [ordenes, setOrdenes] = useState<any[]>([]);
  const [departamentos, setDepartamentos] = useState<any[]>([]);
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
    dispatch(getProductosCompra(true) as any);
    dispatch(getSucursales() as any);
    dispatch(getMonedas() as any);
    dispatch(getTiposIgv() as any);
    axiosInstance.get("/departamentos/listar").then((r: any) => setDepartamentos(r.data?.data ?? [])).catch(() => {});
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
    // Servicio nunca pasa por Recepcion: al emitirse ya queda RECIBIDA de una vez.
    recibir: o.tipoOrden !== "SERVICIO" && ["EMITIDA", "RECIBIDA_PARCIAL"].includes(o.estadoOrden),
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
                <th>N° Orden</th><th>Tipo</th><th>Proveedor</th><th>Fecha</th><th>Total</th><th>Estado</th><th></th>
              </tr>
            </thead>
            <tbody>
              {ordenes.map((o) => {
                const est = ESTADOS[o.estadoOrden] ?? ESTADOS.BORRADOR;
                const p = puede(o);
                return (
                  <tr key={o.id}>
                    <td data-label="N° Orden">{o.numero}</td>
                    <td data-label="Tipo">{o.tipoOrden === "SERVICIO" ? "🧰 Servicio" : "📦 Bien"}</td>
                    <td data-label="Proveedor">{o.proveedor ?? "Sin proveedor"}</td>
                    <td data-label="Fecha">{o.fechaEmision}</td>
                    <td data-label="Total">{formatSoles(o.total)}</td>
                    <td data-label="Estado">
                      <span className={styles.estado} style={{ color: est.color, background: est.bg }}>{est.label}</span>
                    </td>
                    <td className={styles.accionesCell}>
                      <button className={styles.verBtn} onClick={() => abrirDetalle(o, "ver")}>Ver</button>
                      {p.emitir && <button className={styles.editarBtn} onClick={() => accion(() => axiosInstance.put(`/ordenes-compra/${o.id}/emitir`), "Orden emitida")}>Emitir</button>}
                      {p.aprobar && (
                        <button className={styles.editarBtn} title={o.aprobadorAsignado ? `Le toca aprobar a ${o.aprobadorAsignado}` : undefined}
                          onClick={() => accion(() => axiosInstance.put(`/ordenes-compra/${o.id}/aprobar`), "Orden aprobada")}>
                          Aprobar
                        </button>
                      )}
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
          departamentos={departamentos}
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
        <Facturar orden={dialogo.orden} monedas={monedas ?? []} tiposIgv={tiposIgv ?? []} onCerrar={() => setDialogo(null)}
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

const NuevaOrden = ({ proveedores, productos, sucursales, departamentos, aprobacion, onCerrar, onGuardar }: any) => {
  const [tipoOrden, setTipoOrden] = useState<"BIEN" | "SERVICIO">("BIEN");
  const [proveedorId, setProveedorId] = useState(0);
  const [sucursalId, setSucursalId] = useState(0);
  const [observacion, setObservacion] = useState("");
  const [lineas, setLineas] = useState<Linea[]>([{ productoId: 0, descripcion: "", cantidad: 1, costoUnitario: 0 }]);
  const [departamentoId, setDepartamentoId] = useState(0);
  const [aprobadorAsignadoId, setAprobadorAsignadoId] = useState("");
  const esServicio = tipoOrden === "SERVICIO";

  const total = lineas.reduce((a, l) => a + l.cantidad * l.costoUnitario, 0);
  const requiereAprobacion = aprobacion != null && total > aprobacion;
  const departamentoElegido = departamentos.find((d: any) => d.id === departamentoId);
  const aprobadoresDelDepartamento = departamentoElegido?.aprobadores ?? [];
  const setLinea = (i: number, cambio: Partial<Linea>) => setLineas(lineas.map((l, j) => (j === i ? { ...l, ...cambio } : l)));

  const { errors, setError, clearError } = useFormErrors();

  const guardar = (borrador: boolean) => {
    const validas = lineas.filter((l) => (esServicio ? l.descripcion.trim() !== "" : l.productoId > 0));
    if (validas.length === 0) {
      const msg = esServicio ? "Describe al menos un servicio" : "Agrega al menos un producto";
      setError("productos", msg);
      return toast.error(msg);
    }
    // Mismo criterio que el backend (ValidarDetalle): un producto no puede repetirse en la orden,
    // si necesitas mas cantidad se edita la misma linea en vez de agregar otra igual.
    if (!esServicio) {
      const productoIds = validas.map((l) => l.productoId);
      if (new Set(productoIds).size !== productoIds.length) {
        const msg = "Un producto no puede repetirse en la misma orden";
        setError("productos", msg);
        return toast.error(msg);
      }
    }
    if (!borrador && requiereAprobacion) {
      if (!departamentoId) { setError("departamentoId", "Elige el departamento que debe aprobar"); return toast.error("Elige el departamento que debe aprobar"); }
      if (!aprobadorAsignadoId) { setError("aprobadorAsignadoId", "Elige el aprobador"); return toast.error("Elige el aprobador"); }
    }
    onGuardar({
      tipoOrden, proveedorId: proveedorId || undefined, sucursalId: sucursalId || undefined, observacion: observacion || undefined,
      borrador,
      departamentoId: requiereAprobacion ? departamentoId || undefined : undefined,
      aprobadorAsignadoId: requiereAprobacion ? aprobadorAsignadoId || undefined : undefined,
      detalle: validas.map((l) =>
        esServicio ? { descripcion: l.descripcion.trim(), cantidad: l.cantidad, costoUnitario: l.costoUnitario }
                    : { productoId: l.productoId, cantidad: l.cantidad, costoUnitario: l.costoUnitario }
      ),
    });
  };

  return (
    <Modal titulo="Nueva orden de compra" onCerrar={onCerrar}>
      <div style={campo}>
        <label style={label}>Tipo de orden<Ayuda texto="Bien: la orden pasa por Recepción antes de facturarse (sube el stock cuando llega la mercadería). Servicio: no hay recepción, se factura directamente al proveedor." /></label>
        <div style={{ display: "flex", gap: 16, marginBottom: 10, alignItems: "center" }}>
          <label style={{ fontWeight: 400 }}><input type="radio" checked={!esServicio} onChange={() => setTipoOrden("BIEN")} /> 📦 Bien (con recepción)</label>
          <label style={{ fontWeight: 400 }}><input type="radio" checked={esServicio} onChange={() => setTipoOrden("SERVICIO")} /> 🧰 Servicio (directo a factura)</label>
        </div>
      </div>
      <div style={{ display: "grid", gap: 8, gridTemplateColumns: "1fr 1fr" }}>
        <div style={campo}>
          <label style={label}>Proveedor<Ayuda texto="Opcional. A quién le compras. Puedes dejarlo en blanco y completarlo después editando la orden mientras siga en borrador." /></label>
          <select style={input} value={proveedorId} onChange={(e) => setProveedorId(Number(e.target.value))}>
            <option value={0}>Selecciona un proveedor</option>
            {proveedores.map((p: any) => <option key={p.proveedorId ?? p.id} value={p.proveedorId ?? p.id}>{p.nombre}{p.ruc ? ` (${p.ruc})` : ""}</option>)}
          </select>
        </div>
        <div style={campo}>
          <label style={label}>Sucursal<Ayuda texto="Opcional. La sucursal donde ingresará la mercadería o se registrará el gasto." /></label>
          <select style={input} value={sucursalId} onChange={(e) => setSucursalId(Number(e.target.value))}>
            <option value={0}>📍 Selecciona una sucursal</option>
            {sucursales.map((s: any) => <option key={s.id} value={s.id}>{s.value}</option>)}
          </select>
        </div>
      </div>
      <h4 style={{ margin: "14px 0 6px" }}>{esServicio ? "Servicios" : "Productos"}</h4>
      <CampoError mensaje={errors.productos} />
      <div style={{ display: "grid", gap: 6, gridTemplateColumns: "3fr 1fr 1fr auto" }}>
        <label style={label}>{esServicio ? "Descripción" : "Producto"}<Ayuda texto={esServicio
          ? "Obligatorio: describe el servicio que te va a facturar el proveedor."
          : "Obligatorio: elige un producto del catálogo. No se puede repetir el mismo producto en dos líneas -- si necesitas más cantidad, edita esa misma línea."} /></label>
        <label style={label}>Cantidad<Ayuda texto="Obligatorio: cantidad a pedir, número entero mayor a 0." /></label>
        <label style={label}>Costo unitario<Ayuda texto="Costo pactado con el proveedor por unidad, sin IGV. No puede ser negativo; déjalo en 0 si aún no lo conoces." /></label>
        <span />
      </div>
      {lineas.map((l, i) => (
        <div key={i} style={{ display: "grid", gap: 6, gridTemplateColumns: "3fr 1fr 1fr auto", marginBottom: 6, alignItems: "center" }}>
          {esServicio ? (
            <input style={{ ...input, ...estiloError(!!errors.productos) }} placeholder="Descripción del servicio" value={l.descripcion}
              onChange={(e) => { setLinea(i, { descripcion: e.target.value }); clearError("productos"); }} />
          ) : (
            <select style={{ ...input, ...estiloError(!!errors.productos) }} value={l.productoId}
              onChange={(e) => { setLinea(i, { productoId: Number(e.target.value) }); clearError("productos"); }}>
              <option value={0}>Selecciona un producto</option>
              {productos.map((p: any) => <option key={p.productoId} value={p.productoId}>{p.nombre}</option>)}
            </select>
          )}
          <input style={input} type="number" min={1} value={l.cantidad} onChange={(e) => setLinea(i, { cantidad: Math.max(1, Math.floor(Number(e.target.value))) })} />
          <input style={input} type="number" min={0} step="0.01" value={l.costoUnitario} onChange={(e) => setLinea(i, { costoUnitario: Math.max(0, Number(e.target.value)) })} />
          <button onClick={() => setLineas(lineas.filter((_, j) => j !== i))} disabled={lineas.length === 1}>✕</button>
        </div>
      ))}
      <button onClick={() => setLineas([...lineas, { productoId: 0, descripcion: "", cantidad: 1, costoUnitario: 0 }])}>
        + Agregar {esServicio ? "servicio" : "producto"}
      </button>
      <div style={{ ...campo, marginTop: 10 }}>
        <label style={label}>Observación<Ayuda texto="Opcional. Notas internas sobre la orden -- no se envían al proveedor." /></label>
        <textarea style={input} placeholder="Observación (opcional)" value={observacion} onChange={(e) => setObservacion(e.target.value)} />
      </div>
      <p style={{ marginTop: 10 }}>
        <strong>Total: {formatSoles(total)}</strong>
        {requiereAprobacion && <span style={{ color: "#b45309" }}> · requiere aprobación (umbral {formatSoles(aprobacion)})</span>}
      </p>
      {requiereAprobacion && (
        <div style={{ display: "grid", gap: 8, gridTemplateColumns: "1fr 1fr", marginBottom: 10 }}>
          <div style={campo}>
            <label style={label}>Departamento que aprueba<Ayuda texto="Obligatorio porque el total supera el monto configurado para requerir aprobación. Elige la jefatura responsable de aprobar esta orden." /></label>
            <select style={{ ...input, ...estiloError(!!errors.departamentoId) }} value={departamentoId}
              onChange={(e) => { setDepartamentoId(Number(e.target.value)); setAprobadorAsignadoId(""); clearError("departamentoId"); }}>
              <option value={0}>Selecciona un departamento</option>
              {departamentos.map((d: any) => <option key={d.id} value={d.id}>{d.nombre}</option>)}
            </select>
            <CampoError mensaje={errors.departamentoId} />
          </div>
          <div style={campo}>
            <label style={label}>Aprobador<Ayuda texto="Obligatorio: la persona de esa jefatura que debe aprobar la orden antes de que se pueda emitir." /></label>
            <select style={{ ...input, ...estiloError(!!errors.aprobadorAsignadoId) }} value={aprobadorAsignadoId} disabled={!departamentoId}
              onChange={(e) => { setAprobadorAsignadoId(e.target.value); clearError("aprobadorAsignadoId"); }}>
              <option value="">Selecciona un aprobador</option>
              {aprobadoresDelDepartamento.map((a: any) => <option key={a.userId} value={a.userId}>{a.nombre}</option>)}
            </select>
            <CampoError mensaje={errors.aprobadorAsignadoId} />
          </div>
        </div>
      )}
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
        <button className={styles.verBtn} onClick={() => guardar(true)} disabled={Object.keys(errors).length > 0}>Guardar borrador</button>
        <button className={styles.registrarBtn} onClick={() => guardar(false)} disabled={Object.keys(errors).length > 0}>Emitir orden</button>
      </div>
    </Modal>
  );
};

const DetalleOrden = ({ orden, onCerrar, onAnularRecepcion }: any) => (
  <Modal titulo={`Orden ${orden.numero}`} onCerrar={onCerrar}>
    <p>{orden.proveedor ?? "Sin proveedor"} · {orden.sucursal ?? "—"} · {ESTADOS[orden.estadoOrden]?.label}
      {orden.aprobadoPor && ` · aprobada por ${orden.aprobadoPor}`}{orden.motivoCierre && ` · cierre: ${orden.motivoCierre}`}
      {!orden.aprobadoPor && orden.departamento && ` · pendiente de aprobar por ${orden.departamento}${orden.aprobadorAsignado ? ` (${orden.aprobadorAsignado})` : ""}`}</p>
    <table className={styles.table}>
      <thead><tr><th>Producto</th><th>Pedido</th><th>Recibido</th><th>Facturado</th><th>Costo</th></tr></thead>
      <tbody>
        {orden.detalle.map((d: any) => (
          <tr key={d.id}><td>{d.producto ?? d.descripcion}</td><td>{d.cantidadPedida}</td><td>{d.cantidadRecibida}</td><td>{d.cantidadFacturada}</td><td>{formatSoles(d.costoUnitario)}</td></tr>
        ))}
      </tbody>
    </table>
    <h4 style={{ margin: "14px 0 6px" }}>Recepciones</h4>
    {orden.recepciones.length === 0 ? <p>Aún no hay recepciones.</p> : orden.recepciones.map((r: any) => (
      <div key={r.id} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0" }}>
        <span>{r.numero} · {r.fecha} · {r.estadoRecepcion}{r.numeroGuiaRemision && ` · Guía ${r.numeroGuiaRemision}`}</span>
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
  const [numeroGuiaRemision, setNumeroGuiaRemision] = useState("");
  const { errors, setError, clearError } = useFormErrors();
  return (
    <Modal titulo={`Recibir mercadería · ${orden.numero}`} onCerrar={onCerrar}>
      <input style={{ ...input, marginBottom: 10 }} placeholder="N° de guía de remisión del proveedor (opcional)"
        value={numeroGuiaRemision} onChange={(e) => setNumeroGuiaRemision(e.target.value)} />
      <table className={styles.table}>
        <thead><tr><th>Producto</th><th>Pendiente</th><th>Recibo ahora</th></tr></thead>
        <tbody>
          {orden.detalle.map((d: any) => {
            const pendiente = d.cantidadPedida - d.cantidadRecibida;
            return (
              <tr key={d.id}>
                <td>{d.producto}</td><td>{pendiente}</td>
                <td><input style={{ ...input, width: 90, ...estiloError(!!errors.cantidades) }} type="number" min={0} max={pendiente} disabled={pendiente === 0}
                  value={cant[d.id] ?? 0} onChange={(e) => { setCant({ ...cant, [d.id]: Math.min(pendiente, Math.max(0, Math.floor(Number(e.target.value)))) }); clearError("cantidades"); }} /></td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <textarea style={{ ...input, marginTop: 10 }} placeholder="Observación (opcional)" value={observacion} onChange={(e) => setObservacion(e.target.value)} />
      <CampoError mensaje={errors.cantidades} />
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 10 }}>
        <button className={styles.registrarBtn} disabled={!!errors.cantidades}
          onClick={() => {
            const detalle = Object.entries(cant).filter(([, c]) => c > 0).map(([id, c]) => ({ ordenCompraDetalleId: Number(id), cantidad: c }));
            if (detalle.length === 0) {
              setError("cantidades", "Indica al menos una cantidad recibida");
              return toast.error("Indica al menos una cantidad recibida");
            }
            onGuardar({ observacion: observacion || undefined, numeroGuiaRemision: numeroGuiaRemision || undefined, detalle });
          }}>
          Registrar recepción
        </button>
      </div>
    </Modal>
  );
};

const Facturar = ({ orden, monedas, tiposIgv, onCerrar, onGuardar }: any) => {
  const [serie, setSerie] = useState("");
  const [numero, setNumero] = useState("");
  const [fechaEmision, setFechaEmision] = useState("");
  const [esCredito, setEsCredito] = useState(false);
  const [fechaVencimiento, setFechaVencimiento] = useState("");
  const [monedaId, setMonedaId] = useState<number>(orden.monedaId || 0);
  const [tipoIgvId, setTipoIgvId] = useState<number>(0);
  const [observacion, setObservacion] = useState("");
  const { errors, setError, clearError } = useFormErrors();

  // Sugiere serie/numero al abrir (mismo endpoint y criterio que el registro manual de compras en
  // FormularioCompra.tsx) -- queda editable por si el documento real del proveedor es distinto.
  useEffect(() => {
    axiosInstance
      .get(`/compras/obtener-serie-numero?sucursalId=${orden.sucursalId || 0}`)
      .then(({ data }: any) => {
        if (data?.data) {
          setSerie(data.data.serie || "");
          setNumero(data.data.numero || "");
        }
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pendientes = orden.detalle.filter((d: any) => d.cantidadRecibida - d.cantidadFacturada > 0);
  // Clave por Id de la linea (no por producto): las lineas de servicio no tienen productoId.
  const [lineas, setLineas] = useState<Record<number, { cantidad: number; costo: number }>>(
    Object.fromEntries(pendientes.map((d: any) => [d.id, { cantidad: d.cantidadRecibida - d.cantidadFacturada, costo: d.costoUnitario }]))
  );
  return (
    <Modal titulo={`Factura del proveedor · ${orden.numero}`} onCerrar={onCerrar}>
      <div style={{ display: "grid", gap: 8, gridTemplateColumns: "1fr 1fr 1fr" }}>
        <div style={campo}>
          <label style={label}>Serie<Ayuda texto="Obligatorio: serie de la factura o boleta que te dio el proveedor (ej. F001). Se sugiere un valor automáticamente, pero puedes corregirlo por el real del proveedor." /></label>
          <input style={{ ...input, ...estiloError(!!errors.serie) }} placeholder="Serie (F001)" value={serie}
            onChange={(e) => { setSerie(e.target.value); clearError("serie"); }} />
        </div>
        <div style={campo}>
          <label style={label}>Número<Ayuda texto="Obligatorio: número correlativo del documento del proveedor. Se sugiere un valor automáticamente, pero puedes corregirlo por el real del proveedor." /></label>
          <input style={{ ...input, ...estiloError(!!errors.numero) }} placeholder="Número" value={numero}
            onChange={(e) => { setNumero(e.target.value); clearError("numero"); }} />
        </div>
        <div style={campo}>
          <label style={label}>Fecha de emisión<Ayuda texto="Opcional. Fecha de emisión del documento del proveedor; si se deja vacío se usa la fecha de hoy." /></label>
          <input style={input} type="date" value={fechaEmision} onChange={(e) => setFechaEmision(e.target.value)} />
        </div>
      </div>
      <CampoError mensaje={errors.serie ?? errors.numero} />
      <div style={{ display: "grid", gap: 8, gridTemplateColumns: "1fr 1fr", marginTop: 8 }}>
        <div style={campo}>
          <label style={label}>Divisa<Ayuda texto="Opcional. Moneda del documento del proveedor; si no se elige, se asume la moneda por defecto del negocio." /></label>
          <select style={input} value={monedaId} onChange={(e) => setMonedaId(Number(e.target.value))}>
            <option value={0}>Selecciona una divisa</option>
            {monedas.map((m: any) => <option key={m.id} value={m.id}>{m.value}</option>)}
          </select>
        </div>
        <div style={campo}>
          <label style={label}>Afectación IGV<Ayuda texto="Opcional. Cómo afecta el IGV a este documento (Gravado/Exonerado/Inafecto); si no se elige, se calcula como Gravado." /></label>
          <select style={input} value={tipoIgvId} onChange={(e) => setTipoIgvId(Number(e.target.value))}>
            <option value={0}>Selecciona una afectación</option>
            {tiposIgv.map((t: any) => <option key={t.id} value={t.id}>{t.codigo} - {t.value}</option>)}
          </select>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", marginTop: 8 }}>
        <label style={{ fontWeight: 400 }}>
          <input type="checkbox" checked={esCredito} onChange={(e) => setEsCredito(e.target.checked)} /> Compra a crédito
        </label>
        <Ayuda texto="Marca esta opción si el pago al proveedor queda pendiente (no se paga al contado). Necesita que la orden tenga un proveedor asignado." />
      </div>
      {esCredito && (
        <div style={{ ...campo, marginTop: 8, maxWidth: 220 }}>
          <label style={label}>Fecha de vencimiento<Ayuda texto="Obligatorio en compra a crédito: fecha límite para pagarle al proveedor." /></label>
          <input style={{ ...input, ...estiloError(!!errors.fechaVencimiento) }} type="date" value={fechaVencimiento}
            onChange={(e) => { setFechaVencimiento(e.target.value); clearError("fechaVencimiento"); }} />
          <CampoError mensaje={errors.fechaVencimiento} />
        </div>
      )}
      <table className={styles.table}>
        <thead><tr>
          <th>Producto</th><th>Por facturar</th>
          <th>Cant. factura<Ayuda texto="Cantidad que te está facturando el proveedor en este documento. No puede superar lo pendiente por facturar." /></th>
          <th>Precio factura<Ayuda texto="Precio unitario que figura en la factura del proveedor. Si no coincide con el precio de la orden, se te avisará antes de guardar." /></th>
          <th>Precio orden</th>
        </tr></thead>
        <tbody>
          {pendientes.map((d: any) => {
            const l = lineas[d.id];
            return (
              <tr key={d.id}>
                <td>{d.producto ?? d.descripcion}</td><td>{d.cantidadRecibida - d.cantidadFacturada}</td>
                <td><input style={{ ...input, width: 80 }} type="number" min={1} value={l.cantidad} onChange={(e) => setLineas({ ...lineas, [d.id]: { ...l, cantidad: Math.max(1, Math.floor(Number(e.target.value))) } })} /></td>
                <td><input style={{ ...input, width: 90 }} type="number" min={0} step="0.01" value={l.costo} onChange={(e) => setLineas({ ...lineas, [d.id]: { ...l, costo: Math.max(0, Number(e.target.value)) } })} /></td>
                <td>{formatSoles(d.costoUnitario)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div style={{ ...campo, marginTop: 8 }}>
        <label style={label}>Observación<Ayuda texto="Opcional. Notas internas sobre esta factura -- no se envían al proveedor." /></label>
        <textarea style={input} placeholder="Observación (opcional)" value={observacion} onChange={(e) => setObservacion(e.target.value)} />
      </div>
      <p style={{ color: "#6b7280", fontSize: 12 }}>Si algo no coincide con lo recibido o con el precio de la orden, se te mostrarán las diferencias antes de guardar. La factura no modifica el stock.</p>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button className={styles.registrarBtn} disabled={!!errors.serie || !!errors.fechaVencimiento}
          onClick={() => {
            if (!serie.trim() || !numero.trim()) {
              setError("serie", "Indica serie y número de la factura");
              return toast.error("Indica serie y número de la factura");
            }
            // Mismo criterio que el backend (CrearCompraCore): una compra a credito necesita un
            // proveedor -- la orden puede no tenerlo porque Proveedor es opcional al crearla.
            if (esCredito && !orden.proveedorId) {
              const msg = "Esta orden no tiene proveedor asignado: una compra a crédito necesita uno. Asígnalo editando la orden o desmarca 'Compra a crédito'.";
              setError("serie", msg);
              return toast.error(msg);
            }
            if (esCredito && !fechaVencimiento) {
              setError("fechaVencimiento", "Indica la fecha de vencimiento");
              return toast.error("Indica la fecha de vencimiento del pago a crédito");
            }
            onGuardar({
              serie: serie.trim(), numero: numero.trim(), fechaEmision: fechaEmision || undefined, esCredito,
              fechaVencimiento: esCredito ? fechaVencimiento : undefined,
              monedaId: monedaId || undefined, tipoIgvId: tipoIgvId || undefined, observacion: observacion || undefined,
              detalle: pendientes.map((d: any) => ({ ordenCompraDetalleId: d.id, productoId: d.productoId, cantidad: lineas[d.id].cantidad, costoUnitario: lineas[d.id].costo })),
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
  const { errors, setError, clearError } = useFormErrors();
  return (
    <Modal titulo={`Cerrar orden ${orden.numero}`} onCerrar={onCerrar}>
      <p>Cerrar una orden da por terminada la compra aunque falte mercadería. Indica el motivo.</p>
      <textarea style={{ ...input, ...estiloError(!!errors.motivo) }} value={motivo}
        onChange={(e) => { setMotivo(e.target.value); clearError("motivo"); }} placeholder="Motivo del cierre" />
      <CampoError mensaje={errors.motivo} />
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 10 }}>
        <button className={styles.registrarBtn} disabled={!!errors.motivo}
          onClick={() => {
            if (!motivo.trim()) {
              setError("motivo", "Indica el motivo");
              return toast.error("Indica el motivo");
            }
            onGuardar(motivo.trim());
          }}>
          Cerrar orden
        </button>
      </div>
    </Modal>
  );
};
