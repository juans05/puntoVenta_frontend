import { useEffect, useState } from "react";
import Modal from "react-modal";
import styles from "./emitirNota.module.css";
import { useAppDispatch, useAppSelector } from "../../../../../redux/store";
import { RootState } from "../../../../../redux/rootState";
import { emitirNota, listarMotivosNota } from "../../../../../redux/reducers/Admin/ventas/ventasRealizadas.reducer";

Modal.setAppElement("#root");

const TIPO_NOTA_CREDITO = 4;
const TIPO_NOTA_DEBITO = 5;

interface IEmitirNotaModalProps {
  isOpen: boolean;
  comprobante: any;
  tipoInicial?: number;
  onClose: () => void;
  onSuccess: () => void;
}

// El comprobante solo puede afectarse con una nota del tipo que corresponde a su propio
// tipoDocumentoVentaId de origen (Factura/Boleta) -- pero la nota en si misma (Nota de
// Credito/Debito) es independiente de eso, por eso el usuario elige el tipo de nota aqui.
export const EmitirNotaModal = ({ isOpen, comprobante, tipoInicial, onClose, onSuccess }: IEmitirNotaModalProps) => {
  const dispatch = useAppDispatch();
  const { motivosNota }: any = useAppSelector((state: RootState) => state.ventas);

  const [tipoNota, setTipoNota] = useState<number>(tipoInicial ?? TIPO_NOTA_CREDITO);
  const [motivoNotaId, setMotivoNotaId] = useState<string>("");
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setTipoNota(tipoInicial ?? TIPO_NOTA_CREDITO);
    setMotivoNotaId("");
  }, [isOpen, tipoInicial]);

  useEffect(() => {
    if (!isOpen) return;
    dispatch(listarMotivosNota(tipoNota) as any);
  }, [isOpen, tipoNota, dispatch]);

  const handleSubmit = () => {
    if (!motivoNotaId) return;
    setEnviando(true);
    dispatch(
      emitirNota(
        {
          comprobanteAfectadoId: comprobante.idComprobante,
          motivoNotaId: Number(motivoNotaId),
          tipoDocumentoVentaId: tipoNota,
        },
        () => {
          setEnviando(false);
          onSuccess();
          onClose();
        }
      ) as any
    ).finally(() => setEnviando(false));
  };

  if (!comprobante) return null;

  return (
    <Modal isOpen={isOpen} onRequestClose={onClose} className={styles.panel} overlayClassName={styles.overlay}>
      <div className={styles.encabezado}>
        <h3>
          Emitir Nota
          <small>Contra {comprobante.serieCorrelativo}</small>
        </h3>
        <button type="button" className={styles.closeBtn} onClick={onClose}>x</button>
      </div>

      <div className={styles.resumen}>
        <div><span>Cliente</span><span>{comprobante.clienteNombre || comprobante.nombre}</span></div>
        <div><span>Total</span><span>S/ {comprobante.total ?? comprobante.valorTotal}</span></div>
      </div>

      <div className={styles.tabsTipo}>
        <button
          type="button"
          className={tipoNota === TIPO_NOTA_CREDITO ? styles.active : ""}
          onClick={() => { setTipoNota(TIPO_NOTA_CREDITO); setMotivoNotaId(""); }}
        >
          Nota de Crédito
        </button>
        <button
          type="button"
          className={tipoNota === TIPO_NOTA_DEBITO ? styles.active : ""}
          onClick={() => { setTipoNota(TIPO_NOTA_DEBITO); setMotivoNotaId(""); }}
        >
          Nota de Débito
        </button>
      </div>

      <div className={styles.field}>
        <label>Motivo</label>
        <select className={styles.select} value={motivoNotaId} onChange={(e) => setMotivoNotaId(e.target.value)}>
          <option value="">Selecciona un motivo...</option>
          {motivosNota?.map((m: any) => (
            <option key={m.id} value={m.id}>{m.value}</option>
          ))}
        </select>
      </div>

      <div className={styles.buttons}>
        <button type="button" className={styles.cancel} onClick={onClose}>Cancelar</button>
        <button type="button" className={styles.submit} onClick={handleSubmit} disabled={!motivoNotaId || enviando}>
          {enviando ? "Emitiendo..." : "Emitir"}
        </button>
      </div>
    </Modal>
  );
};
