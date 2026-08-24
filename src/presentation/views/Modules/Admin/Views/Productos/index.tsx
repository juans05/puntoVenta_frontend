import { useState, useEffect, ChangeEvent } from "react";
import { Layout } from "../../../../../../components/Layout";
import { Item } from "../../../../../../components/Layout/Items";
import {  TbGridDots } from "react-icons/tb";
import { useAppDispatch, useAppSelector } from "../../../../../../redux/store";
import { RootState } from "../../../../../../redux/rootState";
import {
  activeCategoria,
  activeGrupo,
  activeProducto,
  deleteCategory,
  deleteGrupo,
  getAllGrupos,
  getCategorias,
  getGrupos,
  getProducts,
  openModalCategorias,
  openModalGrupos,
  openModalProducto,
} from "../../../../../../redux/reducers/Admin/productos/producto.reducer";
import { ProductoModal } from "../../../../../../components/Modal/Admin/Producto";
import { HistorialModal } from "../../../../../../components/Modal/Admin/Producto/Historial";
import { CategoriaModal } from "../../../../../../components/Modal/Admin/Producto/Categoria";
import { GrupoModal } from "../../../../../../components/Modal/Admin/Producto/Grupo";
import styles from "./productos.module.css";
import { Toaster, toast } from "sonner";
import { title } from "../../../../../../infraestructure/MData/MData";
import { printTable } from "../../../../../../helpers/functions/printTitle";
import useDebounce from "../../../../../../hooks/useDebounce";
import NotProducts from "../../../../../../assets/svg/notProducts";
import { CardGridSkeleton } from "../../../../../../components/Skeleton";

