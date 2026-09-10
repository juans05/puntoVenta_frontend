import { useState, useEffect, ChangeEvent } from "react";
import { Icon } from "@iconify/react/dist/iconify.js";
import styles from "./pedidos.module.css";
import type { IProduct } from "../../../../redux/reducers/productos/interfaces";

interface ProductoPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (productos: IProduct[]) => void;
  products: IProduct[];
}

export const ProductoPickerModal: React.FC<ProductoPickerModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  products,
}) => {
  const [terminoBusqueda, setTerminoBusqueda] = useState("");
  const [productosFiltrados, setProductosFiltrados] = useState<IProduct[]>([]);
  const [seleccionados, setSeleccionados] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (isOpen) {
      setTerminoBusqueda("");
      setSeleccionados(new Set());
      setProductosFiltrados(products);
    }
  }, [isOpen, products]);

  useEffect(() => {
    if (!terminoBusqueda) {
      setProductosFiltrados(products);
      return;
    }

    const termino = terminoBusqueda.toLowerCase().trim();
    const filtrados = products.filter(
      (p) =>
        p.nombre.toLowerCase().includes(termino) ||
        p.productoId.toString().includes(termino)
    );
    setProductosFiltrados(filtrados);
  }, [terminoBusqueda, products]);

  const toggleSeleccion = (productoId: number) => {
    const nuevosSeleccionados = new Set(seleccionados);
    if (nuevosSeleccionados.has(productoId)) {
      nuevosSeleccionados.delete(productoId);
    } else {
      nuevosSeleccionados.add(productoId);
    }
    setSeleccionados(nuevosSeleccionados);
  };

  const handleConfirmar = () => {
    const productosSeleccionados = products.filter((p) => seleccionados.has(p.productoId));
    onSelect(productosSeleccionados);
    onClose();
  };

if (!isOpen) return null;

  return (
    <>
      <div className={styles.modalOverlay} onClick={onClose}>
        <div className={`${styles.modal} ${styles.pickerModal}`} onClick={(e) => e.stopPropagation()}>
          <div className={styles.modalHeader}>
            <h2>Seleccionar Productos</h2>
            <button className={styles.btnCerrar} onClick={onClose}>
              <Icon icon="mdi:close" />
            </button>
          </div>

          <div className={styles.pickerSearch}>
            <Icon icon="mdi:magnify" className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Buscar producto por nombre o ID..."
              value={terminoBusqueda}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setTerminoBusqueda(e.target.value)}
              className={styles.searchInput}
              autoFocus
            />
          </div>

          <div className={styles.pickerList}>
            {productosFiltrados.length === 0 ? (
              <div className={styles.emptyState}>
                <Icon icon="mdi:package-variant-closed" width={48} height={48} />
                <p>No se encontraron productos</p>
              </div>
            ) : (
              productosFiltrados.map((producto) => {
                const isSelected = seleccionados.has(producto.productoId);
                const imagen = producto.rutaImagen;
                return (
                  <div
                    key={producto.productoId}
                    className={`${styles.pickerItem} ${isSelected ? styles.pickerItemSelected : ""}`}
                    onClick={() => toggleSeleccion(producto.productoId)}
                  >
                    <div className={styles.pickerItemCheckbox}>
                      {isSelected ? (
                        <Icon icon="mdi:checkbox-marked-circle" className={styles.checkboxChecked} />
                      ) : (
                        <Icon icon="mdi:checkbox-blank-circle-outline" className={styles.checkboxUnchecked} />
                      )}
                    </div>

                    {imagen && (
                      <img
                        src={imagen}
                        alt={producto.nombre}
                        className={styles.pickerItemImage}
                      />
                    )}

                    <div className={styles.pickerItemInfo}>
                      <p className={styles.pickerItemNombre}>{producto.nombre}</p>
                      <p className={styles.pickerItemPrecio}>
                        S/ {(producto.precioVentaConInpuesto || producto.precio).toFixed(2)}
                      </p>
                    </div>

                    <div className={styles.pickerItemStock}>
                      Stock: {producto.stock}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className={styles.pickerFooter}>
            <button className={styles.btnCancelar} onClick={onClose}>
              Cancelar
            </button>
            <button
              className={styles.btnConfirmar}
              onClick={handleConfirmar}
              disabled={seleccionados.size === 0}
            >
              Agregar {seleccionados.size} producto(s)
            </button>
          </div>
        </div>
      </div>
    </>
  );
};