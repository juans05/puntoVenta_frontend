interface ISkeleton {
  className?: string;
  width?: string | number;
  height?: string | number;
}

export const Skeleton = ({ className = "", width, height }: ISkeleton) => {
  return (
    <div
      className={`relative overflow-hidden bg-neutral-200 rounded-md ${className}`}
      style={{ width, height }}
    >
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/60 to-transparent" />
    </div>
  );
};

interface ITableSkeleton {
  columns: number;
  rows?: number;
}

export const TableSkeleton = ({ columns, rows = 6 }: ITableSkeleton) => {
  return (
    <table className="w-full">
      <tbody>
        {Array.from({ length: rows }).map((_, r) => (
          <tr key={r} className="border-b border-neutral-100">
            {Array.from({ length: columns }).map((_, c) => (
              <td key={c} className="px-3 py-4">
                <Skeleton height={12} className="w-full max-w-[140px] mx-auto" />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

interface ICardGridSkeleton {
  count?: number;
}

export const CardGridSkeleton = ({ count = 8 }: ICardGridSkeleton) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-md border border-neutral-200 p-2">
          <Skeleton height={140} className="w-full mb-3" />
          <Skeleton height={12} className="w-3/4 mb-2" />
          <Skeleton height={12} className="w-1/2" />
        </div>
      ))}
    </div>
  );
};

export default Skeleton;
