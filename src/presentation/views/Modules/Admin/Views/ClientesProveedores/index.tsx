import { ChangeEvent, useEffect, useState } from "react";
import { Tab } from "../../../../../../components/Layout";
import { Sidebar } from "../../../../../../components/Layout/Sidebar";
import styles from "./clientsAndSuppliers.module.css";
import { ImWoman } from "react-icons/im";
import { IoIosBusiness } from "react-icons/io";
import { IHeaderTable } from "../../../../../../application/models/Header/IHeaderTable";
import { ITableButton } from "../../../../../../components/Datatable/table/TableButton";
import { UserTable } from "../Usuarios/UserTable";
import { ITableHeaderProps } from "../Usuarios/UserTable/UserTableHeader";
import { RootState } from "../../../../../../redux/rootState";
import { useAppDispatch, useAppSelector } from "../../../../../../redux/store";
import {
  activeClientes,
  activeProveedorMain,
  deleteCliente,
  deleteProveedorMain,
  getAllClientes,
  getAllProveedores,
  openModalAnfitriona,
  openModalProveedor,
} from "../../../../../../redux/reducers/Admin/clientes-proveedores/clientesProveedoresAnfitrionas.reducer";
import { Button } from "@tremor/react";
import { Icon } from "@iconify/react";
import { Toaster, toast } from "sonner";
import { printTable } from "../../../../../../helpers/functions/printTitle";
import { title } from "../../../../../../infraestructure/MData/MData";
import {
  getAllUbigeos,
  getTypeDocument,
} from "../../../../../../redux/reducers/extensiones/extensiones..reducer";
import { ClientesModal } from "../../../../../../components/Modal/Admin/Clientes";
import { ProveedorModal } from "../../../../../../components/Modal/Admin/Proveedores";
import { Search } from "../../../../../../components/Search";
import useDebounce from "../../../../../../hooks/useDebounce";
import Pagination from "../../../../../../components/Pagination";
const header: IHeaderTable[] = [
  { type: "id", alias: "N°" },
  { type: "nombre", alias: "Nombres y Apellidos" },
  { type: "tipoDocumento", alias: "Tipo de Documento" },
  { type: "numeroDocumento", alias: "Número de Documento" },
  { type: "direccion", alias: "Dirección" },
  { type: "ubigeo", alias: "Ubigeo" },
  { type: "telefono", alias: "Celular" },
  { type: "accion", alias: "Accion" },
];

const headerProveedores: IHeaderTable[] = [
  { type: "id", alias: "N°" },
  { type: "nombre", alias: "Nombre" },
  { type: "direccion", alias: "Dirección" },
  { type: "ubigeo", alias: "Ubigeo" },
  { type: "telefono", alias: "Teléfono" },
  { type: "email", alias: "Email" },
  { type: "accion", alias: "Accion" },
];

