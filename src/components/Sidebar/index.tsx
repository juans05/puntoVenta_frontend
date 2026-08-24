import { useState, useEffect } from 'react';
import { Outlet, useNavigate } from "react-router-dom";
import { sidebar } from "../../helpers/ClassNames";
import { Navbar } from "./Navbar";
import { SidebarElement } from "./SidebarElement";
import { menuSidebar, superAdminMenu } from "../../infraestructure/MData/MData";
import styles from './sidebar.module.css'
import { getToken } from '../../helpers/auth-helpers';
import { IAuthState } from '../../redux/reducers/auth/interfaces';
import { useAppDispatch, useAppSelector } from '../../redux/store';
import { RootState } from '../../redux/rootState';
import { resetSale } from '../../redux/reducers/ventas/ventas.reducer';
import { Avatar } from '../Avatar';

export const LayoutView = () => {

  const navigate = useNavigate();
  const dispatch = useAppDispatch();


  useEffect(() => {
    dispatch(resetSale());
    if (!getToken()) {
      return navigate('/')
    }
  }, [])

  // openSidebar=true significa OCULTO (nombre heredado). Debajo de "lg" (1024px)
  // el sidebar es un drawer superpuesto que arranca cerrado; a partir de "lg"
  // es el panel fijo de siempre. isDesktop decide si además empuja el contenido.
  const [openSidebar, setOpenSidebar] = useState<boolean>(() => window.innerWidth < 1024)
  const [isDesktop, setIsDesktop] = useState<boolean>(() => window.innerWidth >= 1024)
  const [menu, setMenu] = useState<any[]>([]);
  const { me }: IAuthState = useAppSelector((state: RootState) => state.auth)

  const hideSidebar = () => {
    setOpenSidebar(!openSidebar)
  }

  useEffect(() => {
    const handleResize = () => {
      const desktop = window.innerWidth >= 1024;
      setIsDesktop(desktop);
      setOpenSidebar(!desktop);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    if (me?.rutas?.length > 0) {
      const nuevoSidebar = menuSidebar.filter((item : any) =>
        me?.rutas?.some((ruta : any) => ruta.modulo === item.code)
      );
      setMenu(me?.isSuperAdmin ? [...nuevoSidebar, superAdminMenu] : nuevoSidebar);
    }
  }, [me])




  return (
    <div className="min-h-screen bg-neutral-50">
      <Navbar onClickSidebar={hideSidebar} />

      {
        !openSidebar && !isDesktop && (
          <div className="fixed inset-0 bg-black/50 z-30" onClick={hideSidebar} />
        )
      }

      {
        !openSidebar && <aside id="logo-sidebar" className={`${sidebar.aside} bg-white`} aria-label="Sidebar">
          <div className={styles.avatar}>
            <div>
              <Avatar name={me?.nombre} size={44} />
              <div>
                <h5>{me?.nombre}</h5>
                <p>{me?.userName}</p>
                <div>
                  <span></span>Conectado
                </div>
              </div>
            </div>
          </div>
          <div className={`${styles['aside']} ${sidebar.divUl}`}>

            <ul className={sidebar.ul}>
              {menu?.map((item, index) => {
                return <SidebarElement key={item.id ?? index} {...item} index={index} />;
              })}
            </ul>
          </div>
        </aside>
      }
      <div className={`p-0 transition-all duration-200 ${isDesktop && !openSidebar ? 'ml-64' : 'ml-0'}`} >
        <div className="p-4 sm:p-6 mt-14">
          <Outlet />
        </div>
      </div>
    </div>
  );
};
