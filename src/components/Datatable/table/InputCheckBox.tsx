/* 
import { useDispatch } from 'react-redux'; */


export interface IInputCheckbox {
  disabledButton?: any;
  handleChange?: any
  ticket: string
  checked: any
  row: any
  id:any
}

export const InputCheckBox = ({row,checked,ticket,handleChange,id}: IInputCheckbox) => {

  return (
    <div /* id="ticketCheckbox" */>
      <input
        type="checkbox"
        onChange={e => handleChange(e,row)}
        checked={checked}
        id={id}
    /*     checked={row?.selected} */
        name={ticket}
       /*  disabled={isDisable} */
    /*     className="ticket__checkbox" */
      />
    </div>
  )
}
