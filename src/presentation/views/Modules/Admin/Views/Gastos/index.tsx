import { useEffect, useRef, useState } from "react";
import styles from "./gastos.module.css";
import { useAppDispatch, useAppSelector } from "../../../../../../redux/store";
import { RootState } from "../../../../../../redux/rootState";
import {
  anularGasto,
  getGastos,
  importarGastos,
} from "../../../../../../redux/reducers/Admin/gastos/gasto.reducer";
import { GastoModal } from "../../../../../../components/Modal/Admin/Gasto";
import { Toaster, toast } from "sonner";
import { printTable } from "../../../../../../helpers/functions/printTitle";
import { title } from "../../../../../../infraestructure/MData/MData";
import { parseGastoExcel } from "../../../../../../helpers/functions/parseGastoExcel";

const PAGE_SIZE = 10;

export const Gastos = () => {
  const dispatch = useAppDispatch();
  const { gastos, totalGastos }: any = useAppSelector(
    (state: RootState) => state.gastos
  );

  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleImportClick = () => fileInputRef.current?.click();

  const handleFileChange = async (e: any) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    const buffer = await file.arrayBuffer();
    const { filas, errores } = parseGastoExcel(buffer);

    if (filas.length === 0) {
      toast.error(errores[0] ?? "No se encontraron filas válidas para importar");
      return;
    }

    const mensaje =
      `¿Confirmar la importación de ${filas.length} gasto(s)?` +
      (errores.length > 0
        ? ` ${errores.length} fila(s) con datos incompletos serán omitidas.`
        : "");

    if (!window.confirm(mensaje)) return;

    dispatch(importarGastos(filas) as any);
  };

  return (
    <div>
      <div className={styles.header}>
        <h3>Gastos</h3>
        <div className={styles.actions}>
          <button className={styles.importBtn} onClick={handleImportClick}>
            Importar Excel
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            style={{ display: "none" }}
            onChange={handleFileChange}
          />
          <button className={styles.newBtn} onClick={() => setModalOpen(true)}>
            + Nuevo gasto
          </button>
        </div>
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
                  <td data-label="Fecha">{g.fechaGasto}</td>
                  <td data-label="Categoría">{g.categoria}</td>
                  <td data-label="Descripción">{g.descripcion}</td>
                  <td data-label="Método de pago">{g.metodoPago ?? "-"}</td>
                  <td data-label="Monto">S/ {Number(g.monto).toFixed(2)}</td>
                  <td data-label="Estado">
                    <span
                      className={`${styles.estado} ${
                        g.estado === "ANULADO" ? styles.anulado : styles.confirmado
                      }`}
                    >
                      {g.estado}
                    </span>
                  </td>
                  <td data-label="Usuario">{g.usuario ?? "-"}</td>
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
