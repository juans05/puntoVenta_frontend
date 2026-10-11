import { useEffect } from "react";

// Vista previa del asiento contable que generara el backend al guardar. Es solo informativa:
// replica las reglas por defecto (PCGE) del repositorio correspondiente; si el producto/proveedor
// tiene cuentas propias configuradas, el asiento real las usa en lugar de estos codigos.
export type LineaPreview = { cuenta: string; descripcion: string; debe: number; haber: number };

const fmt = (n: number) => (n ? n.toFixed(2) : "");

export const AsientoPreview = ({ titulo = "Asiento contable a generar", lineas, nota }: { titulo?: string; lineas: LineaPreview[]; nota?: string }) => {
  const visibles = lineas.filter((l) => l.debe || l.haber);
  const debe = visibles.reduce((a, l) => a + l.debe, 0);
  const haber = visibles.reduce((a, l) => a + l.haber, 0);
  return (
    <div style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: 10, marginTop: 10, background: "#fafafa" }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 6 }}>📒 {titulo} (vista previa)</div>
      {visibles.length === 0 ? (
        <p style={{ fontSize: 12, color: "#6b7280", margin: 0 }}>Completa los montos para ver el asiento.</p>
      ) : (
        <table style={{ width: "100%", fontSize: 12, borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ color: "#6b7280", textAlign: "left" }}>
              <th style={{ padding: "2px 4px" }}>Cuenta</th>
              <th style={{ padding: "2px 4px" }}>Descripción</th>
              <th style={{ padding: "2px 4px", textAlign: "right" }}>Debe</th>
              <th style={{ padding: "2px 4px", textAlign: "right" }}>Haber</th>
            </tr>
          </thead>
          <tbody>
            {visibles.map((l, i) => (
              <tr key={i} style={{ borderTop: "1px solid #eee" }}>
                <td style={{ padding: "2px 4px", fontWeight: 600 }}>{l.cuenta}</td>
                <td style={{ padding: "2px 4px" }}>{l.descripcion}</td>
                <td style={{ padding: "2px 4px", textAlign: "right" }}>{fmt(l.debe)}</td>
                <td style={{ padding: "2px 4px", textAlign: "right" }}>{fmt(l.haber)}</td>
              </tr>
            ))}
            <tr style={{ borderTop: "2px solid #d1d5db", fontWeight: 700 }}>
              <td colSpan={2} style={{ padding: "2px 4px" }}>Totales</td>
              <td style={{ padding: "2px 4px", textAlign: "right" }}>{debe.toFixed(2)}</td>
              <td style={{ padding: "2px 4px", textAlign: "right" }}>{haber.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
      )}
      {nota && <p style={{ fontSize: 11, color: "#6b7280", margin: "6px 0 0" }}>{nota}</p>}
    </div>
  );
};

// Asiento de una factura de compra (CompraRepository.CrearCompraCore): 60 (bien) / 63 (servicio)
// = valor sin IGV, 40111 = IGV, 42 = total que se le debe al proveedor.
export const lineasAsientoCompra = (gravada: number, igv: number, total: number, esServicio = false): LineaPreview[] => [
  { cuenta: esServicio ? "63" : "60", descripcion: esServicio ? "Gastos de servicios (subtotal)" : "Compras (subtotal)", debe: gravada, haber: 0 },
  { cuenta: "40111", descripcion: "IGV - crédito fiscal", debe: igv, haber: 0 },
  { cuenta: "42", descripcion: "Cuentas por pagar al proveedor (total)", debe: 0, haber: total },
];

// Mismo calculo que el backend (TaxCalculator): los precios incluyen IGV; el subtotal se obtiene
// dividiendo entre 1.18 cuando la afectacion es gravada.
export const separarIgv = (total: number, aplicaIgv: boolean, tasa = 18) => {
  const gravada = aplicaIgv ? Math.round((total / (1 + tasa / 100)) * 100) / 100 : total;
  const igv = aplicaIgv ? Math.round((total - gravada) * 100) / 100 : 0;
  return { gravada, igv, total };
};

// Plazo de credito en dias: sugiere 15/30/45/60/90 pero acepta cualquier numero (datalist nativo),
// y calcula la fecha de vencimiento a partir de la fecha de emision (o hoy).
const PLAZOS = [7, 15, 20, 30, 45, 60, 90];

export const sumarDias = (fechaIso: string, dias: number) => {
  const base = fechaIso ? new Date(`${fechaIso}T00:00:00`) : new Date();
  base.setDate(base.getDate() + dias);
  return `${base.getFullYear()}-${String(base.getMonth() + 1).padStart(2, "0")}-${String(base.getDate()).padStart(2, "0")}`;
};

export const PlazoCredito = ({
  dias, onDias, fechaEmision, fechaVencimiento, onFechaVencimiento, error, inputStyle,
}: {
  dias: string; onDias: (v: string) => void; fechaEmision: string; fechaVencimiento: string;
  onFechaVencimiento: (v: string) => void; error?: boolean; inputStyle?: React.CSSProperties;
}) => {
  useEffect(() => {
    const n = parseInt(dias, 10);
    if (n > 0) onFechaVencimiento(sumarDias(fechaEmision, n));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dias, fechaEmision]);
  const estilo: React.CSSProperties = { border: `1px solid ${error ? "#f04438" : "#d1d5db"}`, borderRadius: 8, padding: "6px 8px", width: "100%", ...inputStyle };
  return (
    <div style={{ display: "grid", gap: 8, gridTemplateColumns: "1fr 1fr" }}>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 4 }}>Condición de pago (días de crédito)</label>
        <input style={estilo} type="number" min={1} list="plazos-credito" placeholder="Ej. 30" value={dias} onChange={(e) => onDias(e.target.value)} />
        <datalist id="plazos-credito">
          {PLAZOS.map((p) => <option key={p} value={p}>{`Crédito a ${p} días`}</option>)}
        </datalist>
      </div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 4 }}>Fecha de vencimiento</label>
        <input style={estilo} type="date" value={fechaVencimiento} onChange={(e) => onFechaVencimiento(e.target.value)} />
      </div>
    </div>
  );
};
