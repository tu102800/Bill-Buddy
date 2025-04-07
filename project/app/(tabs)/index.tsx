import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useBillStore } from '../../store/billStore';

export default function NewBillScreen() {
  const { billCount, incrementBillCount, setCurrentBill } = useBillStore();
  const [billName, setBillName] = useState(`Bill #${billCount}`);
  const [subtotal, setSubtotal] = useState('');
  const [tax, setTax] = useState('');
  const [tip, setTip] = useState('');

  const getTaxPercentage = () => {
    const subtotalNum = parseFloat(subtotal) || 0;
    const taxNum = parseFloat(tax) || 0;
    return subtotalNum > 0 ? ((taxNum / subtotalNum) * 100).toFixed(1) : '0.0';
  };

  const getTipPercentage = () => {
    const subtotalNum = parseFloat(subtotal) || 0;
    const taxNum = parseFloat(tax) || 0;
    const tipNum = parseFloat(tip) || 0;
    return (subtotalNum + taxNum) > 0 ? ((tipNum / (subtotalNum + taxNum)) * 100).toFixed(1) : '0.0';
  };

  const formatNumberInput = (text: string) => {
    // Remove any non-numeric characters
    const numbers = text.replace(/[^\d]/g, '');
    
    if (numbers.length === 0) return '';
    
    // Convert to a number with 2 decimal places
    const amount = (parseInt(numbers) / 100).toFixed(2);
    return amount;
  };

  const handleSubtotalChange = (text: string) => {
    setSubtotal(formatNumberInput(text));
  };

  const handleTaxChange = (text: string) => {
    setTax(formatNumberInput(text));
  };

  const handleTipChange = (text: string) => {
    setTip(formatNumberInput(text));
  };

  const formatCurrency = (amount: string | number) => {
    const value = typeof amount === 'string' ? parseFloat(amount) || 0 : amount;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const getTotal = () => {
    const subtotalNum = parseFloat(subtotal) || 0;
    const taxNum = parseFloat(tax) || 0;
    const tipNum = parseFloat(tip) || 0;
    return subtotalNum + taxNum + tipNum;
  };

  const handleCreate = () => {
    const newBill = {
      id: Date.now().toString(),
      name: billName,
      subtotal: parseFloat(subtotal) || 0,
      tax: parseFloat(tax) || 0,
      tip: parseFloat(tip) || 0,
      total: getTotal(),
      people: [],
      date: new Date(),
    };
    setCurrentBill(newBill);
    incrementBillCount();
    router.push('/add-people');
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 120 : 20}
    >
      <ScrollView style={styles.scrollView}>
        <Text style={styles.title}>Create New Bill</Text>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Bill Name</Text>
          <TextInput
            style={styles.input}
            value={billName}
            onChangeText={setBillName}
            placeholder="Enter bill name"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Subtotal</Text>
          <TextInput
            style={styles.input}
            value={subtotal}
            onChangeText={handleSubtotalChange}
            placeholder="0.00"
            keyboardType="number-pad"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Tax ({getTaxPercentage()}%)</Text>
          <TextInput
            style={styles.input}
            value={tax}
            onChangeText={handleTaxChange}
            placeholder="0.00"
            keyboardType="number-pad"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Tip ({getTipPercentage()}%)</Text>
          <TextInput
            style={styles.input}
            value={tip}
            onChangeText={handleTipChange}
            placeholder="0.00"
            keyboardType="number-pad"
          />
        </View>

        <View style={styles.summaryContainer}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal:</Text>
            <Text style={styles.summaryValue}>{formatCurrency(subtotal)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tax:</Text>
            <Text style={styles.summaryValue}>{formatCurrency(tax)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tip:</Text>
            <Text style={styles.summaryValue}>{formatCurrency(tip)}</Text>
          </View>
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total:</Text>
            <Text style={styles.totalValue}>{formatCurrency(getTotal())}</Text>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.createButton,
              (!subtotal || parseFloat(subtotal) <= 0) && styles.createButtonDisabled
            ]}
            onPress={handleCreate}
            disabled={!subtotal || parseFloat(subtotal) <= 0}
          >
            <Text style={styles.createButtonText}>Create</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontFamily: 'VarelaRound',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    color: '#0f172a',
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontFamily: 'VarelaRound',
    fontSize: 16,
    marginBottom: 8,
    color: '#334155',
  },
  input: {
    fontFamily: 'VarelaRound',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  summaryContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  summaryLabel: {
    fontFamily: 'VarelaRound',
    fontSize: 16,
    color: '#64748b',
  },
  summaryValue: {
    fontFamily: 'VarelaRound',
    fontSize: 16,
    color: '#0f172a',
    fontWeight: '500',
  },
  totalRow: {
    marginTop: 8,
    paddingTop: 12,
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0891b2',
  },
  buttonContainer: {
    marginBottom: Platform.OS === 'ios' ? 20 : 0,
  },
  createButton: {
    backgroundColor: '#0891b2',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  createButtonDisabled: {
    backgroundColor: '#94a3b8',
  },
  createButtonText: {
    fontFamily: 'VarelaRound',
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});