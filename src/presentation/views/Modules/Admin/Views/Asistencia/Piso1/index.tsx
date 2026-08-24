/* import { useRef, useState } from "react"; */
import styles from "../asistencia.module.css";

import { DropdownPopover } from "../Dropdown";
import { useAppDispatch } from "../../../../../../../redux/store";
import {
  activeRoom,
  clearActiveRoom,
  openPopoverAsistencia,
} from "../../../../../../../redux/reducers/Admin/asistencia/asistencia.reducer";
export interface IPiso {
  data: IRoom[];
  setIsIdRoom?:any;
  dropdownRefs?:any;
  activeStates?:any;
  setActiveStates?:any;
}
export interface IRoom {
  id: number;
  room: number;
  piso: number;
  anfitriona: string;
  nacionalidad: string;
  horaIngreso: string;
  horaSalida: string;
  ocupado: boolean;
}
export const Piso1 = ({ data,setIsIdRoom,dropdownRefs,setActiveStates,activeStates }: IPiso) => {
  const dispatch = useAppDispatch();
 /*  const [, setIsIdRoom] = useState<number>(0);

  const dropdownRefs = useRef<(HTMLTableCellElement | null)[]>([]);

  const [activeStates, setActiveStates] = useState<boolean[]>([]);
 */
  const setRoom = (cuarto: number, index: number) => {
    setIsIdRoom(cuarto);
    /*  dispatch(openPopoverAsistencia());  */
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

   /*  dispatch(clearActiveRoom()); */
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
      <h3 className={`${styles["title"]}`}>Piso N° 1</h3>
      <div className={`${styles["table"]}`}>
        <table>
          <tbody>
            <tr>
              <td>
                <span></span>
              </td>
              <td rowSpan={13}>
                <span>Pasadizo</span>
              </td>
              <td colSpan={5}>
                <span>BARRA</span>
              </td>

              <td rowSpan={12}>
                <span>Pasadizo</span>
              </td>
              <td>
                <span>DJ</span>
              </td>
            </tr>
            <tr>
              <td
                onClick={() => setRoom(101, 0)}
                ref={(ref) => setDropdownRef(0, ref)}
                className={
                  data.find((room) => room.room === 101 && room.ocupado)
                    ? styles["busy"]
                    : styles["libre"]
                }
              >
                <span>101</span>

                <DropdownPopover
                  referencia={dropdownRefs.current[0]}
                  isActive={activeStates[0]}
                />
              </td>
              <td rowSpan={2} colSpan={5}>
                <span>SILLONES</span>
              </td>
              <td rowSpan={2}>
                <span>Escenario</span>
              </td>
            </tr>
            <tr>
              <td
                onClick={() => setRoom(102, 1)}
                ref={(ref) => setDropdownRef(1, ref)}
                className={
                  data.find((room) => room.room === 102 && room.ocupado)
                    ? styles["busy"]
                    : styles["libre"]
                }
              >
                <span>102</span>
                <DropdownPopover
                  referencia={dropdownRefs.current[1]}
                  isActive={activeStates[1]}
                />

                {/* <Popover popoverPosition={popoverPosition} /> */}
              </td>
            </tr>
            <tr>
              <td
                onClick={() => setRoom(103, 2)}
                ref={(ref) => setDropdownRef(2, ref)}
                className={
                  data.find((room) => room.room === 103 && room.ocupado)
                    ? styles["busy"]
                    : styles["libre"]
                }
              >
                <span>103</span>
                <DropdownPopover
                  referencia={dropdownRefs.current[2]}
                  isActive={activeStates[2]}
                />
              </td>
              <td colSpan={4}>
                <span>Escalera</span>
              </td>

              <td
                onClick={() => setRoom(118, 3)}
                className={
                  data.find((room) => room.room === 118 && room.ocupado)
                    ? styles["busy"]
                    : styles["libre"]
                }
              >
                <span>118</span>
                <DropdownPopover
                  referencia={dropdownRefs.current[3]}
                  isActive={activeStates[3]}
                  marginLeft="-305px"
                />
              </td>
              <td
                onClick={() => setRoom(131, 4)}
                ref={(ref) => setDropdownRef(4, ref)}
                className={
                  data.find((room) => room.room === 131 && room.ocupado)
                    ? styles["busy"]
                    : styles["libre"]
                }
              >
                <span>131</span>
                <DropdownPopover
                  referencia={dropdownRefs.current[4]}
                  isActive={activeStates[4]}
                  marginLeft="-305px"
                />
              </td>
            </tr>
            <tr>
              <td
                onClick={() => setRoom(104, 5)}
                ref={(ref) => setDropdownRef(5, ref)}
                className={
                  data.find((room) => room.room === 104 && room.ocupado)
                    ? styles["busy"]
                    : styles["libre"]
                }
              >
                <span>104</span>
                <DropdownPopover
                  referencia={dropdownRefs.current[5]}
                  isActive={activeStates[5]}
                />
              </td>
              <td
                onClick={() => setRoom(117, 6)}
                ref={(ref) => setDropdownRef(6, ref)}
                className={
                  data.find((room) => room.room === 117 && room.ocupado)
                    ? styles["busy"]
                    : styles["libre"]
                }
              >
                <span>117</span>
                <DropdownPopover
                  referencia={dropdownRefs.current[6]}
                  isActive={activeStates[6]}
                />
              </td>

              <td rowSpan={4} colSpan={3}>
                <span>Pasadizo</span>
              </td>
              <td
                onClick={() => setRoom(119, 7)}
                ref={(ref) => setDropdownRef(7, ref)}
                className={
                  data.find((room) => room.room === 119 && room.ocupado)
                    ? styles["busy"]
                    : styles["libre"]
                }
              >
                <span>119</span>
                <DropdownPopover
                  referencia={dropdownRefs.current[7]}
                  isActive={activeStates[7]}
                  marginLeft="-305px"
                />
              </td>
              <td
                onClick={() => setRoom(130, 8)}
                ref={(ref) => setDropdownRef(8, ref)}
                className={
                  data.find((room) => room.room === 130 && room.ocupado)
                    ? styles["busy"]
                    : styles["libre"]
                }
              >
                <span>130</span>
                <DropdownPopover
                  referencia={dropdownRefs.current[8]}
                  isActive={activeStates[8]}
                  marginLeft="-305px"
                />
              </td>
            </tr>
            <tr>
              <td
                onClick={() => setRoom(105, 9)}
                ref={(ref) => setDropdownRef(9, ref)}
                className={
                  data.find((room) => room.room === 105 && room.ocupado)
                    ? styles["busy"]
                    : styles["libre"]
                }
              >
                <span>105</span>
                <DropdownPopover
                  referencia={dropdownRefs.current[9]}
                  isActive={activeStates[9]}
                />
              </td>
              <td
                onClick={() => setRoom(116, 10)}
                ref={(ref) => setDropdownRef(10, ref)}
                className={
                  data.find((room) => room.room === 116 && room.ocupado)
                    ? styles["busy"]
                    : styles["libre"]
                }
              >
                <span>116</span>
                <DropdownPopover
                  referencia={dropdownRefs.current[10]}
                  isActive={activeStates[10]}
                />
              </td>
              <td
                onClick={() => setRoom(120, 11)}
                ref={(ref) => setDropdownRef(11, ref)}
                className={
                  data.find((room) => room.room === 120 && room.ocupado)
                    ? styles["busy"]
                    : styles["libre"]
                }
              >
                <span>120</span>
                <DropdownPopover
                  referencia={dropdownRefs.current[11]}
                  isActive={activeStates[11]}
                  marginLeft="-305px"
                />
              </td>
              <td
                onClick={() => setRoom(129, 12)}
                ref={(ref) => setDropdownRef(12, ref)}
                className={
                  data.find((room) => room.room === 129 && room.ocupado)
                    ? styles["busy"]
                    : styles["libre"]
                }
              >
                <span>129</span>
                <DropdownPopover
                  referencia={dropdownRefs.current[12]}
                  isActive={activeStates[12]}
                  marginLeft="-305px"
                />
              </td>
            </tr>
            <tr>
              <td rowSpan={2}>
                <span>SSHH</span>
              </td>
              <td
                onClick={() => setRoom(115, 13)}
                ref={(ref) => setDropdownRef(13, ref)}
                className={
                  data.find((room) => room.room === 115 && room.ocupado)
                    ? styles["busy"]
                    : styles["libre"]
                }
              >
                <span>115</span>
                <DropdownPopover
                  referencia={dropdownRefs.current[13]}
                  isActive={activeStates[13]}
                />
              </td>
              <td
                onClick={() => setRoom(121, 14)}
                ref={(ref) => setDropdownRef(14, ref)}
                className={
                  data.find((room) => room.room === 121 && room.ocupado)
                    ? styles["busy"]
                    : styles["libre"]
                }
              >
                <span>121</span>
                <DropdownPopover
                  referencia={dropdownRefs.current[14]}
                  isActive={activeStates[14]}
                  marginLeft="-305px"
                />
              </td>
              <td
                onClick={() => setRoom(128, 15)}
                ref={(ref) => setDropdownRef(15, ref)}
                className={
                  data.find((room) => room.room === 128 && room.ocupado)
                    ? styles["busy"]
                    : styles["libre"]
                }
              >
                <span>128</span>
                <DropdownPopover
                  referencia={dropdownRefs.current[15]}
                  isActive={activeStates[15]}
                  marginLeft="-305px"
                />
              </td>
            </tr>
            <tr>
              <td
                onClick={() => setRoom(114, 16)}
                ref={(ref) => setDropdownRef(16, ref)}
                className={
                  data.find((room) => room.room === 114 && room.ocupado)
                    ? styles["busy"]
                    : styles["libre"]
                }
              >
                <span>114</span>
                <DropdownPopover
                  referencia={dropdownRefs.current[16]}
                  isActive={activeStates[16]}
                />
              </td>
              <td
                onClick={() => setRoom(122, 17)}
                ref={(ref) => setDropdownRef(17, ref)}
                className={
                  data.find((room) => room.room === 122 && room.ocupado)
                    ? styles["busy"]
                    : styles["libre"]
                }
              >
                <span>122</span>
                <DropdownPopover
                  referencia={dropdownRefs.current[17]}
                  isActive={activeStates[17]}
                  marginLeft="-305px"
                />
              </td>
              <td
                onClick={() => setRoom(127, 18)}
                ref={(ref) => setDropdownRef(18, ref)}
                className={
                  data.find((room) => room.room === 127 && room.ocupado)
                    ? styles["busy"]
                    : styles["libre"]
                }
              >
                <span>127</span>
                <DropdownPopover
                  referencia={dropdownRefs.current[18]}
                  isActive={activeStates[18]}
                  marginLeft="-305px"
                />
              </td>
            </tr>
            <tr>
              <td
                onClick={() => setRoom(106, 19)}
                ref={(ref) => setDropdownRef(19, ref)}
                className={
                  data.find((room) => room.room === 106 && room.ocupado)
                    ? styles["busy"]
                    : styles["libre"]
                }
              >
                <span>106</span>
                <DropdownPopover
                  referencia={dropdownRefs.current[19]}
                  isActive={activeStates[19]}
                />
              </td>
              <td colSpan={5}>
                <span>PASADIZO</span>
              </td>
              <td
                onClick={() => setRoom(126, 20)}
                ref={(ref) => setDropdownRef(20, ref)}
                className={
                  data.find((room) => room.room === 126 && room.ocupado)
                    ? styles["busy"]
                    : styles["libre"]
                }
              >
                <span>126</span>
                <DropdownPopover
                  referencia={dropdownRefs.current[20]}
                  isActive={activeStates[20]}
                  marginLeft="-305px"
                />
              </td>
            </tr>
            <tr>
              <td
                onClick={() => setRoom(107, 21)}
                ref={(ref) => setDropdownRef(21, ref)}
                className={
                  data.find((room) => room.room === 107 && room.ocupado)
                    ? styles["busy"]
                    : styles["libre"]
                }
              >
                <span>107</span>
                <DropdownPopover
                  referencia={dropdownRefs.current[21]}
                  isActive={activeStates[21]}
                />
              </td>
              <td
                onClick={() => setRoom(113, 22)}
                ref={(ref) => setDropdownRef(22, ref)}
                className={
                  data.find((room) => room.room === 113 && room.ocupado)
                    ? styles["busy"]
                    : styles["libre"]
                }
              >
                <span>113</span>
                <DropdownPopover
                  referencia={dropdownRefs.current[22]}
                  isActive={activeStates[22]}
                />
              </td>
              <td rowSpan={3} colSpan={3}>
                <span>Pasadizo</span>
              </td>
              <td
                onClick={() => setRoom(123, 23)}
                ref={(ref) => setDropdownRef(23, ref)}
                className={
                  data.find((room) => room.room === 123 && room.ocupado)
                    ? styles["busy"]
                    : styles["libre"]
                }
              >
                <span>123</span>
                <DropdownPopover
                  referencia={dropdownRefs.current[23]}
                  isActive={activeStates[23]}
                  marginLeft="-305px"
                />
              </td>
              <td>
                <span>Escalera</span>
              </td>
            </tr>
            <tr>
              <td
                onClick={() => setRoom(108, 24)}
                ref={(ref) => setDropdownRef(24, ref)}
                className={
                  data.find((room) => room.room === 108 && room.ocupado)
                    ? styles["busy"]
                    : styles["libre"]
                }
              >
                <span>108</span>
                <DropdownPopover
                  referencia={dropdownRefs.current[24]}
                  isActive={activeStates[24]}
                />
              </td>
              <td
                onClick={() => setRoom(112, 25)}
                ref={(ref) => setDropdownRef(25, ref)}
                className={
                  data.find((room) => room.room === 112 && room.ocupado)
                    ? styles["busy"]
                    : styles["libre"]
                }
              >
                <span>112</span>
                <DropdownPopover
                  referencia={dropdownRefs.current[25]}
                  isActive={activeStates[25]}
                />
              </td>
              <td
                onClick={() => setRoom(124, 26)}
                ref={(ref) => setDropdownRef(26, ref)}
                className={
                  data.find((room) => room.room === 124 && room.ocupado)
                    ? styles["busy"]
                    : styles["libre"]
                }
              >
                <span>124</span>
                <DropdownPopover
                  referencia={dropdownRefs.current[26]}
                  isActive={activeStates[26]}
                  marginLeft="-305px"
                />
              </td>
              <td>
                <span>A</span>
              </td>
            </tr>
            <tr>
              <td
                onClick={() => setRoom(109, 27)}
                ref={(ref) => setDropdownRef(27, ref)}
                className={
                  data.find((room) => room.room === 109 && room.ocupado)
                    ? styles["busy"]
                    : styles["libre"]
                }
              >
                <span>109</span>
                <DropdownPopover
                  referencia={dropdownRefs.current[27]}
                  isActive={activeStates[27]}
                />
              </td>
              <td
                onClick={() => setRoom(111, 28)}
                ref={(ref) => setDropdownRef(28, ref)}
                className={
                  data.find((room) => room.room === 111 && room.ocupado)
                    ? styles["busy"]
                    : styles["libre"]
                }
              >
                <span>111</span>
                <DropdownPopover
                  referencia={dropdownRefs.current[28]}
                  isActive={activeStates[28]}
                />
              </td>
              <td
                onClick={() => setRoom(125, 29)}
                ref={(ref) => setDropdownRef(29, ref)}
                className={
                  data.find((room) => room.room === 125 && room.ocupado)
                    ? styles["busy"]
                    : styles["libre"]
                }
              >
                <span>125</span>
                <DropdownPopover
                  referencia={dropdownRefs.current[29]}
                  isActive={activeStates[29]}
                  marginLeft="-305px"
                />
              </td>
              <td>
                <span>CAJA</span>
              </td>
            </tr>
            <tr>
              <td
                onClick={() => setRoom(110, 30)}
                ref={(ref) => setDropdownRef(30, ref)}
                className={
                  data.find((room) => room.room === 110 && room.ocupado)
                    ? styles["busy"]
                    : styles["libre"]
                }
              >
                <span>110</span>
                <DropdownPopover
                  referencia={dropdownRefs.current[30]}
                  isActive={activeStates[30]}
                />
              </td>
              <td colSpan={7} rowSpan={4}>
                <span>RECEPCIÓN/ENTRADA</span>
              </td>
            </tr>
            <tr>
              <td colSpan={2} rowSpan={3}>
                <span>SSHH</span>
              </td>
            </tr>
            <tr></tr>
            <tr></tr>
          </tbody>
        </table>
        {/*  <Popover popoverPosition={popoverPosition} /> */}
      </div>
    </div>
  );
};
