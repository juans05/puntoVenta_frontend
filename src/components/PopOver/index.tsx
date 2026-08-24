
import { RootState } from "../../redux/rootState";
import {  useAppSelector } from "../../redux/store";
import styles from "./popover.module.css";

  
export const Popover = ({ popoverPosition }:any) => {

  const { popoverAsistencia }: any = useAppSelector(
    (state: RootState) => state.asistencia
  );
  const closePopover = (e:any) => {
    e.stopPropagation();
/*     dispatch(closePopoverAsistencia()); */
  };
  return (
    <div className={styles["popover"]} style={{display:`${popoverAsistencia?'block':'none'}`, top: popoverPosition.top, left: popoverPosition.left,right: popoverPosition.right,bottom: popoverPosition.bottom}}>
      <div className={styles["popover-content"]}>
        Hola mundo
        <button className={styles["close-button"]} onClick={closePopover} >
          Close
        </button>
      </div>
    </div>
  );
};
