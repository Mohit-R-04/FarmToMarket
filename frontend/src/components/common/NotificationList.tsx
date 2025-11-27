import { useState } from 'react';
import { useNotifications, type Notification } from '../../context/NotificationContext';
import { Check, X, Info, AlertTriangle } from 'lucide-react';

interface NotificationListProps {
    onClose: () => void;
}

export default function NotificationList({ onClose }: NotificationListProps) {
    const { notifications, markAsRead, respondToCancellation } = useNotifications();
    const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());

    if (notifications.length === 0) {
        return (
            <div className="p-8 text-center text-slate-500 dark:text-slate-400">
                <p>No notifications yet</p>
            </div>
        );
    }

    const handleAction = async (notification: Notification, action: 'ACCEPT' | 'REJECT') => {
        if (!notification.relatedEntityId) return;

        setProcessingIds((prev: Set<string>) => new Set(prev).add(notification.id));

        try {
            console.log(`Processing action ${action} for notification ${notification.id}`);
            await respondToCancellation(notification.relatedEntityId, action);
            console.log('Action processed successfully');
        } catch (error) {
            console.error('Action failed:', error);
            alert('Failed to process action');
            setProcessingIds((prev: Set<string>) => {
                const newSet = new Set(prev);
                newSet.delete(notification.id);
                return newSet;
            });
        }
    };

    return (
        <div className="divide-y divide-white/10">
            {notifications.map((notification) => (
                <div
                    key={notification.id}
                    className={`p-4 hover:bg-white/5 transition-colors ${notification.status === 'UNREAD' ? 'bg-white/5' : ''}`}
                    onClick={() => notification.status === 'UNREAD' && markAsRead(notification.id)}
                >
                    <div className="flex gap-3">
                        <div className="mt-1">
                            {notification.type === 'ALERT' || notification.type === 'CANCELLATION_REQUEST' ? (
                                <AlertTriangle className="w-5 h-5 text-amber-500" />
                            ) : (
                                <Info className="w-5 h-5 text-blue-500" />
                            )}
                        </div>
                        <div className="flex-1">
                            <p className="text-sm text-slate-900 dark:text-slate-200">{notification.message}</p>
                            <p className="text-xs text-slate-600 dark:text-slate-500 mt-1">
                                {new Date(notification.createdAt).toLocaleString()}
                            </p>

                            {notification.type === 'CANCELLATION_REQUEST' &&
                                notification.actionStatus === 'PENDING' &&
                                !processingIds.has(notification.id) && (
                                    <div className="flex gap-2 mt-3">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleAction(notification, 'ACCEPT');
                                            }}
                                            className="flex items-center gap-1 px-3 py-1.5 bg-green-500/10 text-green-400 rounded-lg hover:bg-green-500/20 text-xs font-medium transition-colors"
                                        >
                                            <Check className="w-3 h-3" /> Accept
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleAction(notification, 'REJECT');
                                            }}
                                            className="flex items-center gap-1 px-3 py-1.5 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 text-xs font-medium transition-colors"
                                        >
                                            <X className="w-3 h-3" /> Reject
                                        </button>
                                    </div>
                                )}
                        </div>
                        {notification.status === 'UNREAD' && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}
