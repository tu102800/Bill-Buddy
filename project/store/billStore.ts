import { create } from 'zustand';

interface Item {
  id: string;
  name: string;
  cost: number;
}

interface Person {
  id: string;
  name: string;
  items: Item[];
  total: number;
}

interface Bill {
  id: string;
  name: string;
  subtotal: number;
  tax: number;
  tip: number;
  total: number;
  people: Person[];
  date: Date;
}

interface BillStore {
  bills: Bill[];
  currentBill: Bill | null;
  billCount: number;
  setCurrentBill: (bill: Bill) => void;
  addBill: (bill: Bill) => void;
  incrementBillCount: () => void;
}

export const useBillStore = create<BillStore>((set) => ({
  bills: [],
  currentBill: null,
  billCount: 1,
  setCurrentBill: (bill) => set({ currentBill: bill }),
  addBill: (bill) =>
    set((state) => ({ bills: [...state.bills, bill] })),
  incrementBillCount: () =>
    set((state) => ({ billCount: state.billCount + 1 })),
}));