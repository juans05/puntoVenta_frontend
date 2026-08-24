import React, { useState } from 'react';
import styles from './tab.module.css';

interface TabItem {
  id: number;
  title: string;
  children?: TabItem[];
  onClick?: () => void;
  level?: number;
}

interface TabMenuProps {
  data: TabItem[];
  onClick: (itemId: number) => void;
}

export const TabMenu: React.FC<TabMenuProps> = ({ data, onClick }) => {
  const [activeItemId, setActiveItemId] = useState<number | null>(null);

  const handleItemClick = (itemId: number) => {
    setActiveItemId(itemId);
    onClick(itemId);
  };

  const renderTabItems = (items: TabItem[], level: number) => {
    return (
      <ul className={styles[`tab-menu level-${level}`]}>
        {items.map(item => {
          const itemWithLevel: TabItem = { ...item, level }; // Add level to the item
          return (
            <li
              key={itemWithLevel.id}
              onClick={() => handleItemClick(itemWithLevel.id)}
              className={itemWithLevel.id === activeItemId ? styles.active : ''}
            >
              {itemWithLevel.title}
              {itemWithLevel.children && renderTabItems(itemWithLevel.children, level + 1)}
            </li>
          );
        })}
      </ul>
    );
  };

  return <div className={styles['tab-menu-container']}>{renderTabItems(data, 1)}</div>;
};
