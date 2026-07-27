export interface SkeletonProps {
  width?: string;
  height?: string;
  className?: string;
}

export function Skeleton({ width = '100%', height = '16px', className = '' }: SkeletonProps) {
  return (
    <div
      className={className}
      style={{
        width,
        height,
        backgroundColor: 'var(--color-slate-light)',
        borderRadius: 'var(--radius-sm)',
        animation: 'skeleton-loading 1.5s ease-in-out infinite',
      }}
    />
  );
}
