import { RootState } from '../../../../../../redux/rootState';
import { useAppDispatch, useAppSelector } from '../../../../../../redux/store';
import { activeRoom, completarRentaAnfitriona, getListCuartos, getListFichasByRoom, getListReporteRenta, openModalFichas } from '../../../../../../redux/reducers/Admin/asistencia/asistencia.reducer';
import styles from './reporteAsistencia.module.css'
import moment from "moment";
import { useState, useEffect } from 'react';
import { getAllAnfitrionas } from '../../../../../../redux/reducers/Admin/clientes-proveedores/clientesProveedoresAnfitrionas.reducer';
import { getProducts } from '../../../../../../redux/reducers/Admin/productos/producto.reducer';
import { printTable } from '../../../../../../helpers/functions/printTitle';
import { title } from '../../../../../../infraestructure/MData/MData';
import { Toggle } from '../../../../../../components/Toggle';
import { Calendar } from '../../../../../../components/Date';
import { Toaster } from 'sonner';
import DataTable from '../../../../../../components/Datatable/table/DataTable';
import { IHeaderTable } from '../../../../../../application/models/Header/IHeaderTable';
import filter from '../../../../../../assets/img/filter.svg'
import { ITableHeaderProps } from '../../../../../../components/Datatable/table/TableHeader/TableHeader';
import { ITableButton } from '../../../../../../components/Datatable/table/TableButton';
import { FichasModal } from '../../../../../../components/Modal/Admin/Fichas';
import { Indicador } from '../ReporteCierreCaja/Indicadores';

moment.locale("es");
interface IDataHistory {
  dateStart: string;
  dateEnd: string;
}

