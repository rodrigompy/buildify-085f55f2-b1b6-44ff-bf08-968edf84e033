
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Plus, Trash2, Edit } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { formatCurrency } from '../lib/utils';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

interface Debt {
  id: string;
  name: string;
  balance: number;
  interest_rate: number;
  minimum_payment: number;
  due_date?: string;
}

const Debts = () => {
  const { user } = useAuth();
  const [debts, setDebts] = useState<Debt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentDebt, setCurrentDebt] = useState<Debt | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    balance: '',
    interest_rate: '',
    minimum_payment: '',
    due_date: ''
  });

  useEffect(() => {
    if (user) {
      fetchDebts();
    }
  }, [user]);

  const fetchDebts = async () => {
    setIsLoading(true);
    try {
      // This would be replaced with actual Supabase queries
      // For now using sample data
      const sampleDebts = [
        { id: '1', name: 'Credit Card 1', balance: 5000, interest_rate: 18.99, minimum_payment: 150, due_date: '2025-08-15' },
        { id: '2', name: 'Student Loan', balance: 15000, interest_rate: 4.5, minimum_payment: 200, due_date: '2025-08-20' },
        { id: '3', name: 'Car Loan', balance: 8000, interest_rate: 6.25, minimum_payment: 300, due_date: '2025-08-10' },
        { id: '4', name: 'Personal Loan', balance: 3000, interest_rate: 10.5, minimum_payment: 100, due_date: '2025-08-25' },
      ];
      
      setDebts(sampleDebts);
    } catch (error) {
      console.error('Error fetching debts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddDebt = async () => {
    try {
      // This would be replaced with actual Supabase insert
      const newDebt = {
        id: Date.now().toString(),
        name: formData.name,
        balance: parseFloat(formData.balance),
        interest_rate: parseFloat(formData.interest_rate),
        minimum_payment: parseFloat(formData.minimum_payment),
        due_date: formData.due_date || undefined
      };
      
      setDebts(prev => [...prev, newDebt]);
      setIsAddDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error adding debt:', error);
    }
  };

  const handleEditDebt = async () => {
    if (!currentDebt) return;
    
    try {
      // This would be replaced with actual Supabase update
      const updatedDebt = {
        ...currentDebt,
        name: formData.name,
        balance: parseFloat(formData.balance),
        interest_rate: parseFloat(formData.interest_rate),
        minimum_payment: parseFloat(formData.minimum_payment),
        due_date: formData.due_date || undefined
      };
      
      setDebts(prev => prev.map(debt => debt.id === currentDebt.id ? updatedDebt : debt));
      setIsEditDialogOpen(false);
      setCurrentDebt(null);
      resetForm();
    } catch (error) {
      console.error('Error updating debt:', error);
    }
  };

  const handleDeleteDebt = async (id: string) => {
    try {
      // This would be replaced with actual Supabase delete
      setDebts(prev => prev.filter(debt => debt.id !== id));
    } catch (error) {
      console.error('Error deleting debt:', error);
    }
  };

  const openEditDialog = (debt: Debt) => {
    setCurrentDebt(debt);
    setFormData({
      name: debt.name,
      balance: debt.balance.toString(),
      interest_rate: debt.interest_rate.toString(),
      minimum_payment: debt.minimum_payment.toString(),
      due_date: debt.due_date || ''
    });
    setIsEditDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      balance: '',
      interest_rate: '',
      minimum_payment: '',
      due_date: ''
    });
  };

  // Calculate total debt
  const totalDebt = debts.reduce((sum, debt) => sum + debt.balance, 0);
  
  // Calculate total minimum payment
  const totalMinimumPayment = debts.reduce((sum, debt) => sum + debt.minimum_payment, 0);
  
  // Prepare data for pie chart
  const pieData = debts.map((debt, index) => ({
    name: debt.name,
    value: debt.balance,
    color: COLORS[index % COLORS.length]
  }));

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Debt Tracker</h1>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Debt
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Debt</CardTitle>
            <CardDescription>Sum of all your debts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatCurrency(totalDebt)}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Monthly Minimum</CardTitle>
            <CardDescription>Total minimum payments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatCurrency(totalMinimumPayment)}</div>
          </CardContent>
        </Card>