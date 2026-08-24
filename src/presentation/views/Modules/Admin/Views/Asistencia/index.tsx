import { Calendar } from "../../../../../../components/Date";
import { AsistenciaModal } from "../../../../../../components/Modal/Admin/Asistencia";
import { FichasModal } from "../../../../../../components/Modal/Admin/Fichas";
import { Toggle } from "../../../../../../components/Toggle";
import { printTable } from "../../../../../../helpers/functions/printTitle";
import { title } from "../../../../../../infraestructure/MData/MData";
import { getListCuartos, getListFichasByRoom, getListRenta } from "../../../../../../redux/reducers/Admin/asistencia/asistencia.reducer";
import { getAllAnfitrionas } from "../../../../../../redux/reducers/Admin/clientes-proveedores/clientesProveedoresAnfitrionas.reducer";
import { getProducts } from "../../../../../../redux/reducers/Admin/productos/producto.reducer";
import { RootState } from "../../../../../../redux/rootState";
import { useAppDispatch, useAppSelector } from "../../../../../../redux/store";

import { Indicadores } from "./Indicadores/Indicadores";
import { Piso1 } from "./Piso1";
import { Piso2 } from "./Piso2";
import styles from "./asistencia.module.css";
import moment from "moment";
import { useState, useEffect, useRef } from "react";
import { Toaster } from 'sonner'
moment.locale("es");
interface IDataHistory {
  dateStart: string;
  dateEnd: string;
}

