import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/auth-context';
import api from '../api/axiosInstance';
import { Feather, Menu, X, PlusCircle, LogOut, Settings, UserRound } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Server logout failed:', error);
    } finally {
      logout();
      navigate('/login');
    }
  };

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-darkBg/80 border-b border-borderDark px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex items-center justify-between h-16">
        {/* Brand Logo */}
        <Link 
          to="/" 
          className="flex items-center gap-2 text-indigo-400 font-bold text-xl tracking-tight"
        >
          <Feather className="w-6 h-6 text-indigo-500" />
          <span>DevBytes<span className="text-indigo-500">.</span></span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-6">
          <Link 
            to="/" 
            className="text-slate-300 hover:text-white transition-colors text-sm font-medium"
          >
            Articles
          </Link>
          {user ? (
            <div className="flex items-center gap-4">
              <Link 
                to="/profile" 
                className="text-slate-300 hover:text-white" title="Account settings"
              >
                <UserRound className="h-4 w-4" />
              </Link>
              {user.role?.toLowerCase() === 'admin' && <Link to="/admin" className="text-slate-300 hover:text-indigo-300" title="Administration"><Settings className="h-4 w-4" /></Link>}
              <Link
                to="/create"
                className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-3.5 py-1.5 rounded-lg transition-all shadow-md shadow-indigo-600/20"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Write Post</span>
              </Link>
              <div className="flex items-center gap-2 border-l border-borderDark pl-4">
                <img
                  src={user.avatar || 'https://api.dicebear.com/7.x/identicon/svg?seed=' + user.name}
                  alt={user.name}
                  className="w-8 h-8 rounded-full border border-indigo-500/40 object-cover"
                />
                <span className="text-sm font-medium text-slate-200">{user.name}</span>
                <button onClick={handleLogout} className="ml-2 text-slate-400 hover:text-rose-400" title="Logout">
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login" 
                className="text-sm font-medium text-slate-300 hover:text-white"
              >
                Sign In
              </Link>
              <Link to="/register" 
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-3.5 py-1.5 rounded-lg"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <div className="md:hidden">
          <button onClick={() => setIsOpen(!isOpen)} className="text-slate-300 p-1">
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="md:hidden border-t border-borderDark py-4 space-y-3 bg-darkBg">
          <Link to="/" 
            onClick={() => setIsOpen(false)} 
            className="block px-3 py-2 text-base text-slate-300 hover:bg-cardBg rounded-md"
          >
            Articles
          </Link>
          {user ? (
            <>
              <Link to="/profile" 
                onClick={() => setIsOpen(false)} 
                className="block px-3 py-2 text-slate-300 hover:text-white"
              >
                Account settings
              </Link>
              {user.role?.toLowerCase() === 'admin' && 
                <Link to="/admin" 
                  onClick={() => setIsOpen(false)} 
                  className="block px-3 py-2 text-indigo-300"
                >
                  Administration
                </Link>}
              <Link to="/create" 
                onClick={() => setIsOpen(false)} 
                className="block px-3 py-2 text-indigo-400 font-medium"
              >
                Write Post
              </Link>
              <button onClick={() => { void handleLogout(); setIsOpen(false); }} 
                className="w-full text-left px-3 py-2 text-rose-400"
              >
                Sign Out ({user.name})
              </button>
            </>
          ) : (
            <div className="flex flex-col gap-2 pt-2 px-3">
              <Link to="/login" 
                onClick={() => setIsOpen(false)} 
                className="text-center py-2 border border-borderDark rounded-md text-slate-300"
              >
                Sign In
              </Link>
              <Link to="/register" 
                onClick={() => setIsOpen(false)} 
                className="text-center py-2 bg-indigo-600 text-white rounded-md"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}

export default Navbar;