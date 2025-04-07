import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft, Check } from 'lucide-react-native';
import { useBillStore } from '../store/billStore';

export default function SummaryScreen() {
  const { currentBill, addBill } = useBillStore();

  if (!currentBill) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No bill data available</Text>
      </View>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const calculatePersonShare = (personTotal: number) => {
    const billSubtotal = currentBill.subtotal;
    const proportion = personTotal / billSubtotal;
    
    const taxShare = currentBill.tax * proportion;
    const tipShare = currentBill.tip * proportion;
    
    return {
      tax: taxShare,
      tip: tipShare,
      total: personTotal + taxShare + tipShare
    };
  };

  const handleFinish = () => {
    addBill(currentBill);
    router.replace('/(tabs)');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.title}>Bill Summary</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.billInfo}>
          <Text style={styles.billName}>{currentBill.name}</Text>
          <View style={styles.totalContainer}>
            <View style={styles.row}>
              <Text style={styles.label}>Subtotal</Text>
              <Text style={styles.value}>{formatCurrency(currentBill.subtotal)}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Tax</Text>
              <Text style={styles.value}>{formatCurrency(currentBill.tax)}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Tip</Text>
              <Text style={styles.value}>{formatCurrency(currentBill.tip)}</Text>
            </View>
            <View style={[styles.row, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>{formatCurrency(currentBill.total)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.peopleContainer}>
          <Text style={styles.sectionTitle}>Individual Shares</Text>
          {currentBill.people.map((person) => {
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

      <TouchableOpacity style={styles.finishButton} onPress={handleFinish}>
        <Check size={24} color="#ffffff" />
        <Text style={styles.finishButtonText}>Finish</Text>
      </TouchableOpacity>
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
  finishButton: {
    backgroundColor: '#0891b2',
    flexDirection: 'row',
    gap: 8,
    margin: 16,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  finishButtonText: {
    fontFamily: 'VarelaRound',
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    fontFamily: 'VarelaRound',
    fontSize: 18,
    color: '#64748b',
    textAlign: 'center',
  },
});