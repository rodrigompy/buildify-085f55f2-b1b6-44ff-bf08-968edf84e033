
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://aapzgybcottexketvbzm.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFhcHpneWJjb3R0ZXhrZXR2YnptIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM1MDA3MzgsImV4cCI6MjA2OTA3NjczOH0.AfpvOURsyao2lUtVGZtTXILMV8AzBk_uUZFWJdehjss';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Tables<T extends keyof Database['public']['Tables']> = 
  Database['public']['Tables'][T]['Row'];

// This is a simplified type definition - in a real app, you would generate these types
// from your Supabase database using the Supabase CLI
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          created_at: string;
          updated_at: string;
          avatar_url: string | null;
          currency: string;
          timezone: string;
        };
      };
      transactions: {
        Row: {
          id: string;
          user_id: string;
          amount: number;
          description: string | null;
          category: string | null;
          transaction_date: string;
          created_at: string;
          updated_at: string;
          transaction_type: 'income' | 'expense';
          is_recurring: boolean;
          recurring_id: string | null;
          notes: string | null;
        };
      };
      bills: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          amount: number;
          due_date: string;
          category: string | null;
          is_recurring: boolean;
          recurrence_interval: 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'annually' | null;
          last_paid_date: string | null;
          next_due_date: string | null;
          auto_pay: boolean;
          reminder_days: number;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
      };
      debts: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          lender: string | null;
          balance: number;
          original_balance: number | null;
          interest_rate: number;
          minimum_payment: number;
          due_date_day: number | null;
          payment_url: string | null;
          notes: string | null;
          debt_type: 'credit_card' | 'student_loan' | 'mortgage' | 'auto_loan' | 'personal_loan' | 'medical' | 'other';
          created_at: string;
          updated_at: string;
          is_paid_off: boolean;
          paid_off_date: string | null;
        };
      };
      debt_payments: {
        Row: {
          id: string;
          user_id: string;
          debt_id: string;
          amount: number;
          payment_date: string;
          is_extra_payment: boolean;
          notes: string | null;
          created_at: string;
        };
      };
    };
  };
}