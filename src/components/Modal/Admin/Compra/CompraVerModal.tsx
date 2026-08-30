import Modal from "react-modal";
import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import styles from "./compra.module.css";
import axiosInstance from "../../../../utils/axios";
import { toast } from "sonner";

Modal.setAppElement("#root");

interface IProps {
  isOpen: boolean;
  onClose: () => void;
  compraId?: number;
}

export const CompraVerModal = ({ isOpen, onClose, compraId }: IProps) => {
  const [compra, setCompra] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !compraId) {
      setCompra(null);
      return;
    }

    setLoading(true);
    axiosInstance
      .get(`/compras/${compraId}`)
      .then(({ data }: any) => setCompra(data?.data ?? null))
      .catch(() => {
        toast.error("No se pudo cargar la compra");
        setCompra(null);
      })
      .finally(() => setLoading(false));
  }, [isOpen, compraId]);

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      closeTimeoutMS={200}
      className={styles.panel}
      overlayClassName={styles.overlay}
    >
      <div className={styles.encabezado}>
        <h3>
          Compra {compra?.numeroCompra ?? ""}
          <small>Detalle de lo registrado</small>
        </h3>
        <button type="button" className={styles.closeBtn} onClick={onClose}>
          <Icon icon="mdi:close" width={20} />
        </button>
      </div>

      {loading || !compra ? (
        <p>Cargando...</p>
      ) : (
        <>
          <div className={styles.section}>
            <h3>Datos de la compra</h3>
            <div className={styles.grid}>
              <div>
                <label>Fecha</label>
                <div>{compra.fechaCompra}</div>
              </div>
              <div>
                <label>Proveedor</label>
                <div>{compra.proveedor ?? "Sin proveedor"}</div>
              </div>
              <div>
                <label>Método de pago</label>
                <div>{compra.metodoPago ?? "-"}</div>
              </div>
              <div>
                <label>Estado</label>
                <div>{compra.estado}</div>
              </div>
              <div>
                <label>Usuario</label>
                <div>{compra.usuario ?? "-"}</div>
              </div>
              {compra.observacion && (
                <div className={styles.full}>
                  <label>Observación</label>
                  <div>{compra.observacion}</div>
                </div>
              )}
            </div>
          </div>

          <div className={styles.section}>
            <h3>Productos</h3>
            {(compra.detalle ?? []).map((d: any, index: number) => (
              <div key={index} className={styles.detalleRow}>
                <div>{d.producto ?? `Producto ${d.productoId}`}</div>
                <div>Cant: {d.cantidad}</div>
                <div>S/ {Number(d.costoUnitario).toFixed(2)}</div>
                <div className={styles.subtotal}>S/ {Number(d.subtotal).toFixed(2)}</div>
              </div>
            ))}
            <div className={styles.total}>
              <span>Total:</span>
              <span>S/ {Number(compra.total).toFixed(2)}</span>
            </div>
          </div>

          <div className={styles.buttons}>
            <button type="button" className={styles.cancel} onClick={onClose}>
              Cerrar
            </button>
          </div>
        </>
      )}
    </Modal>
  );
};
