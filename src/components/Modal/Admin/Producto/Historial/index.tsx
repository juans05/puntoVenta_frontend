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

const TIPOS_ENTRADA = ["Compra", "AjusteEntrada", "DevolucionVenta"];
const PAGE_SIZE = 10;

const ETIQUETA_TIPO: Record<string, string> = {
  Compra: "Compra",
  Venta: "Venta",
  AjusteEntrada: "Ajuste de entrada",
  AjusteSalida: "Ajuste de salida",
  DevolucionCompra: "Compra anulada",
  DevolucionVenta: "Venta anulada",
};

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

  const kardex = movimientos ?? [];
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
          Kardex de movimientos
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
            {kardex.length === 0 ? (
              <tr>
                <td colSpan={6} className={styles.empty}>
                  Sin movimientos registrados para este producto.
                </td>
              </tr>
            ) : (
              kardex.map((m: any) => {
                const esEntrada = TIPOS_ENTRADA.includes(m.tipoMovimiento);
                return (
                  <tr key={m.id}>
                    <td>{m.fecha}</td>
                    <td>{ETIQUETA_TIPO[m.tipoMovimiento] ?? m.tipoMovimiento}</td>
                    <td className={esEntrada ? styles.entrada : styles.salida}>
                      {esEntrada ? "+" : "-"}
                      {m.cantidad}
                    </td>
                    <td>{m.stockAnterior}</td>
                    <td>{m.stockPosterior}</td>
                    <td>{m.usuario ?? "-"}</td>
                  </tr>
                );
              })
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
