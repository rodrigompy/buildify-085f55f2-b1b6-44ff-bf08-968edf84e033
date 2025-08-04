
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
        
        <Card>
          <CardHeader>
            <CardTitle>Debt Breakdown</CardTitle>
            <CardDescription>Visual distribution of your debts</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            {debts.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value as number)} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-gray-500">
                No debt data to display
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Debts</CardTitle>
          <CardDescription>Manage your debt accounts</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4">Loading...</div>
          ) : debts.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              You haven't added any debts yet. Click "Add Debt" to get started.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-4">Name</th>
                    <th className="text-left py-2 px-4">Balance</th>
                    <th className="text-left py-2 px-4">Interest Rate</th>
                    <th className="text-left py-2 px-4">Min. Payment</th>
                    <th className="text-left py-2 px-4">Due Date</th>
                    <th className="text-right py-2 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {debts.map((debt) => (
                    <tr key={debt.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">{debt.name}</td>
                      <td className="py-3 px-4">{formatCurrency(debt.balance)}</td>
                      <td className="py-3 px-4">{debt.interest_rate}%</td>
                      <td className="py-3 px-4">{formatCurrency(debt.minimum_payment)}</td>
                      <td className="py-3 px-4">{debt.due_date || 'N/A'}</td>
                      <td className="py-3 px-4 text-right">
                        <Button variant="ghost" size="icon" onClick={() => openEditDialog(debt)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteDebt(debt.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Debt Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Debt</DialogTitle>
            <DialogDescription>
              Enter the details of your debt account.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="balance" className="text-right">Balance ($)</Label>
              <Input
                id="balance"
                name="balance"
                type="number"
                value={formData.balance}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="interest_rate" className="text-right">Interest Rate (%)</Label>
              <Input
                id="interest_rate"
                name="interest_rate"
                type="number"
                step="0.01"
                value={formData.interest_rate}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="minimum_payment" className="text-right">Min. Payment ($)</Label>
              <Input
                id="minimum_payment"
                name="minimum_payment"
                type="number"
                value={formData.minimum_payment}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="due_date" className="text-right">Due Date</Label>
              <Input
                id="due_date"
                name="due_date"
                type="date"
                value={formData.due_date}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddDebt}>Add Debt</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Debt Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Debt</DialogTitle>
            <DialogDescription>
              Update the details of your debt account.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-name" className="text-right">Name</Label>
              <Input
                id="edit-name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-balance" className="text-right">Balance ($)</Label>
              <Input
                id="edit-balance"
                name="balance"
                type="number"
                value={formData.balance}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-interest_rate" className="text-right">Interest Rate (%)</Label>
              <Input
                id="edit-interest_rate"
                name="interest_rate"
                type="number"
                step="0.01"
                value={formData.interest_rate}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-minimum_payment" className="text-right">Min. Payment ($)</Label>
              <Input
                id="edit-minimum_payment"
                name="minimum_payment"
                type="number"
                value={formData.minimum_payment}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-due_date" className="text-right">Due Date</Label>
              <Input
                id="edit-due_date"
                name="due_date"
                type="date"
                value={formData.due_date}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleEditDebt}>Update Debt</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Debts;