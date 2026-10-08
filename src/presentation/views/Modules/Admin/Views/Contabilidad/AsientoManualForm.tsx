import { useEffect, useState } from "react";
import { toast } from "sonner";
import axiosInstance from "../../../../../../utils/axios";

// Asiento manual ("Pestaña de Asiento contable_v1.docx"): grilla de lineas con cuenta, cuenta asociada,
// nombre, centros de costos 1/2, cuenta de destino (solo gastos 62-68), debito, credito y descripcion.
// El backend valida que cuadre, cuentas de ultimo nivel y centros obligatorios; aqui solo se ayuda.

type Linea = {
  cuentaCodigo: string;
  cuentaAsociada: string;
  centroCosto1Id: string;
  centroCosto2Id: string;
  cuentaDestinoId: string;
  descripcion: string;
  debe: string;
  haber: string;
};

const lineaVacia = (): Linea => ({
  cuentaCodigo: "", cuentaAsociada: "", centroCosto1Id: "", centroCosto2Id: "", cuentaDestinoId: "", descripcion: "", debe: "", haber: "",
});

const hoy = () => new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD en hora local
const num = (s: string) => Math.round((parseFloat(s) || 0) * 100) / 100;
const esGastoConDestino = (codigo: string) => {
  const clase = parseInt(codigo.slice(0, 2), 10);
  return clase >= 62 && clase <= 68;
};
const formatSoles = (n: number) => `S/ ${n.toFixed(2)}`;

const celda = "border border-gray-200 rounded-md px-2 py-1.5 text-sm w-full bg-white";

