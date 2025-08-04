
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import AppLayout from '../components/layout/AppLayout';
import { Globe } from 'lucide-react';
import { Wallet } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { error } = await signIn(email, password);
      
      if (error) {
        toast.error(error.message);
      } else {
        toast.success('Logged in successfully');
        navigate('/');
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppLayout hideNav>
      <div className="flex flex-col min-h-screen bg-gray-950 p-4">
        <div className="flex justify-end mb-4">
          <button className="flex items-center gap-2 bg-gray-800 rounded-full px-4 py-2 text-sm">
            <Globe size={16} />
            <span>🇺🇸 English</span>
          </button>
        </div>
        
        <div className="flex flex-col items-center justify-center mb-8">
          <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mb-4">
            <Wallet size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">Financial Tracker</h1>
          <p className="text-gray-400 mt-2">Manage your finances with ease</p>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <div className="flex mb-6">
            <button className="flex-1 py-3 text-center bg-blue-500 rounded-l-md text-white font-medium">
              Login
            </button>
            <Link to="/register" className="flex-1 py-3 text-center bg-gray-700 rounded-r-md text-gray