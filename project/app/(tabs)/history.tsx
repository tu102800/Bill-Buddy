import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useBillStore } from '../../store/billStore';

export default function HistoryScreen() {
  const { bills } = useBillStore();

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.billCard}
      onPress={() => router.push(`/bill/${item.id}`)}
    >
      <View style={styles.billHeader}>
        <Text style={styles.billName}>{item.name}</Text>
        <Text style={styles.billDate}>{formatDate(item.date)}</Text>
      </View>
      <View style={styles.billDetails}>
        <Text style={styles.billTotal}>{formatCurrency(item.total)}</Text>
        <Text style={styles.billPeople}>
          {item.people.length} {item.people.length === 1 ? 'person' : 'people'}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bill History</Text>
      {bills.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No bills yet</Text>
          <Text style={styles.emptyStateSubtext}>
            Create a new bill to get started
          </Text>
        </View>
      ) : (
        <FlatList
          data={bills}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8fafc',
  },
  title: {
    fontFamily: 'VarelaRound',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    color: '#0f172a',
  },
  listContainer: {
    gap: 16,
  },
  billCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  billHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  billName: {
    fontFamily: 'VarelaRound',
    fontSize: 18,
    fontWeight: '600',
    color: '#0f172a',
  },
  billDate: {
    fontFamily: 'VarelaRound',
    fontSize: 14,
    color: '#64748b',
  },
  billDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  billTotal: {
    fontFamily: 'VarelaRound',
    fontSize: 20,
    fontWeight: '700',
    color: '#0891b2',
  },
  billPeople: {
    fontFamily: 'VarelaRound',
    fontSize: 14,
    color: '#64748b',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateText: {
    fontFamily: 'VarelaRound',
    fontSize: 20,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontFamily: 'VarelaRound',
    fontSize: 16,
    color: '#94a3b8',
  },
});