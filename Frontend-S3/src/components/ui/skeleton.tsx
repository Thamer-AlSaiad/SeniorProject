interface SkeletonProps {
  className?: string;
}

export const Skeleton = ({ className = '' }: SkeletonProps) => {
  return (
    <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
  );
};

export const CardSkeleton = () => (
  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
    <div className="flex items-center gap-4 mb-4">
      <Skeleton className="w-12 h-12 rounded-full" />
      <div className="flex-1">
        <Skeleton className="h-4 w-32 mb-2" />
        <Skeleton className="h-3 w-24" />
      </div>
    </div>
    <Skeleton className="h-3 w-full mb-2" />
    <Skeleton className="h-3 w-3/4" />
  </div>
);

export const TableRowSkeleton = () => (
  <tr className="border-b border-gray-100">
    <td className="py-4 px-4"><Skeleton className="h-4 w-24" /></td>
    <td className="py-4 px-4"><Skeleton className="h-4 w-32" /></td>
    <td className="py-4 px-4"><Skeleton className="h-4 w-20" /></td>
    <td className="py-4 px-4"><Skeleton className="h-4 w-16" /></td>
    <td className="py-4 px-4"><Skeleton className="h-8 w-20 rounded" /></td>
  </tr>
);

export const ListSkeleton = ({ count = 5 }: { count?: number }) => (
  <div className="space-y-4">
    {Array.from({ length: count }).map((_, i) => (
      <CardSkeleton key={i} />
    ))}
  </div>
);

export const FormSkeleton = () => (
  <div className="space-y-6">
    <div>
      <Skeleton className="h-4 w-24 mb-2" />
      <Skeleton className="h-12 w-full rounded-lg" />
    </div>
    <div>
      <Skeleton className="h-4 w-32 mb-2" />
      <Skeleton className="h-12 w-full rounded-lg" />
    </div>
    <div>
      <Skeleton className="h-4 w-28 mb-2" />
      <Skeleton className="h-24 w-full rounded-lg" />
    </div>
    <Skeleton className="h-12 w-32 rounded-full" />
  </div>
);
