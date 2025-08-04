
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
import { toast } from 'react-hot-toast';

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
    const totalMinPayment = debts.reduce((sum, debt