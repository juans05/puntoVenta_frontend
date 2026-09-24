import { useRef, useEffect, useState } from "react";
import styles from '../sidebar.module.css'
import { Icon } from '@iconify/react';
import { NavLink, useLocation } from "react-router-dom";
import { IAuthState } from "../../../redux/reducers/auth/interfaces";
import { useAppDispatch, useAppSelector } from "../../../redux/store";
import { getSucursales } from "../../../redux/reducers/extensiones/extensiones..reducer";
import { SUCURSAL_ACTIVA_KEY } from "../../../utils/axios";
import { RootState } from "../../../redux/rootState";
import { menuSidebar } from "../../../infraestructure/MData/MData";
import { Avatar } from "../../Avatar";

export const Navbar = ({ onClickSidebar }: any) => {
  const refMenu = useRef<HTMLDivElement>(null);
  const [isActive, setIsActive] = useState(false);
  const { tenantEmpresa }: any = useAppSelector(
    (state: RootState) => state.myBusiness
  );
  const onClick = () => setIsActive(!isActive);

  const dispatch = useAppDispatch();
  const { sucursales }: any = useAppSelector((state: RootState) => state.extentions);
  const sucursalActiva = localStorage.getItem(SUCURSAL_ACTIVA_KEY) ?? "";
  useEffect(() => {
    dispatch(getSucursales() as any);
  }, []);
  // Recarga para que todas las pantallas vuelvan a pedir sus datos con la nueva sede.
  const cambiarSucursal = (id: string) => {
    if (id) localStorage.setItem(SUCURSAL_ACTIVA_KEY, id);
    else localStorage.removeItem(SUCURSAL_ACTIVA_KEY);
    window.location.reload();
  };

  const { me }: IAuthState = useAppSelector((state: RootState) => state.auth)
  const location = useLocation();

  const currentSection = menuSidebar.find(
    (item) => `/${item.url}` === location.pathname
  );

  const logout = () => {
    onClick();
    localStorage.clear();
    sessionStorage.clear();
    return (window.location.href = "/");
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        refMenu.current &&
        !refMenu.current.contains(event.target as Node) &&
        isActive
      ) {
        setIsActive(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [refMenu, isActive]);
  return (
    <nav className="fixed top-0 left-0 z-50 w-full h-14 bg-white border-b border-neutral-200 shadow-xs">
      <div className="h-full pr-4 sm:pr-5">
        <div className="flex items-center justify-between h-full">
          <div className="flex items-center justify-start h-full">
            <button
              data-drawer-target="logo-sidebar"
              data-drawer-toggle="logo-sidebar"
              aria-controls="logo-sidebar"
              type="button"
              onClick={onClickSidebar}
              className="inline-flex items-center p-2 ml-2 text-sm text-neutral-500 rounded-lg lg:hidden hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-brand-200"
            >
              <span className="sr-only">Abrir Sidebar</span>
              <svg
                className="w-6 h-6"
                aria-hidden="true"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  clipRule="evenodd"
                  fillRule="evenodd"
                  d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10z"
                ></path>
              </svg>
            </button>
            <div className={`w-40 sm:w-64 h-full ${styles['brand-logo']}`}>
              <a href="/dashboard" className="flex ml-2 md:mr-24">
                <img className={`${styles['img-brand-logo']}`} src={tenantEmpresa?.logoSidebar} alt="Logo de la empresa" />
              </a>
              <div className={styles['entrance-right']} onClick={onClickSidebar} title="Ocultar menú">
                <Icon icon="mingcute:enter-door-fill" />
              </div>
            </div>
            {currentSection && (
              <h1 className="hidden md:block ml-3 text-sm font-semibold text-neutral-800">
                {currentSection.value}
              </h1>
            )}
          </div>
          <div className="flex items-center">
            <div className="flex items-center gap-3 relative">
              {(sucursales?.length ?? 0) > 0 && (
                <select
                  value={sucursalActiva}
                  onChange={(e) => cambiarSucursal(e.target.value)}
                  title="Cambiar de sede"
                  className="h-9 max-w-[150px] sm:max-w-[200px] rounded-lg border border-neutral-200 bg-white px-2 text-sm font-medium text-neutral-700 focus:outline-none focus:ring-2 focus:ring-brand-200"
                >
                  <option value="">📍 Mi sede</option>
                  {sucursales.map((s: any) => (
                    <option key={s.id} value={s.id}>
                      {s.value}
                    </option>
                  ))}
                </select>
              )}

              {
                !me?.userName?.startsWith('RECEPCION') && !me?.userName?.startsWith('CONTADORA') &&
                <>
                  <div className={styles['btn-go-sales']}>
                    <NavLink to={'/facturacion'}>
                      <Icon icon="icon-park-solid:sales-report" />
                      <p className="hidden sm:inline">Ir a ventas</p>
                    </NavLink>
                  </div>

                  <div className={styles['btn-go-sales']}>
                    <NavLink to={'/venta-rapida'}>
                      <Icon icon="ph:lightning-fill" />
                      <p className="hidden sm:inline">Venta rápida</p>
                    </NavLink>
                  </div>
                </>
              }

              <div>
                <button
                  type="button"
                  className="flex rounded-full focus:outline-none focus:ring-2 focus:ring-brand-200"
                  aria-expanded={isActive ? "true" : "false"}
                  data-dropdown-toggle="dropdown-user"
                  onClick={onClick}
                >
                  <span className="sr-only">Abrir menú de usuario</span>
                  <Avatar name={me?.nombre} size={34} />
                </button>
              </div>
              <div
                ref={refMenu}
                className={`z-50 ${isActive ? `` : `hidden`
                  } absolute top-11 right-0 min-w-[190px] text-base list-none bg-white border border-neutral-100 rounded-lg shadow-dropdown overflow-hidden`}
                id="dropdown-user"
              >
                <div className="px-4 py-3 bg-neutral-50" role="none">
                  <p
                    className="text-sm font-semibold text-neutral-800 truncate"
                    role="none"
                  >
                    {me?.nombre}
                  </p>
                  <p className="text-xs text-neutral-500 truncate">{me?.userName}</p>
                </div>
                <ul className="py-1" role="none">
                  <li>
                    <a
                      onClick={logout}
                      href="#"
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-danger-600 hover:bg-danger-50 transition-colors"
                      role="menuitem"
                    >
                      <Icon icon="mdi:logout" className="w-4 h-4" />
                      Cerrar Sesión
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};
