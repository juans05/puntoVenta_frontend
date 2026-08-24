
import { FC } from 'react'
import { Icon } from '@iconify/react';
import styles from '../datatable.module.css'
export interface ITableButton {
  type?: string;
  title: string;
  icon: any;
  className?: string;
  classNameStatus?: string;
  classNameIcon?: string;
  handleOnClick: (data: any) => void;
  data?: any;
  color?: any, 
disabledButton ?: any;
fileNameModule ?: any;
iconify ?: any;
texto ?: any;


}

const TableButton: FC<ITableButton> = (props) => {



  const { title, handleOnClick, data, iconify, texto } = props;

  console.log(data)

  return (
    <>
      <button type="button" title={title} onClick={() => handleOnClick(data)} /* className={styles.buttonTable} */ disabled={
       ((title === 'Cancelar deuda') ? ((data.montoPendiente === 0) ? true : false) : false) 
      } className={styles.btn}>
        <Icon icon={iconify} />
        <p>{texto} {/* ({data?.listServicios}) */}</p>
      </button>
    </>
  )
}

export default TableButton;
