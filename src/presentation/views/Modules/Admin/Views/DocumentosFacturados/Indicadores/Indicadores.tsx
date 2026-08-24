
import { Indicador } from './Indicador'
import styles from './indicadores.module.css'
interface IIndicador{
    data:IElement[]
}

interface IElement{
    id:number;
    icon:string;
    description:string;
    value:string;
    background?:string;
}
export const Indicadores = ({data}:IIndicador) => {
  return (
    <div className={styles.container}>
    {
        data?.map((item, index)=>{
            return (
                <Indicador
                index={index}
                data={data}
                {...item}
                />
            )
        })
    }
</div>
  )
}
