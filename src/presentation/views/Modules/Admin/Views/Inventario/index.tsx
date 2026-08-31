import { useEffect, useMemo, useState } from "react";
import { Toaster } from "sonner";
import { UserTable } from "../Usuarios/UserTable";
import { IHeaderTable } from "../../../../../../application/models/Header/IHeaderTable";
import { ITableButton } from "../../../../../../components/Datatable/table/TableButton";
import { RootState } from "../../../../../../redux/rootState";
import { useAppDispatch, useAppSelector } from "../../../../../../redux/store";
import {
  getProducts,
  openModalHistorial,
} from "../../../../../../redux/reducers/Admin/productos/producto.reducer";
import { HistorialModal } from "../../../../../../components/Modal/Admin/Producto/Historial";
import useDebounce from "../../../../../../hooks/useDebounce";
import { printTable } from "../../../../../../helpers/functions/printTitle";
import { title } from "../../../../../../infraestructure/MData/MData";
import styles from "./inventario.module.css";

const header: IHeaderTable[] = [
  { type: "id", alias: "N°" },
  { type: "nombre", alias: "Producto" },
  { type: "nombreCategoria", alias: "Categoría" },
  { type: "stock", alias: "Stock" },
  { type: "stockMinimo", alias: "Stock mínimo" },
  { type: "stockBajo", alias: "Estado" },
  { type: "accion", alias: "Acción" },
];

const PAGE_SIZE = 20;

export const Inventario = () => {
  const dispatch = useAppDispatch();
  const { products, totalProductos }: any = useAppSelector(
    (state: RootState) => state.adminProducts
  );

  const [busqueda, setBusqueda] = useState("");
  const [soloBajoStock, setSoloBajoStock] = useState(false);
  const [orden, setOrden] = useState<"asc" | "desc" | "">("asc");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const busquedaDebounced = useDebounce(busqueda, 400);

  useEffect(() => {
    setPage(1);
  }, [busquedaDebounced]);

  useEffect(() => {
    setLoading(true);
    dispatch(getProducts(0, 0, busquedaDebounced, page, PAGE_SIZE) as any).finally(() =>
      setLoading(false)
    );
  }, [busquedaDebounced, page, dispatch]);

  useEffect(() => {
    printTable(`${title.name}::INVENTARIO`);
  }, []);

  // ponytail: ordena/filtra solo la página actual (PAGE_SIZE=20), no el catálogo
  // completo. Si el catálogo crece mucho, mover el filtro "solo bajo stock" y el
  // orden por stock al backend (query en GetProducto).
  const filas = useMemo(() => {
    let lista = (products ?? []).map((p: any) => ({
      ...p,
      stockBajo: p.stockMinimo != null && p.stock <= p.stockMinimo,
    }));

    if (soloBajoStock) {
      lista = lista.filter((p: any) => p.stockBajo);
    }

    if (orden) {
      lista = [...lista].sort((a: any, b: any) =>
        orden === "asc" ? a.stock - b.stock : b.stock - a.stock
      );
    }

    return lista;
  }, [products, soloBajoStock, orden]);

  const verKardex = (data: any) => {
    dispatch(openModalHistorial(data) as any);
  };

  const acciones: ITableButton[] = [
    {
      title: "Kardex",
      icon: "",
      className: "body__btn-companyBtn",
      classNameIcon: "",
      handleOnClick: verKardex,
      iconify: "mdi:history",
      texto: "Kardex",
    },
  ];

  const totalPages = Math.max(1, Math.ceil((totalProductos || 0) / PAGE_SIZE));

  return (
    <>
      <div className={styles.main}>
        <div className={styles.outlet}>
          <div className={styles.content}>
            <div className={styles.title}>
              <h3>Inventario</h3>
            </div>

            <div className={styles.filtros}>
              <input
                type="text"
                placeholder="Buscar producto..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
              <label className={styles.checkbox}>
                <input
                  type="checkbox"
                  checked={soloBajoStock}
                  onChange={(e) => setSoloBajoStock(e.target.checked)}
                />
                Solo bajo stock
              </label>
              <select value={orden} onChange={(e) => setOrden(e.target.value as any)}>
                <option value="asc">Stock: menor a mayor</option>
                <option value="desc">Stock: mayor a menor</option>
                <option value="">Sin ordenar</option>
              </select>
            </div>

            <UserTable
              header={header}
              body={filas}
              actions={acciones}
              idTable="inventario"
              loading={loading}
            />

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
          </div>
        </div>
      </div>
      <HistorialModal />
      <Toaster richColors position="top-right" />
    </>
  );
};
