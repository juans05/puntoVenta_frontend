import { useEffect } from "react";
import { printTable } from "../../../../../../helpers/functions/printTitle";
import { title } from "../../../../../../infraestructure/MData/MData";

export const Documentos = () => {
  useEffect(() => {
    printTable(`${title.name}::DOCUMENTOS`); 
  }, []);
  return (
    <div>Documentos</div>
  )
}
