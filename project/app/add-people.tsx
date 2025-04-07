import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, KeyboardAvoidingView, Platform, Modal } from 'react-native';
import { router } from 'expo-router';
import { Plus, Trash2, ArrowLeft, Square as SplitSquare, X, User, DollarSign } from 'lucide-react-native';
import { useBillStore } from '../store/billStore';

export default function AddPeopleScreen() {
  const { currentBill, setCurrentBill } = useBillStore();
  const [people, setPeople] = useState<Array<{ id: string; name: string; items: any[]; total: number }>>([]);
  const [newPersonName, setNewPersonName] = useState('');
  const [newItemName, setNewItemName] = useState('');
  const [newItemCost, setNewItemCost] = useState('');
  const [selectedPerson, setSelectedPerson] = useState<string | null>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatNumberInput = (text: string) => {
    // Remove any non-numeric characters
    const numbers = text.replace(/[^\d]/g, '');
    
    if (numbers.length === 0) return '';
    
    // Convert to a number with 2 decimal places
    const amount = (parseInt(numbers) / 100).toFixed(2);
    return amount;
  };

  const handleAddPerson = () => {
    if (newPersonName.trim()) {
      const newPeople = [
        ...people,
        { id: Date.now().toString(), name: newPersonName.trim(), items: [], total: 0 }
      ].sort((a, b) => a.name.localeCompare(b.name));
      setPeople(newPeople);
      setNewPersonName('');
      
      if (currentBill) {
        setCurrentBill({
          ...currentBill,
          people: newPeople
        });
      }
    }
  };

  const handleRemovePerson = (id: string) => {
    const newPeople = people.filter(person => person.id !== id);
    setPeople(newPeople);
    if (selectedPerson === id) {
      setSelectedPerson(null);
    }
    
    if (currentBill) {
      setCurrentBill({
        ...currentBill,
        people: newPeople
      });
    }
  };

  const handleRemoveItem = (personId: string, itemId: string) => {
    const newPeople = people.map(person => {
      if (person.id === personId) {
        const newItems = person.items.filter(item => item.id !== itemId);
        return {
          ...person,
          items: newItems,
          total: newItems.reduce((sum, item) => sum + item.cost, 0)
        };
      }
      return person;
    });
    
    setPeople(newPeople);
    if (currentBill) {
      setCurrentBill({
        ...currentBill,
        people: newPeople
      });
    }
  };

  const handleAddItem = () => {
    if (selectedPerson && newItemName.trim() && newItemCost.trim()) {
      const cost = parseFloat(newItemCost);
      if (!isNaN(cost) && cost > 0) {
        const newPeople = people.map(person => {
          if (person.id === selectedPerson) {
            const newItems = [...person.items, {
              id: Date.now().toString(),
              name: newItemName.trim(),
              cost: cost
            }];
            return {
              ...person,
              items: newItems,
              total: newItems.reduce((sum, item) => sum + item.cost, 0)
            };
          }
          return person;
        }).sort((a, b) => a.name.localeCompare(b.name));
        
        setPeople(newPeople);
        if (currentBill) {
          setCurrentBill({
            ...currentBill,
            people: newPeople
          });
        }
        
        setNewItemName('');
        setNewItemCost('');

        // Calculate total assigned after adding the new item
        const newTotalAssigned = newPeople.reduce((sum, person) => sum + person.total, 0);
        const newRemainingAmount = (currentBill?.subtotal || 0) - newTotalAssigned;

        // If remaining amount is 0 or less, close the modal
        if (newRemainingAmount <= 0) {
          setSelectedPerson(null);
        }
      }
    }
  };

  const handleCostChange = (text: string) => {
    setNewItemCost(formatNumberInput(text));
  };

  const handleSplitEvenly = () => {
    if (people.length === 0 || !currentBill) return;

    const totalAssigned = people.reduce((sum, person) => sum + person.total, 0);
    const remainingAmount = currentBill.subtotal - totalAssigned;
    const splitAmount = remainingAmount / people.length;

    const newPeople = people.map(person => {
      const newItems = [...person.items];
      if (splitAmount > 0) {
        newItems.push({
          id: Date.now().toString() + person.id,
          name: 'Split Share',
          cost: splitAmount
        });
      }
      return {
        ...person,
        items: newItems,
        total: newItems.reduce((sum, item) => sum + item.cost, 0)
      };
    }).sort((a, b) => a.name.localeCompare(b.name));

    setPeople(newPeople);
    setCurrentBill({
      ...currentBill,
      people: newPeople
    });
  };

  const totalAssigned = people.reduce((sum, person) => sum + person.total, 0);
  const remainingAmount = (currentBill?.subtotal || 0) - totalAssigned;

  const sortedPeople = [...people].sort((a, b) => a.name.localeCompare(b.name));
  const selectedPersonData = selectedPerson ? people.find(p => p.id === selectedPerson) : null;

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 120 : 20}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.title}>{currentBill?.name}</Text>
      </View>

      <View style={styles.summaryContainer}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Subtotal</Text>
          <Text style={styles.summaryValue}>{formatCurrency(currentBill?.subtotal || 0)}</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Tax</Text>
          <Text style={styles.summaryValue}>{formatCurrency(currentBill?.tax || 0)}</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Tip</Text>
          <Text style={styles.summaryValue}>{formatCurrency(currentBill?.tip || 0)}</Text>
        </View>
        <View style={styles.summaryTotal}>
          <Text style={styles.summaryTotalLabel}>Total</Text>
          <Text style={styles.summaryTotalValue}>{formatCurrency(currentBill?.total || 0)}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Add People</Text>
        <View style={styles.addPersonContainer}>
          <TextInput
            style={styles.input}
            value={newPersonName}
            onChangeText={setNewPersonName}
            placeholder="Enter name"
          />
          <TouchableOpacity
            style={[styles.addButton, !newPersonName.trim() && styles.addButtonDisabled]}
            onPress={handleAddPerson}
            disabled={!newPersonName.trim()}
          >
            <Plus size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.peopleList}>
        {sortedPeople.map(person => (
          <TouchableOpacity
            key={person.id}
            style={[
              styles.personCard,
              selectedPerson === person.id && styles.selectedPersonCard
            ]}
            onPress={() => setSelectedPerson(person.id)}
          >
            <View style={styles.personHeader}>
              <Text style={styles.personName}>{person.name}</Text>
              <TouchableOpacity
                onPress={() => handleRemovePerson(person.id)}
                style={styles.removeButton}
              >
                <Trash2 size={20} color="#ef4444" />
              </TouchableOpacity>
            </View>
            {person.items.map(item => (
              <View key={item.id} style={styles.itemRow}>
                <Text style={styles.itemName}>{item.name}</Text>
                <View style={styles.itemActions}>
                  <Text style={styles.itemCost}>{formatCurrency(item.cost)}</Text>
                  <TouchableOpacity
                    onPress={() => handleRemoveItem(person.id, item.id)}
                    style={styles.removeItemButton}
                  >
                    <X size={16} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
            <Text style={styles.personTotal}>
              Total: {formatCurrency(person.total)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Modal
        visible={selectedPerson !== null}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSelectedPerson(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.selectedPersonHeader}>
                <User size={20} color="#0891b2" />
                <Text style={styles.selectedPersonName}>
                  Adding items for {selectedPersonData?.name}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setSelectedPerson(null)}
                style={styles.closeButton}
              >
                <X size={24} color="#64748b" />
              </TouchableOpacity>
            </View>

            {selectedPersonData?.items.length ? (
              <View style={styles.currentItems}>
                <Text style={styles.currentItemsLabel}>Current Items:</Text>
                <View style={styles.currentItemsList}>
                  {selectedPersonData.items.map((item) => (
                    <View key={item.id} style={styles.currentItemRow}>
                      <Text style={styles.currentItemName}>{item.name}</Text>
                      <View style={styles.currentItemActions}>
                        <Text style={styles.currentItemCost}>{formatCurrency(item.cost)}</Text>
                        <TouchableOpacity
                          onPress={() => handleRemoveItem(selectedPerson, item.id)}
                          style={styles.removeItemButton}
                        >
                          <X size={16} color="#ef4444" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                  <View style={styles.currentItemsTotal}>
                    <Text style={styles.currentItemsTotalLabel}>Total</Text>
                    <Text style={styles.currentItemsTotalValue}>
                      {formatCurrency(selectedPersonData.total)}
                    </Text>
                  </View>
                </View>
              </View>
            ) : null}

            <View style={styles.addItemContainer}>
              <View style={styles.inputsContainer}>
                <TextInput
                  style={styles.itemInput}
                  value={newItemName}
                  onChangeText={setNewItemName}
                  placeholder="Item name"
                />
                <View style={styles.costInputContainer}>
                  <DollarSign size={16} color="#64748b" style={styles.costInputIcon} />
                  <TextInput
                    style={styles.costInput}
                    value={newItemCost}
                    onChangeText={handleCostChange}
                    placeholder="0.00"
                    keyboardType="number-pad"
                    maxLength={10}
                  />
                </View>
              </View>
              <TouchableOpacity
                style={[
                  styles.addItemButton,
                  (!newItemName.trim() || !newItemCost.trim()) && styles.addButtonDisabled
                ]}
                onPress={handleAddItem}
                disabled={!newItemName.trim() || !newItemCost.trim()}
              >
                <Plus size={24} color="#ffffff" />
                <Text style={styles.addItemButtonText}>Add Item</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <View style={styles.bottomContainer}>
        {remainingAmount > 0 && people.length > 0 && (
          <TouchableOpacity
            style={styles.splitEvenlyButton}
            onPress={handleSplitEvenly}
          >
            <SplitSquare size={24} color="#ffffff" />
            <Text style={styles.splitEvenlyText}>
              Split Remaining {formatCurrency(remainingAmount)} Evenly
            </Text>
          </TouchableOpacity>
        )}

        {remainingAmount <= 0 && (
          <TouchableOpacity
            style={styles.continueButton}
            onPress={() => router.push('/summary')}
          >
            <Text style={styles.continueButtonText}>Continue to Summary</Text>
          </TouchableOpacity>
        )}

        <View style={styles.remainingContainer}>
          <Text style={styles.remainingLabel}>Remaining from Subtotal:</Text>
          <Text style={[
            styles.remainingAmount,
            remainingAmount <= 0 ? styles.remainingComplete : styles.remainingIncomplete
          ]}>
            {formatCurrency(remainingAmount)}
          </Text>
        </View>
      </View>
    </KeyboardAvoidingView>
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
  summaryContainer: {
    backgroundColor: '#ffffff',
    padding: 16,
    marginBottom: 16,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
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
  },
  summaryTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  summaryTotalLabel: {
    fontFamily: 'VarelaRound',
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  summaryTotalValue: {
    fontFamily: 'VarelaRound',
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0891b2',
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontFamily: 'VarelaRound',
    fontSize: 18,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 12,
  },
  addPersonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  input: {
    fontFamily: 'VarelaRound',
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  addButton: {
    backgroundColor: '#0891b2',
    width: 48,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonDisabled: {
    backgroundColor: '#94a3b8',
  },
  peopleList: {
    flex: 1,
    padding: 16,
  },
  personCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedPersonCard: {
    borderColor: '#0891b2',
  },
  personHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  personName: {
    fontFamily: 'VarelaRound',
    fontSize: 18,
    fontWeight: '600',
    color: '#0f172a',
  },
  removeButton: {
    padding: 4,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemName: {
    fontFamily: 'VarelaRound',
    fontSize: 16,
    color: '#334155',
    flex: 1,
  },
  itemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  itemCost: {
    fontFamily: 'VarelaRound',
    fontSize: 16,
    color: '#0f172a',
  },
  removeItemButton: {
    padding: 4,
  },
  personTotal: {
    fontFamily: 'VarelaRound',
    fontSize: 16,
    fontWeight: '600',
    color: '#0891b2',
    marginTop: 8,
    textAlign: 'right',
  },
  bottomContainer: {
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingBottom: Platform.OS === 'ios' ? 20 : 0,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    width: '100%',
    maxWidth: 500,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  closeButton: {
    padding: 4,
  },
  selectedPersonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  selectedPersonName: {
    fontFamily: 'VarelaRound',
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
  },
  currentItems: {
    backgroundColor: '#f1f5f9',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  currentItemsLabel: {
    fontFamily: 'VarelaRound',
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 8,
  },
  currentItemsList: {
    gap: 8,
  },
  currentItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  currentItemName: {
    fontFamily: 'VarelaRound',
    fontSize: 14,
    color: '#334155',
  },
  currentItemCost: {
    fontFamily: 'VarelaRound',
    fontSize: 14,
    color: '#0f172a',
    fontWeight: '500',
  },
  currentItemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap:  8,
  },
  currentItemsTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  currentItemsTotalLabel: {
    fontFamily: 'VarelaRound',
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
  },
  currentItemsTotalValue: {
    fontFamily: 'VarelaRound',
    fontSize: 16,
    fontWeight: '600',
    color: '#0891b2',
  },
  addItemContainer: {
    gap: 16,
  },
  inputsContainer: {
    flexDirection: 'column',
    gap: 12,
  },
  itemInput: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    fontFamily: 'VarelaRound',
  },
  costInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    width: '100%',
  },
  costInputIcon: {
    marginLeft: 12,
  },
  costInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    borderWidth: 0,
    fontFamily: 'VarelaRound',
  },
  addItemButton: {
    backgroundColor: '#0891b2',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  addItemButtonText: {
    fontFamily: 'VarelaRound',
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  splitEvenlyButton: {
    backgroundColor: '#0891b2',
    margin: 16,
    marginBottom: 8,
    padding: 16,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  splitEvenlyText: {
    fontFamily: 'VarelaRound',
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  continueButton: {
    backgroundColor: '#0891b2',
    margin: 16,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  continueButtonText: {
    fontFamily: 'VarelaRound',
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  remainingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  remainingLabel: {
    fontFamily: 'VarelaRound',
    fontSize: 16,
    color: '#64748b',
  },
  remainingAmount: {
    fontFamily: 'VarelaRound',
    fontSize: 20,
    fontWeight: 'bold',
  },
  remainingComplete: {
    color: '#059669',
  },
  remainingIncomplete: {
    color: '#dc2626',
  },
});