export const ClientesProveedores = () => {
  const dispatch = useAppDispatch();
  const { clients, totalClients, providers, totalProviders }: any = useAppSelector(
    (state: RootState) => state.clientes
  );
  const [clienteSearch, setClienteSearch] = useState<string>("");
  const [loadingClientes, setLoadingClientes] = useState<boolean>(true);
  const [loadingProveedores, setLoadingProveedores] = useState<boolean>(true);
  const handleOnchangeClient = ({ target }: ChangeEvent<HTMLInputElement>) => {
    setClienteSearch(target.value);
  };
  const debounceSearch = useDebounce(clienteSearch, 1000);
  const newDataClientes = clients?.map((value: any) => {
    return {
      ...value,
      tipoDocumento:
        value?.tipoDocumentoId === 1
          ? "DNI"
          : value?.tipoDocumentoId === 2
          ? "RUC"
          : "OTRO DOC.",
      telefono:
        value?.telefono === "" || value?.telefono === null
          ? "Sin especificar"
          : value?.telefono,
      ubigeo:
        value?.ubigeo === null
          ? "Sin especificar"
          : `${value?.ubigeo?.departamento}/${value?.ubigeo?.provincia}/${value?.ubigeo?.distrito}`,
      direccion:
        value?.direccion === "" || value?.direccion === null
          ? "Sin especificar"
          : value?.direccion,
    };
  });

  const newDataProveedores = providers?.map((value: any) => {
    return {
      ...value,
      telefono:
        value?.telefono === "" || value?.telefono === null
          ? "Sin especificar"
          : value?.telefono,
      email:
        value?.email === "" || value?.email === null
          ? "Sin especificar"
          : value?.email,
      ubigeo:
        !value?.ubigeo
          ? "Sin especificar"
          : `${value?.ubigeo?.departamento}/${value?.ubigeo?.provincia}/${value?.ubigeo?.distrito}`,
      direccion:
        value?.dirección === "" || value?.dirección === null
          ? "Sin especificar"
          : value?.dirección,
    };
  });

  const [currentPage, setcurrentPage] = useState(1);
  const [itemsPerPage, setitemsPerPage] = useState(50);

  const [activeTab, setActiveTab] = useState(1);

  const totalActivo = activeTab === 1 ? totalClients : totalProviders;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const pages = [];
  for (let i = 1; i <= Math.ceil(totalActivo / itemsPerPage); i++) {
    pages.push(i);
  }

  const newCliente = () => {
    dispatch(openModalAnfitriona());
  };

  const editCliente = (data: any) => {
    dispatch(openModalAnfitriona());
    dispatch(activeClientes(data));
  };
  const deleteClienteMain = (data: any) => {
    dispatch(activeClientes(data));
    dispatch(deleteCliente(data?.id));
    toast.success("Se eliminó correctamente");
  };
  const buttonsAnfitriona: ITableButton[] = [
    {
      title: "Editar",
      icon: "",
      className: "body__btn-companyBtn",
      classNameIcon: "",
      handleOnClick: editCliente,
      iconify: "fa:pencil",
    },
    {
      title: "Eliminar",
      icon: "",
      className: "body__btn-companyBtn",
      classNameIcon: "",
      handleOnClick: deleteClienteMain,
      iconify: "wpf:full-trash",
    },
  ];
  const btnsClientes = [
    {
      id: 1,
      value: "Nuevo Cliente",
      icon: "",
      onClick: newCliente,
    },
  ];

  const newProveedor = () => {
    dispatch(openModalProveedor());
  };

  const editProveedor = (data: any) => {
    dispatch(openModalProveedor());
    dispatch(activeProveedorMain(data));
  };
  const deleteProveedorHandler = (data: any) => {
    dispatch(deleteProveedorMain(data?.proveedorId));
    toast.success("Se eliminó correctamente");
  };
  const buttonsProveedor: ITableButton[] = [
    {
      title: "Editar",
      icon: "",
      className: "body__btn-companyBtn",
      classNameIcon: "",
      handleOnClick: editProveedor,
      iconify: "fa:pencil",
    },
    {
      title: "Eliminar",
      icon: "",
      className: "body__btn-companyBtn",
      classNameIcon: "",
      handleOnClick: deleteProveedorHandler,
      iconify: "wpf:full-trash",
    },
  ];
  const btnsProveedores = [
    {
      id: 1,
      value: "Nuevo Proveedor",
      icon: "",
      onClick: newProveedor,
    },
  ];

  const tabs: Tab[] = [
    {
      id: 1,
      label: "Clientes",
      icon: ImWoman,
      data: newDataClientes,
      dataBtns: buttonsAnfitriona,
      btnsHeader: btnsClientes,
    },
    {
      id: 2,
      label: "Proveedores",
      icon: IoIosBusiness,
      data: newDataProveedores,
      dataBtns: buttonsProveedor,
      btnsHeader: btnsProveedores,
    },
  ];

  const [headerClients] = useState<IHeaderTable[] | ITableHeaderProps[] | any>(
    header
  );
  const [headerProveedoresState] = useState<IHeaderTable[] | ITableHeaderProps[] | any>(
    headerProveedores
  );
  const selectedTab = tabs.find((tab) => tab.id === activeTab);
  const getButtons = selectedTab && selectedTab.dataBtns;
  const getData = selectedTab && selectedTab.data;
  const getLabel = selectedTab && selectedTab.label;
  const getBtnsHeader = selectedTab && selectedTab.btnsHeader;
  const handleTabClick = (tabId: number) => {
    setActiveTab(tabId);
  };

  useEffect(() => {
    printTable(`${title.name}::Clientes`);
  }, []);

  useEffect(() => {
    if (activeTab !== 1) return;
    setLoadingClientes(true);
    dispatch(getAllClientes(debounceSearch, currentPage, itemsPerPage)).finally(() => setLoadingClientes(false));
  }, [dispatch, debounceSearch, currentPage, itemsPerPage, activeTab]);
  useEffect(() => {
    if (activeTab !== 2) return;
    setLoadingProveedores(true);
    dispatch(getAllProveedores(debounceSearch, currentPage, itemsPerPage) as any).finally(() => setLoadingProveedores(false));
  }, [dispatch, debounceSearch, currentPage, itemsPerPage, activeTab]);
  useEffect(() => {
    setcurrentPage(1);
  }, [activeTab]);
  useEffect(() => {
    dispatch(getAllUbigeos());
  }, [dispatch]);
  useEffect(() => {
    dispatch(getTypeDocument());
  }, [dispatch]);
  return (
    <>
      <div className={styles.main}>
        <div className={styles.sidebar}>
          <Sidebar
            tabs={tabs}
            handleTabClick={handleTabClick}
            activeTab={activeTab}
          />
        </div>
        <div className={styles.outlet}>
          <div className={styles.navbar}>
            <div className={styles["search-main"]}>
              <Search handleSearch={handleOnchangeClient} placeholder={""} />
            </div>
            <div className={`${styles["btns-header"]}`}>
              {getBtnsHeader?.map((value: any) => {
                return (
                  <Button onClick={value?.onClick}>
                    {value?.icon != "" && <Icon icon={value?.icon} />}

                    <p>{value?.value}</p>
                  </Button>
                );
              })}
            </div>
          </div>
          <div className={styles.content}>
            <UserTable
              header={activeTab === 1 ? headerClients : headerProveedoresState}
              body={getData}
              actions={getButtons}
              idTable={getLabel}
              loading={activeTab === 1 ? loadingClientes : loadingProveedores}
            />
            <Pagination
              data={getData}
              optionSelect
              currentPage={currentPage}
              indexOfFirstItem={indexOfFirstItem}
              indexOfLastItem={indexOfLastItem}
              setcurrentPage={setcurrentPage}
              setitemsPerPage={setitemsPerPage}
              pages={pages}
              total={totalActivo}
            />
          </div>
        </div>
      </div>
      <ClientesModal />
      <ProveedorModal />
      <Toaster richColors position="top-right" />
    </>
  );
};
