import React from 'react';
import { Search } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const Navbar = ({ onSearch }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleKeyDown = (e) => {
    // Jika user menekan Enter
    if (e.key === 'Enter') {
      // Jika posisi sedang tidak di Home ("/")
      if (location.pathname !== '/') {
        // Arahkan ke Home, fungsi onSearch akan otomatis memfilter produk di sana
        navigate('/');
      }
    }
  };

  return (
    <nav className="bg-stone-900/95 backdrop-blur-md text-white py-4 px-6 sticky top-0 z-50 shadow-xl border-b border-amber-900/20">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="group">
          <h1 className="text-2xl font-serif font-bold text-amber-500 tracking-tighter group-hover:text-amber-400 transition-colors">
            Kebaya<span className="text-stone-100 font-light">Klasik</span>
          </h1>
        </Link>
        
        <div className="relative w-48 md:w-80">
          <input 
            type="text" 
            placeholder="Cari keanggunan..." 
            onChange={(e) => onSearch(e.target.value)}
            onKeyDown={handleKeyDown} // Tambahkan listener tombol di sini
            className="w-full pl-4 pr-10 py-2 rounded-xl bg-stone-800/50 border border-stone-700 focus:outline-none focus:border-amber-600 focus:bg-stone-800 text-xs text-stone-200 transition-all shadow-inner"
          />
          <Search className="absolute right-3 top-2.5 text-amber-600 pointer-events-none" size={16} />
          
          {/* Tooltip kecil penanda fungsionalitas */}
          <div className="hidden md:block absolute -bottom-5 right-0 opacity-0 group-focus-within:opacity-100 transition-opacity">
            <p className="text-[8px] text-stone-500 uppercase tracking-tighter">Tekan Enter untuk mencari</p>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;