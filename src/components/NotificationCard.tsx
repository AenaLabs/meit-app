import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Gift,
  CreditCard,
  Award,
  TrendingUp,
  CheckCircle2,
  Users,
  Bell,
} from 'lucide-react-native';
import { Notification, NotificationType } from '@/services/notifications';

interface NotificationCardProps {
  notification: Notification;
  onPress?: (notification: Notification) => void;
  onDelete?: (notificationId: string) => void;
}

/**
 * Retorna el icono y colores según el tipo de notificación
 */
function getNotificationStyle(type: NotificationType) {
  switch (type) {
    case 'gift_card_generated':
      return {
        icon: Gift,
        colors: ['#8B5CF6', '#6D28D9'] as [string, string], // Púrpura
        bgColor: '#F3E8FF',
        iconColor: '#8B5CF6',
      };
    case 'gift_card_redeemed':
      return {
        icon: CreditCard,
        colors: ['#10B981', '#059669'] as [string, string], // Verde
        bgColor: '#D1FAE5',
        iconColor: '#10B981',
      };
    case 'points_assigned':
      return {
        icon: TrendingUp,
        colors: ['#F59E0B', '#D97706'] as [string, string], // Naranja
        bgColor: '#FEF3C7',
        iconColor: '#F59E0B',
      };
    case 'challenge_completed':
      return {
        icon: Award,
        colors: ['#3B82F6', '#2563EB'] as [string, string], // Azul
        bgColor: '#DBEAFE',
        iconColor: '#3B82F6',
      };
    case 'customer_milestone':
      return {
        icon: CheckCircle2,
        colors: ['#EC4899', '#DB2777'] as [string, string], // Rosa
        bgColor: '#FCE7F3',
        iconColor: '#EC4899',
      };
    case 'checkin':
      return {
        icon: Users,
        colors: ['#14B8A6', '#0D9488'] as [string, string], // Teal
        bgColor: '#CCFBF1',
        iconColor: '#14B8A6',
      };
    default:
      return {
        icon: Bell,
        colors: ['#6B7280', '#4B5563'] as [string, string], // Gris
        bgColor: '#F3F4F6',
        iconColor: '#6B7280',
      };
  }
}

/**
 * Formatea la fecha de forma relativa (hace 5 min, hace 1 hora, etc.)
 */
function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Ahora';
  if (diffMins < 60) return `Hace ${diffMins} min`;
  if (diffHours < 24) return `Hace ${diffHours} ${diffHours === 1 ? 'hora' : 'horas'}`;
  if (diffDays < 7) return `Hace ${diffDays} ${diffDays === 1 ? 'día' : 'días'}`;

  return date.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  });
}

export default function NotificationCard({
  notification,
  onPress,
  onDelete,
}: NotificationCardProps) {
  const style = getNotificationStyle(notification.type);
  const Icon = style.icon;

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => onPress?.(notification)}
      style={styles.container}
    >
      <LinearGradient
        colors={style.colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {/* Indicador de no leído */}
        {!notification.isRead && (
          <View style={styles.unreadIndicator} />
        )}

        {/* Icono */}
        <View style={[styles.iconContainer, { backgroundColor: style.bgColor }]}>
          <Icon size={24} color={style.iconColor} strokeWidth={2.5} />
        </View>

        {/* Contenido */}
        <View style={styles.content}>
          <Text
            style={[
              styles.title,
              !notification.isRead && styles.titleUnread,
            ]}
            numberOfLines={1}
          >
            {notification.title}
          </Text>
          <Text style={styles.message} numberOfLines={2}>
            {notification.message}
          </Text>
          <Text style={styles.time}>
            {formatRelativeTime(notification.createdAt)}
          </Text>
        </View>

        {/* Badge de prioridad (solo si es alta o urgente) */}
        {(notification.priority === 'high' || notification.priority === 'urgent') && (
          <View
            style={[
              styles.priorityBadge,
              notification.priority === 'urgent' && styles.priorityUrgent,
            ]}
          >
            <Text style={styles.priorityText}>
              {notification.priority === 'urgent' ? '⚡' : '⭐'}
            </Text>
          </View>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    position: 'relative',
  },
  unreadIndicator: {
    position: 'absolute',
    top: 12,
    left: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FBBF24', // Amarillo brillante
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginLeft: 8, // Espacio para el indicador de no leído
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontFamily: 'Arial Rounded MT Bold',
    color: 'white',
    marginBottom: 4,
  },
  titleUnread: {
    fontWeight: '700',
  },
  message: {
    fontSize: 13,
    fontFamily: 'Lato-Light',
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 18,
    marginBottom: 6,
  },
  time: {
    fontSize: 11,
    fontFamily: 'Lato-Light',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  priorityBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  priorityUrgent: {
    backgroundColor: 'rgba(239, 68, 68, 0.9)', // Rojo para urgente
  },
  priorityText: {
    fontSize: 12,
  },
});
