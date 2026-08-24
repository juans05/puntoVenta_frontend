import styles from './sidebar.module.css'
import { IconType } from 'react-icons';
import { Icon } from "@iconify/react";


interface Tab {
    id: number;
    label: string;
    icon: IconType;
  }
  interface ITabArray{
    tabs:Tab[];
    handleTabClick?:any;
    activeTab?:any;
    background?:any;
    onEditTab?:any;
    onDeleteTab?:any;
  }
export const Sidebar = ({tabs,handleTabClick,activeTab,background,onEditTab,onDeleteTab}:ITabArray) => {


  return (
    <div className={styles['sidebar-main']} >
       <div className={styles["sidebar"]}>
      <ul className={styles["tab-list"]}>
        {tabs?.map(tab => (
          <li
            key={tab?.id}
            className={`${styles['tab-item']} ${activeTab === tab.id ? `${styles.active}` : ''}`}
            onClick={() => handleTabClick && handleTabClick(tab.id)}
            style={{background:`${activeTab === tab.id?`${background}`:''}`}}
          >
            {/* <tab.icon /> */}
            <span>{tab?.label}</span>
            {(onEditTab || onDeleteTab) && (
              <div className={styles["tab-actions"]}>
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
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
   {/*  <div className={styles.content}>
        {selectedTab && <span>{selectedTab.label}</span>}
      </div> */}
    </div>
 
  );
};

