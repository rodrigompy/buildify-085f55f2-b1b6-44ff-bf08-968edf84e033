
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
import { formatCurrency, formatDate, calculateDaysUntil } from '../lib/utils';

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
    .reduce((total, bill) => total + bill.amount, 0);

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Bills</h1>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Bill
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Bills</CardTitle>
            <CardDescription>Bills due in the next 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatCurrency(upcomingBillsTotal)}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Next Due</CardTitle>
            <CardDescription>Your next bill payment</CardDescription>
          </CardHeader>
          <CardContent>
            {bills.filter(bill => !bill.isPaid).length > 0 ? (
              bills
                .filter(bill => !bill.isPaid)
                .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())[0] && (
                <div>
                  <div className="text-xl font-semibold">
                    {bills
                      .filter(bill => !bill.isPaid)
                      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())[0].name}
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-muted-foreground">
                      {formatDate(bills
                        .filter(bill => !bill.isPaid)
                        .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())[0].dueDate)}
                    </div>
                    <div className="text-lg font-bold">
                      {formatCurrency(bills
                        .filter(bill => !bill.isPaid)
                        .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())[0].amount)}
                    </div>
                  </div>
                </div>
              )
            ) : (
              <div className="text-muted-foreground">No upcoming bills</div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Monthly Total</CardTitle>
            <CardDescription>Total bills for this month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {formatCurrency(bills.reduce((total, bill) => total + bill.amount, 0))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end space-x-2 mb-4">
        <Button 
          variant={filter === 'all' ? 'default' : 'outline'} 
          onClick={() => setFilter('all')}
        >
          All
        </Button>
        <Button 
          variant={filter === 'unpaid' ? 'default' : 'outline'} 
          onClick={() => setFilter('unpaid')}
        >
          Unpaid
        </Button>
        <Button 
          variant={filter === 'paid' ? 'default' : 'outline'} 
          onClick={() => setFilter('paid')}
        >
          Paid
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Bills</CardTitle>
          <CardDescription>Manage your recurring and one-time bills</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">Loading bills...</div>
          ) : filteredBills.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Recurrence</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBills.map((bill) => {
                  const daysUntil = calculateDaysUntil(bill.dueDate);
                  const isOverdue = daysUntil < 0 && !bill.isPaid;
                  const isDueSoon = daysUntil >= 0 && daysUntil <= 3 && !bill.isPaid;
                  
                  return (
                    <TableRow key={bill.id}>
                      <TableCell>
                        {bill.isPaid ? (
                          <div className="flex items-center text-green-500">
                            <CheckCircleIcon className="h-5 w-5 mr-1" />
                            <span>Paid</span>
                          </div>
                        ) : isOverdue ? (
                          <div className="flex items-center text-red-500">
                            <AlertCircleIcon className="h-5 w-5 mr-1" />
                            <span>Overdue</span>
                          </div>
                        ) : isDueSoon ? (
                          <div className="flex items-center text-amber-500">
                            <CalendarIcon className="h-5 w-5 mr-1" />
                            <span>Due Soon</span>
                          </div>
                        ) : (
                          <div className="flex items-center text-blue-500">
                            <CalendarIcon className="h-5 w-5 mr-1" />
                            <span>Upcoming</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>{bill.name}</TableCell>
                      <TableCell>{formatCurrency(bill.amount)}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span>{formatDate(bill.dueDate)}</span>
                          {!bill.isPaid && (
                            <span className={`text-xs ${isOverdue ? 'text-red-500' : isDueSoon ? 'text-amber-500' : 'text-muted-foreground'}`}>
                              {isOverdue
                                ? `${Math.abs(daysUntil)} days overdue`
                                : daysUntil === 0
                                ? 'Due today'
                                : `${daysUntil} days left`}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{bill.recurrence}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleBillPaid(bill.id)}
                        >
                          {bill.isPaid ? 'Mark Unpaid' : 'Mark Paid'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No bills found</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => setIsAddDialogOpen(true)}
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Your First Bill
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Bill</DialogTitle>
            <DialogDescription>
              Add a new bill to track your recurring or one-time payments.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Bill Name</Label>
              <Input
                id="name"
                value={newBill.name}
                onChange={(e) => setNewBill({ ...newBill, name: e.target.value })}
                placeholder="e.g. Rent, Internet, etc."
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                value={newBill.amount}
                onChange={(e) => setNewBill({ ...newBill, amount: e.target.value })}
                placeholder="0.00"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={newBill.dueDate}
                onChange={(e) => setNewBill({ ...newBill, dueDate: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="recurrence">Recurrence</Label>
              <Select
                value={newBill.recurrence}
                onValueChange={(value) => setNewBill({ ...newBill, recurrence: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select recurrence" />
                </SelectTrigger>
                <SelectContent>
                  {recurrenceOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isPaid"
                checked={newBill.isPaid}
                onCheckedChange={(checked) => 
                  setNewBill({ ...newBill, isPaid: checked === true })
                }
              />
              <Label htmlFor="isPaid">Already paid</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddBill}>Add Bill</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}