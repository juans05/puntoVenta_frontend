import { activeProducto, deleteProducts, openModalHistorial } from "../../../redux/reducers/Admin/productos/producto.reducer";
import { useAppDispatch } from "../../../redux/store";
import Svg from "../../Svg";
import { Icons } from "../../Svg/iconsPack";
import styles from "./items.module.css";
import { Icon } from "@iconify/react";
import { toast } from 'sonner'

interface IItem {
  img?: any;
  textoAlternativo?: string;
  description?: string;
  price?: string;
  onClick?: any;
  data?: any;
  stock?: any;
}
export const Item = ({
  img,
  textoAlternativo,
  description,
  price,
  data,
  onClick,
  stock,
}: IItem) => {
  const dispatch = useAppDispatch();




  const deleteItem = (event: any) => {
    event.stopPropagation();
    dispatch(activeProducto(data))
    dispatch(deleteProducts(data?.productoId))
    toast.success('Se eliminó correctamente el producto')
  }

  const verHistorial = (event: any) => {
    event.stopPropagation();
    dispatch(openModalHistorial(data) as any)
  }


  return (
    <div className={styles.item} onClick={() => onClick(data)}>
      <div className={styles.closeBtn} onClick={deleteItem} title='Eliminar'>
        <Svg icon={Icons.close} />
      </div>
      <div className={styles.historyBtn} onClick={verHistorial} title='Kardex de movimientos'>
        <Icon icon="mdi:history" />
      </div>
      {
      img !=='' ? <div className={styles.itemImg}>
        <img src={img} alt={textoAlternativo} />
      </div>:<div className={styles['empty-img']}>
        <p>Sin Imagen para previsualizar</p>
      </div>
      }
     
      <p>{description}</p>
      <span>S/. {price}</span>
      {!stock || stock && (
        <div className={`${styles.stock}`}>
          <Icon icon="healthicons:stock-out-outline" />
          <p>
            {stock} unidades
          </p>

        </div>
      )}
    </div>
  );
};
