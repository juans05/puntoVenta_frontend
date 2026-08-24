import styles from './tabs.module.css'

interface TabProps {
  label: string;
  onClick: () => void;
  isActive: boolean;
}

export const TabItem: React.FC<TabProps> = ({ label, onClick,isActive  }) => {
  return (
    <div className={`${styles["tab"]} ${isActive ? `${styles["active"]}` : ''}`} onClick={onClick}>
      {label}
    </div>
  );
};


