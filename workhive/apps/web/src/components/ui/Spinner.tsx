export interface SpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
}

export function Spinner({ size = 'medium', color = 'var(--color-primary)' }: SpinnerProps) {
  const sizeStyles = {
    small: { width: '16px', height: '16px' },
    medium: { width: '24px', height: '24px' },
    large: { width: '32px', height: '32px' },
  };

  return (
    <div
      className="spinner"
      style={{
        ...sizeStyles[size],
        border: `3px solid ${color}`,
        borderTop: '3px solid transparent',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
      }}
    />
  );
}
