const Hero = () => {
  const scrollToCollection = () => {
    const element = document.getElementById("katalog-produk");
    if (element) element.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="relative h-[60vh] bg-stone-950 flex items-center justify-center text-center px-4 overflow-hidden">
      {/* Pattern Batik Background */}
      <div 
        className="absolute inset-0 opacity-[0.15] bg-cover bg-center mix-blend-luminosity scale-110" 
        style={{ backgroundImage: "url('https://i.pinimg.com/1200x/61/b2/52/61b2526fd72fe5288e46536c64d4e5c2.jpg')" }}
      ></div>
      
      {/* Gradient Overlay untuk Kedalaman */}
      <div className="absolute inset-0 bg-linear-to-b from-stone-950/20 via-transparent to-stone-950/80"></div>
      
      <div className="relative z-10 space-y-6 max-w-4xl">
        <div className="flex items-center justify-center gap-4 mb-2 animate-bounce">
           <span className="h-px w-12 bg-amber-600"></span>
           <p className="text-amber-500 text-[10px] font-bold uppercase tracking-[0.5em]">Langgam Estetika Nusantara</p>
           <span className="h-px w-12 bg-amber-600"></span>
        </div>
        <h2 className="text-5xl md:text-7xl font-serif text-white leading-tight">
          Pesona <span className="italic text-amber-500">Kebaya</span> Koleksi <br/>
          Ningrat Modern
        </h2>
        <p className="text-stone-400 text-sm md:text-base max-w-xl mx-auto font-light leading-relaxed tracking-wide">
          Sewa keanggunan tanpa batas untuk wisuda, lamaran, dan pernikahan. 
          Kualitas bahan premium dengan sentuhan tangan pengrajin lokal.
        </p>
        <div className="pt-8">
          <button 
            onClick={scrollToCollection}
            className="group relative px-10 py-4 bg-amber-700 text-white font-bold rounded-full overflow-hidden transition-all shadow-2xl hover:bg-amber-600 active:scale-95"
          >
            <span className="relative z-10 text-xs uppercase tracking-widest">Jelajahi Galeri</span>
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Hero;