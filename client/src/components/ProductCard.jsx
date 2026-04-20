import { useNavigate } from 'react-router-dom';

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const isAvailable = product.isAvailable !== false;

  return (
    <div 
      onClick={() => navigate(`/product/${product._id}`)}
      className={`group cursor-pointer bg-white rounded-t-3xl overflow-hidden border border-stone-200 transition-all duration-500 hover:border-amber-700/50 hover:shadow-2xl 
        ${!isAvailable ? 'opacity-60 grayscale-[0.8]' : ''}`}
    >
      {/* Container Gambar */}
      <div className="relative aspect-square bg-[#F9F6F0] flex items-center justify-center p-6 overflow-hidden">
        {/* Dekorasi Batik */}
        <div className="absolute inset-0 opacity-5 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/batik-fractal.png')]"></div>
        
        {/* GAMBAR: Tambahkan z-10 agar berada di bawah badge */}
        <img 
          src={product.image} 
          alt={product.name}
          className={`relative z-10 max-w-full max-h-full object-contain transition-transform duration-700 group-hover:scale-105 
            ${!isAvailable ? 'scale-90' : ''}`}
        />
        
        {/* BADGE KATEGORI: Tambahkan z-20 agar melayang di atas gambar */}
        <div className="absolute top-3 left-3 z-20 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full shadow-md border border-stone-100">
           <p className="text-[9px] font-bold uppercase tracking-widest text-amber-900">{product.category}</p>
        </div>

        {/* Badge STATUS (saat tidak tersedia) */}
        {!isAvailable && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-stone-900/10">
            <div className="bg-amber-900/90 text-white px-4 py-1.5 rounded-full shadow-2xl scale-110">
               <p className="text-[10px] font-bold uppercase tracking-[0.2em]">Sedang Disewa</p>
            </div>
          </div>
        )}
      </div>

      <div className="p-5 text-center bg-white">
        <h3 className={`text-sm font-serif font-semibold transition-colors duration-300 
          ${isAvailable ? 'text-stone-800 group-hover:text-amber-900' : 'text-stone-400'}`}>
          {product.name}
        </h3>
        <div className={`w-8 h-px bg-amber-200 mx-auto my-2 transition-all duration-500 
          ${isAvailable ? 'group-hover:w-16' : 'opacity-0'}`}></div>
        <p className={`font-bold text-base ${isAvailable ? 'text-amber-900' : 'text-stone-400'}`}>
          {isAvailable ? `Rp ${product.price?.toLocaleString()}` : "Tidak Tersedia"}
        </p>
      </div>
    </div>
  );
};

export default ProductCard;