import Modal from "react-modal";
import styles from "./ventasModal.module.css";
import { RootState } from "../../../../redux/rootState";
import { useAppDispatch, useAppSelector } from "../../../../redux/store";
import { Icons } from "../../../Svg/iconsPack";
import Svg from "../../../Svg";
import { useEffect, useState } from "react";
import { Item } from "./Items";
import { closeModalVentas } from "../../../../redux/reducers/Admin/ventas/ventasRealizadas.reducer";
import NotProducts from "../../../../assets/svg/notProducts";
const customStyles = {};
Modal.setAppElement("#root");
interface IAsistenciaModal {
  isTurno?: boolean;
}
export const VentasModal = ({ isTurno }: IAsistenciaModal) => {
  const dispatch = useAppDispatch();
  const { modalVentas, room, listCuartos, activeVentas }: any = useAppSelector(
    (state: RootState) => state.ventas
  )
  console.log('activeVentas', activeVentas);

  console.log(listCuartos);
  const { anfitrionas }: any = useAppSelector(
    (state: RootState) => state.clientes
  );
  const { products }: any = useAppSelector(
    (state: RootState) => state.products
  );
  console.log(products);

  const fechaActual = new Date();

  const dia = String(fechaActual.getDate()).padStart(2, "0");
  const mes = String(fechaActual.getMonth() + 1).padStart(2, "0");
  const anio = fechaActual.getFullYear();

  const fechaFormateada = `${dia}/${mes}/${anio}`;
  console.log(fechaFormateada);

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


  const turnoToInitialId = diaSemana === 0 ? "1" : isTurno === false ? "1" : (isTurno === true ? "2" : "1")
  console.log(turnoToInitialId);
  const initialForm = {
    habitacionId: 0,
    habitacion: "",
    anfitrionaId: 0,
    anfitriona: "",
    turno: "",
    /*  turnoId: turnoToInitialId, */
  };
  const [formValues, setFormValues] = useState(initialForm);
  console.log(formValues)
  const [selectedItems, setSelectedItems] = useState<any>([]);
  console.log(selectedItems);
 
  
 
  const { anfitrionaId,/* habitacionId, habitacion, anfitrionaId,  *//* anfitriona, */ turno/* , turnoId  */ } =
    formValues;
    console.log(anfitrionaId)

  
/*   const setPricesRelatedTurnos =
    
    diaSemana === 0 ? "85.00" : isTurno === false ? "55.00" : (isTurno === true ? "105.00" : "55.00") */


  
/*   const handleChangeSelect = (
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
  }; */
  /*   console.log(turnoId); */
  const closeModal = () => {
    dispatch(closeModalVentas());
    // dispatch(clearActiveRoom());
    setFormValues(initialForm);
    setSelectedItems([])
    /*  setTimeout(() => {
      dispatch(clearActiveProducto())
    }, 200); */
  };

  console.log(anfitrionas);
  console.log(turno);



    diaSemana === 0 ? "M" : isTurno === false ? "M" : (isTurno === true ? "T" : "M")



    const allHygieneProducts =
    activeVentas &&
    activeVentas?.comprobanteDetalles.map((item: any) => {
      return {
        ...item,
        id: item?.productoId,
        img: item?.rutaImagen ? item?.rutaImagen : 'https://dcuk1cxrnzjkh.cloudfront.net/imagesproducto/029832L.jpg',
        description: item?.producto,
        textoAlternativo: item?.nombre,
        price: `${item?.valorUnitarioTotal?.toFixed(2)}`,
        cantidad: item?.cantidad,

      };
    });

    
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

  const setHeight = (windowHeight >= 953) ? "773px" : windowHeight >= 804 ? "600px" : (

    windowHeight <= 803 && windowHeight > 748

  )
    ? "773px" : (windowHeight <= 747 && windowHeight > 603 ? "557px" : windowHeight <= 603 && "410px");

/*   const total = selectedItems.reduce((accumulator: any, item: any) => {
    return accumulator + parseFloat(item.price);
  }, 0); */
  console.log(selectedItems);

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

 
  console.log(room);
  return (
    <Modal
      isOpen={modalVentas}
      style={customStyles}
      closeTimeoutMS={200}
      className={styles.ventas}
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
                Productos Vendidos {room}{" "}
                {/* <span>
                  {`${selectedItems?.length === 0
                      ? `(${selectedItems?.length}) productos seleccionados`
                      : `${selectedItems?.length > 1
                        ? `(${selectedItems?.length}) productos seleccionados`
                        : `(${selectedItems?.length}) producto seleccionado`
                      }`
                    }`}
                </span> */}
              </h2>
            </div>
            <div className={styles.content}>
              <div style={{ height: `${setHeight}` }}>
  
                <div className={styles["productos"]}>
                  {/* <h3>Productos a escoger</h3> */}
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
            {/* <div className="main-content-totales"> */}



            {/* </div> */}


            <div className={styles["main-content-totales"]}>

                <div>
                    <p>fecha de venta</p>
                    <p>{activeVentas?.fechaVenta}</p>
                </div>
                <div>
                    <p>fecha de registro</p>
                    <p>{activeVentas?.fecha}</p>
                </div>
                <div>
                    <p>cliente</p>
                    <p className="uppercase">{activeVentas?.clienteNombre || "SIN ESPECIFICAR"}</p>
                </div>
                <div>
                    <p>subtotal</p>
                    <p>{activeVentas?.valorSubtotal.toFixed(2)}</p>
                </div>
                <div>
                    <p>impuestos</p>
                    <p>{activeVentas?.valorIgv.toFixed(2)}</p>
                </div>
                <div>
                    <p>descuento</p>
                    <p>0.00</p>
                </div>
                <div className={styles.dash}></div>
                <div>
                    <p>total</p>
                    <p>{activeVentas?.total.toFixed(2)}</p>
                </div>
                {/* <button onClick={showPage} className="mt-4 bg-[#2997FE] w-full rounded-md p-3 text-cyan-50">Pagar</button> */}
    

              
              {/* <Button size="sm" onClick={closeModal}>
                Cancelar
              </Button>
              <Button size="sm" onClick={createAnfitriona} disabled={anfitrionaId!=0?false:true}>
                Agregar asistencia
              </Button> */}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
