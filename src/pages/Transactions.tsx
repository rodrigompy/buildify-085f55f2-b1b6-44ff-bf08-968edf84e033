
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { PlusIcon, SearchIcon, FilterIcon } from 'lucide-react';

// Mock data - replace with actual data from Supabase
const mockTransactions = [
  { id: 1, description: 'Grocery Shopping', amount: -120.50, date: '2025-08-01', category: 'Food' },
  { id: 2, description: 'Salary Deposit', amount: 2500.00, date: '2025-07-31', category: 'Income' },
  { id: 3, description: 'Electric Bill', amount: -85.20, date: '2025-07-29', category: 'Utilities' },
  { id: 4, description: 'Restaurant', amount: -45.80, date: '2025-07-28', category: 'Food' },
  { id: 5, description: 'Gas Station', amount: -35.40, date: '2025-07-27', category: 'Transportation' },
  { id: 6, description: 'Movie Tickets', amount: -24.00, date: '2025-07-26', category: 'Entertainment' },
  { id: 7, description: 'Online Shopping', amount: -78.90, date: '2025-07-25', category: 'Shopping' },
  { id: 8, description: 'Freelance Payment', amount: 350.00, date: '2025-07-24', category: 'Income' },
  { id: 9, description: 'Coffee Shop', amount: -4.50, date: '2025-07-23', category: 'Food' },
  { id: 10, description: 'Gym Membership', amount: -50.00, date: '2025-07-22', category: 'Health' },
];

const categories = [
  'All Categories',
  'Food',
  'Income',
  'Utilities',
  'Transportation',
  'Entertainment',
  'Shopping',
  'Health',
  'Housing',
  'Education',
  'Other'
];

export default function Transactions() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState(mockTransactions);
  const [filteredTransactions, setFilteredTransactions] = useState(mockTransactions);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newTransaction, setNewTransaction] = useState({
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    category: 'Other'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real implementation, fetch data from Supabase here
    const fetchTransactions = async () => {
      try {
        // Example of how to fetch transactions from Supabase
        // const { data, error } = await supabase
        //   .from('transactions')
        //   .select('*')
        //   .eq('user_id', user.id)
        //   .order('date', { ascending: false });
        
        // if (error) throw error;
        // setTransactions(data);
        // setFilteredTransactions(data);
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching transactions:', error);
        setLoading(false);
      }
    };

    if (user) {
      fetchTransactions();
    }
  }, [user]);

  useEffect(() => {
    // Filter transactions based on search term and category
    let filtered = transactions;
    
    if (searchTerm) {
      filtered = filtered.filter(transaction => 
        transaction.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedCategory !== 'All Categories') {
      filtered = filtered.filter(transaction => 
        transaction.category === selectedCategory
      );
    }
    
    setFilteredTransactions(filtered);
  }, [searchTerm, selectedCategory, transactions]);

  const handleAddTransaction = async () => {
    try {
      // Validate input
      if (!newTransaction.description || !newTransaction.amount || !newTransaction.date) {
        alert('Please fill in all required fields');
        return;
      }

      // In a real implementation, add transaction to Supabase
      // const { data, error } = await supabase
      //   .from('transactions')
      //   .insert([
      //     { 
      //       user_id: user.id,
      //       description: newTransaction.description,
      //       amount: parseFloat(newTransaction.amount),
      //       date: newTransaction.date,
      //       category: newTransaction.category
      //     }
      //   ]);
      
      // if (error) throw error;

      // For now, just add to local state
      const newId = Math.max(...transactions.map(t => t.id)) + 1;
      const transactionToAdd = {
        id: newId,
        description: newTransaction.description,
        amount: parseFloat(newTransaction.amount),
        date: newTransaction.date,
        category: newTransaction.category
      };
      
      setTransactions([transactionToAdd, ...transactions]);
      
      // Reset form and close dialog
      setNewTransaction({
        description: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        category: 'Other'
      });
      setIsAddDialogOpen(false);
    } catch (error) {
      console.error('Error adding transaction:', error);
      alert('Failed to add transaction');
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Transactions</h1>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusIcon className="mr-2 h-4 w-4" />
              Add Transaction
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Transaction</DialogTitle>
              <DialogDescription>
                Enter the details of your transaction below.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Description
                </Label>
                <Input
                  id="description"
                  value={newTransaction.description}
                  onChange={(e) => setNewTransaction({...newTransaction, description: e.target.value})}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="amount" className="text-right">
                  Amount
                </Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="Use negative for expenses"
                  value={newTransaction.amount}
                  onChange={(e) => setNewTransaction({...newTransaction, amount: e.target.value})}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="date" className="text-right">
                  Date
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={newTransaction.date}
                  onChange={(e) => setNewTransaction({...newTransaction, date: e.target.value})}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="category" className="text-right">
                  Category
                </Label>
                <Select 
                  value={newTransaction.category}
                  onValueChange={(value) => setNewTransaction({...newTransaction, category: value})}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.slice(1).map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddTransaction}>
                Add Transaction
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <FilterIcon className="h-4 w-4 text-gray-500" />
              <Select 
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>
            Showing {filteredTransactions.length} of {transactions.length} transactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>{transaction.date}</TableCell>
                  <TableCell>{transaction.description}</TableCell>
                  <TableCell>{transaction.category}</TableCell>
                  <TableCell className={`text-right font-medium ${transaction.amount > 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {transaction.amount > 0 ? '+' : ''}{transaction.amount.toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
              {filteredTransactions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-4">
                    No transactions found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}