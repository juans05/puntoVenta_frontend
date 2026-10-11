import { useState, useEffect, useRef } from "react";

type UseDropdownReturnType = [boolean, React.Dispatch<React.SetStateAction<boolean>>, React.RefObject<HTMLDivElement>];

// extraRef: contenido renderizado fuera del wrapper (portal), que tampoco cuenta como "afuera".
function useOutsideClick(initialIsOpen: boolean, extraRef?: React.RefObject<HTMLElement>): UseDropdownReturnType {

  const [isOpen, setIsOpen] = useState(initialIsOpen);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node) && !extraRef?.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("click", handleClickOutside, true);
    return () => {
      document.removeEventListener("click", handleClickOutside, true);
    };
  }, [ref, extraRef]);
  return [isOpen, setIsOpen, ref];
}

export default useOutsideClick;