import { useEffect, useState } from "react";
import styles from "./compras.module.css";
import { useAppDispatch, useAppSelector } from "../../../../../../redux/store";
import { RootState } from "../../../../../../redux/rootState";
import {
  anularCompra,
  getCompras,
} from "../../../../../../redux/reducers/Admin/compras/compra.reducer";
import { CompraModal } from "../../../../../../components/Modal/Admin/Compra";
import { Toaster } from "sonner";
import { printTable } from "../../../../../../helpers/functions/printTitle";
import { title } from "../../../../../../infraestructure/MData/MData";

const PAGE_SIZE = 10;

export const Compras = () => {
  const dispatch = useAppDispatch();
  const { compras, totalCompras }: any = useAppSelector(
    (state: RootState) => state.compras
  );

  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);

  const totalPages = Math.max(1, Math.ceil((totalCompras || 0) / PAGE_SIZE));

  useEffect(() => {
    dispatch(getCompras(page, PAGE_SIZE) as any);
  }, [dispatch, page]);

  useEffect(() => {
    printTable(`${title.name}::COMPRAS`);
  }, []);

  const confirmarAnular = (id: number) => {
    if (!window.confirm("¿Seguro que deseas anular esta compra? Se revertirá el stock ingresado."))
      return;
    dispatch(anularCompra(id) as any);
  };

  return (
    <div>
      <div className={styles.header}>
        <h3>Compras</h3>
        <button className={styles.newBtn} onClick={() => setModalOpen(true)}>
          + Nueva compra
        </button>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>N° Compra</th>
              <th>Fecha</th>
              <th>Proveedor</th>
              <th>Método de pago</th>
              <th>Total</th>
              <th>Estado</th>
              <th>Usuario</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {!compras || compras.length === 0 ? (
              <tr>
                <td colSpan={8} className={styles.empty}>
                  No hay compras registradas todavía.
                </td>
              </tr>
            ) : (
              compras.map((c: any) => (
                <tr key={c.id}>
                  <td data-label="N° Compra">{c.numeroCompra}</td>
                  <td data-label="Fecha">{c.fechaCompra}</td>
                  <td data-label="Proveedor">{c.proveedor ?? "Sin proveedor"}</td>
                  <td data-label="Método de pago">{c.metodoPago ?? "-"}</td>
                  <td data-label="Total">S/ {Number(c.total).toFixed(2)}</td>
                  <td data-label="Estado">
                    <span
                      className={`${styles.estado} ${
                        c.estado === "ANULADO" ? styles.anulado : styles.confirmado
                      }`}
                    >
                      {c.estado}
                    </span>
                  </td>
                  <td data-label="Usuario">{c.usuario ?? "-"}</td>
                  <td>
                    {c.estado !== "ANULADO" && (
                      <button
                        className={styles.anularBtn}
                        onClick={() => confirmarAnular(c.id)}
                      >
                        Anular
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            className={styles["pagination-btn"]}
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
          >
            Anterior
          </button>
          <span className={styles["pagination-info"]}>
            Página {page} de {totalPages}
          </span>
          <button
            className={styles["pagination-btn"]}
            disabled={page >= totalPages}
            onClick={() => setPage(page + 1)}
          >
            Siguiente
          </button>
        </div>
      )}

      <CompraModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
      <Toaster richColors position="top-right" duration={2000} />
    </div>
  );
};
