import { useState } from "react";
/* import { useAppDispatch } from "../../../../../redux/store"; */



import styles from "./items.module.css";
/* import { Icon } from "@iconify/react";
import {  toast } from 'sonner' */
interface IItem {
  img?: any;
  textoAlternativo?: string;
  description?: string;
  price?: string;
  cantidad?: number;
  onClick?: any;
  data?: any;
  stock?: any;
}
export const Item = ({
  img,
  textoAlternativo,
  description,
  price,
  cantidad,
  data,
  onClick,
 /*  stock, */
}: IItem) => {
/*   const dispatch = useAppDispatch(); */

  const [isSelected, setIsSelected] = useState(false); // State to manage selection

  const handleClick = () => {
    setIsSelected((prev) => !prev); // Toggle the selection state when clicked
    onClick(data);
  };




  return (
    <div
    className={`${styles.item} ${isSelected ? styles.selected : ""}`} // Apply a different style for selected items
    onClick={handleClick}
  >
    <img src={img} alt={textoAlternativo} />
    <p>{description}</p>
    <p>Cantidad: {cantidad}</p>
    <span>S/. {price}</span>
  </div>
  );
};
