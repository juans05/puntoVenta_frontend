import { useState } from "react";
import { Icon } from "@iconify/react";
import { sidebar } from "../../helpers/ClassNames";
import { NavLink, useLocation } from "react-router-dom";
import { IMenu } from "../../infraestructure/MData/MData";

interface ISidebarElement extends IMenu {
  index: number;
}

// Un nodo del menu puede tener children que a su vez tienen sus propios children
// (ver "Configuraciones" dentro de "Administración" en MData.ts) -- por eso este
// componente se llama a si mismo para cada nivel, en vez de asumir que los child
// son siempre hojas navegables.
const algunoCoincideConRuta = (items: IMenu[], pathname: string): boolean =>
  items.some((item) => pathname === `/${item.url}` || (item.children && algunoCoincideConRuta(item.children, pathname)));

export const SidebarElement = ({
  value,
  icon,
  url,
  index,
  children,
  nivel = 0,
}: ISidebarElement & { nivel?: number }) => {
  const location = useLocation();
  const hasChildren = !!children?.length;
  const isChildActive = hasChildren && algunoCoincideConRuta(children!, location.pathname);
  const [isOpen, setIsOpen] = useState(isChildActive);

  if (hasChildren) {
    return (
      <li key={index}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`${sidebar.contenedorSidebar} w-full justify-between ${
            isChildActive ? "text-brand-700" : "text-neutral-600 hover:bg-brand-50 hover:text-brand-700"
          }`}
        >
          <span className="flex items-center gap-3">
            <Icon icon={icon} className={sidebar.svgSidebar} />
            <span className="whitespace-nowrap">{value}</span>
          </span>
          <Icon
            icon="mdi:chevron-down"
            className={`w-4 h-4 shrink-0 transition-transform duration-150 ${isOpen ? "rotate-180" : ""}`}
          />
        </button>
        {isOpen && (
          <ul className="mt-1 space-y-1 pl-6">
            {children!.map((child, childIndex) => (
              <SidebarElement key={child.id ?? childIndex} {...child} index={childIndex} nivel={nivel + 1} />
            ))}
          </ul>
        )}
      </li>
    );
  }

  return (
    <li key={index}>
      <NavLink
        to={`/${url}`}
        end
        className={({ isActive }) =>
          `${sidebar.contenedorSidebar} ${nivel > 0 ? "text-sm" : ""} ${
            isActive
              ? "bg-brand-500 text-white"
              : "text-neutral-600 hover:bg-brand-50 hover:text-brand-700"
          }`
        }
      >
        <Icon icon={icon} className={sidebar.svgSidebar} />
        <span className="whitespace-nowrap">{value}</span>
      </NavLink>
    </li>
  );
};
