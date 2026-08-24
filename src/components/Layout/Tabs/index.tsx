import styles from "./tabs.module.css";
import { Icon } from "@iconify/react";

interface Tab {
  id: number;
  name: string;
}
interface ITabButton {
  tabs: Tab[];
  activeTab?: any;
  handleClick?: any;
  onEditTab?: any;
  onDeleteTab?: any;
}
export const Tabs = ({ tabs, activeTab, handleClick, onEditTab, onDeleteTab }: ITabButton) => {
  return (
    <>
      <div className={styles["tabs-container"]}>
        <div className={styles["tabs"]}>
          {tabs?.map((tab) => (
            <button
              key={tab.id}
              className={`${styles["tab-button"]} ${
                activeTab === tab.id ? `${styles.active}` : ""
              }`}
              onClick={() => handleClick && handleClick(tab.id)}
            >
              {tab.name}
              {(onEditTab || onDeleteTab) && (
                <span className={styles["tab-actions"]}>
                  {onEditTab && (
                    <span
                      className={styles["tab-action"]}
                      title="Editar"
                      onClick={(e) => { e.stopPropagation(); onEditTab(tab.id); }}
                    >
                      <Icon icon="mdi:pencil" />
                    </span>
                  )}
                  {onDeleteTab && (
                    <span
                      className={styles["tab-action"]}
                      title="Eliminar"
                      onClick={(e) => { e.stopPropagation(); onDeleteTab(tab.id); }}
                    >
                      <Icon icon="mdi:trash" />
                    </span>
                  )}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
      {/*     <div className={styles["tab-content"]}>
        {activeTab !== null && (
          <p>{tabs.find((tab) => tab.id === activeTab)?.name}</p>
        )}
      </div> */}
    </>
  );
};
