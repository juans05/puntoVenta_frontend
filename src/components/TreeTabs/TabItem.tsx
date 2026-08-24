import React  from "react";
import { Icon } from '@iconify/react';
import styles from './tabs.module.css';

interface Tab {
  id: number;
  title: string;
  children?: Tab[];
}

interface TabItemProps {
  data: Tab;
  onClick: (tab: Tab) => void;
  activeIds: number[];
}

export const TabItem: React.FC<TabItemProps> = ({ data, onClick, activeIds }) => {
  const isActive = activeIds.includes(data.id);
  console.log(isActive)

  const handleClick = () => {
    onClick(data);
  };

  return (
    <div className={`${styles['tab-item']} ${isActive ? styles.active : ''}`} onClick={handleClick}>
      <div className={styles.dir}>
        <Icon icon="bi:folder" />
        <span>{data.title}</span>
      </div>
      {isActive && data.children && (
        <div className={styles["sub-tabs"]}>
          {data.children.map((child) => (
            <TabItem
              key={child.id}
              data={child}
              onClick={onClick}
              activeIds={activeIds}
            />
          ))}
        </div>
      )}
    </div>
  );
};