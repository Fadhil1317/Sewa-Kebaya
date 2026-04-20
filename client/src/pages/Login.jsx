import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LockKeyhole, ChevronLeft } from 'lucide-react'; // Pastikan lucide-react terinstall

const Login = () => {
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === 'admin123') {
      localStorage.setItem('isAdmin', 'true');
      navigate('/admin');
    } else {
      alert('Password Salah!');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDFCF8] font-sans relative overflow-hidden">
      {/* Dekorasi Latar Belakang (Aksen Batik Transparan) */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/batik-fractal.png')]"></div>
      
      {/* Lingkaran Dekoratif Halus */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-amber-100/40 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-stone-200/50 rounded-full blur-3xl"></div>

      <div className="relative w-full max-w-md px-6">
        {/* Tombol Kembali ke Beranda */}
        <button 
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-stone-400 hover:text-amber-800 transition-colors mb-8 group"
        >
          <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Kembali ke Katalog</span>
        </button>

        <div className="bg-white p-10 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-stone-100 relative overflow-hidden">
          {/* Garis Aksen Emas di Atas */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-700 via-amber-500 to-amber-900"></div>

          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-stone-50 rounded-2xl mb-6 border border-stone-100 shadow-inner">
              <LockKeyhole className="text-amber-700" size={28} />
            </div>
            <h1 className="font-serif text-3xl font-bold text-stone-800 tracking-tight">
              Akses <span className="text-amber-900">Admin</span>
            </h1>
            <div className="w-12 h-0.5 bg-amber-200 mx-auto mt-3 mb-3"></div>
            <p className="text-stone-400 text-[10px] uppercase tracking-[0.3em] font-medium">
              Kebaya Klasik Management
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-widest ml-1">
                Kunci Akses
              </label>
              <div className="relative group">
                <input 
                  type="password" 
                  className="w-full bg-stone-50 border border-stone-100 p-4 rounded-xl outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 transition-all text-center tracking-[0.5em] text-stone-800"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="w-full bg-stone-900 text-white py-4 rounded-xl font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-black hover:shadow-2xl active:scale-[0.98] transition-all duration-300 shadow-xl shadow-stone-200"
            >
              Buka Dashboard
            </button>
          </form>

          <p className="text-center mt-10 text-[9px] text-stone-300 uppercase tracking-widest leading-relaxed">
            Sistem Keamanan Terenkripsi <br />
            &copy; 2026 Kebaya Klasik Koleksi
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;