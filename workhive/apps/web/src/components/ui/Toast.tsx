import { ReactNode, useEffect, useState } from 'react';

export interface ToastProps {
  message: ReactNode;
  type?: 'success' | 'error' | 'info';
  duration?: number;
  onClose: () => void;
}

export function Toast({ message, type = 'info', duration = 3000, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const typeStyles = {
    success: { backgroundColor: 'var(--bg-green-tint)', color: 'var(--color-signal-green)', border: '1px solid var(--color-signal-green)' },
    error: { backgroundColor: 'var(--bg-rust-tint)', color: 'var(--color-alert-rust)', border: '1px solid var(--color-alert-rust)' },
    info: { backgroundColor: 'var(--bg-blue-tint)', color: 'var(--color-info-blue)', border: '1px solid var(--color-info-blue)' },
  };

  const style = typeStyles[type];

  return (
    <div
      className="p-4"
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 9999,
        borderRadius: 'var(--radius-sm)',
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(-20px)',
        transition: 'all 0.3s ease',
        ...style,
      }}
    >
      {message}
    </div>
  );
}
