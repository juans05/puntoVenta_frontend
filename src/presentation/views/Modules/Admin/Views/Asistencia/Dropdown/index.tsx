import { RootState } from "../../../../../../../redux/rootState";
import {
  useAppDispatch,
  useAppSelector,
} from "../../../../../../../redux/store";
import styles from "./dropdown.module.css";
import logoBrand from "../../../../../../../assets/img/logo-brand.svg";

import { Icon } from "@iconify/react";
import {
  completarRentaAnfitriona,
  marcarSalidaAnfitriona,
  openModalFichas,
} from "../../../../../../../redux/reducers/Admin/asistencia/asistencia.reducer";
interface IDropDownOptions {
  referencia: any;
  isActive: any;
  marginLeft?: string;
}
export const DropdownPopover = ({
  referencia,
  isActive,
  marginLeft,
}: IDropDownOptions) => {
  const dispatch = useAppDispatch();
  const findCountryFlag = (nacionalidad: string) => {
    switch (nacionalidad) {
      case "COLOMBIANA":
        return (
          <img
            alt="Colombia"
            src="http://purecatamphetamine.github.io/country-flag-icons/3x2/CO.svg"
            className={`${styles["flag"]}`}
          />
        );
      case "PERUANA":
        return (
          <img
            alt="Perú"
            src="http://purecatamphetamine.github.io/country-flag-icons/3x2/PE.svg"
            className={`${styles["flag"]}`}
          />
        );
      case "VENEZOLANA":
        return (
          <img
            alt="Venezuela"
            src="http://purecatamphetamine.github.io/country-flag-icons/3x2/VE.svg"
            className={`${styles["flag"]}`}
          />
        );
      case "ECUATORIANA":
        return (
          <img
            alt="Ecuador"
            src="http://purecatamphetamine.github.io/country-flag-icons/3x2/EC.svg"
            className={`${styles["flag"]}`}
          />
        );
      case "ARGENTINA":
        return (
          <img
            alt="Argentina"
            src="http://purecatamphetamine.github.io/country-flag-icons/3x2/AR.svg"
            className={`${styles["flag"]}`}
          />
        );
      default:
        return null;
    }
  };

  const { activeRoom }: any = useAppSelector(
    (state: RootState) => state.asistencia
  );

  console.log(activeRoom);

  const viewFichas = () => {
    console.log(activeRoom);
    dispatch(openModalFichas());
  };

  const marcarSalida = () => {
    console.log(activeRoom);
    dispatch(
      marcarSalidaAnfitriona(activeRoom?.anfitrionaId, activeRoom?.turno)
    );
  };
  const cancelarDeuda = () => {
/*     console.log(activeRoom); */
    dispatch(
      completarRentaAnfitriona(activeRoom?.id)
    );
  };
  return (
    <div>
      <div
        ref={referencia}
        className={`${styles.menuFilterColumn} ${
          isActive ? styles.active : styles.inactive
        }`}
        style={{ marginLeft: `${marginLeft ? marginLeft : "85px"}` }}
      >
        <div className={styles.containerButtons}>
          <div className={styles["main"]}>
            <div className={styles["encabezado"]}>
              <div className={`${styles["logo"]}`}>
                <img src={logoBrand} />
              </div>
              <div className={`${styles["content"]}`}>
                <div className={styles["main-content-text"]}>
                  <div className={styles["country"]}>
                    <div className={styles["nacionalidad"]}>
                      <p className={styles["anfitriona"]}>
                        {activeRoom?.anfitriona}
                      </p>

                      {/*  <p>{activeRoom?.nacionalidad}</p> */}
                      {findCountryFlag(activeRoom?.nacionalidad)}
                    </div>
                    

                    <div className={`${styles["room"]}`}>
                      <div>
                        <Icon icon="ic:baseline-meeting-room" />
                        <p> {activeRoom?.room}</p>
                      </div>
                      {/*  <div>
                      <p>Piso {activeRoom?.piso}</p>
                    </div> */}
                    </div>
                  </div>

                  <div className={`${styles["btns"]}`}>
                    <div className={`${styles["button"]}`}>
                      <button onClick={viewFichas}>Ver fichas</button>
                    </div>
                    {
                      activeRoom?.montoPendiente === 0 ? <div className={`${styles["button"]}`}>
                      <button
                        onClick={marcarSalida}
                       /*  disabled={
                          activeRoom?.montoPendiente === 0 ? false : true
                        } */
                      >
                        Marcar Salida
                      </button>
                    </div> :<div className={`${styles["button"]}`}>
                      <button
                        onClick={cancelarDeuda}
                       /*  disabled={
                          activeRoom?.montoPendiente === 0 ? false : true
                        } */
                      >
                        Pagar Deuda
                      </button>
                    </div> 
                    }
                   {/*  <div className={`${styles["button"]}`}>
                      <button
                        onClick={marcarSalida}
                        disabled={
                          activeRoom?.montoPendiente === 0 ? false : true
                        }
                      >
                        Marcar Salida
                      </button>
                    </div>  */}
                  </div>

                  {/* <img
                  alt="Colombia"
                  src="http://purecatamphetamine.github.io/country-flag-icons/3x2/CO.svg"
                /> */}
                </div>
                <div className={`${styles["time"]}`}>
                  <div>
                    <p>Ingreso</p>
                    <p>{activeRoom?.horaIngreso}</p>
                  </div>
                  {activeRoom?.montoPendiente === 0 ? (
                          <div>
                          <p>Salida</p>
                          <p>
                            {activeRoom?.horaSalida === "" ||
                            activeRoom?.horaSalida == undefined
                              ? "--:--"
                              : `${activeRoom?.horaSalida}`}
                          </p>
                        </div>
                    ) : (
                      <div className={styles['deuda']}>
                        <span> Debe  S/.  {parseFloat(activeRoom?.montoPendiente).toFixed(2)}</span>
                      </div>
                    )}
              
                </div>
              </div>
            </div>

            {/* <div className={styles["first-section"]}>
              
              <div>
                <p>{activeRoom?.horaIngreso}</p>
                <p>{activeRoom?.horaSalida}</p>
              </div>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
};
