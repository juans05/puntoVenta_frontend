import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import styles from "./notasCreditoDebito.module.css";
import { useAppDispatch, useAppSelector } from "../../../../../../redux/store";
import { RootState } from "../../../../../../redux/rootState";
import {
  buscarComprobante,
  clearComprobanteBuscado,
  getAllVentas,
} from "../../../../../../redux/reducers/Admin/ventas/ventasRealizadas.reducer";
import { EmitirNotaModal } from "../../../../../../components/Modal/Admin/Notas/EmitirNotaModal";
import moment from "moment";
import { Toaster, toast } from "sonner";
import { useFormErrors, estiloError, CampoError } from "../../../../../../components/FormError";

const rangoPorDefecto = () => ({
  dateStart: moment().subtract(30, "days").format("DD/MM/YYYY"),
  dateEnd: moment().format("DD/MM/YYYY"),
});

const TIPO_NOTA_CREDITO = 4;
const TIPO_NOTA_DEBITO = 5;

export const NotasCreditoDebito = () => {
  const dispatch = useAppDispatch();
  const { ventas, comprobanteBuscado }: any = useAppSelector((state: RootState) => state.ventas);
  const { tipo } = useParams<{ tipo: string }>();
  const tipoNota = tipo === "debito" ? TIPO_NOTA_DEBITO : TIPO_NOTA_CREDITO;

  const [serie, setSerie] = useState("");
  const [correlativo, setCorrelativo] = useState("");
  const [modalComprobante, setModalComprobante] = useState<any>(null);

  const recargarVentas = () => {
    const { dateStart, dateEnd } = rangoPorDefecto();
    dispatch(getAllVentas(dateStart, dateEnd) as any);
  };

  useEffect(() => {
    recargarVentas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  const notasEmitidas = useMemo(
    () => (ventas || []).filter((v: any) => v.tipoDocumentoVentaId === 4 || v.tipoDocumentoVentaId === 5),
    [ventas]
  );

  const { errors, setError, clearError } = useFormErrors();

  const handleBuscar = () => {
    if (!serie.trim()) {
      setError("serie", "Escribe la serie del comprobante (ej. F001)");
      return toast.error("Escribe la serie del comprobante (ej. F001)");
    }
    if (!correlativo) {
      setError("correlativo", "Escribe el número de correlativo del comprobante");
      return toast.error("Escribe el número de correlativo del comprobante");
    }
    dispatch(buscarComprobante(serie.trim().toUpperCase(), Number(correlativo)) as any);
  };

  const abrirEmitirNota = () => {
    if (!comprobanteBuscado) return;
    setModalComprobante({
      idComprobante: comprobanteBuscado.id,
      serieCorrelativo: `${comprobanteBuscado.serie}-${comprobanteBuscado.correlativo}`,
      clienteNombre: comprobanteBuscado.razonSocial,
      numeroDocumento: comprobanteBuscado.numeroDocumento,
      total: comprobanteBuscado.valorTotal,
      valorSubtotal: comprobanteBuscado.valorSubtotal,
      valorIgv: comprobanteBuscado.valorIgv,
      tipoDocumentoVentaId: comprobanteBuscado.tipoDocumentoVentaId,
      detalle: (comprobanteBuscado.comprobanteDetalles || []).map((d: any) => ({
        nombre: d.producto?.nombre ?? "Producto",
        cantidad: d.cantidad,
        valorUnitario: d.valorUnitario,
        valorUnitarioTotal: d.valorUnitarioTotal,
      })),
    });
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3>{tipoNota === TIPO_NOTA_DEBITO ? "Nueva Nota de Débito" : "Nueva Nota de Crédito"}</h3>
      </div>

      <div className={styles.buscador}>
        <input
          className={styles.input}
          placeholder="Serie (ej. B001)"
          value={serie}
          style={estiloError(!!errors.serie)}
          onChange={(e) => { setSerie(e.target.value); clearError("serie"); }}
        />
        <input
          className={styles.input}
          placeholder="Correlativo"
          type="number"
          value={correlativo}
          style={estiloError(!!errors.correlativo)}
          onChange={(e) => { setCorrelativo(e.target.value); clearError("correlativo"); }}
        />
        <button className={styles.buscarBtn} onClick={handleBuscar}>
          Buscar
        </button>
      </div>
      <CampoError mensaje={errors.serie ?? errors.correlativo} />

      {comprobanteBuscado && (
        <div className={styles.resultado}>
          <div>
            <div className={styles.resultadoLabel}>Comprobante encontrado</div>
            <div className={styles.resultadoValue}>
              {comprobanteBuscado.serie}-{String(comprobanteBuscado.correlativo).padStart(7, "0")} ·{" "}
              {comprobanteBuscado.razonSocial || "Sin nombre"} · S/{" "}
              {Number(comprobanteBuscado.valorTotal).toFixed(2)}
            </div>
          </div>
          <button className={styles.emitirBtn} onClick={abrirEmitirNota}>
            Emitir Nota
          </button>
        </div>
      )}

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Serie-Correlativo</th>
              <th>Tipo</th>
              <th>Cliente</th>
              <th>Total</th>
              <th>Fecha</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {notasEmitidas.length === 0 ? (
              <tr>
                <td colSpan={6} className={styles.empty}>
                  Aún no se han emitido notas.
                </td>
              </tr>
            ) : (
              notasEmitidas.map((n: any) => (
                <tr key={n.idComprobante}>
                  <td data-label="Serie-Correlativo">
                    {n.serie}-{n.correlativo}
                  </td>
                  <td data-label="Tipo">{n.tipoDocumentoVentaId === 4 ? "Nota de Crédito" : "Nota de Débito"}</td>
                  <td data-label="Cliente">{n.clienteNombre || "Sin especificar"}</td>
                  <td data-label="Total">S/ {Number(n.valorTotal).toFixed(2)}</td>
                  <td data-label="Fecha">{n.fecha}</td>
                  <td data-label="Estado">{n.estadoComprobante}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <EmitirNotaModal
        isOpen={!!modalComprobante}
        comprobante={modalComprobante}
        tipoInicial={tipoNota}
        onClose={() => setModalComprobante(null)}
        onSuccess={() => {
          dispatch(clearComprobanteBuscado());
          setSerie("");
          setCorrelativo("");
          recargarVentas();
        }}
      />
      <Toaster richColors position="top-right" />
    </div>
  );
};
