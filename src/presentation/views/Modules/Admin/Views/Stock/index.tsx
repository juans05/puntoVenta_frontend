import { useEffect } from "react";
import { printTable } from "../../../../../../helpers/functions/printTitle";
import { title } from "../../../../../../infraestructure/MData/MData";


export const Stock = () => {
  useEffect(() => {
    printTable(`${title.name}::STOCK`); 
  }, []);
  return (
    <div>Stock</div>
  )
}
