import { create } from 'zustand';
import {
  Notification,
  getUserNotifications,
  getUnreadNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  subscribeToNotifications,
  NotificationType,
} from '@/services/notifications';

interface NotificationsState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  realtimeUnsubscribe: (() => void) | null;

  // Actions
  loadNotifications: (customerId: string) => Promise<void>;
  loadUnreadNotifications: (customerId: string) => Promise<void>;
  refreshUnreadCount: (customerId: string) => Promise<void>;
  markNotificationAsRead: (notificationId: string) => Promise<void>;
  markAllNotificationsAsRead: (customerId: string) => Promise<void>;
  deleteNotificationById: (notificationId: string) => Promise<void>;
  subscribeToRealtimeNotifications: (
    customerId: string,
    onNewNotification?: (notification: Notification) => void
  ) => void;
  unsubscribeFromRealtimeNotifications: () => void;
  getNotificationsByType: (type: NotificationType) => Notification[];
  clearNotifications: () => void;
}

export const useNotificationsStore = create<NotificationsState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,
  realtimeUnsubscribe: null,

  /**
   * Carga todas las notificaciones del usuario
   */
  loadNotifications: async (customerId: string) => {
    set({ isLoading: true, error: null });
    try {
      const notifications = await getUserNotifications(customerId);
      const unreadCount = notifications.filter((n) => !n.isRead).length;
      set({ notifications, unreadCount, isLoading: false });
    } catch (error) {
      console.error('Error loading notifications:', error);
      set({ error: 'Error al cargar notificaciones', isLoading: false });
    }
  },

  /**
   * Carga solo las notificaciones no leídas
   */
  loadUnreadNotifications: async (customerId: string) => {
    set({ isLoading: true, error: null });
    try {
      const notifications = await getUnreadNotifications(customerId);
      set({ notifications, unreadCount: notifications.length, isLoading: false });
    } catch (error) {
      console.error('Error loading unread notifications:', error);
      set({ error: 'Error al cargar notificaciones no leídas', isLoading: false });
    }
  },

  /**
   * Actualiza el contador de notificaciones no leídas
   */
  refreshUnreadCount: async (customerId: string) => {
    try {
      const count = await getUnreadCount(customerId);
      set({ unreadCount: count });
    } catch (error) {
      console.error('Error refreshing unread count:', error);
    }
  },

  /**
   * Marca una notificación como leída
   */
  markNotificationAsRead: async (notificationId: string) => {
    try {
      await markAsRead(notificationId);

      // Actualiza el estado local
      const notifications = get().notifications.map((n) =>
        n.id === notificationId
          ? { ...n, isRead: true, readAt: new Date() }
          : n
      );
      const unreadCount = notifications.filter((n) => !n.isRead).length;

      set({ notifications, unreadCount });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      set({ error: 'Error al marcar notificación como leída' });
    }
  },

  /**
   * Marca todas las notificaciones como leídas
   */
  markAllNotificationsAsRead: async (customerId: string) => {
    try {
      await markAllAsRead(customerId);

      // Actualiza el estado local
      const notifications = get().notifications.map((n) => ({
        ...n,
        isRead: true,
        readAt: new Date(),
      }));

      set({ notifications, unreadCount: 0 });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      set({ error: 'Error al marcar todas las notificaciones como leídas' });
    }
  },

  /**
   * Elimina una notificación
   */
  deleteNotificationById: async (notificationId: string) => {
    try {
      await deleteNotification(notificationId);

      // Actualiza el estado local
      const notifications = get().notifications.filter((n) => n.id !== notificationId);
      const unreadCount = notifications.filter((n) => !n.isRead).length;

      set({ notifications, unreadCount });
    } catch (error) {
      console.error('Error deleting notification:', error);
      set({ error: 'Error al eliminar notificación' });
    }
  },

  /**
   * Suscribe a notificaciones en tiempo real
   */
  subscribeToRealtimeNotifications: (
    customerId: string,
    onNewNotification?: (notification: Notification) => void
  ) => {
    // Si ya hay una suscripción activa, la cancelamos
    const currentUnsub = get().realtimeUnsubscribe;
    if (currentUnsub) {
      currentUnsub();
    }

    // Creamos nueva suscripción
    const unsubscribe = subscribeToNotifications(customerId, (newNotification) => {
      // Agrega la nueva notificación al principio del array
      const notifications = [newNotification, ...get().notifications];
      const unreadCount = get().unreadCount + 1;

      set({ notifications, unreadCount });

      // Llama al callback si existe
      if (onNewNotification) {
        onNewNotification(newNotification);
      }
    });

    set({ realtimeUnsubscribe: unsubscribe });
  },

  /**
   * Cancela la suscripción a notificaciones en tiempo real
   */
  unsubscribeFromRealtimeNotifications: () => {
    const unsubscribe = get().realtimeUnsubscribe;
    if (unsubscribe) {
      unsubscribe();
      set({ realtimeUnsubscribe: null });
    }
  },

  /**
   * Obtiene notificaciones filtradas por tipo
   */
  getNotificationsByType: (type: NotificationType) => {
    return get().notifications.filter((n) => n.type === type);
  },

  /**
   * Limpia todas las notificaciones del store
   */
  clearNotifications: () => {
    const unsubscribe = get().realtimeUnsubscribe;
    if (unsubscribe) {
      unsubscribe();
    }
    set({
      notifications: [],
      unreadCount: 0,
      isLoading: false,
      error: null,
      realtimeUnsubscribe: null,
    });
  },
}));
