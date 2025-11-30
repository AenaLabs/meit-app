import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft, CheckCheck, Filter } from 'lucide-react-native';
import { useNotificationsStore } from '@/store/notificationsStore';
import { useAuthStore } from '@/store/authStore';
import NotificationCard from '@/components/NotificationCard';
import { Notification, NotificationType } from '@/services/notifications';

type FilterType = 'all' | NotificationType;

export default function NotificationsScreen() {
  const { user } = useAuthStore();
  const {
    notifications,
    unreadCount,
    isLoading,
    loadNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    subscribeToRealtimeNotifications,
    unsubscribeFromRealtimeNotifications,
  } = useNotificationsStore();

  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<FilterType>('all');

  useEffect(() => {
    if (user?.id) {
      // Cargar notificaciones iniciales
      loadNotifications(user.id);

      // Suscribirse a notificaciones en tiempo real
      subscribeToRealtimeNotifications(user.id);

      // Limpiar al desmontar
      return () => {
        unsubscribeFromRealtimeNotifications();
      };
    }
  }, [user?.id]);

  const onRefresh = async () => {
    if (!user?.id) return;
    setRefreshing(true);
    await loadNotifications(user.id);
    setRefreshing(false);
  };

  const handleNotificationPress = async (notification: Notification) => {
    // Marcar como leída
    if (!notification.isRead) {
      await markNotificationAsRead(notification.id);
    }

    // Navegar según el tipo
    switch (notification.type) {
      case 'gift_card_generated':
      case 'gift_card_redeemed':
        router.push('/(tabs)/gift-cards');
        break;
      case 'points_assigned':
        router.push('/(tabs)/profile');
        break;
      case 'challenge_completed':
      case 'customer_milestone':
        router.push('/(tabs)');
        break;
      default:
        break;
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!user?.id) return;
    await markAllNotificationsAsRead(user.id);
  };

  const filteredNotifications = React.useMemo(() => {
    if (filter === 'all') return notifications;
    return notifications.filter((n) => n.type === filter);
  }, [notifications, filter]);

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Debes iniciar sesión</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#1F2937" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Notificaciones</Text>
          {unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadBadgeText}>{unreadCount}</Text>
            </View>
          )}
        </View>
        {unreadCount > 0 && (
          <TouchableOpacity
            onPress={handleMarkAllAsRead}
            style={styles.markAllButton}
          >
            <CheckCheck size={22} color="#8B5CF6" />
          </TouchableOpacity>
        )}
      </View>

      {/* Filtros rápidos */}
      <View style={styles.filtersContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={[
            { key: 'all', label: 'Todas' },
            { key: 'gift_card_generated', label: 'Gift Cards' },
            { key: 'points_assigned', label: 'Puntos' },
            { key: 'challenge_completed', label: 'Desafíos' },
          ]}
          keyExtractor={(item) => item.key}
          contentContainerStyle={styles.filtersList}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => setFilter(item.key as FilterType)}
              style={[
                styles.filterChip,
                filter === item.key && styles.filterChipActive,
              ]}
            >
              <Text
                style={[
                  styles.filterChipText,
                  filter === item.key && styles.filterChipTextActive,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Lista de notificaciones */}
      {isLoading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8B5CF6" />
          <Text style={styles.loadingText}>Cargando notificaciones...</Text>
        </View>
      ) : filteredNotifications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Filter size={64} color="#D1D5DB" strokeWidth={1.5} />
          <Text style={styles.emptyTitle}>No hay notificaciones</Text>
          <Text style={styles.emptySubtitle}>
            {filter === 'all'
              ? 'Cuando recibas notificaciones aparecerán aquí'
              : 'No hay notificaciones de este tipo'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredNotifications}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <NotificationCard
              notification={item}
              onPress={handleNotificationPress}
            />
          )}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#8B5CF6"
            />
          }
          contentContainerStyle={styles.listContent}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 8,
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Arial Rounded MT Bold',
    color: '#1F2937',
  },
  unreadBadge: {
    backgroundColor: '#EF4444',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    minWidth: 24,
    alignItems: 'center',
  },
  unreadBadgeText: {
    color: 'white',
    fontSize: 12,
    fontFamily: 'Arial Rounded MT Bold',
  },
  markAllButton: {
    padding: 8,
  },
  filtersContainer: {
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  filtersList: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: '#8B5CF6',
  },
  filterChipText: {
    fontSize: 14,
    fontFamily: 'Lato-Light',
    color: '#6B7280',
  },
  filterChipTextActive: {
    color: 'white',
    fontWeight: '600',
  },
  listContent: {
    paddingVertical: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    fontFamily: 'Lato-Light',
    color: '#6B7280',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    marginTop: 16,
    fontSize: 18,
    fontFamily: 'Arial Rounded MT Bold',
    color: '#1F2937',
  },
  emptySubtitle: {
    marginTop: 8,
    fontSize: 14,
    fontFamily: 'Lato-Light',
    color: '#6B7280',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    fontFamily: 'Lato-Light',
    color: '#EF4444',
    textAlign: 'center',
  },
});
