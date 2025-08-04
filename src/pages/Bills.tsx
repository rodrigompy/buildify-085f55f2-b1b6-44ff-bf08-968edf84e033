
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { Checkbox } from '../components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { PlusIcon, CalendarIcon, AlertCircleIcon, CheckCircleIcon } from 'lucide-react';

// Mock data - replace with actual data from Supabase
const mockBills = [
  { id: 1, name: 'Rent', amount: 1200, dueDate: '2025-08-15', isPaid: false, recurrence: 'Monthly' },
  { id: 2, name: 'Internet', amount: 65, dueDate: '2025-08-10', isPaid: false, recurrence: 'Monthly' },
  { id: 3, name: 'Phone', amount: 45, dueDate: '2025-08-05', isPaid: true, recurrence: 'Monthly' },
  { id: 4, name: 'Electricity', amount: 85, dueDate: '2025-08-20', isPaid: false, recurrence: 'Monthly' },
  { id: 5, name: 'Water', amount: 40, dueDate: '2025-08-25', isPaid: false, recurrence: 'Monthly' },
  { id: 6, name: 'Gym Membership', amount: 50, dueDate: '2025-08-01', isPaid: true, recurrence: 'Monthly' },
  { id: 7, name: 'Streaming Service', amount: 15, dueDate: '2025-08-12', isPaid: false, recurrence: 'Monthly' },
  { id: 8, name: 'Car Insurance', amount: 120, dueDate: '2025-08-18', isPaid: false, recurrence: 'Monthly' },
];

const recurrenceOptions = [
  'One-time',
  'Weekly',
  'Bi-weekly',
  'Monthly',
  'Quarterly',
  'Yearly'
];

export default function Bills() {
  const { user } = useAuth();
  const [bills, setBills] = useState(mockBills);
  const [filter, setFilter] = useState('all'); // 'all', 'paid', 'unpaid'
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newBill, setNewBill] = useState({
    name: '',
    amount: '',
    dueDate: new Date().toISOString().split('T')[0],
    recurrence: 'Monthly',
    isPaid: false
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real implementation, fetch data from Supabase here
    const fetchBills = async () => {
      try {
        // Example of how to fetch bills from Supabase
        // const { data, error } = await supabase
        //   .from('bills')
        //   .select('*')
        //   .eq('user_id', user.id)
        //   .order('dueDate', { ascending: true });
        
        // if (error) throw error;
        // setBills(data);
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching bills:', error);
        setLoading(false);
      }
    };

    if (user) {
      fetchBills();
    }
  }, [user]);

  const filteredBills = bills.filter(bill => {
    if (filter === 'all') return true;
    if (filter === 'paid') return bill.isPaid;
    if (filter === 'unpaid') return !bill.isPaid;
    return true;
  });

  const handleAddBill = async () => {
    try {
      // Validate input
      if (!newBill.name || !newBill.amount || !newBill.dueDate) {
        alert('Please fill in all required fields');
        return;
      }

      // In a real implementation, add bill to Supabase
      // const { data, error } = await supabase
      //   .from('bills')
      //   .insert([
      //     { 
      //       user_id: user.id,
      //       name: newBill.name,
      //       amount: parseFloat(newBill.amount),
      //       dueDate: newBill.dueDate,
      //       recurrence: newBill.recurrence,
      //       isPaid: newBill.isPaid
      //     }
      //   ]);
      
      // if (error) throw error;

      // For now, just add to local state
      const newId = Math.max(...bills.map(b => b.id)) + 1;
      const billToAdd = {
        id: newId,
        name: newBill.name,
        amount: parseFloat(newBill.amount),
        dueDate: newBill.dueDate,
        recurrence: newBill.recurrence,
        isPaid: newBill.isPaid
      };
      
      setBills([...bills, billToAdd]);
      
      // Reset form and close dialog
      setNewBill({
        name: '',
        amount: '',
        dueDate: new Date().toISOString().split('T')[0],
        recurrence: 'Monthly',
        isPaid: false
      });
      setIsAddDialogOpen(false);
    } catch (error) {
      console.error('Error adding bill:', error);
      alert('Failed to add bill');
    }
  };

  const toggleBillPaid = async (id: number) => {
    try {
      // Find the bill to update
      const billToUpdate = bills.find(bill => bill.id === id);
      if (!billToUpdate) return;

      // In a real implementation, update bill in Supabase
      // const { error } = await supabase
      //   .from('bills')
      //   .update({ isPaid: !billToUpdate.isPaid })
      //   .eq('id', id)
      //   .eq('user_id', user.id);
      
      // if (error) throw error;

      // Update local state
      setBills(bills.map(bill => 
        bill.id === id ? { ...bill, isPaid: !bill.isPaid } : bill
      ));
    } catch (error) {
      console.error('Error updating bill:', error);
      alert('Failed to update bill');
    }
  };

  // Calculate upcoming bills total
  const upcomingBillsTotal = bills
    .filter(bill => !bill.isPaid)
    .reduce((total, bill