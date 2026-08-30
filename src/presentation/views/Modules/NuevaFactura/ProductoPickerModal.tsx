import Modal from "react-modal";
import { useMemo, useState } from "react";
import { Icon } from "@iconify/react/dist/iconify.js";
import styles from "./nuevaFactura.module.css";
import { IProduct } from "../../../../redux/reducers/productos/interfaces";

Modal.setAppElement("#root");

interface IProps {
  isOpen: boolean;
  onClose: () => void;
  products: IProduct[];
  onAgregar: (seleccionados: IProduct[]) => void;
}

export const ProductoPickerModal = ({ isOpen, onClose, products, onAgregar }: IProps) => {
  const [busqueda, setBusqueda] = useState("");
  const [seleccionados, setSeleccionados] = useState<Set<number>>(new Set());

  const filtrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();
    if (!texto) return products;
    return products.filter((p) => p.nombre?.toLowerCase().includes(texto));
  }, [products, busqueda]);

  const toggleSeleccion = (productoId: number) => {
    setSeleccionados((prev) => {
      const siguiente = new Set(prev);
      if (siguiente.has(productoId)) siguiente.delete(productoId);
      else siguiente.add(productoId);
      return siguiente;
    });
  };

  const confirmar = () => {
    const elegidos = products.filter((p) => seleccionados.has(p.productoId));
    onAgregar(elegidos);
    setSeleccionados(new Set());
    setBusqueda("");
    onClose();
  };

  const cerrar = () => {
    setSeleccionados(new Set());
    setBusqueda("");
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={cerrar}
      closeTimeoutMS={200}
      className={styles.pickerPanel}
      overlayClassName={styles.overlay}
    >
      <div className={styles.pickerHeader}>
        <h3>Agregar productos</h3>
        <button type="button" className={styles.closeBtn} onClick={cerrar}>
          <Icon icon="mdi:close" width={20} />
        </button>
      </div>

      <div className={styles.pickerSearch}>
        <Icon icon="iconamoon:search-bold" width={20} />
        <input
          autoFocus
          type="text"
          placeholder="Buscar producto..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      <div className={styles.pickerList}>
        {filtrados.length === 0 ? (
          <p className={styles.pickerEmpty}>No se encontraron productos.</p>
        ) : (
          filtrados.map((p) => {
            const activo = seleccionados.has(p.productoId);
            return (
              <div
                key={p.productoId}
                className={activo ? `${styles.pickerRow} ${styles.pickerRowActive}` : styles.pickerRow}
                onClick={() => toggleSeleccion(p.productoId)}
              >
                <input type="checkbox" readOnly checked={activo} />
                <div className={styles.pickerRowInfo}>
                  <span className={styles.pickerRowNombre}>{p.nombre}</span>
                  <span className={styles.pickerRowMeta}>
                    Stock: {p.stock ?? 0} · {p.nombreCategoria}
                  </span>
                </div>
                <span className={styles.pickerRowPrecio}>S/ {Number(p.precio).toFixed(2)}</span>
              </div>
            );
          })
        )}
      </div>

      <div className={styles.pickerFooter}>
        <button type="button" className={styles.cancel} onClick={cerrar}>
          Cancelar
        </button>
        <button
          type="button"
          className={styles.submit}
          disabled={seleccionados.size === 0}
          onClick={confirmar}
        >
          Agregar ({seleccionados.size})
        </button>
      </div>
    </Modal>
  );
};
