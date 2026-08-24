interface IAvatar {
  name?: string;
  size?: number;
  className?: string;
}

const getInitials = (name?: string) => {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  const first = parts[0][0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
};

export const Avatar = ({ name, size = 40, className }: IAvatar) => {
  return (
    <div
      className={`flex items-center justify-center rounded-full bg-brand-500 text-white font-semibold select-none shrink-0 ${className ?? ""}`}
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {getInitials(name)}
    </div>
  );
};

export default Avatar;
