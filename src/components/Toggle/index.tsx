import styles from './toggle.module.css'


export const Toggle = ({ isOn, handleToggle, colorOne, colorTwo, id, }:any) => {
  console.log(isOn)
  console.log(handleToggle);
    return (
      <>
        <input
          checked={isOn}
          onChange={handleToggle}
          className={styles["switch-checkbox"]}
          id={`${id?`${id}`:'switch'}`}
          type="checkbox"
        />
        <label
          style={{ background: isOn ? colorOne : colorTwo }}
          className={styles["switch-label"]}
          htmlFor={`${id?`${id}`:'switch'}`}
          data-yes={id!=='switchTurno'?'Sí':''}
          data-no={id!=='switchTurno'?'No':''}
        >
          <span className={styles[`switch-button`]} />
        </label>
      </>
    );
  };