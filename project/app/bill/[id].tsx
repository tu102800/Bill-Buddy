import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { useBillStore } from '../../store/billStore';

export default function BillDetailsScreen() {
  const { id } = useLocalSearchParams();
  const { bills } = useBillStore();
  const bill = bills.find(b => b.id === id);

  if (!bill) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color="#0f172a" />
          </TouchableOpacity>
          <Text style={styles.title}>Bill Not Found</Text>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>This bill could not be found.</Text>
          <TouchableOpacity
            style={styles.returnButton}
            onPress={() => router.back()}
          >
            <Text style={styles.returnButtonText}>Return to History</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const calculatePersonShare = (personTotal: number) => {
    const billSubtotal = bill.subtotal;
    const proportion = personTotal / billSubtotal;
    
    const taxShare = bill.tax * proportion;
    const tipShare = bill.tip * proportion;
    
    return {
      tax: taxShare,
      tip: tipShare,
      total: personTotal + taxShare + tipShare
    };
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.title}>Bill Details</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.billInfo}>
          <Text style={styles.billName}>{bill.name}</Text>
          <Text style={styles.date}>{formatDate(bill.date)}</Text>
          
          <View style={styles.totalContainer}>
            <View style={styles.row}>
              <Text style={styles.label}>Subtotal</Text>
              <Text style={styles.value}>{formatCurrency(bill.subtotal)}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Tax</Text>
              <Text style={styles.value}>{formatCurrency(bill.tax)}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Tip</Text>
              <Text style={styles.value}>{formatCurrency(bill.tip)}</Text>
            </View>
            <View style={[styles.row, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>{formatCurrency(bill.total)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.peopleContainer}>
          <Text style={styles.sectionTitle}>Individual Shares</Text>
          {bill.people.map((person) => {
            const share = calculatePersonShare(person.total);
            return (
              <View key={person.id} style={styles.personCard}>
                <Text style={styles.personName}>{person.name}</Text>
                <View style={styles.itemsContainer}>
                  {person.items.map((item) => (
                    <View key={item.id} style={styles.itemRow}>
                      <Text style={styles.itemName}>{item.name}</Text>
                      <Text style={styles.itemCost}>{formatCurrency(item.cost)}</Text>
                    </View>
                  ))}
                </View>
                <View style={styles.shareDetails}>
                  <View style={styles.shareRow}>
                    <Text style={styles.shareLabel}>Items Total</Text>
                    <Text style={styles.shareValue}>{formatCurrency(person.total)}</Text>
                  </View>
                  <View style={styles.shareRow}>
                    <Text style={styles.shareLabel}>Tax Share</Text>
                    <Text style={styles.shareValue}>{formatCurrency(share.tax)}</Text>
                  </View>
                  <View style={styles.shareRow}>
                    <Text style={styles.shareLabel}>Tip Share</Text>
                    <Text style={styles.shareValue}>{formatCurrency(share.tip)}</Text>
                  </View>
                  <View style={[styles.shareRow, styles.personTotal]}>
                    <Text style={styles.shareTotalLabel}>Total to Pay</Text>
                    <Text style={styles.shareTotalValue}>{formatCurrency(share.total)}</Text>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontFamily: 'VarelaRound',
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  content: {
    flex: 1,
  },
  billInfo: {
    backgroundColor: '#ffffff',
    padding: 20,
    marginBottom: 16,
  },
  billName: {
    fontFamily: 'VarelaRound',
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 8,
  },
  date: {
    fontFamily: 'VarelaRound',
    fontSize: 16,
    color: '#64748b',
    marginBottom: 16,
  },
  totalContainer: {
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    fontFamily: 'VarelaRound',
    fontSize: 16,
    color: '#64748b',
  },
  value: {
    fontFamily: 'VarelaRound',
    fontSize: 16,
    color: '#0f172a',
  },
  totalRow: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  totalLabel: {
    fontFamily: 'VarelaRound',
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  totalValue: {
    fontFamily: 'VarelaRound',
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0891b2',
  },
  peopleContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontFamily: 'VarelaRound',
    fontSize: 20,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 16,
  },
  personCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  personName: {
    fontFamily: 'VarelaRound',
    fontSize: 18,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 16,
  },
  itemsContainer: {
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  itemName: {
    fontFamily: 'VarelaRound',
    fontSize: 16,
    color: '#334155',
  },
  itemCost: {
    fontFamily: 'VarelaRound',
    fontSize: 16,
    color: '#0f172a',
  },
  shareDetails: {
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 8,
  },
  shareRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  shareLabel: {
    fontFamily: 'VarelaRound',
    fontSize: 14,
    color: '#64748b',
  },
  shareValue: {
    fontFamily: 'VarelaRound',
    fontSize: 14,
    color: '#0f172a',
  },
  personTotal: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  shareTotalLabel: {
    fontFamily: 'VarelaRound',
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
  },
  shareTotalValue: {
    fontFamily: 'VarelaRound',
    fontSize: 16,
    fontWeight: '600',
    color: '#0891b2',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontFamily: 'VarelaRound',
    fontSize: 18,
    color: '#64748b',
    marginBottom: 16,
    textAlign: 'center',
  },
  returnButton: {
    backgroundColor: '#0891b2',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  returnButtonText: {
    fontFamily: 'VarelaRound',
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});