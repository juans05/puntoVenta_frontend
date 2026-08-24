
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
      <div>
        <input
          type="checkbox"
          onChange={e => handleChange(e,row)}
          checked={checked}
          id={id}
          name={ticket}
        />
      </div>
    )
  }