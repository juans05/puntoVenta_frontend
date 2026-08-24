import { useState } from "react";
import { Icon } from "@iconify/react";
import { sidebar } from "../../helpers/ClassNames";
import { NavLink, useLocation } from "react-router-dom";
import { IMenu } from "../../infraestructure/MData/MData";

interface ISidebarElement extends IMenu {
  index: number;
}

export const SidebarElement = ({
  value,
  icon,
  url,
  index,
  children,
}: ISidebarElement) => {
  const location = useLocation();
  const hasChildren = !!children?.length;
  const isChildActive = hasChildren && children!.some((child) => location.pathname === `/${child.url}`);
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
              <li key={child.id ?? childIndex}>
                <NavLink
                  to={`/${child.url}`}
                  className={({ isActive }) =>
                    `${sidebar.contenedorSidebar} text-sm ${
                      isActive
                        ? "bg-brand-500 text-white"
                        : "text-neutral-600 hover:bg-brand-50 hover:text-brand-700"
                    }`
                  }
                >
                  <span className="whitespace-nowrap">{child.value}</span>
                </NavLink>
              </li>
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
        className={({ isActive }) =>
          `${sidebar.contenedorSidebar} ${
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