const dataHistory: IDataHistory = {
  dateStart: moment(new Date()).format("DD/MM/YYYY"),
  dateEnd: moment(new Date()).format("DD/MM/YYYY"),
};
export const ReporteAsistencia = () => {
    const dispatch = useAppDispatch();
    const { listaReporteRentas }: any = useAppSelector(
      (state: RootState) => state.asistencia
    );
    const iconFilter = (
        <div>
            <img src={filter} />
        </div>
    )


   


    const header: IHeaderTable[] = [
        /*        { type: "seleccion", alias: "Seleccionar" }, */

        { type: "id", alias: "N°" },
        { type: "estadoDeuda", alias: "Estado" },
        { type: "montoPendiente", alias: "Deuda" },
        { type: "montoPagado", alias: "Monto Pagado" },
        { type: "montoTotal", alias: "Monto Total" },
        { type: "habitacion", alias: "Habitación", sortable: true },
        { type: "anfitriona", alias: "Anfitriona", sortable: true },
        { type: "nacionalidad", alias: "Nacionalidad" },
        { type: "piso", alias: "Piso" },
        { type: "turnoTexto", alias: "Turno" },
        { type: "fechaIngreso", alias: "Fecha de Ingreso" },
        { type: "fechaSalida", alias: "Fecha de Salida" },
    

        { type: "accion", alias: iconFilter },
    ];

    const [headerTickets, ] = useState<
        IHeaderTable[] | ITableHeaderProps[] | any
    >(header);
/*     const [searchVal, setSearchVal] = useState<any>(null); */

    const openFichasData=(data:any)=>{
      console.log(data);
      dispatch(activeRoom(data));
      dispatch(openModalFichas());
    }
    const cancelarDeuda = (data:any) => {
      /*     console.log(activeRoom); */
      dispatch(activeRoom(data));
          dispatch(
            completarRentaAnfitriona(data?.id)
          );
        };
    const buttons: ITableButton[] = [
      /*   {
            title: "Eliminar",
            icon: "",
            className: "body__btn-companyBtn",
            classNameIcon: "",
            handleOnClick: () => { },
            iconify: "wpf:full-trash",
     
        }, {
            title: "Editar",
            icon: "",
            className: "body__btn-companyBtn",
            classNameIcon: "",
            handleOnClick: () => { },
            iconify: "ri:ball-pen-line",
        }, */ {
            title: "Fichas",
            icon: "",
            className: "body__btn-companyBtn",
            classNameIcon: "",
            handleOnClick: openFichasData,
            iconify: "game-icons:take-my-money"
        }
        ,{
          title: "Cancelar deuda",
          icon: "",
          className: "body__btn-companyBtn",
          classNameIcon: "",
          handleOnClick: cancelarDeuda,
          iconify: "mdi:calculator" 
      }


    ];
    const idTable = 'asistenciaAnfitrionas'
   /*  let handleSearch = (e: any) => {
        setSearchVal(e.target.value)


    } */
    console.log(listaReporteRentas);
    /*   console.log(listRenta); */
    const [dateHistory, setDateHistory] = useState<IDataHistory>(dataHistory);
    const { dateStart } = dateHistory;
    const handleChangeDate = (value: string, name: string) => {
      setDateHistory({
        ...dateHistory,
        [name]: value,
      });
    };
  

 
  
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
  
  
    const newReportListRentas= listaReporteRentas?.map((value:any)=>{
      return{
          ...value,
          fechaSalida:value?.fechaSalida===''?'-------':value?.fechaSalida,
          turnoTexto:diaSemana===0 && value?.turno==='M'?'Turno único': diaSemana!==0 && value?.turno==='M'?'1er Turno':'2do Turno',
          estadoDeuda:value?.montoPendiente===0?'Completado':'Mantiene Deuda',
          montoPagado:value?.montoPendiente===0?value?.montoTotal:value?.montoCuarto,
          montoTotal:value?.montoTotal,
      }
    })
  
    console.log(newReportListRentas);
    const calcularAcumulado=(propiedad:string)=> {
      return newReportListRentas.reduce((acumulado:any, objeto:any) => acumulado + objeto[propiedad], 0);
  }
  const acumuladoMontoTotal = calcularAcumulado("montoTotal");
/* const acumuladoMontoCuarto = calcularAcumulado("montoCuarto"); */
const acumuladoMontoPendiente = calcularAcumulado("montoPendiente");
const acumuladoMontoPagado = calcularAcumulado("montoPagado");
    const [isTurno, setCheckedTurno] = useState<any>(setTurnoToSwitch);
    const [loadingReporte, setLoadingReporte] = useState<boolean>(true);
    const handleChecked=()=>{
        if(diaSemana===0){
          setCheckedTurno(false);
        }else{
          setCheckedTurno(!isTurno)
        }
    }
  
  
 
 
    const turnoToApi=!isTurno?'M':'T'
  
    useEffect(() => {
      setLoadingReporte(true);
      dispatch(getListReporteRenta(dateStart,turnoToApi)).finally(() => setLoadingReporte(false));
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
      printTable(`${title.name}::REPORTE DE ASISTENCIA`);
    }, []);
    useEffect(() => {
      dispatch(getListFichasByRoom(dateStart))
    }, [dispatch,dateStart])
    
   
  return (
    <>
    <div >
      <div className={`${styles['encabezado-principal']}`}>
        <div className={`${styles["description"]}`}>
          <h3>Asistencia de anfitrionas del día {dateStart}</h3>
          <h4>{diaSemana===0?'Turno único':!isTurno?'1er Turno':'2do Turno'} {diaSemana===0?'(10:00 a.m - 02:00 a.m)':!isTurno?'(10:00am - 17:00pm)':'(17:00 p.m. - 02:00 a.m.)'}</h4>
          {/* <p>Croquis del Piso 1 y 2</p> */}
      
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

      <div className={styles['indicador-main']}>
       
       <Indicador
         icon={"game-icons:money-stack" }
         value={"Total Deuda"}
         amount={`S/. ${parseFloat(acumuladoMontoPendiente).toFixed(2)}`}
         colorBg={'#FEF9F3'}
         color={'#DD5408'}
       />
       <Indicador
         icon={"game-icons:money-stack" }
         value={"Total Pagado"}
         amount={`S/. ${parseFloat(acumuladoMontoPagado).toFixed(2)}`}
       /*   colorBg={'#FEF9F3'}
         color={'#DD5408'} */
         colorBg={'#EDFEEA'}
         color={'#05c46b'}
       />
       <Indicador
         icon={"game-icons:money-stack" }
         value={"Total"}
         amount={`S/. ${parseFloat(acumuladoMontoTotal).toFixed(2)}`}
         colorBg={'#F1FCFD'}
         color={'#0F8BBE'}
       />
       {/* <Indicador
         icon={"entypo:documents" }
         value={"Total de Documentos"}
         amount={reporteCajaResumido !== null ? total?.cantidad : 0}
         colorBg={'#F5F5FE'}
         color={'#4344D0'}
       />
       <Indicador
         icon={"game-icons:money-stack" }
         value={"Total (S/.)"}
         amount={
           reporteCajaResumido !== null
             ? `S/. ${parseFloat(total?.total).toFixed(2)}`
             : "S/. 0.00"
         }
         colorBg={'#EDFEEA'}
         color={'#05c46b'}
       /> */}
      
     </div>


      <div className={styles.container}>

      <div
                    id="table-scroll" className={styles.content__table}
                >
                    <div>
                        <div id="table">
                        <DataTable
                                header={headerTickets}
                                body={newReportListRentas}
                                actions={buttons}
                                idTable={idTable}
                                loading={loadingReporte}
                            /* border={borderTD}
                            colorIndex={colorIndex}
                            color={color} */
                            /*   setRowOrder={setRowOrder} */
                            >
                            </DataTable>
                        </div>
                    </div>
                </div>
       
      </div>
     
    </div>
    <Toaster richColors  position="top-right" />
    <FichasModal />
 

  </>
  )
}
