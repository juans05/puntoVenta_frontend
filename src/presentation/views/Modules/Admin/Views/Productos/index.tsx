import { useEffect, useMemo, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../../../../redux/store";
import { RootState } from "../../../../../../redux/rootState";
import {
  activeProducto,
  clearActiveProducto,
  deleteProducts,
  getCategorias,
  getProducts,
  importarProductosDesdeExcel,
  openModalCategorias,
  openModalGrupos,
  openModalHistorial,
  openModalProducto,
  previsualizarImportacionProductos,
} from "../../../../../../redux/reducers/Admin/productos/producto.reducer";
import { excelArchivoACsv } from "../../../../../../helpers/functions/excelToCsv";
import { ProductoModal } from "../../../../../../components/Modal/Admin/Producto";
import { HistorialModal } from "../../../../../../components/Modal/Admin/Producto/Historial";
import { CategoriaModal } from "../../../../../../components/Modal/Admin/Producto/Categoria";
import { GrupoModal } from "../../../../../../components/Modal/Admin/Producto/Grupo";
import { Toaster, toast } from "sonner";
import { title } from "../../../../../../infraestructure/MData/MData";
import { printTable } from "../../../../../../helpers/functions/printTitle";
import useDebounce from "../../../../../../hooks/useDebounce";
import { TableSkeleton } from "../../../../../../components/Skeleton";
import { Icon } from "@iconify/react";

// Columnas opcionales que se pueden ocultar/mostrar desde "Columnas" -- las 4 core
// (Producto/Precio/Stock/Acciones) siempre se muestran, estas se pueden apagar.
const COLUMNAS_OPCIONALES = [
  { key: "codigoBarra", label: "Código de barras" },
  { key: "categoria", label: "Categoría" },
  { key: "proveedor", label: "Proveedor" },
  { key: "margen", label: "Margen" },
  { key: "costo", label: "Costo" },
] as const;

type ColumnaKey = (typeof COLUMNAS_OPCIONALES)[number]["key"];

const PAGE_SIZE = 20;

export const Productos = () => {
  const dispatch = useAppDispatch();
  const { products, categorias, totalProductos }: any = useAppSelector(
    (state: RootState) => state.adminProducts
  );
  const { activeTenant }: any = useAppSelector((state: RootState) => state.myBusiness);

  const [busqueda, setBusqueda] = useState("");
  const debounceSearch = useDebounce(busqueda, 800);
  const [categoriaId, setCategoriaId] = useState(0);
  const [filtro, setFiltro] = useState<"todos" | "stockBajo">("todos");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [menuAcciones, setMenuAcciones] = useState(false);
  const [menuColumnas, setMenuColumnas] = useState(false);
  const [columnas, setColumnas] = useState<Record<ColumnaKey, boolean>>({
    codigoBarra: true,
    categoria: true,
    proveedor: true,
    margen: true,
    costo: true,
  });

  const totalPages = Math.max(1, Math.ceil((totalProductos || 0) / PAGE_SIZE));

  useEffect(() => {
    dispatch(getCategorias());
  }, [dispatch]);

  useEffect(() => {
    printTable(`${title.name}::PRODUCTOS`);
  }, []);

  useEffect(() => {
    setLoading(true);
    dispatch(getProducts(categoriaId, 0, debounceSearch, page, PAGE_SIZE)).finally(() =>
      setLoading(false)
    );
  }, [dispatch, categoriaId, debounceSearch, page]);

  useEffect(() => {
    setPage(1);
  }, [categoriaId, debounceSearch]);

  const productosFiltrados = useMemo(() => {
    if (filtro === "stockBajo") {
      return (products ?? []).filter(
        (p: any) => p.stockMinimo != null && p.stockMinimo > 0 && p.stock <= p.stockMinimo
      );
    }
    return products ?? [];
  }, [products, filtro]);

  const columnasActivas = COLUMNAS_OPCIONALES.filter((c) => columnas[c.key]).length;

  const toggleColumna = (key: ColumnaKey) => {
    setColumnas({ ...columnas, [key]: !columnas[key] });
  };

  const abrirNuevo = () => {
    dispatch(clearActiveProducto() as any);
    dispatch(openModalProducto());
  };

  const editarProducto = (producto: any) => {
    dispatch(activeProducto(producto));
    dispatch(openModalProducto());
  };

  const verHistorial = (producto: any) => {
    dispatch(openModalHistorial(producto) as any);
  };

  const eliminarProducto = (producto: any) => {
    const confirmado = window.confirm(`¿Seguro que deseas eliminar "${producto.nombre}"?`);
    if (!confirmado) return;
    dispatch(activeProducto(producto));
    dispatch(deleteProducts(producto.productoId) as any);
    toast.success("Se eliminó el producto correctamente");
  };

  const importFileInputRef = useRef<HTMLInputElement>(null);
  const abrirDialogoImportar = () => importFileInputRef.current?.click();

  const recargarProductos = () => {
    setLoading(true);
    dispatch(getProducts(categoriaId, 0, debounceSearch, 1, PAGE_SIZE)).finally(() => setLoading(false));
    setPage(1);
  };

  const handleImportarExcel = async (e: any) => {
    const archivo: File | undefined = e.target.files?.[0];
    e.target.value = "";
    if (!archivo) return;

    const csv = await excelArchivoACsv(archivo);
    const preview: any = await dispatch(previsualizarImportacionProductos(csv) as any);

    if (!preview || preview.validas === 0) {
      toast.error("No se encontraron filas válidas para importar");
      return;
    }

    const mensaje =
      `¿Confirmar la importación de ${preview.validas} producto(s)?` +
      (preview.conError > 0 ? ` ${preview.conError} fila(s) con datos incompletos serán omitidas.` : "");
    if (!window.confirm(mensaje)) return;

    dispatch(importarProductosDesdeExcel(csv, recargarProductos) as any);
  };

  return (
    <div className="w-full">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Gestión de Productos y Servicios</h3>
          <p className="text-sm text-gray-500 mt-1">
            {totalProductos ?? 0} productos
            {activeTenant?.razonSocial ? ` · ${activeTenant.razonSocial}` : ""}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 mt-4">
        <div className="flex-1 min-w-[260px] relative">
          <input
            className="w-full border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm"
            placeholder="Buscar por código o nombre del producto..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
          <Icon
            icon="mdi:magnify"
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            width={18}
          />
        </div>

        <div className="relative">
          <button
            type="button"
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm font-semibold text-gray-700 bg-white flex items-center gap-1"
            onClick={() => setMenuColumnas(!menuColumnas)}
          >
            <Icon icon="mdi:view-column-outline" width={16} /> Columnas {columnasActivas}
          </button>
          {menuColumnas && (
            <div className="absolute right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-2 z-20 w-56">
              {COLUMNAS_OPCIONALES.map((c) => (
                <label
                  key={c.key}
                  className="flex items-center gap-2 text-sm text-gray-700 px-2 py-1.5 rounded hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={columnas[c.key]}
                    onChange={() => toggleColumna(c.key)}
                  />
                  {c.label}
                </label>
              ))}
            </div>
          )}
        </div>

        <div className="relative">
          <button
            type="button"
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm font-semibold text-gray-700 bg-white flex items-center gap-1"
            onClick={() => setMenuAcciones(!menuAcciones)}
          >
            <Icon icon="mdi:dots-horizontal" width={16} /> Más acciones
          </button>
          {menuAcciones && (
            <div className="absolute right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-20 w-48">
              <button
                type="button"
                className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                onClick={() => {
                  setMenuAcciones(false);
                  dispatch(openModalCategorias());
                }}
              >
                + Nueva categoría
              </button>
              <button
                type="button"
                className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                onClick={() => {
                  setMenuAcciones(false);
                  dispatch(openModalGrupos());
                }}
              >
                + Nuevo grupo
              </button>
              <button
                type="button"
                className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                onClick={() => {
                  setMenuAcciones(false);
                  abrirDialogoImportar();
                }}
              >
                Importar desde Excel
              </button>
            </div>
          )}
        </div>

        <input
          ref={importFileInputRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          style={{ display: "none" }}
          onChange={handleImportarExcel}
        />

        <button
          type="button"
          className="bg-indigo-600 text-white text-sm font-semibold rounded-lg px-4 py-2 flex items-center gap-1"
          onClick={abrirNuevo}
        >
          + Nuevo producto
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3 mt-4 bg-white border border-gray-100 rounded-xl p-3">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setFiltro("todos")}
            className={`text-sm font-semibold rounded-full px-4 py-1.5 ${
              filtro === "todos" ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-600"
            }`}
          >
            Todos
          </button>
          <button
            type="button"
            onClick={() => setFiltro("stockBajo")}
            className={`text-sm font-semibold rounded-full px-4 py-1.5 ${
              filtro === "stockBajo" ? "bg-amber-500 text-white" : "bg-gray-100 text-gray-600"
            }`}
          >
            Stock bajo
          </button>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <span className="text-xs font-semibold text-gray-400 uppercase">Categoría</span>
          <select
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm"
            value={categoriaId}
            onChange={(e) => setCategoriaId(Number(e.target.value))}
          >
            <option value={0}>Todas</option>
            {(categorias ?? [])
              .filter((c: any) => c.categoriaId !== 0)
              .map((c: any) => (
                <option key={c.categoriaId} value={c.categoriaId}>
                  {c.nombre}
                </option>
              ))}
          </select>
        </div>
      </div>

      <div className="mt-4 bg-white border border-gray-100 rounded-2xl overflow-x-auto">
        {loading ? (
          <div className="p-6">
            <TableSkeleton columns={4 + columnasActivas} />
          </div>
        ) : productosFiltrados.length === 0 ? (
          <div className="flex flex-col items-center text-center px-6 py-14">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center text-3xl mb-4">
              📦
            </div>
            <h4 className="text-lg font-bold text-gray-900">
              {products?.length === 0
                ? "Aún no tienes productos registrados"
                : "No hay productos que coincidan con el filtro"}
            </h4>
            {products?.length === 0 && (
              <>
                <p className="text-sm text-gray-500 max-w-md mt-2">
                  Los productos te permiten manejar stock, precios y categorías.
                </p>
                <div className="flex items-center gap-3 mt-5">
                  <button
                    type="button"
                    className="bg-indigo-600 text-white text-sm font-semibold rounded-lg px-4 py-2"
                    onClick={abrirNuevo}
                  >
                    + Crear primer producto
                  </button>
                  <button
                    type="button"
                    className="border border-gray-200 text-gray-700 text-sm font-semibold rounded-lg px-4 py-2"
                    onClick={abrirDialogoImportar}
                  >
                    Importar desde Excel
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th className="px-4 py-3">Producto</th>
                {columnas.codigoBarra && <th className="px-4 py-3">Código de barras</th>}
                {columnas.categoria && <th className="px-4 py-3">Categoría</th>}
                {columnas.proveedor && <th className="px-4 py-3">Proveedor</th>}
                <th className="px-4 py-3 text-right">Precio</th>
                {columnas.costo && <th className="px-4 py-3 text-right">Costo</th>}
                {columnas.margen && <th className="px-4 py-3 text-right">Margen</th>}
                <th className="px-4 py-3 text-right">Stock</th>
                <th className="px-4 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {productosFiltrados.map((p: any) => {
                const stockBajo =
                  p.stockMinimo != null && p.stockMinimo > 0 && p.stock <= p.stockMinimo;
                return (
                  <tr key={p.productoId} className="bg-white border-b hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{p.nombre}</td>
                    {columnas.codigoBarra && (
                      <td className="px-4 py-3 font-mono text-xs">{p.codigoBarra || "-"}</td>
                    )}
                    {columnas.categoria && (
                      <td className="px-4 py-3">{p.nombreCategoria || "Sin categoría"}</td>
                    )}
                    {columnas.proveedor && (
                      <td className="px-4 py-3">{p.proveedor?.nombre || "-"}</td>
                    )}
                    <td className="px-4 py-3 text-right">S/. {p.precio?.toFixed(2)}</td>
                    {columnas.costo && (
                      <td className="px-4 py-3 text-right">
                        S/. {p.costoUnitario ? Number(p.costoUnitario).toFixed(2) : "-"}
                      </td>
                    )}
                    {columnas.margen && (
                      <td className="px-4 py-3 text-right">
                        {p.margenGanancia ? `${Number(p.margenGanancia).toFixed(0)}%` : "-"}
                      </td>
                    )}
                    <td className="px-4 py-3 text-right">
                      <span
                        className={
                          stockBajo
                            ? "text-amber-600 font-semibold"
                            : "text-gray-700"
                        }
                      >
                        {p.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          title="Editar"
                          className="text-gray-400 hover:text-indigo-600"
                          onClick={() => editarProducto(p)}
                        >
                          <Icon icon="mdi:pencil-outline" width={18} />
                        </button>
                        <button
                          type="button"
                          title="Kardex de movimientos"
                          className="text-gray-400 hover:text-indigo-600"
                          onClick={() => verHistorial(p)}
                        >
                          <Icon icon="mdi:history" width={18} />
                        </button>
                        <button
                          type="button"
                          title="Eliminar"
                          className="text-gray-400 hover:text-red-600"
                          onClick={() => eliminarProducto(p)}
                        >
                          <Icon icon="mdi:trash-can-outline" width={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-4">
          <button
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm disabled:opacity-40"
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
          >
            Anterior
          </button>
          <span className="text-sm text-gray-500">
            Página {page} de {totalPages}
          </span>
          <button
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm disabled:opacity-40"
            disabled={page >= totalPages}
            onClick={() => setPage(page + 1)}
          >
            Siguiente
          </button>
        </div>
      )}

      <ProductoModal />
      <HistorialModal />
      <CategoriaModal />
      <GrupoModal />
      <Toaster richColors position="top-right" />
    </div>
  );
};
