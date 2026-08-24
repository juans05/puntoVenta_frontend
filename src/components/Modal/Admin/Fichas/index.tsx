import Modal from "react-modal";
import styles from "./fichas.module.css";
import { useEffect, useState } from "react";

import { Icons } from "../../../Svg/iconsPack";
import Svg from "../../../Svg";
import { RootState } from "../../../../redux/rootState";
import { useAppDispatch, useAppSelector } from "../../../../redux/store";

import "../../index.css";
import {
  clearActiveRoom,
  closeModalFichas,
} from "../../../../redux/reducers/Admin/asistencia/asistencia.reducer";
/* import { Button } from "@tremor/react"; */
import dark from "../../../../assets/img/dark.png";

const customStyles = {};
Modal.setAppElement("#root");
export const FichasModal = () => {
  const dispatch = useAppDispatch();

  const { modalFichas, activeRoom, listFichasByRoom }: any = useAppSelector(
    (state: RootState) => state.asistencia
  );

  const newListFichas = listFichasByRoom
    ?.filter((value: any) => value?.anfitrionaId === activeRoom?.anfitrionaId)
    ?.filter((item: any) => item?.turno === activeRoom?.turno);

  console.log(newListFichas);

  console.log(listFichasByRoom);
  console.log(activeRoom);
  /*   console.log(turnoId); */
  const closeModal = () => {
    dispatch(closeModalFichas());
    setTimeout(() => {
      dispatch(clearActiveRoom());
    }, 200);

    /*  setTimeout(() => {
      dispatch(clearActiveProducto())
    }, 200); */
  };

  const [windowHeight, setWindowHeight] = useState(window.innerHeight);
  console.log(windowHeight);
  console.log(windowHeight);
  useEffect(() => {
    const handleResize = () => {
      setWindowHeight(window.innerHeight);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

/*   const onPayFichas = () => {}; */

  /*  const setHeight =
    windowHeight > 747
      ? "773px"
      : windowHeight <= 747 && windowHeight > 603
      ? "557px"
      : windowHeight <= 603 && "410px"; */

  const setHeight =
    windowHeight >= 953
      ? "773px"
      : windowHeight >= 804
      ? "600px"
      : windowHeight <= 803 && windowHeight > 748
      ? "773px"
      : windowHeight <= 747 && windowHeight > 603
      ? "557px"
      : windowHeight <= 603 && "410px";

  const total =
    newListFichas?.length > 0 &&
    newListFichas?.reduce((accumulator: any, item: any) => {
      return accumulator + parseFloat(item?.comision);
    }, 0);

  return (
    <Modal
      isOpen={modalFichas}
      style={customStyles}
      closeTimeoutMS={200}
      className={styles.fichas}
      overlayClassName="modal-fondo"
    >
      <div className={styles.container}>
        <div className={styles.main}>
          <div className={styles.closeBtn} onClick={closeModal}>
            <Svg icon={Icons.close} />
          </div>
          <div className={styles["content-main-modal"]}>
            <div className={styles.encabezado}>
              <h2>
                Fichas de {activeRoom?.anfitriona}
                <span>Cuarto {activeRoom?.habitacion}</span>
              </h2>
              {/* <div className={styles['btn-fichas']}>
              <Button onClick={onPayFichas}>Pagar fichas</Button>
              </div> */}
            </div>
            <div className={styles.content}>
              <div style={{ height: `${setHeight}` }}>
                <div>
                  {newListFichas.length > 0 ? (
                    newListFichas?.map((value: any, index: number) => {
                      const date=value?.fecha
                      const newDateMain=date?.split(" ");
                    
                      return (
                        <div className={styles["ficha-producto"]} key={index}>
                          <div className={styles["ficha-producto-section1"]}>
                            <img src={value?.productoImagen} />
                            <div
                              className={
                                styles["ficha-producto-section1-description"]
                              }
                            >
                              <p className={styles["ficha-producto-name"]}>
                                {value?.producto}
                              </p>
                              <span className={styles["ficha-producto-date"]}>
                                {newDateMain[0]}
                              </span>
                              <p className={styles["ficha-producto-hour"]}>
                              {newDateMain[1]}
                              </p>
                            </div>
                          </div>
                          <div className={styles["ficha-producto-section2"]}>
                            <p
                              className={
                                styles["ficha-producto-section2-price"]
                              }
                            >
                              S/. <span>{value?.comision?.toFixed(2)}</span>
                            </p>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className={styles['empty-fichas']}>
                      <img
                        width={230}
                        /*  src="https://c.tenor.com/p2eovClgAMoAAAAd/designer-coffee-break.gif" */
                        src={dark}
                        alt=""
                      />
                      <div>
                      <h3>Sin fichas</h3>
                      <p>
                        No se encontraron fichas asociadas a la anfitriona{" "}
                        {activeRoom?.anfitriona}
                      </p>
                      </div>
                     
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className={styles["amount"]}>
              <div>
                <p>Total a pagar</p>
                <span>
                  S/.{" "}
                  {newListFichas?.length > 0
                    ? parseFloat(total)?.toFixed(2)
                    : "0.00"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
