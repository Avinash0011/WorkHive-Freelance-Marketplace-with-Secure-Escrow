import { useState, useEffect } from 'react';
import { useSocket } from '../../hooks/useSocket';
import { useAuthStore } from '../../stores/authStore';

interface Notification {
  id: string;
  type: 'proposal:created' | 'proposal:accepted' | 'payment:released' | 'delivery:submitted';
  data: any;
  timestamp: Date;
  read: boolean;
}

export default function NotificationCenter() {
  const { isAuthenticated } = useAuthStore();
  const socket = useSocket();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!socket) return;

    socket.on('proposal:created', (data) => {
      const notification: Notification = {
        id: crypto.randomUUID(),
        type: 'proposal:created',
        data,
        timestamp: new Date(),
        read: false,
      };
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);
    });

    socket.on('proposal:accepted', (data) => {
      const notification: Notification = {
        id: crypto.randomUUID(),
        type: 'proposal:accepted',
        data,
        timestamp: new Date(),
        read: false,
      };
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);
    });

    socket.on('payment:released', (data) => {
      const notification: Notification = {
        id: crypto.randomUUID(),
        type: 'payment:released',
        data,
        timestamp: new Date(),
        read: false,
      };
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);
    });

    socket.on('delivery:submitted', (data) => {
      const notification: Notification = {
        id: crypto.randomUUID(),
        type: 'delivery:submitted',
        data,
        timestamp: new Date(),
        read: false,
      };
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);
    });

    return () => {
      socket.off('proposal:created');
      socket.off('proposal:accepted');
      socket.off('payment:released');
      socket.off('delivery:submitted');
    };
  }, [socket]);

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const getNotificationMessage = (notification: Notification) => {
    switch (notification.type) {
      case 'proposal:created':
        return 'New proposal received for your job';
      case 'proposal:accepted':
        return 'Your proposal has been accepted!';
      case 'payment:released':
        return 'Payment has been released';
      case 'delivery:submitted':
        return 'Work has been submitted for review';
      default:
        return 'New notification';
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  if (!isAuthenticated) return null;

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="btn btn-ghost btn-compact"
        style={{ position: 'relative' }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '-4px',
              right: '-4px',
              backgroundColor: 'var(--color-alert-rust)',
              color: 'white',
              borderRadius: '50%',
              width: '18px',
              height: '18px',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            width: '320px',
            backgroundColor: 'white',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-modal)',
            zIndex: 1000,
            maxHeight: '400px',
            overflowY: 'auto',
          }}
        >
          <div style={{ padding: '16px', borderBottom: '1px solid var(--color-slate-light)' }}>
            <h3 className="text-h3">Notifications</h3>
          </div>

          {notifications.length === 0 ? (
            <div style={{ padding: '32px', textAlign: 'center' }}>
              <p className="text-small text-slate">No notifications yet</p>
            </div>
          ) : (
            <div>
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => markAsRead(notification.id)}
                  style={{
                    padding: '16px',
                    borderBottom: '1px solid var(--color-slate-light)',
                    backgroundColor: notification.read ? 'transparent' : 'var(--bg-blue-tint)',
                    cursor: 'pointer',
                  }}
                >
                  <p className="text-body" style={{ marginBottom: '4px' }}>
                    {getNotificationMessage(notification)}
                  </p>
                  <p className="text-small text-slate">{formatTime(notification.timestamp)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
