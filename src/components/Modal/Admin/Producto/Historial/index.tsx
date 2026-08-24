import Modal from "react-modal";
import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import styles from "./historial.module.css";
import { useAppDispatch, useAppSelector } from "../../../../../redux/store";
import { RootState } from "../../../../../redux/rootState";
import {
  closeModalHistorial,
  getMovimientosProducto,
} from "../../../../../redux/reducers/Admin/productos/producto.reducer";

Modal.setAppElement("#root");

const TIPOS_SALIDA = ["Venta", "AjusteSalida", "DevolucionCompra"];
const PAGE_SIZE = 10;

export const HistorialModal = () => {
  const dispatch = useAppDispatch();
  const { modalHistorial, historialProducto, movimientos, totalMovimientos }: any =
    useAppSelector((state: RootState) => state.adminProducts);

  const [page, setPage] = useState(1);

  useEffect(() => {
    if (modalHistorial) setPage(1);
  }, [modalHistorial]);

  useEffect(() => {
    if (modalHistorial && historialProducto?.productoId) {
      dispatch(
        getMovimientosProducto(historialProducto.productoId, page, PAGE_SIZE) as any
      );
    }
  }, [modalHistorial, historialProducto, page, dispatch]);

  const onClose = () => dispatch(closeModalHistorial() as any);

  const salidas = (movimientos ?? []).filter((m: any) =>
    TIPOS_SALIDA.includes(m.tipoMovimiento)
  );
  const totalPages = Math.max(1, Math.ceil((totalMovimientos || 0) / PAGE_SIZE));

  return (
    <Modal
      isOpen={modalHistorial}
      onRequestClose={onClose}
      closeTimeoutMS={200}
      className={styles.panel}
      overlayClassName={styles.overlay}
    >
      <div className={styles.encabezado}>
        <h3>
          Historial de salidas
          <small>{historialProducto?.nombre}</small>
        </h3>
        <button type="button" className={styles.closeBtn} onClick={onClose}>
          <Icon icon="mdi:close" width={20} />
        </button>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Tipo</th>
              <th>Cantidad</th>
              <th>Stock antes</th>
              <th>Stock después</th>
              <th>Usuario</th>
            </tr>
          </thead>
          <tbody>
            {salidas.length === 0 ? (
              <tr>
                <td colSpan={6} className={styles.empty}>
                  Sin salidas registradas para este producto.
                </td>
              </tr>
            ) : (
              salidas.map((m: any) => (
                <tr key={m.id}>
                  <td>{m.fecha}</td>
                  <td>{m.tipoMovimiento}</td>
                  <td>-{m.cantidad}</td>
                  <td>{m.stockAnterior}</td>
                  <td>{m.stockPosterior}</td>
                  <td>{m.usuario ?? "-"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button disabled={page <= 1} onClick={() => setPage(page - 1)}>
            Anterior
          </button>
          <span>
            Página {page} de {totalPages}
          </span>
          <button disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
            Siguiente
          </button>
        </div>
      )}
    </Modal>
  );
};