export const AsientoManualForm = ({ onGuardado, onCancelar }: { onGuardado: () => void; onCancelar: () => void }) => {
  const [cuentas, setCuentas] = useState<any[]>([]);
  const [centros, setCentros] = useState<any[]>([]);
  const [fecha, setFecha] = useState(hoy());
  const [fechaDocumento, setFechaDocumento] = useState("");
  const [fechaVencimiento, setFechaVencimiento] = useState("");
  const [glosa, setGlosa] = useState("");
  const [lineas, setLineas] = useState<Linea[]>([lineaVacia(), lineaVacia()]);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    axiosInstance.get("/cuentas-contables/listar").then((r: any) => setCuentas(r.data?.data ?? [])).catch(() => {});
    axiosInstance.get("/extensiones/centros-costo").then((r: any) => setCentros(r.data?.data ?? [])).catch(() => {});
  }, []);

  const hojas = cuentas.filter((c: any) => c.nivel === 5);
  const clase9 = hojas.filter((c: any) => c.codigo.startsWith("9"));
  const nombreDe = (codigo: string) => hojas.find((c: any) => c.codigo === codigo)?.nombre ?? "";

  const cambiar = (i: number, campo: keyof Linea, valor: string) =>
    setLineas((ls) => ls.map((l, j) => {
      if (j !== i) return l;
      const nueva = { ...l, [campo]: valor };
      if (campo === "cuentaCodigo" && !esGastoConDestino(valor)) nueva.cuentaDestinoId = ""; // destino solo para 62-68
      if (campo === "debe" && valor) nueva.haber = "";   // una linea es debito o credito, no ambos
      if (campo === "haber" && valor) nueva.debe = "";
      return nueva;
    }));

  const totalDebe = lineas.reduce((s, l) => s + num(l.debe), 0);
  const totalHaber = lineas.reduce((s, l) => s + num(l.haber), 0);
  const diferencia = Math.round((totalDebe - totalHaber) * 100) / 100;

  const guardar = async () => {
    if (diferencia !== 0) return toast.error("El asiento no cuadra: la diferencia debe ser 0");
    setGuardando(true);
    try {
      await axiosInstance.post("/asientos-contables/crear", {
        fecha,
        fechaDocumento: fechaDocumento || null,
        fechaVencimiento: fechaVencimiento || null,
        glosa,
        lineas: lineas
          .filter((l) => l.cuentaCodigo.trim() && (num(l.debe) || num(l.haber)))
          .map((l) => ({
            cuentaCodigo: l.cuentaCodigo.trim(),
            cuentaAsociada: l.cuentaAsociada.trim() || null,
            centroCosto1Id: l.centroCosto1Id ? Number(l.centroCosto1Id) : null,
            centroCosto2Id: l.centroCosto2Id ? Number(l.centroCosto2Id) : null,
            cuentaDestinoId: l.cuentaDestinoId ? Number(l.cuentaDestinoId) : null,
            descripcion: l.descripcion.trim() || null,
            debe: num(l.debe),
            haber: num(l.haber),
          })),
      });
      toast.success("Asiento registrado");
      onGuardado();
    } catch (error: any) {
      toast.error(error?.response?.data?.message ?? "No se pudo registrar el asiento");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="mt-5 bg-white border border-gray-100 rounded-2xl p-4">
      <div className="flex flex-wrap gap-4 justify-between">
        <div className="flex flex-wrap gap-3 items-end flex-1 min-w-0">
          <div>
            <label className="text-xs font-semibold text-gray-500">Fecha contable</label>
            <input type="date" className={`${celda} mt-1`} value={fecha} onChange={(e) => setFecha(e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500">Fecha documento</label>
            <input type="date" className={`${celda} mt-1`} value={fechaDocumento} onChange={(e) => setFechaDocumento(e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500">Vencimiento</label>
            <input type="date" className={`${celda} mt-1`} value={fechaVencimiento} onChange={(e) => setFechaVencimiento(e.target.value)} />
          </div>
          <div className="flex-1 min-w-[220px]">
            <label className="text-xs font-semibold text-gray-500">Descripción</label>
            <input type="text" className={`${celda} mt-1`} placeholder="Escribe una descripción" value={glosa} onChange={(e) => setGlosa(e.target.value)} />
          </div>
        </div>

        <div className="border border-gray-200 rounded-xl px-4 py-3 text-sm min-w-[220px]">
          <div className="flex justify-between gap-6"><span>Débitos totales:</span><span>{formatSoles(totalDebe)}</span></div>
          <div className="flex justify-between gap-6"><span>Créditos totales:</span><span>{formatSoles(totalHaber)}</span></div>
          <div className="flex justify-between gap-6 font-bold">
            <span>Diferencia:</span>
            <span className={diferencia === 0 ? "text-green-600" : "text-red-600"}>{formatSoles(diferencia)}</span>
          </div>
        </div>
      </div>

      <datalist id="cuentas-hoja">
        {hojas.map((c: any) => <option key={c.id} value={c.codigo}>{c.nombre}</option>)}
      </datalist>

      <div className="overflow-x-auto mt-4">
        <table className="w-full text-sm min-w-[1100px]">
          <thead className="text-xs text-gray-600">
            <tr>
              <th className="text-left py-2 pr-2 w-[130px]">Cuenta contable</th>
              <th className="text-left py-2 pr-2 w-[120px]">Cuenta asociada</th>
              <th className="text-left py-2 pr-2">Nombre de cuenta</th>
              <th className="text-left py-2 pr-2 w-[130px]">Centro de costos 1</th>
              <th className="text-left py-2 pr-2 w-[130px]">Centro de costos 2</th>
              <th className="text-left py-2 pr-2 w-[140px]">Cuenta de destino</th>
              <th className="text-left py-2 pr-2 w-[100px]">Débito</th>
              <th className="text-left py-2 pr-2 w-[100px]">Crédito</th>
              <th className="text-left py-2 pr-2 w-[160px]">Descripción</th>
              <th className="w-8" />
            </tr>
          </thead>
          <tbody>
            {lineas.map((l, i) => (
              <tr key={i} className="align-top">
                <td className="py-1 pr-2">
                  <input list="cuentas-hoja" className={celda} placeholder="Código" value={l.cuentaCodigo}
                    onChange={(e) => cambiar(i, "cuentaCodigo", e.target.value)} />
                </td>
                <td className="py-1 pr-2">
                  <input className={celda} placeholder="RUC / DNI" value={l.cuentaAsociada} onChange={(e) => cambiar(i, "cuentaAsociada", e.target.value)} />
                </td>
                <td className="py-1 pr-2 text-gray-700 pt-2.5">{nombreDe(l.cuentaCodigo)}</td>
                <td className="py-1 pr-2">
                  <select className={celda} value={l.centroCosto1Id} onChange={(e) => cambiar(i, "centroCosto1Id", e.target.value)}>
                    <option value="" />
                    {centros.map((c: any) => <option key={c.id} value={c.id}>{c.value}</option>)}
                  </select>
                </td>
                <td className="py-1 pr-2">
                  <select className={celda} value={l.centroCosto2Id} onChange={(e) => cambiar(i, "centroCosto2Id", e.target.value)}>
                    <option value="" />
                    {centros.map((c: any) => <option key={c.id} value={c.id}>{c.value}</option>)}
                  </select>
                </td>
                <td className="py-1 pr-2">
                  <select className={`${celda} disabled:bg-gray-100`} value={l.cuentaDestinoId} disabled={!esGastoConDestino(l.cuentaCodigo)}
                    title={esGastoConDestino(l.cuentaCodigo) ? "" : "Solo para gastos de las clases 62 a 68"}
                    onChange={(e) => cambiar(i, "cuentaDestinoId", e.target.value)}>
                    <option value="">{esGastoConDestino(l.cuentaCodigo) ? "Según cuenta" : ""}</option>
                    {clase9.map((c: any) => <option key={c.id} value={c.id}>{c.codigo} - {c.nombre}</option>)}
                  </select>
                </td>
                <td className="py-1 pr-2">
                  <input type="number" min="0" step="0.01" className={`${celda} text-right`} value={l.debe} onChange={(e) => cambiar(i, "debe", e.target.value)} />
                </td>
                <td className="py-1 pr-2">
                  <input type="number" min="0" step="0.01" className={`${celda} text-right`} value={l.haber} onChange={(e) => cambiar(i, "haber", e.target.value)} />
                </td>
                <td className="py-1 pr-2">
                  <input className={celda} value={l.descripcion} onChange={(e) => cambiar(i, "descripcion", e.target.value)} />
                </td>
                <td className="py-1">
                  <button type="button" aria-label="Quitar línea" className="text-gray-400 hover:text-red-600 px-2 py-1.5 disabled:opacity-30"
                    disabled={lineas.length <= 2} onClick={() => setLineas((ls) => ls.filter((_, j) => j !== i))}>✕</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap justify-between gap-3 mt-3">
        <button type="button" className="border border-gray-300 rounded-lg px-3 py-2 text-sm hover:bg-gray-50"
          onClick={() => setLineas((ls) => [...ls, lineaVacia()])}>
          Agregar línea
        </button>
        <div className="flex gap-2">
          <button type="button" className="border border-gray-300 rounded-lg px-4 py-2 text-sm hover:bg-gray-50" onClick={onCancelar}>Cancelar</button>
          <button type="button" className="bg-indigo-600 text-white text-sm font-semibold rounded-lg px-4 py-2 disabled:opacity-60"
            disabled={guardando || diferencia !== 0 || totalDebe === 0} onClick={guardar}>
            {guardando ? "Guardando..." : "Registrar asiento"}
          </button>
        </div>
      </div>
    </div>
  );
};
