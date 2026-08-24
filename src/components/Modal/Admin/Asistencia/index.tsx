import Modal from "react-modal";
import styles from "./asistenciaModal.module.css";
import { RootState } from "../../../../redux/rootState";
import { useAppDispatch, useAppSelector } from "../../../../redux/store";
import {
  clearActiveRoom,
  closePopoverAsistencia,
  createRentaMain,
} from "../../../../redux/reducers/Admin/asistencia/asistencia.reducer";
import { Icons } from "../../../Svg/iconsPack";
import Svg from "../../../Svg";
import SelectPro from "../../../SelectPro";
import Input from "../../../Input";
import { Button } from "@tremor/react";
import { useEffect, useState } from "react";
import NotProducts from "../../../../assets/svg/notProducts";
import { toast } from "sonner";
import { Item } from "./Items";
const customStyles = {};
Modal.setAppElement("#root");
interface IAsistenciaModal {
  isTurno?: boolean;
}
export const AsistenciaModal = ({ isTurno }: IAsistenciaModal) => {
  const dispatch = useAppDispatch();
  const { popoverAsistencia, room, listCuartos, listRenta }: any =
    useAppSelector((state: RootState) => state.asistencia);

  console.log(listCuartos);
  const { anfitrionas }: any = useAppSelector(
    (state: RootState) => state.clientes
  );
  const { products }: any = useAppSelector(
    (state: RootState) => state.products
  );
  console.log(products);
/*   const turnos = [
    {
      id: 1,
      value: "Primer Turno",
    },
    {
      id: 2,
      value: "Segundo Turno",
    },
  ]; */

  const primerTurno = [
    {
      id: 1,
      value: "Primer Turno",
    },
  ];

  const segundoTurno = [
    {
      id: 2,
      value: "Segundo Turno",
    },
  ];

  const turnoEspecial = [
    {
      id: 1,
      value: "Turno Único",
    },
  ];

  const getIdCuarto = listCuartos?.find(
    (value: any) => parseInt(value?.descripcion) === room
  );
  const idCuarto = getIdCuarto?.id;

  const fechaActual = new Date();

  const dia = String(fechaActual.getDate()).padStart(2, "0");
  const mes = String(fechaActual.getMonth() + 1).padStart(2, "0");
  const anio = fechaActual.getFullYear();

  const fechaFormateada = `${dia}/${mes}/${anio}`;

  const obtenerTurno = (fecha: string) => {
    const partesFecha = fecha.split("/");
    const dia = parseInt(partesFecha[0], 10);
    const mes = parseInt(partesFecha[1], 10) - 1;
    const anio = parseInt(partesFecha[2], 10);
    const fechaActual = new Date(anio, mes, dia);
    const diaSemana = fechaActual.getDay();
    /*    const horaActual = fechaActual.getHours(); */

    const today = new Date();
    const horaActual = today.getHours();
    /*     const minutos = today.getMinutes();
  const segundos = today.getSeconds(); */
    console.log(fechaActual);

    let turno = "";

    if (diaSemana === 0) {
      turno = "Turno Especial"; // Domingo
    } else if (horaActual >= 10 && horaActual < 17) {
      turno = "Primer Turno"; // Lunes a sábado, primer turno
    } else if (
      (horaActual >= 17 && horaActual < 24 && diaSemana !== 0) ||
      (horaActual >= 0 && horaActual < 2)
    ) {
      turno = "Segundo Turno"; // Lunes a sábado, segundo turno
    }

    return {
      turno,
      diaSemana,
    };
  };
/*   const turnoSetted = obtenerTurno(fechaFormateada)?.turno; */
  const diaSemana = obtenerTurno(fechaFormateada)?.diaSemana;

  /*   const setTurnoToId =
      diaSemana === 0
        ? "1"
        : turnoSetted === "Primer Turno"
        ? "1"
        : turnoSetted === "Segundo Turno"
        ? "2"
        : "1";
   */

  const turnoToInitialId =
    diaSemana === 0
      ? "1"
      : isTurno === false
      ? "1"
      : isTurno === true
      ? "2"
      : "1";
  console.log(turnoToInitialId);
  const initialForm = {
    habitacionId: 0,
    habitacion: "",
    anfitrionaId: 0,
    anfitriona: "",
    turno: "",
    adelanto:0,
    observaciones:"",
    /*  turnoId: turnoToInitialId, */
  };
  const [formValues, setFormValues] = useState(initialForm);
  const [isCheckedAdelanto,setIsCheckedAdelanto ]= useState(false);
  console.log(formValues);
  const [selectedItems, setSelectedItems] = useState<any>([]);
  console.log(selectedItems);

  const newArraySelectedItems = selectedItems?.map((value: any) => {
    return {
      productoId: value?.productoId,
      precio: value?.precio,
    };
  });
  const {
    anfitrionaId,
    adelanto,
    observaciones,
    /* habitacionId, habitacion, anfitrionaId,  */ anfitriona,
    turno /* , turnoId  */,
  } = formValues;
  console.log(anfitrionaId);

  /*  console.log(turnoId); */
   const handleInputChange = (e: any) => {
     setFormValues({
       ...formValues,
       [e.target.name]: e.target.value,
     });
   };
  /*   const setTurnoToSwitch =
      diaSemana === 0
        ? "Turno Único"
        : turnoSetted === "Primer Turno"
        ? "Primer Turno"
        : turnoSetted === "Segundo Turno"
        ? "Segundo Turno"
        : "Primer Turno"; */

  /*   const setTurnoOptions =
      diaSemana === 0
        ? turnoEspecial
        : turnoSetted === "Primer Turno" || turnoSetted === "Segundo Turno"
        ? turnos
        : turnos; */
  const turnoToSelectsOptions =
    diaSemana === 0 ? turnoEspecial : !isTurno ? primerTurno : segundoTurno;
  const turnoToSelectsSwitch =
    diaSemana === 0
      ? "Turno Único"
      : !isTurno
      ? "Primer Turno"
      : "Segundo Turno";
  const setPricesRelatedTurnos =
    /*   diaSemana === 0
        ? "85.00"
        : turnoId === "1"
        ? "55.00"
        : turnoId === "2"
        ? "105.00"
        : "55.00"; */

    /*     diaSemana === 0 ? "85.00" : isTurno === false ? "55.00" : (isTurno === true ? "105.00" : "55.00") */
    diaSemana === 0
      ? "85.00"
      : isTurno === false
      ? "55.00"
      : isTurno === true &&
        (diaSemana === 1 || diaSemana === 2 || diaSemana == 3)
      ? "85.00"
      : isTurno === true &&
        (diaSemana === 4 || diaSemana === 5 || diaSemana == 6)
      ? "105.00"
      : "55.00";

  const setTurnoRelatedRoom =
    diaSemana === 0
      ? "TURNO ÚNICO"
      : isTurno === false
      ? "PRIMER TURNO"
      : isTurno === true
      ? "SEGUNDO TURNO"
      : "PRIMER TURNO";
  /*   diaSemana === 0
      ? "TURNO ÚNICO"
      : turnoId === "1"
      ? "PRIMER TURNO"
      : turnoId === "2"
      ? "SEGUNDO TURNO"
      : "PRIMER TURNO"; */
  const handleChangeSelect = (
    idValue: any,
    value: string,
    name: string,
    id: number
  ) => {
    console.log(idValue, id, name, value);

    setFormValues({
      ...formValues,
      [name]: value,
      [id]: idValue,
    });
  };
  /*   console.log(turnoId); */
  const closeModal = () => {
    dispatch(closePopoverAsistencia());
    dispatch(clearActiveRoom());
    setFormValues(initialForm);
    setIsCheckedAdelanto(false);
    setSelectedItems([]);
    /*  setTimeout(() => {
      dispatch(clearActiveProducto())
    }, 200); */
  };

  console.log(anfitrionas);
  console.log(turno);

  const filtrarAnfitrionas = (
    renta: any,
    anfitrionas: any,
    turno: any,
    fecha: any
  ) => {
    function obtenerFechaSinHora(fechaCompleta: any) {
      const partes = fechaCompleta.split(" ");
      return partes[0];
    }

    const newAnfitrionas = (anfitrionas ?? []).filter((anfitriona: any) => {
      const tieneCoincidencia = renta.some((rentaItem: any) => {
        const rentaFechaSinHora = obtenerFechaSinHora(rentaItem.fechaIngreso);
        const fechaSinHora = obtenerFechaSinHora(fecha);
        return (
          rentaItem.anfitrionaId === anfitriona.anfitrionaId &&
          rentaItem.turno === turno &&
          rentaFechaSinHora === fechaSinHora
        );
      });

      return !tieneCoincidencia;
    });

    return newAnfitrionas;
  };

  const turnoToFilter =
    /* diaSemana === 0 ? "M" : turnoId === "1" ? "M" : (turnoId==='2'?'T':'M') */

    diaSemana === 0
      ? "M"
      : isTurno === false
      ? "M"
      : isTurno === true
      ? "T"
      : "M";
  const newAnfitrionasFiltered = filtrarAnfitrionas(
    listRenta,
    anfitrionas,
    turnoToFilter,
    fechaFormateada
  );

  const newAnfitrionas = newAnfitrionasFiltered?.map((value: any) => {
    return {
      id: value?.anfitrionaId,
      value: `${value?.nombres}`,
    };
  });

  /*   const anfitrionas=[
    {
      id:1,
      value:'Paulina',
    },{
      id:2,
      value:'Moana',
    },
    {
      id:3,
      value:'Abrill'
    }
  ] */
  const allHygieneProducts =
    products &&
    products?.map((item: any) => {
      return {
        ...item,
        id: item?.productoId,
        img: item?.rutaImagen,
        description: item?.nombre,
        textoAlternativo: item?.nombre,
        price: `${item?.precio?.toFixed(2)}`,
      };
    });

  /*   const getData = (data: any) => {
      console.log(data);
    }; */

  const [windowWidth, ] = useState(window.innerWidth);
  const [windowHeight, setWindowHeight] = useState(window.innerHeight);

  console.log(windowHeight);
  console.log(windowWidth);
  useEffect(() => {
    const handleResize = () => {
      setWindowHeight(window.innerHeight);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

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

  const total = selectedItems.reduce((accumulator: any, item: any) => {
    return accumulator + parseFloat(item.price);
  }, 0);
  const resultConAdelanto= adelanto===0? Number(setPricesRelatedTurnos) : adelanto
  const resultConAdelantoMain=adelanto===0?(0).toFixed(2):(Number(setPricesRelatedTurnos) - adelanto).toFixed(2)

  const totalPlusRentaRelatedTurno = (Number(total) + Number(resultConAdelanto));

  const montoTotalPaid=total + Number(setPricesRelatedTurnos)


  const handleItemClick = (item: any) => {
    console.log(item);

    if (
      selectedItems?.find((value: any) => value?.productoId === item.productoId)
    ) {
      setSelectedItems(
        selectedItems.filter(
          (selectedItem: any) => selectedItem.productoId !== item.productoId
        )
      );
    } else {
      setSelectedItems([...selectedItems, item]);
    }
  };
  const createAnfitriona = () => {
    dispatch(
      createRentaMain({
        ...formValues,
        habitacionId: idCuarto,
        montoTotal: parseFloat(montoTotalPaid).toFixed(2),
        montoPendiente:resultConAdelantoMain,
        detalleProductos: newArraySelectedItems,
        montoCuarto:adelanto,
        /*    turno: diaSemana === 0 ? "M" : turnoId === "1" ? "M" : (turnoId==='2'?'T':'M'), */
        turno:
          diaSemana === 0
            ? "M"
            : isTurno === false
            ? "M"
            : isTurno === true
            ? "T"
            : "M",
      })
    );
    closeModal();
    toast.success("Se asignó una anfitriona al turno");
    setFormValues(initialForm);
  };
  const obtenerPrimeraLetra = (room: number) => {
    const newRoom = room?.toString();
    if (typeof newRoom === "string" && newRoom?.length > 0) {
      return newRoom?.charAt(0);
    } else {
      return null; // O cualquier valor que desees en caso de que room no sea una cadena válida
    }
  };

  const primeraLetra = obtenerPrimeraLetra(room);

  useEffect(() => {
    if(!isCheckedAdelanto){
      setFormValues({
        ...formValues,
        adelanto:0,
      })
    }
  }, [isCheckedAdelanto])
  
  return (
    <Modal
      isOpen={popoverAsistencia}
      style={customStyles}
      closeTimeoutMS={200}
      className={styles.asistencia}
      overlayClassName="modal-fondo"
    >
      <div className={styles.container}>
        <div className={styles["pay-table"]}>
          <div className={styles["content-main-modal"]}>
            <div className={styles.encabezadoPay}>
              <h2>
                Pagos asociados al Cuarto {room}{" "}
                <span>
                  <span>{anfitriona != "" && `${anfitriona}`}</span>
                </span>
              </h2>
            </div>
            <div className={styles.content}>
              <div style={{ height: `${setHeight}` }}>
                <div className={styles["producto"]}>
                  <div className={styles["producto-door"]}>
                    <div className={styles["first-section-producto"]}>
                      {/* <img
                      src={
                        "https://distintaslatitudes.net/storage/2017/07/las-cucardas-06.jpg"
                      }
                    /> */}
                      <img
                        src={
                          "https://static.vecteezy.com/system/resources/previews/014/863/769/non_2x/open-door-icon-cartoon-exterior-door-vector.jpg"
                        }
                      />
                      <div className={`${styles["description-producto"]}`}>
                        <p>Cuarto {room}</p>
                        <span>{setTurnoRelatedRoom}</span>
                      </div>
                    </div>
                    <div className={styles["second-section-producto"]}>
                      <p className={styles["price"]}>
                        S/. {setPricesRelatedTurnos}
                      </p>
                      <p className={styles.quantity}>
                        Cantidad:<span> 1</span>
                      </p>
                    </div>
                  </div>
                  <div className={styles["adelanto"]}>
                    <div className={styles["adelanto-first"]}>
                      <input type="checkbox" onChange={()=>setIsCheckedAdelanto(!isCheckedAdelanto)}/>
                      <p>Abonará un adelanto</p>
                    </div>
                    {
                      isCheckedAdelanto&&   <div className={styles["adelanto-second"]}>
                      <Input type="number" name="adelanto" value={adelanto} onChange={handleInputChange} />
                    </div>
                    }
                 
                  </div>
                  {
                    isCheckedAdelanto && <div className={styles['deuda']}>
                    <p>Total Deuda</p>
                    <span className={styles["price"]}>S/. {resultConAdelantoMain}</span>
                  </div>
                  }
                  

                  <div className={styles['comentario']}>
                    <label htmlFor="observaciones">Comentario</label>
                    <textarea id='observaciones' name='observaciones' value={observaciones} onChange={handleInputChange}/>
                  </div>
                </div>
                <div>
                  <div>
                    {selectedItems?.map((item: any, index: any) => {
                      return (
                        <div key={index} className={styles["producto-items"]}>
                          <div className={styles["first-section-producto"]}>
                            <img src={item?.img} />
                            <div
                              className={`${styles["description-producto"]}`}
                            >
                              <p>{item?.nombre}</p>
                              <span>{fechaFormateada}</span>
                            </div>
                          </div>
                          <div className={styles["second-section-producto"]}>
                            <p className={styles["price"]}>S/. {item?.price}</p>
                            <p className={styles.quantity}>
                              Cantidad:<span> 1</span>
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
            <div className={`${styles["amount"]}`}>
              <div>
                <p>Total a pagar</p>
                <span>S/. {totalPlusRentaRelatedTurno?.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
        <div className={styles.main}>
          <div className={styles.closeBtn} onClick={closeModal}>
            <Svg icon={Icons.close} />
          </div>
          <div className={styles["content-main-modal"]}>
            <div className={styles.encabezado}>
              <h2>
                Asignar Cuarto {room}{" "}
                <span>
                  {`${
                    selectedItems?.length === 0
                      ? `(${selectedItems?.length}) productos seleccionados`
                      : `${
                          selectedItems?.length > 1
                            ? `(${selectedItems?.length}) productos seleccionados`
                            : `(${selectedItems?.length}) producto seleccionado`
                        }`
                  }`}
                </span>
              </h2>
            </div>
            <div className={styles.content}>
              <div style={{ height: `${setHeight}` }}>
                <div className={`${styles["first-section"]}`}>
                  <div>
                    <SelectPro
                      isLabel
                      label="Anfitriona"
                      isSearch
                      id="anfitrionaId"
                      name="anfitriona"
                      defaultValue={anfitriona}
                      options={newAnfitrionas}
                      onChange={handleChangeSelect}
                    />
                  </div>
                  <div>
                    <SelectPro
                      isLabel
                      label="Turno"
                      isSearch
                      id="turnoId"
                      name="turno"
                      defaultValue={turnoToSelectsSwitch}
                      /* options={setTurnoOptions} */
                      options={turnoToSelectsOptions}
                      onChange={handleChangeSelect}
                    />
                  </div>
                </div>
                <div className={`${styles["second-section"]}`}>
                  <div>
                    <Input
                      name=""
                      isLabel
                      label="Fecha"
                      disabled
                      value={fechaFormateada}
                    />
                  </div>
                  <div>
                    <Input
                      name=""
                      isLabel
                      label="Cuarto"
                      value={room}
                      disabled
                    />
                  </div>
                  <div>
                    <Input
                      name=""
                      isLabel
                      label="Piso"
                      value={`Piso ${primeraLetra}`}
                      disabled
                    />
                  </div>
                </div>
                <div className={styles["productos"]}>
                  <h3>Productos a escoger</h3>
                  <div className={styles.items}>
                    {allHygieneProducts?.length > 0 ? (
                      allHygieneProducts?.map((item: any, index: any) => {
                        return (
                          <Item
                            key={index}
                            data={item}
                            /*       onClick={getData} */
                            onClick={handleItemClick}
                            {...item}
                          />
                        );
                      })
                    ) : (
                      <div className={`${styles["empty-image"]}`}>
                        <NotProducts />
                        <h5>Sin Elementos agregados</h5>
                        <p>
                          Por favor crea y agrega nuevos elementos a la lista.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* <div>
                  <p>
                    Precio del cuarto por turno: S/. {setPricesRelatedTurnos}
                  </p>
                </div> */}
              </div>
            </div>
            <div className={styles["main-content-buttons"]}>
              <Button size="sm" onClick={closeModal}>
                Cancelar
              </Button>
              <Button
                size="sm"
                onClick={createAnfitriona}
                disabled={anfitrionaId != 0 ? false : true}
              >
                Agregar asistencia
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
