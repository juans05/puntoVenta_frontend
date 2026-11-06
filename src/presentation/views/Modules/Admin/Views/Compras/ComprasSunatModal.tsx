import { useMemo, useState } from "react";
import Modal from "react-modal";
import { toast } from "sonner";
import axiosInstance from "../../../../../../utils/axios";

const TIPOS: Record<string, string> = { "01": "Factura", "03": "Boleta", "07": "Nota de crédito", "08": "Nota de débito" };

// Mes anterior en formato "AAAA-MM" para el <input type="month">.
const mesAnterior = () => {
  const d = new Date();
  d.setMonth(d.getMonth() - 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};

const espera = (ms: number) => new Promise((r) => setTimeout(r, ms));

const clave = (c: any) => `${c.docProveedor}|${c.serie}-${c.numero}`;

// Facturas de compra que SUNAT tiene para el RUC en el periodo (propuesta del Registro de Compras, RCE).
// Las elegidas se devuelven a Compras, que las abre una por una en el formulario ya llenado.
export const ComprasSunatModal = ({ isOpen, onClose, onRegistrar }: {
  isOpen: boolean;
  onClose: () => void;
  onRegistrar: (comprobantes: any[]) => void;
}) => {
  const [mes, setMes] = useState(mesAnterior());
  const [comprobantes, setComprobantes] = useState<any[] | null>(null);
  const [cargando, setCargando] = useState(false);
  const [aviso, setAviso] = useState("");
  const [soloFaltantes, setSoloFaltantes] = useState(true);
  const [elegidos, setElegidos] = useState<Set<string>>(new Set());

  const consultar = async () => {
    const periodo = mes.replace("-", "");
    setCargando(true);
    setComprobantes(null);
    setElegidos(new Set());
    setAviso("");
    try {
      let numTicket: string | undefined;
      // SUNAT arma el archivo en segundo plano: se reintenta con el mismo ticket hasta ~3 minutos.
      for (let intento = 0; intento < 36; intento++) {
        const { data }: any = await axiosInstance.get(`/sunat/compras/${periodo}`, { params: { numTicket }, timeout: 120000 });
        const r = data?.data;
        if (r?.estado === "LISTO") {
          setComprobantes(r.comprobantes ?? []);
          setAviso("");
          return;
        }
        numTicket = r?.numTicket;
        setAviso(`SUNAT está preparando el archivo (ticket ${numTicket})... puede tardar unos minutos.`);
        await espera(5000);
      }
      setAviso(`SUNAT sigue procesando el ticket ${numTicket}. Vuelve a consultar en unos minutos.`);
    } catch (error: any) {
      toast.error(error?.response?.data?.message ?? "No se pudo consultar a SUNAT");
      setAviso("");
    } finally {
      setCargando(false);
    }
  };

  const filas = useMemo(
    () => (comprobantes ?? []).filter((c) => !soloFaltantes || !c.enSistema),
    [comprobantes, soloFaltantes]
  );
  const faltantes = (comprobantes ?? []).filter((c) => !c.enSistema).length;
  const total = (comprobantes ?? []).reduce((s, c) => s + (c.total ?? 0), 0);
  const importables = filas.filter((c) => !c.enSistema);
  const todosElegidos = importables.length > 0 && importables.every((c) => elegidos.has(clave(c)));

  const alternar = (k: string) =>
    setElegidos((prev) => {
      const s = new Set(prev);
      s.has(k) ? s.delete(k) : s.add(k);
      return s;
    });

  const registrar = () => {
    onRegistrar((comprobantes ?? []).filter((c) => elegidos.has(clave(c))));
    setElegidos(new Set());
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      ariaHideApp={false}
      className="bg-white rounded-2xl p-5 w-full max-w-[1100px] max-h-[90vh] overflow-y-auto outline-none mx-4"
      overlayClassName="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center"
    >
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-lg font-bold text-gray-900">Facturas de compra en SUNAT</h3>
        <button type="button" aria-label="Cerrar" className="text-gray-400 hover:text-gray-700 text-xl" onClick={onClose}>✕</button>
      </div>
      <p className="text-sm text-gray-500 mb-4">
        Comprobantes que tus proveedores emitieron a tu RUC en el periodo (propuesta del Registro de Compras). SUNAT no
        envía los productos: al registrar cada factura se abre el formulario con proveedor, número, fechas y total, y tú
        eliges los productos. Usa la Clave SOL configurada en Mi Empresa → Certificado y Clave SOL.
      </p>

      <div className="flex flex-wrap items-end gap-3 mb-4">
        <div>
          <label className="text-xs font-semibold text-gray-500">Periodo</label>
          <input type="month" className="block border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1" value={mes}
            max={new Date().toISOString().slice(0, 7)} onChange={(e) => setMes(e.target.value)} />
        </div>
        <button type="button" className="bg-indigo-600 text-white text-sm font-semibold rounded-lg px-4 py-2 disabled:opacity-60"
          disabled={cargando || !mes} onClick={consultar}>
          {cargando ? "Consultando SUNAT..." : "Consultar"}
        </button>
        {comprobantes && (
          <label className="flex items-center gap-2 text-sm text-gray-600 ml-auto">
            <input type="checkbox" checked={soloFaltantes} onChange={(e) => setSoloFaltantes(e.target.checked)} />
            Solo los que no están registrados
          </label>
        )}
      </div>

      {aviso && <p className="text-sm text-amber-600 mb-3">{aviso}</p>}

      {comprobantes && (
        <>
          <div className="flex flex-wrap gap-3 mb-3 text-sm">
            <span className="bg-gray-50 rounded-lg px-3 py-2">Comprobantes en SUNAT: <b>{comprobantes.length}</b></span>
            <span className={`rounded-lg px-3 py-2 ${faltantes ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}>
              Sin registrar: <b>{faltantes}</b>
            </span>
            <span className="bg-gray-50 rounded-lg px-3 py-2">Total: <b>S/ {total.toFixed(2)}</b></span>
            <button type="button" className="ml-auto bg-indigo-600 text-white font-semibold rounded-lg px-4 py-2 disabled:opacity-60"
              disabled={elegidos.size === 0} onClick={registrar}>
              {`Registrar seleccionadas (${elegidos.size})`}
            </button>
          </div>
          <div className="border border-gray-100 rounded-xl overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-600">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                  <th className="px-3 py-2">
                    <input type="checkbox" aria-label="Elegir todos" disabled={importables.length === 0} checked={todosElegidos}
                      onChange={() => setElegidos(todosElegidos ? new Set() : new Set(importables.map(clave)))} />
                  </th>
                  <th className="px-3 py-2">Fecha</th>
                  <th className="px-3 py-2">Tipo</th>
                  <th className="px-3 py-2">Número</th>
                  <th className="px-3 py-2">Proveedor</th>
                  <th className="px-3 py-2 text-right">Base</th>
                  <th className="px-3 py-2 text-right">IGV</th>
                  <th className="px-3 py-2 text-right">Total</th>
                  <th className="px-3 py-2">En el sistema</th>
                </tr>
              </thead>
              <tbody>
                {filas.length === 0 ? (
                  <tr><td colSpan={9} className="px-3 py-8 text-center text-gray-400">No hay comprobantes para mostrar.</td></tr>
                ) : (
                  filas.map((c) => (
                    <tr key={clave(c)} className="border-b">
                      <td className="px-3 py-2">
                        {!c.enSistema && (
                          <input type="checkbox" aria-label={`Elegir ${c.serie}-${c.numero}`} checked={elegidos.has(clave(c))} onChange={() => alternar(clave(c))} />
                        )}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">{c.fecha}</td>
                      <td className="px-3 py-2 whitespace-nowrap">{TIPOS[c.tipo] ?? c.tipo}</td>
                      <td className="px-3 py-2 whitespace-nowrap font-medium text-gray-900">{c.serie}-{c.numero}</td>
                      <td className="px-3 py-2">
                        <div>{c.proveedor}</div>
                        <div className="text-xs text-gray-400">{c.docProveedor}</div>
                      </td>
                      <td className="px-3 py-2 text-right">{c.baseGravada.toFixed(2)}</td>
                      <td className="px-3 py-2 text-right">{c.igv.toFixed(2)}</td>
                      <td className="px-3 py-2 text-right">{c.moneda && c.moneda !== "PEN" ? `${c.moneda} ` : ""}{c.total.toFixed(2)}</td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        {c.enSistema
                          ? <span className="text-xs font-semibold text-green-600">✓ Registrada</span>
                          : <span className="text-xs font-semibold text-red-600">✕ Sin registrar</span>}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </Modal>
  );
};
