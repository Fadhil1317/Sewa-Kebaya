const Footer = () => {
  return (
    <footer className="bg-stone-950 text-stone-400 pt-16 pb-8 border-t border-amber-900/30 w-full mt-auto">
      <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12">
        
        {/* Kolom 1: Branding */}
        <div className="space-y-6">
          <h3 className="text-amber-500 font-serif text-2xl tracking-tighter">
            Kebaya<span className="text-stone-100 font-light">Klasik</span>
          </h3>
          <p className="text-sm leading-relaxed italic font-serif text-stone-500">
            "Menghidupkan kembali tradisi melalui busana yang penuh makna dan cerita."
          </p>
          <div className="flex gap-4 pt-2">
            <span className="grayscale opacity-70 hover:opacity-100 cursor-pointer text-xl">📸</span>
            <span className="grayscale opacity-70 hover:opacity-100 cursor-pointer text-xl">🌐</span>
          </div>
        </div>

        {/* Kolom 2: Kontak - Menggunakan Emoji agar tidak error */}
        <div className="flex flex-col space-y-6">
          <h4 className="text-white text-[10px] font-bold uppercase tracking-[0.3em] pb-2 border-b border-amber-900/20 w-fit">
            Informasi Kontak
          </h4>
          <div className="space-y-4 text-[11px] uppercase tracking-widest font-medium">
            <div className="flex items-start gap-4 text-stone-300">
              <span className="text-amber-700">📍</span>
              <span>Jl. Batik Kumeli No. 123, Solo</span>
            </div>
            <div className="flex items-center gap-4 text-stone-300">
              <span className="text-amber-700">📞</span>
              <span>+62 813 9341 3417</span>
            </div>
            <div className="flex items-center gap-4 text-stone-300">
              <span className="text-amber-700">✉️</span>
              <span>halo@kebayaklasik.com</span>
            </div>
          </div>
        </div>

        {/* Kolom 3: Google Map Preview */}
        <div className="w-full h-44 rounded-2xl overflow-hidden grayscale contrast-125 opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-700 border border-stone-800 shadow-2xl">
          <iframe 
            title="Lokasi Toko"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3955.123456789!2d110.82!3d-7.56!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zN8KwMzMnMzYuMCJTIDExMMKwNDknMTIuMCJF!5e0!3m2!1sid!2sid!4v1234567890" 
            className="w-full h-full"
            style={{ border: 0 }}
            allowFullScreen="" 
            loading="lazy"
          ></iframe>
        </div>
      </div>
      
      <div className="mt-16 pt-8 border-t border-stone-900 text-center text-[9px] uppercase tracking-[0.5em] text-stone-700">
        © {new Date().getFullYear()} KebayaKlasik UMKM • Selaras dalam Budaya
      </div>
    </footer>
  );
};

export default Footer;