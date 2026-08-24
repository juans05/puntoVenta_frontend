import styles from "./multiselect.module.css";
interface OptionProps {
    value: string;
    label: string;
    isSelected: boolean;
    onSelect: () => void;
  }
  
  export const Option=({/*  value, */ label, isSelected, onSelect }: OptionProps)=> {
    return (
      <div
        className={`${styles.option} ${isSelected ? styles.selected : ""}`}
        onClick={onSelect}
      >
        {label}
      </div>
    );
  }