const dataHistory: IDataHistory = {
  dateStart: moment(new Date()).format("DD/MM/YYYY"),
  dateEnd: moment(new Date()).format("DD/MM/YYYY"),
};
export const Asistencia = () => {
  const dispatch = useAppDispatch();
  const { listRenta,listFichasByRoom }: any = useAppSelector(
    (state: RootState) => state.asistencia
  );

  console.log(listFichasByRoom);
  /*   console.log(listRenta); */
  const [dateHistory, setDateHistory] = useState<IDataHistory>(dataHistory);
  const { dateStart } = dateHistory;
  const handleChangeDate = (value: string, name: string) => {
    setDateHistory({
      ...dateHistory,
      [name]: value,
    });
  };

  const busy = listRenta?.length;
  const diferenciaBusyAndFrees = 66 - busy;
  const indicadores = [
    {
      id: 1,
      icon: "mingcute:door-line",
      description: "Cuartos Ocupados",
      value: busy,
      background: "red",
    },
    {
      id: 2,
      icon: "system-uicons:door",
      description: "Cuarto Libres",
      value: diferenciaBusyAndFrees,
      background: "green",
    },
    {
      id: 3,
      icon: "ion:woman-outline",
      description: "Anfitrionas",
      value: busy,
      background: "blue",
    } /* ,
    {
      id: 4,
      icon: "mdi:clock-time-eight-outline",
      description: "Nacionalidad",
      value: "Colombiana",
      background: "orange",
    }, *//* ,
    {
      id: 5,
      icon: "mdi:clock-time-eight-outline",
      description: "Mayor Hora de ingreso",
      value: "17 hrs",
      background: "gray",
    } */ /* ,
    {
      id: 6,
      icon: "mdi:clock-time-eight-outline",
      description: "Tiempo promedio",
      value: "5 Minutos",
      background: "orange",
    }, */,
  ];

/*   const busyRooms = [
    {
      id: 1,
      room: 101,
      piso: 1,
      anfitriona: "Paulina",
      nacionalidad: "Colombiana",
      horaIngreso: "17:00",
      horaSalida: "20:00",
      ocupado: true,
    },
    {
      id: 2,
      piso: 1,
      room: 107,
      anfitriona: "Vicky",
      nacionalidad: "Colombiana",
      horaIngreso: "17:00",
      horaSalida: "",
      ocupado: true,
    },
    {
      id: 3,
      room: 203,
      piso: 2,
      anfitriona: "Sirena",
      nacionalidad: "Colombiana",
      horaIngreso: "17:00",
      horaSalida: "",
      ocupado: true,
    },
    {
      id: 4,
      room: 130,
      piso: 1,
      anfitriona: "Mariana",
      nacionalidad: "Peruana",
      horaIngreso: "17:00",
      horaSalida: "",
      ocupado: true,
    },
    {
      id: 5,
      room: 118,
      piso: 1,
      anfitriona: "Karina",
      nacionalidad: "Ecuatoriana",
      horaIngreso: "17:00",
      horaSalida: "",
      ocupado: true,
    },
  ];
 */

  const obtenerTurno = (fecha:string) => {
    const partesFecha = fecha.split('/');
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
  
    let turno = '';
  
    if (diaSemana === 0) {
      turno = 'Turno Especial'; // Domingo
    } else if (horaActual >= 10 && horaActual < 17) {
      turno = 'Primer Turno'; // Lunes a sábado, primer turno
    } else if (
      (horaActual >= 17 && horaActual < 24 && diaSemana !== 0) ||
      (horaActual >= 0 && horaActual < 2)
    ) {
      turno = 'Segundo Turno'; // Lunes a sábado, segundo turno
    }
  
    return {
      turno, 
      diaSemana
    };
  };
  
  
  console.log(obtenerTurno(dateStart));

  const turnoSetted=obtenerTurno(dateStart)?.turno;
  const diaSemana=obtenerTurno(dateStart)?.diaSemana;
  const setTurnoToSwitch=turnoSetted==='Primer Turno'?false:(
    turnoSetted==='Segundo Turno'?true :false
  )





  const [isTurno, setCheckedTurno] = useState<any>(setTurnoToSwitch);
  const handleChecked=()=>{
      if(diaSemana===0){
        setCheckedTurno(false);
      }else{
        setCheckedTurno(!isTurno)
      }
  }


  const newArrayBusyRooms = listRenta?.map((value: any) => {
    const obtenerHora = (fecha: string) => {
      console.log(fecha);
      if (fecha !== "" || fecha != undefined || fecha != null) {
        // Separa la cadena en fecha y hora
        const partes = fecha?.split(" ");

        // Obtiene la segunda parte que contiene la hora
        const hora = partes[1];

        // Retorna solo la parte de la hora
        return hora;
      } else {
        return "";
      }
    };

    // Ejem
    return {
      ...value,
   /*    id: value?.habitacionId, */
      room: parseInt(value?.habitacion),
      piso: value?.piso,
      horaIngreso: obtenerHora(value?.fechaIngreso),
      horaSalida: obtenerHora(value?.fechaSalida),
      ocupado: true,
    };
  });
  const separarPorPiso = (habitaciones: any) => {
    const piso1 = [];
    const piso2 = [];

    for (let i = 0; i < habitaciones.length; i++) {
      const habitacion = habitaciones[i];
      if (habitacion.piso === 1) {
        piso1.push(habitacion);
      } else if (habitacion.piso === 2) {
        piso2.push(habitacion);
      }
    }

    return [piso1, piso2];
  };

  const turnoToApi=!isTurno?'M':'T'

  useEffect(() => {
    dispatch(getListRenta(dateStart,turnoToApi));
  }, [dateStart, dispatch,turnoToApi]);
  useEffect(() => {
    dispatch(getListCuartos());
  }, [ dispatch]);
  useEffect(() => {
    dispatch(getAllAnfitrionas());
  }, [dispatch]);


  useEffect(() => {
    dispatch(getProducts(2, 16, "", 1, 100,""));
  }, [dispatch]);
  useEffect(() => {
    printTable(`${title.name}::ASISTENCIA`);
  }, []);
  const [piso1, piso2] = separarPorPiso(newArrayBusyRooms);

  const [, setIsIdRoom] = useState<number>(0);

  const dropdownRefs = useRef<(HTMLTableCellElement | null)[]>([]);

  const [activeStates, setActiveStates] = useState<boolean[]>([]);

  useEffect(() => {
    dispatch(getListFichasByRoom(dateStart))
  }, [dispatch,dateStart])
  


  console.log(piso1);
  return (
    <>
      <div >
        <div className={`${styles['encabezado-principal']}`}>
          <div className={`${styles["description"]}`}>
            <h3>Asistencia de anfitrionas del día {dateStart}</h3>
            <h4>{diaSemana===0?'Turno único':!isTurno?'1er Turno':'2do Turno'} {diaSemana===0?'(10:00 a.m - 02:00 a.m)':!isTurno?'(10:00am - 17:00pm)':'(17:00 p.m. - 02:00 a.m.)'}</h4>
            <p>Croquis del Piso 1 y 2</p>
        
          </div>
          <div className={styles['toggle-date']}>
            <div className={styles.toggle}>
              <Toggle
                isOn={diaSemana===0?false:isTurno}
                handleToggle={handleChecked}
                colorOne="#50cd89"
                colorTwo="#c7ece8"
                id='switchTurno'
              />
              <span>{diaSemana===0?'Turno único':!isTurno?'1er Turno':'2do Turno'}</span>
            </div>
            <div className={`${styles["date"]}`}>
              <Calendar
                onChange={handleChangeDate}
                name="dateStart"
                text="Fecha"
              />
            </div>

          </div>

        </div>

        <div>
         
          <div className={`${styles["indicador"]}`}>
            <Indicadores data={indicadores} />
            <div className={`${styles["leyenda"]}`}>
              <div>
                <div>
                  <div className={`${styles["busy-div"]}`}></div>
                  <p>Cuartos Ocupados</p>
                </div>
                <div>
                  <div className={`${styles["free-div"]}`}></div>
                  <p>Cuartos Libres</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className={styles.container}>
          <Piso1 data={piso1} setIsIdRoom={setIsIdRoom} dropdownRefs={dropdownRefs} activeStates={activeStates} setActiveStates={setActiveStates}/>
          <Piso2 data={piso2} setIsIdRoom={setIsIdRoom} dropdownRefs={dropdownRefs} activeStates={activeStates} setActiveStates={setActiveStates}/>
        </div>
       
      </div>
      <Toaster richColors  position="top-right" />
      <AsistenciaModal isTurno={isTurno}/>
      <FichasModal />
  
    </>
  );
};
