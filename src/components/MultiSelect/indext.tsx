import { useState } from "react";
import styles from "./multiselect.module.css";
import { Option } from "./Option";
import Input from "../../components/Input";

import { motion } from "framer-motion";
import useOutsideClick from "./useOutsideClick";

export interface OptionType {
  id?: string;
  value: string;
  label: string;
}

interface SelectProps {
  options: OptionType[];
  label: string;
  setSedesSelected?: any;
  setSelectedOptions?: any;
  selectedOptions?: any
  disabled?: boolean
}

export const MultiSelect = ({ disabled, options, label, setSelectedOptions, selectedOptions }: SelectProps) => {

  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen, ref] = useOutsideClick(false);

  // const toggleOpen = () => setIsOpen((prev) => !prev);

  const handleSelect = (option: OptionType) => {
    if (!selectedOptions?.find((o: any) => o.id === option.id)) {
      setSelectedOptions((prev: any) => [...prev, option]);
    }
    setIsOpen(false);
  };

  const handleRemove = (option: OptionType) => {
    setSelectedOptions((prev: any) => prev?.filter((o: any) => o?.id !== option?.id));
  };

  const filteredOptions = options?.length > 0 ? options?.filter((option) =>
    option?.label?.toLowerCase().includes(searchTerm.toLowerCase())
  ) : []


  return (
    <>
      <label className={styles.label}>{label}</label>
      <div className={disabled ? styles.disabled : styles.select} ref={ref}>
        <div className={styles["selected-options"]} onClick={() => setIsOpen(!isOpen)}>
          {selectedOptions?.length > 0 ? (
            selectedOptions?.map((option: any) => (
              <div key={option.id} className={styles["selected-option"]}>
                {option.label}
                <button
                  className={styles["remove-button"]}
                  onClick={() => handleRemove(option)}
                >
                  X
                </button>
              </div>
            ))
          ) : (
            <span></span>
          )}
        </div>

        {
          isOpen &&
          <motion.div animate={{ x: 0, y: 0 }}
            initial={{ y: 20 }} className={`${styles.options} ${isOpen ? styles.open : ""}`}>
            <Input
              name=""
              className={styles["search-input"]}
              type="text"
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e: any) => setSearchTerm(e.target.value)}
            />
            {filteredOptions?.map((option) => (
              <Option
                key={option?.id}
                value={option?.value}
                label={option?.label}
                isSelected={selectedOptions?.find((o: any) => o.id === option.id) != null}
                onSelect={() => handleSelect(option)}
              />
            ))}
          </motion.div>
        }
      </div>
    </>
  );
};