import { activeRoom, clearActiveRoom, openPopoverAsistencia } from "../../../../../../../redux/reducers/Admin/asistencia/asistencia.reducer";
import { useAppDispatch } from "../../../../../../../redux/store";
import { DropdownPopover } from "../Dropdown";
import styles from "../asistencia.module.css";
/* import { useRef, useState } from 'react'; */


export interface IPiso{
  data:IRoom[];
  setIsIdRoom?:any;
  dropdownRefs?:any;
  activeStates?:any;
  setActiveStates?:any;
}
export interface IRoom{
id: number;
  room: number;
  piso: number;
  anfitriona: string;
  nacionalidad: string;
  horaIngreso: string;
  horaSalida: string;
  ocupado: boolean;
}
export const Piso2 = ({data,setIsIdRoom,dropdownRefs,setActiveStates,activeStates}:IPiso) => {
  const dispatch = useAppDispatch();
 /*  const [, setIsIdRoom] = useState<number>(0);

  const dropdownRefs = useRef<(HTMLTableCellElement | null)[]>([]);

  const [activeStates, setActiveStates] = useState<boolean[]>([]); */
 
/* const setRoom=(cuarto: number)=>{
  console.log(cuarto)
} */

  const setRoom = (cuarto: number, index: number) => {
    setIsIdRoom(cuarto);

    const newActiveStates = [...activeStates];
    const roomData = data.find((room) => room.room === cuarto && room.ocupado);
  
    if (data.find((room) => room.room === cuarto && room.ocupado)) {
      dispatch(clearActiveRoom());
      dispatch(activeRoom(roomData));
      if (newActiveStates[index]) {
        newActiveStates[index] = false;
    
      } else {
        newActiveStates.fill(false);
        newActiveStates[index] = true;
        
      }
    } else {
      newActiveStates.fill(false);
      setActiveStates(Array(activeStates.length).fill(false));

    }
  
/*     dispatch(clearActiveRoom()); */
    setActiveStates(newActiveStates);
    if (!data.find((room) => room.room === cuarto && room.ocupado)) {
      dispatch(openPopoverAsistencia(cuarto));
    }

  };
  
  const setDropdownRef = (index: number, ref: HTMLTableCellElement | null) => {
    dropdownRefs.current[index] = ref;
  };
  return (
    <div>
        <h3 className={`${styles['title']}`}>Piso N° 2</h3>
<div className={styles["table"]}>
      <table>
        <tbody>
          <tr>
            <td colSpan={2}>
              <span>SSHH</span>
            </td>
            <td colSpan={5}>
              <span>BARRA</span>
            </td>
            <td colSpan={2}>
              <span>ZONA VIP</span>
            </td>
          </tr>
          <tr>
      
            <td
                onClick={() => setRoom(201, 31)}
                ref={(ref) => setDropdownRef(31, ref)}
             
                className={
                  data.find((room) => room.room === 201 && room.ocupado)
                    ? styles["busy"]
                    : styles["libre"]
                }
              >
                <span>201</span>

                <DropdownPopover
                  referencia={dropdownRefs.current[31]}
                  isActive={activeStates[31]}
                />
              </td>

            <td rowSpan={13}>
              <span>Pasadizo</span>
            </td>
            <td rowSpan={2} colSpan={5}>
              <span>SILLONES</span>
            </td>
            <td rowSpan={13}>
              <span>PASADIZO</span>
            </td>
            <td rowSpan={2}>
              <span>ESCENARIO</span>
            </td>
           
           
          </tr>
          <tr>
          <td
                onClick={() => setRoom(202, 32)}
                ref={(ref) => setDropdownRef(32, ref)}
             
                className={
                  data.find((room) => room.room === 202 && room.ocupado)
                    ? styles["busy"]
                    : styles["libre"]
                }
              >
                <span>202</span>

                <DropdownPopover
                  referencia={dropdownRefs.current[32]}
                  isActive={activeStates[32]}
                />
              </td>
           
           
          </tr>
          <tr>
          <td
                onClick={() => setRoom(203, 33)}
                ref={(ref) => setDropdownRef(33, ref)}
             
                className={
                  data.find((room) => room.room === 203 && room.ocupado)
                    ? styles["busy"]
                    : styles["libre"]
                }
              >
                <span>203</span>

                <DropdownPopover
                  referencia={dropdownRefs.current[33]}
                  isActive={activeStates[33]}
                />
              </td>
            <td>
              <span></span>
            </td>
            <td rowSpan={3} colSpan={3}>
              <span>Escalera</span>
            </td>
            <td>
              <span></span>
            </td>
            <td>
              <span>DJ</span>
            </td>
          
          </tr>
          <tr>
          
            <td
                onClick={() => setRoom(204, 34)}
                ref={(ref) => setDropdownRef(34, ref)}
             
                className={
                  data.find((room) => room.room === 204 && room.ocupado)
                    ? styles["busy"]
                    : styles["libre"]
                }
              >
                <span>204</span>

                <DropdownPopover
                  referencia={dropdownRefs.current[34]}
                  isActive={activeStates[34]}
                />
              </td>


              <td rowSpan={2}
                onClick={() => setRoom(220, 35)}
                ref={(ref) => setDropdownRef(35, ref)}
             
                className={
                  data.find((room) => room.room === 220 && room.ocupado)
                    ? styles["busy"]
                    : styles["libre"]
                }
              >
                <span>220</span>

                <DropdownPopover
                  referencia={dropdownRefs.current[35]}
                  isActive={activeStates[35]}
                  marginLeft="-305px"
                />
              </td>
              <td 
                onClick={() => setRoom(221, 36)}
                ref={(ref) => setDropdownRef(36, ref)}
             
                className={
                  data.find((room) => room.room === 221 && room.ocupado)
                    ? styles["busy"]
                    : styles["libre"]
                }
              >
                <span>221</span>

                <DropdownPopover
                  referencia={dropdownRefs.current[36]}
                  isActive={activeStates[36]}
                  marginLeft="-305px"
                />
              </td>

              <td 
                onClick={() => setRoom(227, 37)}
                ref={(ref) => setDropdownRef(37, ref)}
             
                className={
                  data.find((room) => room.room === 227 && room.ocupado)
                    ? styles["busy"]
                    : styles["libre"]
                }
              >
                <span>227</span>

                <DropdownPopover
                  referencia={dropdownRefs.current[37]}
                  isActive={activeStates[37]}
                  marginLeft="-305px"
                />
              </td>
          
            
         
           
            
            
          </tr>
          <tr>
           

            
            <td 
                onClick={() => setRoom(205, 38)}
                ref={(ref) => setDropdownRef(38, ref)}
             
                className={
                  data.find((room) => room.room === 205 && room.ocupado)
                    ? styles["busy"]
                    : styles["libre"]
                }
              >
                <span>205</span>

                <DropdownPopover
                  referencia={dropdownRefs.current[38]}
                  isActive={activeStates[38]}
                />
              </td>

                  
            <td 
                onClick={() => setRoom(222, 39)}
                ref={(ref) => setDropdownRef(39, ref)}
             
                className={
                  data.find((room) => room.room === 222 && room.ocupado)
                    ? styles["busy"]
                    : styles["libre"]
                }
              >
                <span>222</span>

                <DropdownPopover
                  referencia={dropdownRefs.current[39]}
                  isActive={activeStates[39]}
                  marginLeft="-305px"
                />
              </td>



                  
            <td 
                onClick={() => setRoom(228, 40)}
                ref={(ref) => setDropdownRef(40, ref)}
             
                className={
                  data.find((room) => room.room === 228 && room.ocupado)
                    ? styles["busy"]
                    : styles["libre"]
                }
              >
                <span>228</span>

                <DropdownPopover
                  referencia={dropdownRefs.current[40]}
                  isActive={activeStates[40]}
                  marginLeft="-305px"
                />
              </td>
          
           
        
      
           
          
          </tr>
          <tr>
         
            <td 
                onClick={() => setRoom(206, 41)}
                ref={(ref) => setDropdownRef(41, ref)}
             
                className={
                  data.find((room) => room.room === 206 && room.ocupado)
                    ? styles["busy"]
                    : styles["libre"]
                }
              >
                <span>206</span>

                <DropdownPopover
                  referencia={dropdownRefs.current[41]}
                  isActive={activeStates[41]}
                />
              </td>
              <td rowSpan={2}
                onClick={() => setRoom(219, 42)}
                ref={(ref) => setDropdownRef(42, ref)}
             
                className={
                  data.find((room) => room.room === 219 && room.ocupado)
                    ? styles["busy"]
                    : styles["libre"]
                }
              >
                <span>219</span>

                <DropdownPopover
                  referencia={dropdownRefs.current[42]}
                  isActive={activeStates[42]}
                  marginLeft="-305px"
                />
              </td>
        
            <td rowSpan={2} colSpan={3} >
              <span></span>
            </td>
            <td rowSpan={2}
                onClick={() => setRoom(223, 43)}
                ref={(ref) => setDropdownRef(43, ref)}
             
                className={
                  data.find((room) => room.room === 223 && room.ocupado)
                    ? styles["busy"]
                    : styles["libre"]
                }
              >
                <span>223</span>

                <DropdownPopover
                  referencia={dropdownRefs.current[43]}
                  isActive={activeStates[43]}
                  marginLeft="-305px"
                />
              </td>

              <td 
                onClick={() => setRoom(229, 44)}
                ref={(ref) => setDropdownRef(44, ref)}
             
                className={
                  data.find((room) => room.room === 229 && room.ocupado)
                    ? styles["busy"]
                    : styles["libre"]
                }
              >
                <span>229</span>

                <DropdownPopover
                  referencia={dropdownRefs.current[44]}
                  isActive={activeStates[44]}
                  marginLeft="-305px"
                />
              </td>
           
         
           
        
          </tr>
          <tr>
          <td 
                onClick={() => setRoom(207, 45)}
                ref={(ref) => setDropdownRef(45, ref)}
             
                className={
                  data.find((room) => room.room === 207 && room.ocupado)
                    ? styles["busy"]
                    : styles["libre"]
                }
              >
                <span>207</span>

                <DropdownPopover
                  referencia={dropdownRefs.current[45]}
                  isActive={activeStates[45]}
                />
              </td>
              <td 
                onClick={() => setRoom(230, 46)}
                ref={(ref) => setDropdownRef(46, ref)}
             
                className={
                  data.find((room) => room.room === 230 && room.ocupado)
                    ? styles["busy"]
                    : styles["libre"]
                }
              >
                <span>230</span>

                <DropdownPopover
                  referencia={dropdownRefs.current[46]}
                  isActive={activeStates[46]}
                  marginLeft="-305px"
                />
              </td>
          
          
        
          
           
          </tr>
          <tr>
           

            <td 
                onClick={() => setRoom(208, 47)}
                ref={(ref) => setDropdownRef(47, ref)}
             
                className={
                  data.find((room) => room.room === 208 && room.ocupado)
                    ? styles["busy"]
                    : styles["libre"]
                }
              >
                <span>208</span>

                <DropdownPopover
                  referencia={dropdownRefs.current[47]}
                  isActive={activeStates[47]}
                />
              </td>
            <td colSpan={5}>
              <span>PASADIZO</span>
            </td>
            <td colSpan={2}>
              <span>CAJA</span>
            </td>
            
          </tr>
          <tr>
         

            <td 
                onClick={() => setRoom(209, 48)}
                ref={(ref) => setDropdownRef(48, ref)}
             
                className={
                  data.find((room) => room.room === 209 && room.ocupado)
                    ? styles["busy"]
                    : styles["libre"]
                }
              >
                <span>209</span>

                <DropdownPopover
                  referencia={dropdownRefs.current[48]}
                  isActive={activeStates[48]}
                />
              </td>

              <td 
                onClick={() => setRoom(218, 49)}
                ref={(ref) => setDropdownRef(49, ref)}
             
                className={
                  data.find((room) => room.room === 218 && room.ocupado)
                    ? styles["busy"]
                    : styles["libre"]
                }
              >
                <span>218</span>

                <DropdownPopover
                  referencia={dropdownRefs.current[49]}
                  isActive={activeStates[49]}
                  marginLeft="-305px"
                />
              </td>
              
        
            <td rowSpan={3} colSpan={3}>
              <span></span>
            </td>
            <td rowSpan={2}
                onClick={() => setRoom(224, 50)}
                ref={(ref) => setDropdownRef(50, ref)}
             
                className={
                  data.find((room) => room.room === 224 && room.ocupado)
                    ? styles["busy"]
                    : styles["libre"]
                }
              >
                <span>224</span>

                <DropdownPopover
                  referencia={dropdownRefs.current[50]}
                  isActive={activeStates[50]}
                  marginLeft="-305px"
                />
              </td>
         
            <td colSpan={2} >
              <span>PUERTA 3ER P.</span>
            </td>
           
         
          
          </tr>
          <tr>
          <td 
                onClick={() => setRoom(210, 51)}
                ref={(ref) => setDropdownRef(51, ref)}
             
                className={
                  data.find((room) => room.room === 210 && room.ocupado)
                    ? styles["busy"]
                    : styles["libre"]
                }
              >
                <span>210</span>

                <DropdownPopover
                  referencia={dropdownRefs.current[51]}
                  isActive={activeStates[51]}
                />
              </td>

              <td 
                onClick={() => setRoom(217, 52)}
                ref={(ref) => setDropdownRef(52, ref)}
             
                className={
                  data.find((room) => room.room === 217 && room.ocupado)
                    ? styles["busy"]
                    : styles["libre"]
                }
              >
                <span>217</span>

                <DropdownPopover
                  referencia={dropdownRefs.current[52]}
                  isActive={activeStates[52]}
                  marginLeft="-305px"
                />
              </td>
           
            
            <td colSpan={2}>
              <span>ESCALERA</span>
            </td>
           
           
           
          </tr>
          <tr>
          <td 
                onClick={() => setRoom(211, 53)}
                ref={(ref) => setDropdownRef(53, ref)}
             
                className={
                  data.find((room) => room.room === 211 && room.ocupado)
                    ? styles["busy"]
                    : styles["libre"]
                }
              >
                <span>211</span>

                <DropdownPopover
                  referencia={dropdownRefs.current[53]}
                  isActive={activeStates[53]}
                />
              </td>

              <td 
                onClick={() => setRoom(216, 54)}
                ref={(ref) => setDropdownRef(54, ref)}
             
                className={
                  data.find((room) => room.room === 216 && room.ocupado)
                    ? styles["busy"]
                    : styles["libre"]
                }
              >
                <span>216</span>

                <DropdownPopover
                  referencia={dropdownRefs.current[54]}
                  isActive={activeStates[54]}
                  marginLeft="-305px"
                />
              </td>

              <td 
                onClick={() => setRoom(225, 55)}
                ref={(ref) => setDropdownRef(55, ref)}
             
                className={
                  data.find((room) => room.room === 225 && room.ocupado)
                    ? styles["busy"]
                    : styles["libre"]
                }
              >
                <span>225</span>

                <DropdownPopover
                  referencia={dropdownRefs.current[55]}
                  isActive={activeStates[55]}
                  marginLeft="-305px"
                />
              </td>
           
           
           
            <td rowSpan={3}>
              <span>PASADIZO</span>
            </td>
           
         

            
            <td 
                onClick={() => setRoom(231, 56)}
                ref={(ref) => setDropdownRef(56, ref)}
             
                className={
                  data.find((room) => room.room === 231 && room.ocupado)
                    ? styles["busy"]
                    : styles["libre"]
                }
              >
                <span>231</span>

                <DropdownPopover
                  referencia={dropdownRefs.current[56]}
                  isActive={activeStates[56]}
                  marginLeft="-305px"
                />
              </td>
           
          </tr>
          <tr>
           
            <td 
                onClick={() => setRoom(212, 57)}
                ref={(ref) => setDropdownRef(57, ref)}
             
                className={
                  data.find((room) => room.room === 212 && room.ocupado)
                    ? styles["busy"]
                    : styles["libre"]
                }
              >
                <span>212</span>

                <DropdownPopover
                  referencia={dropdownRefs.current[57]}
                  isActive={activeStates[57]}
                />
              </td>
              <td 
                onClick={() => setRoom(215, 58)}
                ref={(ref) => setDropdownRef(58, ref)}
             
                className={
                  data.find((room) => room.room === 215 && room.ocupado)
                    ? styles["busy"]
                    : styles["libre"]
                }
              >
                <span>215</span>

                <DropdownPopover
                  referencia={dropdownRefs.current[58]}
                  isActive={activeStates[58]}
                  marginLeft="-305px"
                />
              </td>
              <td colSpan={3}
                onClick={() => setRoom(226, 59)}
                ref={(ref) => setDropdownRef(59, ref)}
             
                className={
                  data.find((room) => room.room === 226 && room.ocupado)
                    ? styles["busy"]
                    : styles["libre"]
                }
              >
                <span>226</span>

                <DropdownPopover
                  referencia={dropdownRefs.current[59]}
                  isActive={activeStates[59]}
                />
              </td>
            
           
            <td>
              <span></span>
            </td>

            <td 
                onClick={() => setRoom(232, 60)}
                ref={(ref) => setDropdownRef(60, ref)}
             
                className={
                  data.find((room) => room.room === 232 && room.ocupado)
                    ? styles["busy"]
                    : styles["libre"]
                }
              >
                <span>232</span>

                <DropdownPopover
                  referencia={dropdownRefs.current[60]}
                  isActive={activeStates[60]}
                  marginLeft="-305px"
                />
              </td>
          
           
           
          </tr>
          <tr>
            
          <td 
                onClick={() => setRoom(213, 61)}
                ref={(ref) => setDropdownRef(61, ref)}
             
                className={
                  data.find((room) => room.room === 213 && room.ocupado)
                    ? styles["busy"]
                    : styles["libre"]
                }
              >
                <span>213</span>

                <DropdownPopover
                  referencia={dropdownRefs.current[61]}
                  isActive={activeStates[61]}
                />
              </td>
            
            <td colSpan={5}>
              <span>PASADIZO</span>
            </td>

            <td 
                onClick={() => setRoom(233, 62)}
                ref={(ref) => setDropdownRef(62, ref)}
             
                className={
                  data.find((room) => room.room === 233 && room.ocupado)
                    ? styles["busy"]
                    : styles["libre"]
                }
              >
                <span>233</span>

                <DropdownPopover
                  referencia={dropdownRefs.current[62]}
                  isActive={activeStates[62]}
                  marginLeft="-305px"
                />
              </td>
           
          
           
          </tr>
          <tr>
            <td colSpan={2}>
              <span>SSHH</span>
            </td>
            <td colSpan={3}
                onClick={() => setRoom(214, 63)}
                ref={(ref) => setDropdownRef(63, ref)}
             
                className={
                  data.find((room) => room.room === 214 && room.ocupado)
                    ? styles["busy"]
                    : styles["libre"]
                }
              >
                <span>214</span>

                <DropdownPopover
                  referencia={dropdownRefs.current[63]}
                  isActive={activeStates[63]}
                />
              </td>
              <td colSpan={2}
                onClick={() => setRoom(235, 64)}
                ref={(ref) => setDropdownRef(64, ref)}
             
                className={
                  data.find((room) => room.room === 235 && room.ocupado)
                    ? styles["busy"]
                    : styles["libre"]
                }
              >
                <span>235</span>

                <DropdownPopover
                  referencia={dropdownRefs.current[64]}
                  isActive={activeStates[64]}
                  marginLeft="-305px"
                />
              </td>
           
            <td>
              <span></span>
            </td>
            <td colSpan={2}
                onClick={() => setRoom(234, 65)}
                ref={(ref) => setDropdownRef(65, ref)}
             
                className={
                  data.find((room) => room.room === 234 && room.ocupado)
                    ? styles["busy"]
                    : styles["libre"]
                }
              >
                <span>234</span>

                <DropdownPopover
                  referencia={dropdownRefs.current[65]}
                  isActive={activeStates[65]}
                  marginLeft="-305px"
                />
              </td>
          
           
          </tr>
        </tbody>
      </table>
    </div>
    </div>
    
  );
};
