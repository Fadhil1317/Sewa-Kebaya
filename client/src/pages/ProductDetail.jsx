import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, MessageCircle, ArrowLeft, ShieldCheck, Clock } from 'lucide-react';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [duration, setDuration] = useState(1); // State untuk durasi sewa

  useEffect(() => {
    window.scrollTo(0, 0);
    fetch('http://127.0.0.1:5000/api/products')
      .then(res => res.json())
      .then(data => {
        const found = data.find(p => p._id === id);
        setProduct(found);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDFCF8]">
      <div className="animate-pulse font-serif italic text-amber-900">Menyampirkan Kain...</div>
    </div>
  );
  
  if (!product) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FDFCF8]">
      <p className="font-serif text-xl text-stone-600">Koleksi tidak ditemukan.</p>
      <button onClick={() => navigate('/')} className="mt-4 px-8 py-3 bg-stone-900 text-white rounded-full uppercase text-xs tracking-widest font-bold">Kembali Ke Galeri</button>
    </div>
  );

  const isAvailable = product.isAvailable !== false;
  const totalPrice = (product.price || 0) * duration;

  const handleWhatsAppChat = () => {
    const message = encodeURIComponent(
      `📜 *RESERVASI SEWA KEBAYA* 📜\n` +
      `----------------------------------\n` +
      `*Produk:* ${product.name}\n` +
      `*Kategori:* ${product.category}\n` +
      `----------------------------------\n` +
      `*Durasi:* ${duration} Hari\n` +
      `*Harga/Hari:* Rp ${product.price?.toLocaleString()}\n` +
      `*ESTIMASI TOTAL:* Rp ${totalPrice.toLocaleString()}\n` +
      `----------------------------------\n\n` +
      `*Foto Produk:* ${product.image}\n` +
      `*Link Katalog:* ${window.location.href}\n\n` +
      `Halo Admin, saya ingin menanyakan ketersediaan kebaya ini untuk durasi ${duration} hari. Apakah masih kosong?`
    );
    window.open(`https://wa.me/6281393413417?text=${message}`, '_blank');
  };

  return (
    <div className="bg-[#FDFCF8] min-h-screen pb-20">
      <div className="max-w-6xl mx-auto px-6 py-8 md:py-16">
        {/* Tombol Kembali */}
        <button 
          onClick={() => navigate('/')} 
          className="mb-10 group flex items-center text-stone-500 hover:text-amber-900 transition-colors font-bold uppercase tracking-[0.2em] text-[10px]"
        >
          <ArrowLeft size={14} className="mr-2 transform group-hover:-translate-x-2 transition-transform" /> 
          Kembali ke Koleksi
        </button>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20 items-start">
          
          {/* SISI KIRI: Visual Produk */}
          <div className="relative group">
            <div className={`aspect-4/5 bg-white rounded-[2.5rem] border border-stone-200 flex items-center justify-center p-8 shadow-2xl shadow-stone-200/50 overflow-hidden transition-all duration-700 ${!isAvailable ? 'grayscale opacity-60' : ''}`}>
              {/* Tekstur Batik Overlay */}
              <div className="absolute inset-0 opacity-[0.04] bg-[url('https://www.transparenttextures.com/patterns/batik-fractal.png')]"></div>
              
              <img 
                src={product.image} 
                alt={product.name} 
                className="max-w-full max-h-full object-contain drop-shadow-2xl z-10"
              />

              {/* Status Sedang Disewa */}
              {!isAvailable && (
                <div className="absolute inset-0 z-20 flex items-center justify-center bg-stone-900/10 backdrop-blur-[2px]">
                  <div className="bg-amber-950 text-white px-8 py-3 rounded-full shadow-2xl rotate-[-5deg] border border-white/20">
                    <p className="text-xs font-bold uppercase tracking-[0.3em]">Sedang Disewa</p>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* SISI KANAN: Detail & Transaksi */}
          <div className="flex flex-col">
            <div className="mb-6 flex items-center gap-3">
              <span className="bg-amber-100 text-amber-900 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
                {product.category}
              </span>
              {isAvailable && (
                <span className="flex items-center gap-1 text-green-600 text-[10px] font-bold uppercase tracking-widest">
                  <ShieldCheck size={12} /> Ready to Rent
                </span>
              )}
            </div>

            <h1 className={`text-4xl md:text-5xl font-serif font-medium mb-4 leading-tight ${!isAvailable ? 'text-stone-400' : 'text-stone-900'}`}>
              {product.name}
            </h1>

            <p className={`text-3xl font-light mb-8 pb-8 border-b border-stone-200/60 ${!isAvailable ? 'text-stone-300' : 'text-amber-900'}`}>
              <span className="text-sm align-top mr-1 uppercase text-stone-400 font-sans">IDR</span>
              {product.price?.toLocaleString()} <span className="text-sm font-sans text-stone-400">/ Hari</span>
            </p>
            
            <div className="space-y-8 mb-10">
              <div>
                <h3 className="font-bold text-stone-400 mb-3 text-[10px] uppercase tracking-[0.2em] flex items-center gap-2">
                  <Clock size={12} /> Deskripsi Produk
                </h3>
                <p className="text-stone-700 leading-relaxed text-lg font-serif italic">
                  "{product.description || "Koleksi pilihan dengan kualitas jahitan premium, dirancang khusus untuk kenyamanan dan keanggunan pemakainya."}"
                </p>
              </div>

              {/* INPUT DURASI & TOTAL (Hanya muncul jika tersedia) */}
              {isAvailable && (
                <div className="bg-stone-50 p-6 rounded-3xl border border-stone-100 shadow-inner">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h4 className="text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-1">Pilih Durasi</h4>
                      <p className="text-xs text-stone-400">Minimal sewa 1 hari</p>
                    </div>
                    <div className="flex items-center gap-4 bg-white border border-stone-200 rounded-2xl p-2 shadow-sm">
                      <button 
                        onClick={() => setDuration(Math.max(1, duration - 1))}
                        className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-stone-100 transition-colors text-amber-900 font-bold text-xl"
                      >
                        −
                      </button>
                      <span className="text-base font-bold w-12 text-center text-stone-800">{duration} Hari</span>
                      <button 
                        onClick={() => setDuration(duration + 1)}
                        className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-stone-100 transition-colors text-amber-900 font-bold text-xl"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-between items-end pt-4 border-t border-stone-200">
                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest pb-1">Estimasi Total</span>
                    <span className="text-2xl font-serif font-bold text-amber-900">
                      Rp {totalPrice.toLocaleString()}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* TOMBOL ACTION */}
            {isAvailable ? (
              <button 
                onClick={handleWhatsAppChat}
                className="group relative overflow-hidden w-full py-5 bg-stone-900 text-white rounded-2xl font-bold uppercase tracking-widest text-xs transition-all hover:bg-amber-900 hover:shadow-2xl hover:shadow-amber-900/20 active:scale-[0.98] flex items-center justify-center gap-3"
              >
                <MessageCircle size={18} />
                Pesan via WhatsApp
              </button>
            ) : (
              <div className="w-full py-5 bg-stone-100 text-stone-400 rounded-2xl font-bold uppercase tracking-widest text-[10px] text-center border border-stone-200 flex items-center justify-center gap-2">
                <Clock size={16} /> Produk Sedang Dalam Masa Sewa
              </div>
            )}
            
            <div className="mt-8 grid grid-cols-2 gap-4">
               <div className="flex items-center gap-3 p-4 bg-white border border-stone-100 rounded-2xl shadow-sm">
                  <ShieldCheck className="text-amber-700" size={20} />
                  <div>
                    <p className="text-[9px] font-bold uppercase text-stone-400">Higienitas</p>
                    <p className="text-[10px] font-bold text-stone-700">Laundry Premium</p>
                  </div>
               </div>
               <div className="flex items-center gap-3 p-4 bg-white border border-stone-100 rounded-2xl shadow-sm">
                  <Calendar className="text-amber-700" size={20} />
                  <div>
                    <p className="text-[9px] font-bold uppercase text-stone-400">Fleksibel</p>
                    <p className="text-[10px] font-bold text-stone-700">Bisa Re-Schedule</p>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;