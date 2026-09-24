import { useEffect, useState } from "react";
import { Toaster, toast } from "sonner";
import styles from "../Compras/compras.module.css";
import axiosInstance from "../../../../../../utils/axios";

// Guias de remision remitente: documento INTERNO de traslado generado desde una Entrega
// (Pedidos de venta -> flujo completo). No se envian a SUNAT.

const overlay: React.CSSProperties = {
  position: "fixed", inset: 0, background: "rgba(0,0,0,.4)", zIndex: 1000,
  display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
};
const modal: React.CSSProperties = {
  background: "#fff", borderRadius: 12, padding: 20, width: "min(640px, 100%)", maxHeight: "90vh", overflow: "auto",
};
const input: React.CSSProperties = { border: "1px solid #d1d5db", borderRadius: 8, padding: "6px 8px", width: "100%" };
const mensajeError = (e: any, def: string) => e?.response?.data?.message ?? def;

export const GuiasRemision = () => {
  const [guias, setGuias] = useState<any[]>([]);
  const [cargando, setCargando] = useState(false);
  const [editando, setEditando] = useState<any>(null);

  const cargar = async () => {
    setCargando(true);
    try {
      const r: any = await axiosInstance.get("/guias-remision/listar?Page=1&Amount=100");
      setGuias(r.data?.data?.items ?? []);
    } catch (e) {
      toast.error(mensajeError(e, "No se pudieron cargar las guías"));
    } finally {
      setCargando(false);
    }
  };
  useEffect(() => {
    cargar();
  }, []);

  const anular = async (g: any) => {
    if (!window.confirm(`¿Anular la guía ${g.numero}? Es un documento interno: no se avisa a nadie más.`)) return;
    try {
      await axiosInstance.put(`/guias-remision/${g.id}/anular`);
      toast.success("Guía anulada");
      cargar();
    } catch (e) {
      toast.error(mensajeError(e, "No se pudo anular"));
    }
  };

  return (
    <div>
      <Toaster richColors position="top-right" />
      <div className={styles.headerTop}>
        <div>
          <h3>Guías de remisión</h3>
          <p className={styles.subtitle}>Documento interno de traslado, generado desde una entrega. No se envía a SUNAT.</p>
        </div>
      </div>

      <div className={`${styles.tableWrap} ${styles.tableWrapTabbed}`}>
        {cargando ? (
          <div className={styles.emptyState}><p>Cargando...</p></div>
        ) : guias.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>🚚</div>
            <h4>Sin guías de remisión</h4>
            <p>Se generan desde una entrega, en Pedidos de venta.</p>
          </div>
        ) : (
          <table className={styles.table}>
            <thead><tr><th>N° Guía</th><th>Pedido</th><th>Cliente</th><th>Traslado</th><th>Destino</th><th>Estado</th><th></th></tr></thead>
            <tbody>
              {guias.map((g) => (
                <tr key={g.id}>
                  <td data-label="N° Guía">{g.numero}</td>
                  <td data-label="Pedido">{g.pedidoVentaNumero}</td>
                  <td data-label="Cliente">{g.clienteNombre ?? "Sin cliente"}</td>
                  <td data-label="Traslado">{g.fechaTraslado}</td>
                  <td data-label="Destino">{g.direccionLlegada ?? "-"}{g.placa ? ` · ${g.placa}` : ""}</td>
                  <td data-label="Estado"><span className={`${styles.estado} ${g.estadoGuia === "ANULADA" ? styles.anulado : styles.confirmado}`}>{g.estadoGuia}</span></td>
                  <td className={styles.accionesCell}>
                    <button className={styles.verBtn} onClick={() => setEditando(g)}>Ver / Completar</button>
                    {g.estadoGuia === "EMITIDA" && <button className={styles.anularBtn} onClick={() => anular(g)}>Anular</button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {editando && (
        <EditarGuia guia={editando} onCerrar={() => setEditando(null)}
          onGuardado={() => { setEditando(null); cargar(); }} />
      )}
    </div>
  );
};

const EditarGuia = ({ guia, onCerrar, onGuardado }: any) => {
  const [modTraslado, setModTraslado] = useState(guia.modTraslado);
  const [pesoTotal, setPesoTotal] = useState(guia.pesoTotal ?? "");
  const [undPesoTotal, setUndPesoTotal] = useState(guia.undPesoTotal ?? "KGM");
  const [direccionPartida, setDireccionPartida] = useState(guia.direccionPartida ?? "");
  const [direccionLlegada, setDireccionLlegada] = useState(guia.direccionLlegada ?? "");
  const [transportistaRuc, setTransportistaRuc] = useState(guia.transportistaRuc ?? "");
  const [transportistaRazonSocial, setTransportistaRazonSocial] = useState(guia.transportistaRazonSocial ?? "");
  const [choferNombre, setChoferNombre] = useState(guia.choferNombre ?? "");
  const [choferDocumento, setChoferDocumento] = useState(guia.choferDocumento ?? "");
  const [placa, setPlaca] = useState(guia.placa ?? "");
  const soloLectura = guia.estadoGuia === "ANULADA";

  const guardar = async () => {
    try {
      await axiosInstance.put(`/guias-remision/${guia.id}/actualizar`, {
        modTraslado, pesoTotal: pesoTotal === "" ? undefined : Number(pesoTotal), undPesoTotal,
        direccionPartida: direccionPartida || undefined, direccionLlegada: direccionLlegada || undefined,
        transportistaRuc: transportistaRuc || undefined, transportistaRazonSocial: transportistaRazonSocial || undefined,
        choferNombre: choferNombre || undefined, choferDocumento: choferDocumento || undefined, placa: placa || undefined,
      });
      toast.success("Guía actualizada");
      onGuardado();
    } catch (e) {
      toast.error(mensajeError(e, "No se pudo guardar"));
    }
  };

  return (
    <div style={overlay} onClick={onCerrar}>
      <div style={modal} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
          <h3 style={{ margin: 0 }}>Guía {guia.numero}</h3>
          <button onClick={onCerrar} aria-label="Cerrar">✕</button>
        </div>
        <p>{guia.clienteNombre ?? "Sin cliente"}{guia.clienteDocumento ? ` · ${guia.clienteDocumento}` : ""} · Traslado: {guia.fechaTraslado}</p>

        <div style={{ display: "flex", gap: 16, margin: "10px 0" }}>
          <label><input type="radio" disabled={soloLectura} checked={modTraslado === "01"} onChange={() => setModTraslado("01")} /> Transporte público</label>
          <label><input type="radio" disabled={soloLectura} checked={modTraslado === "02"} onChange={() => setModTraslado("02")} /> Transporte privado</label>
        </div>

        <div style={{ display: "grid", gap: 8, gridTemplateColumns: "1fr 1fr" }}>
          <input style={input} disabled={soloLectura} placeholder="Dirección de partida" value={direccionPartida} onChange={(e) => setDireccionPartida(e.target.value)} />
          <input style={input} disabled={soloLectura} placeholder="Dirección de llegada" value={direccionLlegada} onChange={(e) => setDireccionLlegada(e.target.value)} />
          <input style={input} disabled={soloLectura} type="number" min={0} step="0.01" placeholder="Peso total" value={pesoTotal} onChange={(e) => setPesoTotal(e.target.value)} />
          <input style={input} disabled={soloLectura} placeholder="Unidad (KGM)" value={undPesoTotal} onChange={(e) => setUndPesoTotal(e.target.value)} />
        </div>

        {modTraslado === "01" ? (
          <div style={{ display: "grid", gap: 8, gridTemplateColumns: "1fr 2fr", marginTop: 8 }}>
            <input style={input} disabled={soloLectura} placeholder="RUC transportista" value={transportistaRuc} onChange={(e) => setTransportistaRuc(e.target.value)} />
            <input style={input} disabled={soloLectura} placeholder="Razón social transportista" value={transportistaRazonSocial} onChange={(e) => setTransportistaRazonSocial(e.target.value)} />
          </div>
        ) : (
          <div style={{ display: "grid", gap: 8, gridTemplateColumns: "2fr 1fr 1fr", marginTop: 8 }}>
            <input style={input} disabled={soloLectura} placeholder="Nombre del chofer" value={choferNombre} onChange={(e) => setChoferNombre(e.target.value)} />
            <input style={input} disabled={soloLectura} placeholder="DNI chofer" value={choferDocumento} onChange={(e) => setChoferDocumento(e.target.value)} />
            <input style={input} disabled={soloLectura} placeholder="Placa" value={placa} onChange={(e) => setPlaca(e.target.value)} />
          </div>
        )}

        <h4 style={{ margin: "14px 0 6px" }}>Productos</h4>
        <table className={styles.table}>
          <thead><tr><th>Producto</th><th>Cantidad</th></tr></thead>
          <tbody>{guia.detalle.map((d: any, i: number) => <tr key={i}><td>{d.producto}</td><td>{d.cantidad}</td></tr>)}</tbody>
        </table>

        {!soloLectura && (
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}>
            <button className={styles.registrarBtn} onClick={guardar}>Guardar</button>
          </div>
        )}
      </div>
    </div>
  );
};
