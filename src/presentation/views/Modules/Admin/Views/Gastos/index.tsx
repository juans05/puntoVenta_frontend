import { useEffect, useState } from "react";
import styles from "./gastos.module.css";
import { useAppDispatch, useAppSelector } from "../../../../../../redux/store";
import { RootState } from "../../../../../../redux/rootState";
import {
  anularGasto,
  getGastos,
} from "../../../../../../redux/reducers/Admin/gastos/gasto.reducer";
import { GastoModal } from "../../../../../../components/Modal/Admin/Gasto";
import { Toaster } from "sonner";
import { printTable } from "../../../../../../helpers/functions/printTitle";
import { title } from "../../../../../../infraestructure/MData/MData";

const PAGE_SIZE = 10;

export const Gastos = () => {
  const dispatch = useAppDispatch();
  const { gastos, totalGastos }: any = useAppSelector(
    (state: RootState) => state.gastos
  );

  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);

  const totalPages = Math.max(1, Math.ceil((totalGastos || 0) / PAGE_SIZE));

  useEffect(() => {
    dispatch(getGastos(page, PAGE_SIZE) as any);
  }, [dispatch, page]);

  useEffect(() => {
    printTable(`${title.name}::GASTOS`);
  }, []);

  const confirmarEliminar = (id: number) => {
    if (!window.confirm("¿Seguro que deseas eliminar este gasto?"))
      return;
    dispatch(anularGasto(id) as any);
  };

  return (
    <div>
      <div className={styles.header}>
        <h3>Gastos</h3>
        <button className={styles.newBtn} onClick={() => setModalOpen(true)}>
          + Nuevo gasto
        </button>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Categoría</th>
              <th>Descripción</th>
              <th>Método de pago</th>
              <th>Monto</th>
              <th>Estado</th>
              <th>Usuario</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {!gastos || gastos.length === 0 ? (
              <tr>
                <td colSpan={8} className={styles.empty}>
                  No hay gastos registrados todavía.
                </td>
              </tr>
            ) : (
              gastos.map((g: any) => (
                <tr key={g.id}>
                  <td>{g.fechaGasto}</td>
                  <td>{g.categoria}</td>
                  <td>{g.descripcion}</td>
                  <td>{g.metodoPago ?? "-"}</td>
                  <td>S/ {Number(g.monto).toFixed(2)}</td>
                  <td>
                    <span
                      className={`${styles.estado} ${
                        g.estado === "ANULADO" ? styles.anulado : styles.confirmado
                      }`}
                    >
                      {g.estado}
                    </span>
                  </td>
                  <td>{g.usuario ?? "-"}</td>
                  <td>
                    {g.estado !== "ANULADO" && (
                      <button
                        className={styles.anularBtn}
                        onClick={() => confirmarEliminar(g.id)}
                      >
                        Eliminar
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

      <GastoModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
      <Toaster richColors position="top-right" duration={2000} />
    </div>
  );
};
