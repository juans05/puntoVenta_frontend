import styles from "./login.module.css";
/* import banner from "./../../../assets/img/logo_white.svg"; */
import { ChangeEvent, useEffect, useState } from "react";
import { Icon } from "@iconify/react/dist/iconify.js";
import { signIn } from "../../../redux/reducers/auth/auth.reducer";
import { useAppDispatch, useAppSelector } from "../../../redux/store";
/* import Logo from "../../../assets/img/logo-brand.svg"; */
import { IAuthState, IUser } from "../../../redux/reducers/auth/interfaces";
import { RootState } from "../../../redux/rootState";
import { Toaster, toast } from "sonner";
import Input from "../../../components/Input";
import { getAllRecursos, getAllTenants } from "../../../redux/reducers/Admin/my-business/myBusiness.reducer";
import { getToken } from "../../../helpers/auth-helpers";

const initialForm: IUser = {
  userName: "",
  password: "",
};

const Login = () => {
  const dispatch = useAppDispatch();

  const { login, me, message }: IAuthState = useAppSelector(
    (state: RootState) => state.auth
  );


  const { recursos, tenants }: any = useAppSelector(
    (state: RootState) => state.myBusiness
  );

/*   console.log(login)
  console.log(tenants.flat().join('').toUpperCase()) */


  const [isText, setIsText] = useState<boolean>(false);
  const [formValues, setFormValues] = useState<IUser>(initialForm);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues({
      ...formValues,
      [name]: value,
    });
  };

  const goNewSale = () => {
    dispatch(signIn(formValues));
  };

  const handleKeyPress = (
    event: React.KeyboardEvent<HTMLButtonElement | HTMLInputElement>
  ) => {
    if (event.key === "Enter") {
      goNewSale();
    }
  };

  useEffect(() => {
    toast.error(message);
  }, [message]);


  

  useEffect(() => {
    const token = localStorage.getItem("4D3V$PUNTOVENT4");

    console.log(token);
    console.log(me);

    const checkTenantMatch = (username: string | undefined) => {
      if (!username) return false;
      const uLower = username.toLowerCase();
      if (Array.isArray(tenants)) {
        return tenants.some((t: any) => {
          if (!t) return false;
          if (typeof t === 'string') {
            return uLower.includes(t.toLowerCase());
          }
          if (typeof t === 'object') {
            const name = t.tenantNombre || t.nombre || t.id;
            return name && uLower.includes(String(name).toLowerCase());
          }
          return false;
        });
      }
      return false;
    };

    if (
      (token && me?.userName === "VENTAS2") ||
      (token && me?.userName === "VENTAS1") ||
      (token && me?.userName === "JRAMIREZ") ||
      (token && me?.userName === "DISCOBAR") ||
      (token && me?.userName === "SPASOLIS") 
    ) {
      window.location.href = "/facturacion";
      return;
    }
    if (
      /*  (token && me?.userName === "ADMIN") || */
      (token && me?.userName === "RECEPCION") || 
      (token && me?.nombre?.toLowerCase() === login?.username?.toLowerCase())
    ) {
      window.location.href = "/dashboard/productos";
      return;
    }
    console.log(login);
    if (login === null) {
      return;
    }
    const usernameLower = login?.username?.toLowerCase() || "";
    const meUsernameLower = me?.userName?.toLowerCase() || "";

    if (
      usernameLower.startsWith("ventas") ||
      meUsernameLower.startsWith("ventas") ||
      usernameLower.startsWith("barra1") ||
      meUsernameLower.startsWith("barra1")
    ) {
      window.location.href = "/facturacion";
      return;
    }
    if (
      usernameLower.startsWith("admin") ||
      checkTenantMatch(login?.username) ||
      usernameLower.startsWith("recepcion") ||
      usernameLower.startsWith("developer") ||
      usernameLower.startsWith("jramirez") ||
      usernameLower.startsWith("discobar") ||
      usernameLower.startsWith("restaurant") ||
      usernameLower.startsWith("spasolis") ||
      meUsernameLower.startsWith("recepcion") ||
      checkTenantMatch(me?.userName) ||
      meUsernameLower.startsWith("contadora")
    ) {
      window.location.href = "/dashboard/productos";
      return;
    }
    if (usernameLower.startsWith("contadora")) {
      window.location.href = "/dashboard/documentos-facturados";
      return;
    }

    // Cualquier usuario autenticado que no matchea ninguna regla legacy de arriba
    // (ej. el admin de un tenant nuevo) cae aquí en vez de quedar pegado en el login.
    window.location.href = "/dashboard/productos";
  }, [login, me, tenants]);

  useEffect(() => {
    dispatch(getAllRecursos())
  }, [dispatch])
  useEffect(() => {
    if (!getToken()) return;
    dispatch(getAllTenants())
  }, [dispatch])

  return (
    <>
      {message && <Toaster position="top-right" richColors />}
      <div className={styles.login__wrapper}>
        <div className={styles.login__form}>
          <img src={recursos?.logo} alt="Logo de la empresa" className={styles.logo} />
          <div className={styles.header__loginInfo}>
            <h5>Iniciar Sesión</h5>
            <p>Ingresa a tu cuenta y accede a tu sistema en linea</p>
          </div>
          <div className={styles.form__wrapper}>
            <div>
              <Input
                onKeyUp={handleKeyPress}
                isLabel
                label="Usuario o correo electrónico"
                name="userName"
                onChange={handleChange}
                type="text"
              />
            </div>
            <div>
              <button
                type="button"
                className={styles.togglePassword}
                aria-label={isText ? "Ocultar contraseña" : "Mostrar contraseña"}
                onClick={() => setIsText(!isText)}
              >
                <Icon icon={isText ? "uiw:eye-o" : "ri:eye-off-line"} />
              </button>
              <Input
                onKeyUp={handleKeyPress}
                name="password"
                onChange={handleChange}
                type={isText ? "text" : "password"}
                isLabel
                label="Contraseña"
              />
            </div>
            <div>{/* <a href="">Has olvidado tu contraseña ?</a> */}</div>
            <div>
              <button tabIndex={0} onKeyUp={handleKeyPress} onClick={goNewSale}>
                Iniciar sesión
              </button>
            </div>
          </div>
        </div>
        <div className={styles.login__banner} style={recursos?.imagenPortada ? { backgroundImage: `url(${recursos.imagenPortada})` } : undefined}>
          <div className={styles.content__loginBanner}>
            <div>
              <div className={styles.img__contentLogin}>
                {/*       <img src={banner} alt="" /> */}

              </div>
              <div className={styles.info__contentLogin}>
                <p>
                  El mejor <strong>sistema</strong> para cualquier{" "}
                  <strong>negocio</strong>, hecho para ti, verfica tus reportes,
                  productos,ventas,etc.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