export const Productos = () => {
  const { products, categorias, grupos, totalProductos }: any = useAppSelector(
    (state: RootState) => state.adminProducts
  );
  const [activeTab, setActiveTab] = useState(0);

  const [groupState, setGroupState] = useState<any>([]);
  const getAllFindGroup: any =
    groupState?.length > 0 &&
    groupState?.find((value: any) => value?.name === "Todos");
  const getIdGroup = getAllFindGroup && getAllFindGroup?.id;
  const getAllGroupsFounded = groupState?.length > 0 ? getIdGroup : 1;

  const [activeTab1, setActiveTab1] = useState<number | null>(
    parseInt(getAllGroupsFounded)
  );
 
  useEffect(() => {
    const getAllGroupsFounded = groupState?.length > 0 ? getIdGroup : 1;
    setActiveTab1(parseInt(getAllGroupsFounded));
  }, [groupState]);

  const [productosState, setProductosState] = useState([]);
  const pageSize = 12;
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil((totalProductos || 0) / pageSize));
  const newGroupState: any = groupState?.find(
    (value: any) => value?.id === activeTab1
  );
  const [clienteSearch, setClienteSearch] = useState<string>("");
  const [loadingProducts, setLoadingProducts] = useState<boolean>(true);
  console.log(clienteSearch);
  const handleOnchangeClient = ({ target }: ChangeEvent<HTMLInputElement>) => {
    setClienteSearch(target.value);
  };
  const debounceSearch = useDebounce(clienteSearch, 1000);

  useEffect(() => {
    if (activeTab) {
      const newGrupos = grupos.filter(
        (value: any) => value.categoriaId === activeTab
      );
      const newGruposMain = newGrupos?.map((value: any) => {
        return {
          id: value?.grupoId,
          name: value?.nombre,
        };
      });

      setGroupState(newGruposMain);
    }
  }, [activeTab, grupos]);

  useEffect(() => {

    if (activeTab) {
      if (newGroupState !== undefined && newGroupState?.name === "Todos") {
        setProductosState(products);
      } else {
        const newProductos = products.filter(
          (value: any) =>
            value.categoriaId === activeTab && value.grupoId === activeTab1
        );

        setProductosState(newProductos);
      }
    }
  }, [activeTab, products, activeTab1]);

  useEffect(() => {
    if (activeTab === 0) {
      setProductosState(products);
      setGroupState([]);
      console.log("here");
    }
  }, [activeTab, products, activeTab1, grupos]);

  console.log(activeTab)

  const dispatch = useAppDispatch();
 
  const allProducts =
    productosState &&
    productosState?.map((item: any) => {
      return {
        ...item,
        id: item?.productoId,
        img: item?.rutaImagen,
        description: item?.nombre,
        textoAlternativo: item?.nombre,
        price: `${item?.precio?.toFixed(2)}`,
      };
    });


 


    const mergedTabs=categorias.map((value:any)=>{
      return{
        ...value,
        id:value?.categoriaId,
        label:value?.nombre?.charAt(0).toUpperCase() + value?.nombre?.slice(1),
        icon: TbGridDots,
        children: groupState,
        data: allProducts,

      }
    })

  const newProducto = () => {
    dispatch(openModalProducto());
  };

  const newGroup = () => {
    dispatch(openModalGrupos());
  };

  const newCategoria = () => {
    dispatch(openModalCategorias());
  };

  const editCategoria = (categoriaId: number) => {
    const categoria = categorias?.find((c: any) => c.categoriaId === categoriaId);
    if (!categoria || categoriaId === 0) return;
    dispatch(activeCategoria(categoria));
    dispatch(openModalCategorias());
  };

  const eliminarCategoria = (categoriaId: number) => {
    const categoria = categorias?.find((c: any) => c.categoriaId === categoriaId);
    if (!categoria || categoriaId === 0) {
      toast.error('No se puede eliminar la opción "Todos"');
      return;
    }
    const confirmado = window.confirm(
      `¿Seguro que deseas eliminar la categoría "${categoria.nombre}"?`
    );
    if (!confirmado) return;
    dispatch(deleteCategory(categoriaId));
    toast.success("Categoría eliminada correctamente");
  };

  const editGrupo = (grupoId: number) => {
    const grupo = groupState?.find((g: any) => g.id === grupoId);
    if (!grupo || grupo.name === "Todos") return;
    dispatch(activeGrupo({ grupoId, nombre: grupo.name, categoriaId: activeTab }));
    dispatch(openModalGrupos());
  };

  const eliminarGrupo = (grupoId: number) => {
    const grupo = groupState?.find((g: any) => g.id === grupoId);
    if (!grupo || grupo.name === "Todos") {
      toast.error('No se puede eliminar la opción "Todos"');
      return;
    }
    const confirmado = window.confirm(
      `¿Seguro que deseas eliminar el grupo "${grupo.name}"?`
    );
    if (!confirmado) return;
    dispatch(deleteGrupo(grupoId));
    toast.success("Grupo eliminado correctamente");
  };

  const buttonsMenu = [
    {
      id: 1,
      value: "Nueva Categoría",
      onClick: newCategoria,
    },
    {
      id: 2,
      value: "Nuevo Grupo",
      onClick: newGroup,
    },
    {
      id: 3,
      value: "Nuevo Producto",
      onClick: newProducto,
    },
  ];

  /*   const [activeTab, setActiveTab] = useState(1); */

  const selectedTab = mergedTabs?.find((tab:any) => tab.id === activeTab);
  const handleTabClick = (tabId: number) => {
    setActiveTab(tabId);
  };
  const getTabsButton = selectedTab && selectedTab.children;
  const getProductos = selectedTab && selectedTab.data;

  const selectTabButton = (tabId: number) => {
    setActiveTab1(tabId);
  };

  console.log(activeTab1)

  const getData = (data: any) => {
    dispatch(activeProducto(data));
    dispatch(openModalProducto());
  };

  console.log(newGroupState?.name)

  useEffect(() => {
    setLoadingProducts(true);
    dispatch(
      getProducts(activeTab, activeTab1, debounceSearch, page, pageSize, newGroupState?.name)
    ).finally(() => setLoadingProducts(false));
  }, [dispatch, activeTab, activeTab1, debounceSearch, page]);

  useEffect(() => {
    setPage(1);
  }, [activeTab, activeTab1, debounceSearch]);
  useEffect(() => {
    dispatch(getCategorias());
  }, [dispatch]);
  useEffect(() => {
    dispatch(getGrupos(activeTab));
  }, [dispatch, activeTab]);
  useEffect(() => {
    dispatch(getAllGrupos());
  }, [dispatch]);
  useEffect(() => {
    printTable(`${title.name}::PRODUCTOS`);
  }, []);

  
  return (
    <>
      <Layout
        title="Productos"
        tabs={mergedTabs}
        tabs1={getTabsButton}
        handleTabClick={handleTabClick}
        activeTab={activeTab}
        selectTabButton={selectTabButton}
        activeTab1={activeTab1}
        buttons={buttonsMenu}
        handleSearch={handleOnchangeClient}
        setClientSearch={setClienteSearch}
        clienteSearch={clienteSearch}
        onEditTab={editCategoria}
        onDeleteTab={eliminarCategoria}
        onEditTab1={editGrupo}
        onDeleteTab1={eliminarGrupo}
      >
        <>
          {loadingProducts ? (
            <CardGridSkeleton count={pageSize} />
          ) : getProductos?.length > 0 ? (
            getProductos?.map((item: any, index: any) => {
              return (
                   <Item key={index} data={item} onClick={getData} {...item} />
              );
            })
          ) : (
            <div className={`${styles["empty-image"]}`}>
              <NotProducts />
              <h5>Sin Elementos agregados</h5>
              <p>Por favor crea y agrega nuevos elementos a la lista.</p>
            </div>
          )}
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
        </>
      </Layout>
      <ProductoModal />
      <HistorialModal />
      <Toaster richColors position="top-right" />
      <GrupoModal />
      <CategoriaModal />
    </>
  );
};
