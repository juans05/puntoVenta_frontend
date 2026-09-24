import { useEffect, useState } from "react";
import { Toaster, toast } from "sonner";
import axiosInstance from "../../../../../../utils/axios";

// Configuracion > Flujo de compras. Solo la puede guardar un administrador (policy del backend).
export const ConfiguracionFlujo = () => {
  const [flujoCompras, setFlujoCompras] = useState("SIMPLIFICADO");
  const [cruceFactura, setCruceFactura] = useState("ADVERTIR");
  const [aprobacionActiva, setAprobacionActiva] = useState(false);
  const [monto, setMonto] = useState("");
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    axiosInstance
      .get("/configuracion-flujo")
      .then((r: any) => {
        const c = r.data?.data;
        if (!c) return;
        setFlujoCompras(c.flujoCompras);
        setCruceFactura(c.cruceFactura);
        setAprobacionActiva(c.montoAprobacionOc != null);
        setMonto(c.montoAprobacionOc != null ? String(c.montoAprobacionOc) : "");
      })
      .catch(() => toast.error("No se pudo cargar la configuración"));
  }, []);

  const guardar = async () => {
    if (aprobacionActiva && (monto === "" || Number(monto) < 0)) return toast.error("Indica un monto de aprobación válido");
    setGuardando(true);
    try {
      await axiosInstance.put("/configuracion-flujo", {
        flujoCompras,
        cruceFactura,
        montoAprobacionOc: flujoCompras === "COMPLETO" && aprobacionActiva ? Number(monto) : null,
      });
      toast.success("Configuración guardada");
    } catch (e: any) {
      toast.error(e?.response?.status === 403 ? "Solo un administrador puede cambiar esto" : e?.response?.data?.message ?? "No se pudo guardar");
    } finally {
      setGuardando(false);
    }
  };

  const completo = flujoCompras === "COMPLETO";
  const caja: React.CSSProperties = { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: 16, marginBottom: 14 };
  const opcion = (activa: boolean): React.CSSProperties => ({
    display: "block", border: `2px solid ${activa ? "#3b82f6" : "#e5e7eb"}`, borderRadius: 10, padding: 12, marginBottom: 8, cursor: "pointer",
  });

  return (
    <div style={{ maxWidth: 720 }}>
      <Toaster richColors position="top-right" />
      <h3>Flujo de compras</h3>
      <p style={{ color: "#6b7280", marginBottom: 14 }}>
        Elige cómo se registran las compras. Cambiar de modo no modifica los documentos ya creados.
      </p>

      <div style={caja}>
        <label style={opcion(!completo)}>
          <input type="radio" checked={!completo} onChange={() => setFlujoCompras("SIMPLIFICADO")} /> <strong>Simplificado</strong>
          <div style={{ color: "#6b7280", marginLeft: 22 }}>Se registra la factura del proveedor y el stock sube al guardar.</div>
        </label>
        <label style={opcion(completo)}>
          <input type="radio" checked={completo} onChange={() => setFlujoCompras("COMPLETO")} /> <strong>Completo</strong>
          <div style={{ color: "#6b7280", marginLeft: 22 }}>Orden de compra → recepción de mercadería (sube el stock) → factura del proveedor con cruce.</div>
        </label>
      </div>

      {completo && (
        <>
          <div style={caja}>
            <strong>Si la factura no coincide con lo recibido o el precio de la orden</strong>
            <div style={{ marginTop: 8 }}>
              <label style={{ marginRight: 16 }}>
                <input type="radio" checked={cruceFactura === "ADVERTIR"} onChange={() => setCruceFactura("ADVERTIR")} /> Advertir y dejar guardar
              </label>
              <label>
                <input type="radio" checked={cruceFactura === "BLOQUEAR"} onChange={() => setCruceFactura("BLOQUEAR")} /> Bloquear
              </label>
            </div>
          </div>

          <div style={caja}>
            <label>
              <input type="checkbox" checked={aprobacionActiva} onChange={(e) => setAprobacionActiva(e.target.checked)} /> <strong>Pedir aprobación según el monto</strong>
            </label>
            {aprobacionActiva && (
              <div style={{ marginTop: 8 }}>
                Las órdenes con total mayor a S/{" "}
                <input type="number" min={0} step="0.01" value={monto} onChange={(e) => setMonto(e.target.value)}
                  style={{ border: "1px solid #d1d5db", borderRadius: 8, padding: "4px 8px", width: 120 }} /> necesitan aprobación de un administrador.
              </div>
            )}
          </div>
        </>
      )}

      <button onClick={guardar} disabled={guardando}
        style={{ background: "#3b82f6", color: "#fff", border: 0, borderRadius: 8, padding: "10px 20px", fontWeight: 600 }}>
        {guardando ? "Guardando..." : "Guardar"}
      </button>
    </div>
  );
};
