
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Progress } from '../components/ui/progress';
import { ArrowUpIcon, ArrowDownIcon, DollarSign, Calendar, CreditCard, PieChart, BarChart3 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { supabase } from '../lib/supabase';

// Mock data - replace with actual data from Supabase
const mockTransactions = [
  { id: 1, description: 'Grocery Shopping', amount: -120.50, date: '2025-08-01', category: 'Food' },
  { id: 2, description: 'Salary Deposit', amount: 2500.00, date: '2025-07-31', category: 'Income' },
  { id: 3, description: 'Electric Bill', amount: -85.20, date: '2025-07-29', category: 'Utilities' },
  { id: 4, description: 'Restaurant', amount: -45.80, date: '2025-07-28', category: 'Food' },
];

const mockBills = [
  { id: 1, name: 'Rent', amount: 1200, dueDate: '2025-08-15', isPaid: false },
  { id: 2, name: 'Internet', amount: 65, dueDate: '2025-08-10', isPaid: false },
  { id: 3, name: 'Phone', amount: 45, dueDate: '2025-08-05', isPaid: true },
];

export default function Dashboard() {
  const { user } = useAuth();
  const [balance, setBalance] = useState(2500);
  const [income, setIncome] = useState(3200);
  const [expenses, setExpenses] = useState(1850);
  const [transactions, setTransactions] = useState(mockTransactions);
  const [upcomingBills, setUpcomingBills] = useState(mockBills);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real implementation, fetch data from Supabase here
    const fetchData = async () => {
      try {
        // Example of how to fetch transactions from Supabase
        // const { data, error } = await supabase
        //   .from('transactions')
        //   .select('*')
        //   .eq('user_id', user.id)
        //   .order('date', { ascending: false })
        //   .limit(5);
        
        // if (error) throw error;
        // setTransactions(data);
        
        // Similar fetches for balance, income, expenses, and bills would go here
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  // Calculate budget progress
  const budgetProgress = Math.min(100, Math.round((expenses / income) * 100));

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <p className="text-gray-500">Welcome back, {user?.email?.split('@')[0] || 'User'}</p>
      
      {/* Financial Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Current Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <DollarSign className="mr-2 h-4 w-4 text-gray-500" />
              <span className="text-2xl font-bold">${balance.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Monthly Income</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <ArrowUpIcon className="mr-2 h-4 w-4 text-green-500" />
              <span className="text-2xl font-bold">${income.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Monthly Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <ArrowDownIcon className="mr-2 h-4 w-4 text-red-500" />
              <span className="text-2xl font-bold">${expenses.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Budget Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Budget</CardTitle>
          <CardDescription>You've spent {budgetProgress}% of your income this month</CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={budgetProgress} className="h-2" />
          <div className="flex justify-between mt-2 text-sm">
            <span>${expenses.toFixed(2)} spent</span>
            <span>${income.toFixed(2)} income</span>
          </div>
        </CardContent>
      </Card>
      
      {/* Tabs for Recent Transactions and Upcoming Bills */}
      <Tabs defaultValue="transactions">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="transactions">Recent Transactions</TabsTrigger>
          <TabsTrigger value="bills">Upcoming Bills</TabsTrigger>
        </TabsList>
        
        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Your latest financial activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {transactions.map(transaction => (
                  <div key={transaction.id} className="flex justify-between items-center border-b pb-2">
                    <div>
                      <p className="font-medium">{transaction.description}</p>
                      <p className="text-sm text-gray-500">{transaction.date} • {transaction.category}</p>
                    </div>
                    <span className={`font-bold ${transaction.amount > 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {transaction.amount > 0 ? '+' : ''}{transaction.amount.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4">View All Transactions</Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="bills">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Bills</CardTitle>
              <CardDescription>Bills due in the next 30 days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingBills.map(bill => (
                  <div key={bill.id} className="flex justify-between items-center border-b pb-2">
                    <div>
                      <p className="font-medium">{bill.name}</p>
                      <p className="text-sm text-gray-500">Due: {bill.dueDate}</p>
                    </div>
                    <div className="flex items-center">
                      <span className="font-bold mr-2">${bill.amount.toFixed(2)}</span>
                      <span className={`text-xs px-2 py-1 rounded-full ${bill.isPaid ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {bill.isPaid ? 'Paid' : 'Upcoming'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4">View All Bills</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Button variant="outline" className="flex flex-col items-center justify-center h-24 space-y-2">
          <DollarSign className="h-6 w-6" />
          <span>New Transaction</span>
        </Button>
        <Button variant="outline" className="flex flex-col items-center justify-center h-24 space-y-2">
          <Calendar className="h-6 w-6" />
          <span>Add Bill</span>
        </Button>
        <Button variant="outline" className="flex flex-col items-center justify-center h-24 space-y-2">
          <CreditCard className="h-6 w-6" />
          <span>Manage Debts</span>
        </Button>
        <Button variant="outline" className="flex flex-col items-center justify-center h-24 space-y-2">
          <BarChart3 className="h-6 w-6" />
          <span>View Reports</span>
        </Button>
      </div>
    </div>
  );
}