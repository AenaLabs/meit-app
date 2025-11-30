import { supabase } from './supabase';

// Tipos de notificaciones
export type NotificationType =
  | 'checkin'
  | 'gift_card_generated'
  | 'gift_card_redeemed'
  | 'points_assigned'
  | 'customer_milestone'
  | 'challenge_completed'
  | 'new_customer';

export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';

// Interface para la notificación tal como viene de la BD
export interface NotificationFromDB {
  id: string;
  business_settings_id: number;
  customer_id: string | null;
  type: NotificationType;
  title: string;
  message: string;
  metadata: Record<string, any>;
  data: Record<string, any>;
  is_read: boolean;
  read_at: string | null;
  priority: NotificationPriority;
  created_at: string;
}

// Interface para usar en la app (con datos transformados)
export interface Notification {
  id: string;
  businessSettingsId: number;
  customerId: string | null;
  type: NotificationType;
  title: string;
  message: string;
  metadata: Record<string, any>;
  data: Record<string, any>;
  isRead: boolean;
  readAt: Date | null;
  priority: NotificationPriority;
  createdAt: Date;
}

/**
 * Transforma una notificación de la BD al formato de la app
 */
function transformNotification(dbNotification: NotificationFromDB): Notification {
  return {
    id: dbNotification.id,
    businessSettingsId: dbNotification.business_settings_id,
    customerId: dbNotification.customer_id,
    type: dbNotification.type,
    title: dbNotification.title,
    message: dbNotification.message,
    metadata: dbNotification.metadata || {},
    data: dbNotification.data || {},
    isRead: dbNotification.is_read,
    readAt: dbNotification.read_at ? new Date(dbNotification.read_at) : null,
    priority: dbNotification.priority,
    createdAt: new Date(dbNotification.created_at),
  };
}

/**
 * Obtiene todas las notificaciones de un usuario
 */
export async function getUserNotifications(
  customerId: string,
  limit: number = 50
): Promise<Notification[]> {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching user notifications:', error);
    throw error;
  }

  return (data || []).map(transformNotification);
}

/**
 * Obtiene solo las notificaciones no leídas de un usuario
 */
export async function getUnreadNotifications(customerId: string): Promise<Notification[]> {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('customer_id', customerId)
    .eq('is_read', false)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching unread notifications:', error);
    throw error;
  }

  return (data || []).map(transformNotification);
}

/**
 * Cuenta las notificaciones no leídas de un usuario
 */
export async function getUnreadCount(customerId: string): Promise<number> {
  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('customer_id', customerId)
    .eq('is_read', false);

  if (error) {
    console.error('Error counting unread notifications:', error);
    throw error;
  }

  return count || 0;
}

/**
 * Marca una notificación como leída
 */
export async function markAsRead(notificationId: string): Promise<void> {
  const { error } = await supabase
    .from('notifications')
    .update({
      is_read: true,
      read_at: new Date().toISOString(),
    })
    .eq('id', notificationId);

  if (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
}

/**
 * Marca múltiples notificaciones como leídas
 */
export async function markMultipleAsRead(notificationIds: string[]): Promise<void> {
  const { error } = await supabase
    .from('notifications')
    .update({
      is_read: true,
      read_at: new Date().toISOString(),
    })
    .in('id', notificationIds);

  if (error) {
    console.error('Error marking notifications as read:', error);
    throw error;
  }
}

/**
 * Marca todas las notificaciones de un usuario como leídas
 */
export async function markAllAsRead(customerId: string): Promise<void> {
  const { error } = await supabase
    .from('notifications')
    .update({
      is_read: true,
      read_at: new Date().toISOString(),
    })
    .eq('customer_id', customerId)
    .eq('is_read', false);

  if (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
}

/**
 * Obtiene notificaciones filtradas por tipo
 */
export async function getNotificationsByType(
  customerId: string,
  type: NotificationType
): Promise<Notification[]> {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('customer_id', customerId)
    .eq('type', type)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching notifications by type:', error);
    throw error;
  }

  return (data || []).map(transformNotification);
}

/**
 * Elimina una notificación
 */
export async function deleteNotification(notificationId: string): Promise<void> {
  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('id', notificationId);

  if (error) {
    console.error('Error deleting notification:', error);
    throw error;
  }
}

/**
 * Suscripción a cambios en notificaciones (realtime)
 * Útil para mostrar notificaciones en tiempo real
 */
export function subscribeToNotifications(
  customerId: string,
  onNotification: (notification: Notification) => void
) {
  const channel = supabase
    .channel('notifications-changes')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `customer_id=eq.${customerId}`,
      },
      (payload) => {
        const notification = transformNotification(payload.new as NotificationFromDB);
        onNotification(notification);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
