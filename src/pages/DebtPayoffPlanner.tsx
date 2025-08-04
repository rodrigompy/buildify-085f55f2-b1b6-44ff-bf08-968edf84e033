
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '../components/ui/select';
import { Slider } from '../components/ui/slider';
import { Progress } from '../components/ui/progress';
import { toast } from 'sonner';
import { formatCurrency } from '../lib/utils';

// Types
interface Debt {
  id: string;
  name: string;
  balance: number;
  interest_rate: number;
  minimum_payment: number;
  user_id: string;
}

interface PayoffPlan {
  debt_id: string;
  name: string;
  starting_balance: number;
  months_to_payoff: number;
  total_interest_paid: number;
  monthly_payments: MonthlyPayment[];
}

interface MonthlyPayment {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  remaining_balance: number;
}

const DebtPayoffPlanner: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [debts, setDebts] = useState<Debt[]>([]);
  const [loading, setLoading] = useState(true);
  const [extraPayment, setExtraPayment] = useState(100);
  const [avalanchePlan, setAvalanchePlan] = useState<PayoffPlan[]>([]);
  const [snowballPlan, setSnowballPlan] = useState<PayoffPlan[]>([]);
  const [selectedMethod, setSelectedMethod] = useState('avalanche');
  const [selectedDebtId, setSelectedDebtId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    
    const fetchDebts = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('debts')
          .select('*')
          .eq('user_id', user.id)
          .order('interest_rate', { ascending: false });
          
        if (error) throw error;
        
        if (data) {
          setDebts(data);
          if (data.length > 0) {
            setSelectedDebtId(data[0].id);
          }
        }
      } catch (error) {
        console.error('Error fetching debts:', error);
        toast.error('Failed to load your debts');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDebts();
  }, [user]);

  useEffect(() => {
    if (debts.length > 0) {
      calculatePayoffPlans();
    }
  }, [debts, extraPayment]);

  const calculatePayoffPlans = () => {
    // Clone debts for calculations
    const avalancheDebts = [...debts].sort((a, b) => b.interest_rate - a.interest_rate);
    const snowballDebts = [...debts].sort((a, b) => a.balance - b.balance);
    
    // Calculate minimum payment total
    const totalMinPayment = debts.reduce((sum, debt) => sum + debt.minimum_payment, 0);
    const totalMonthlyPayment = totalMinPayment + extraPayment;
    
    // Calculate avalanche plan
    const avalanchePlanResult = calculatePayoffPlan(avalancheDebts, totalMonthlyPayment);
    setAvalanchePlan(avalanchePlanResult);
    
    // Calculate snowball plan
    const snowballPlanResult = calculatePayoffPlan(snowballDebts, totalMonthlyPayment);
    setSnowballPlan(snowballPlanResult);
  };

  const calculatePayoffPlan = (orderedDebts: Debt[], totalMonthlyPayment: number): PayoffPlan[] => {
    const plan: PayoffPlan[] = [];
    const workingDebts = [...orderedDebts].map(debt => ({
      ...debt,
      currentBalance: debt.balance,
      isPaidOff: false
    }));
    
    let month = 1;
    let allPaidOff = false;
    
    // Initialize payment tracking for each debt
    const debtPayments: Record<string, MonthlyPayment[]> = {};
    workingDebts.forEach(debt => {
      debtPayments[debt.id] = [];
    });
    
    // Continue until all debts are paid off
    while (!allPaidOff && month <= 600) { // Cap at 50 years to prevent infinite loops
      let remainingPayment = totalMonthlyPayment;
      
      // Pay minimum on all debts first
      workingDebts.forEach(debt => {
        if (debt.isPaidOff) return;
        
        const minPayment = Math.min(debt.minimum_payment, debt.currentBalance);
        const interestPayment = (debt.interest_rate / 100 / 12) * debt.currentBalance;
        const principalPayment = minPayment - interestPayment;
        
        debt.currentBalance -= principalPayment;
        remainingPayment -= minPayment;
        
        // Track payment
        debtPayments[debt.id].push({
          month,
          payment: minPayment,
          interest: interestPayment,
          principal: principalPayment,
          remaining_balance: debt.currentBalance
        });
        
        // Check if debt is paid off
        if (debt.currentBalance <= 0.01) {
          debt.isPaidOff = true;
          debt.currentBalance = 0;
        }
      });
      
      // Apply extra payment to highest priority debt
      for (const debt of workingDebts) {
        if (debt.isPaidOff || remainingPayment <= 0) continue;
        
        const extraPaymentAmount = Math.min(remainingPayment, debt.currentBalance);
        const interestPayment = 0; // Interest already accounted for in minimum payment
        const principalPayment = extraPaymentAmount;
        
        debt.currentBalance -= principalPayment;
        remainingPayment -= extraPaymentAmount;
        
        // Update the last payment record for this month
        const lastPayment = debtPayments[debt.id][debtPayments[debt.id].length - 1];
        lastPayment.payment += extraPaymentAmount;
        lastPayment.principal += principalPayment;
        lastPayment.remaining_balance = debt.currentBalance;
        
        // Check if debt is paid off
        if (debt.currentBalance <= 0.01) {
          debt.isPaidOff = true;
          debt.currentBalance = 0;
        }
        
        // Only apply extra payment to one debt per month
        break;
      }
      
      // Check if all debts are paid off
      allPaidOff = workingDebts.every(debt => debt.isPaidOff);
      month++;
    }
    
    // Create the final plan
    orderedDebts.forEach(originalDebt => {
      const payments = debtPayments[originalDebt.id];
      const totalInterestPaid = payments.reduce((sum, payment) => sum + payment.interest, 0);
      
      plan.push({
        debt_id: originalDebt.id,
        name: originalDebt.name,
        starting_balance: originalDebt.balance,
        months_to_payoff: payments.length,
        total_interest_paid: totalInterestPaid,
        monthly_payments: payments
      });
    });
    
    return plan;
  };

  const getSelectedPlan = () => {
    return selectedMethod === 'avalanche' ? avalanchePlan : snowballPlan;
  };

  const getTotalMonthsToPayoff = () => {
    const plan = getSelectedPlan();
    if (plan.length === 0) return 0;
    
    return Math.max(...plan.map(debt => debt.months_to_payoff));
  };

  const getTotalInterestPaid = () => {
    const plan = getSelectedPlan();
    return plan.reduce((sum, debt) => sum + debt.total_interest_paid, 0);
  };

  const getSelectedDebtPayments = () => {
    if (!selectedDebtId) return [];
    
    const plan = getSelectedPlan();
    const debtPlan = plan.find(d => d.debt_id === selectedDebtId);
    return debtPlan ? debtPlan.monthly_payments : [];
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
        <h2 className="text-2xl font-bold mb-4">Please log in to access this feature</h2>
        <Button onClick={() => navigate('/login')}>Log In</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <h1 className="text-3xl font-bold mb-6">Debt Payoff Planner</h1>
      
      {loading ? (
        <div className="flex justify-center my-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : debts.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No Debts Found</CardTitle>
            <CardDescription>
              You haven't added any debts yet. Add debts in the Debt Tracker to use this planner.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/debts')}>Go to Debt Tracker</Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Total Debt</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">
                  {formatCurrency(debts.reduce((sum, debt) => sum + debt.balance, 0))}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Average Interest Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">
                  {(debts.reduce((sum, debt) => sum + debt.interest_rate * debt.balance, 0) / 
                    debts.reduce((sum, debt) => sum + debt.balance, 0)).toFixed(2)}%
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Monthly Minimum</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">
                  {formatCurrency(debts.reduce((sum, debt) => sum + debt.minimum_payment, 0))}
                </p>
              </CardContent>
            </Card>
          </div>
          
          <div className="mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Extra Monthly Payment</CardTitle>
                <CardDescription>
                  How much extra can you put toward your debts each month?
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <Slider
                      value={[extraPayment]}
                      min={0}
                      max={1000}
                      step={10}
                      onValueChange={(value) => setExtraPayment(value[0])}
                      className="flex-1"
                    />
                    <div className="w-24">
                      <Input
                        type="number"
                        value={extraPayment}
                        onChange={(e) => setExtraPayment(Number(e.target.value))}
                        min={0}
                      />
                    </div>
                  </div>
                  <p className="text-sm text-gray-500">
                    Total monthly payment: {formatCurrency(debts.reduce((sum, debt) => sum + debt.minimum_payment, 0) + extraPayment)}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Tabs value={selectedMethod} onValueChange={setSelectedMethod} className="mb-8">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="avalanche">Avalanche Method</TabsTrigger>
              <TabsTrigger value="snowball">Snowball Method</TabsTrigger>
            </TabsList>
            
            <TabsContent value="avalanche">
              <Card>
                <CardHeader>
                  <CardTitle>Avalanche Method</CardTitle>
                  <CardDescription>
                    Pay minimum on all debts, then put extra money toward the highest interest rate debt first.
                    This saves the most money in interest.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-lg font-medium mb-2">Time to Debt Freedom</h3>
                        <p className="text-2xl font-bold">{getTotalMonthsToPayoff()} months</p>
                      </div>
                      <div>
                        <h3 className="text-lg font-medium mb-2">Total Interest Paid</h3>
                        <p className="text-2xl font-bold">{formatCurrency(getTotalInterestPaid())}</p>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium mb-2">Payoff Order</h3>
                      <div className="space-y-2">
                        {avalanchePlan.map((debt, index) => (
                          <div key={debt.debt_id} className="flex items-center space-x-2">
                            <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between">
                                <span>{debt.name}</span>
                                <span>{debt.months_to_payoff} months</span>
                              </div>
                              <Progress value={(debt.starting_balance - debt.monthly_payments[0]?.remaining_balance) / debt.starting_balance * 100} className="h-2 mt-1" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="snowball">
              <Card>
                <CardHeader>
                  <CardTitle>Snowball Method</CardTitle>
                  <CardDescription>
                    Pay minimum on all debts, then put extra money toward the smallest balance debt first.
                    This provides quick wins to keep you motivated.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-lg font-medium mb-2">Time to Debt Freedom</h3>
                        <p className="text-2xl font-bold">{getTotalMonthsToPayoff()} months</p>
                      </div>
                      <div>
                        <h3 className="text-lg font-medium mb-2">Total Interest Paid</h3>
                        <p className="text-2xl font-bold">{formatCurrency(getTotalInterestPaid())}</p>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium mb-2">Payoff Order</h3>
                      <div className="space-y-2">
                        {snowballPlan.map((debt, index) => (
                          <div key={debt.debt_id} className="flex items-center space-x-2">
                            <div className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between">
                                <span>{debt.name}</span>
                                <span>{debt.months_to_payoff} months</span>
                              </div>
                              <Progress value={(debt.starting_balance - debt.monthly_payments[0]?.remaining_balance) / debt.starting_balance * 100} className="h-2 mt-1" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
          
          <Card>
            <CardHeader>
              <CardTitle>Payment Schedule</CardTitle>
              <CardDescription>
                Select a debt to see its detailed payment schedule
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="debt-select">Select Debt</Label>
                  <Select 
                    value={selectedDebtId || ''} 
                    onValueChange={(value) => setSelectedDebtId(value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a debt" />
                    </SelectTrigger>
                    <SelectContent>
                      {debts.map(debt => (
                        <SelectItem key={debt.id} value={debt.id}>
                          {debt.name} - {formatCurrency(debt.balance)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {selectedDebtId && (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2">Month</th>
                          <th className="text-right py-2">Payment</th>
                          <th className="text-right py-2">Principal</th>
                          <th className="text-right py-2">Interest</th>
                          <th className="text-right py-2">Remaining</th>
                        </tr>
                      </thead>
                      <tbody>
                        {getSelectedDebtPayments().map((payment) => (
                          <tr key={payment.month} className="border-b">
                            <td className="py-2">{payment.month}</td>
                            <td className="text-right py-2">{formatCurrency(payment.payment)}</td>
                            <td className="text-right py-2">{formatCurrency(payment.principal)}</td>
                            <td className="text-right py-2">{formatCurrency(payment.interest)}</td>
                            <td className="text-right py-2">{formatCurrency(payment.remaining_balance)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default DebtPayoffPlanner;