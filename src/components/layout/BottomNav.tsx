
import { Link, useLocation } from 'react-router-dom';
import { Home, ListChecks, Calendar, BarChart2 } from 'lucide-react';

export default function BottomNav() {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 py-2 px-4">
      <div className="flex justify-between items-center max-w-md mx-auto">
        <Link 
          to="/" 
          className={`flex flex-col items-center p-2 ${isActive('/') ? 'text-blue-500' : 'text-gray-400'}`}
        >
          <Home size={20} />
          <span className="text-xs mt-1">Dashboard</span>
        </Link>
        
        <Link 
          to="/transactions" 
          className={`flex flex-col items-center p-2 ${isActive('/transactions') ? 'text-blue-500' : 'text-gray-400'}`}
        >
          <ListChecks size={20} />
          <span className="text-xs mt-1">Transactions</span>
        </Link>
        
        <Link 
          to="/bills" 
          className={`flex flex-col items-center p-2 ${isActive('/bills') ? 'text-blue-500' : 'text-gray-400'}`}
        >
          <Calendar size={20} />
          <span className="text-xs mt-1">Bills</span>
        </Link>
        
        <Link 
          to="/stats" 
          className={`flex flex-col items-center p-2 ${isActive('/stats') ? 'text-blue-500' : 'text-gray-400'}`}
        >
          <BarChart2 size={20} />
          <span className="text-xs mt-1">Stats</span>
        </Link>
      </div>
    </nav>
  );
}