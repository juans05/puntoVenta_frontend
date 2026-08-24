import { useState, useEffect, useRef } from "react";

type UseDropdownReturnType = [boolean, React.Dispatch<React.SetStateAction<boolean>>, React.RefObject<HTMLDivElement>];

function useOutsideClick(initialIsOpen: boolean): UseDropdownReturnType {

  const [isOpen, setIsOpen] = useState(initialIsOpen);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("click", handleClickOutside, true);
    return () => {
      document.removeEventListener("click", handleClickOutside, true);
    };
  }, [ref]);
  return [isOpen, setIsOpen, ref];
}

export default useOutsideClick;