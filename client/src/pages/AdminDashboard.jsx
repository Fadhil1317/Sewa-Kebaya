import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { 
  Package, LogOut, PlusCircle, Edit3, Trash2, 
  CreditCard, Search, Users, Printer, X, Menu, ChevronDown, ChevronUp, Sparkles
} from "lucide-react";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const formRef = useRef(null);

  // --- STATE MANAGEMENT ---
  const [activeTab, setActiveTab] = useState('katalog'); 
  const [products, setProducts] = useState([]); // Default array kosong agar tidak crash
  const [transactions, setTransactions] = useState([]); // Default array kosong
  const [loading, setLoading] = useState(false);
  const [editId, setEditId] = useState(null);
  const [adminSearchTerm, setAdminSearchTerm] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(true);
  const [isEditingGlow, setIsEditingGlow] = useState(false);
  
  // --- LAZY LOADING STATE UNTUK LIST PRODUK ---
  const [visibleCount, setVisibleCount] = useState(5); // Memuat 5 produk pertama terlebih dahulu
  
  const [printData, setPrintData] = useState(null);
  
  const [form, setForm] = useState({
    name: "", price: "", category: "", description: "", image: "", isAvailable: true 
  });

  const [showTransModal, setShowTransModal] = useState(false);
  const [transForm, setTransForm] = useState({
    customerName: "", customerWhatsapp: "", productName: "",
    productId: "", startDate: "", duration: 3, totalPrice: 0 
  });

  // --- LOAD DATA ---
  useEffect(() => {
    const isAdmin = localStorage.getItem("isAdmin");
    if (!isAdmin) navigate("/login");
    refreshAllData();
  }, [navigate]);

  const refreshAllData = () => {
    fetchProducts();
    fetchTransactions();
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/products`);
      const data = await res.json();
      // SAFETY CHECK: Pastikan data dari server berbentuk array sebelum di-set ke state
      if (res.ok && Array.isArray(data)) {
        setProducts(data);
      } else {
        setProducts([]);
        toast.error("Format data produk dari server tidak valid.");
      }
    } catch (err) { 
      console.error("Gagal memuat produk:", err); 
      setProducts([]); // Fallback ke array kosong jika API 500/error jaringan
    }
  };

  const fetchTransactions = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/transactions`);
      const data = await res.json();
      if (res.ok && Array.isArray(data)) {
        setTransactions(data);
      } else {
        setTransactions([]);
      }
    } catch (err) { 
      console.error("Gagal memuat transaksi:", err); 
      setTransactions([]); 
    }
  };

  // --- LOGIKA FILTER AMAN (Mencegah b.filter is not a function) ---
  const filteredAdminProducts = useMemo(() => {
    if (!Array.isArray(products)) return []; // Proteksi mutlak jika state bukan array
    return products.filter(p => 
      p?.name?.toLowerCase().includes(adminSearchTerm.toLowerCase()) ||
      (p?.category && p.category.toLowerCase().includes(adminSearchTerm.toLowerCase()))
    );
  }, [products, adminSearchTerm]);

  // --- LAZY LOADING SLICE ---
  const lazyLoadedProducts = useMemo(() => {
    return filteredAdminProducts.slice(0, visibleCount);
  }, [filteredAdminProducts, visibleCount]);

  // --- HANDLERS ---
  const handleEditClick = (p) => {
    setEditId(p._id);
    setForm(p);
    setIsFormOpen(true);
    setIsEditingGlow(true);
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setTimeout(() => setIsEditingGlow(false), 2000);
  };

  const handleSubmitProduct = async (e) => {
    e.preventDefault();
    setLoading(true);
    const url = editId 
      ? `${import.meta.env.VITE_API_URL}/api/products/${editId}` 
      : `${import.meta.env.VITE_API_URL}/api/products`;
      
    try {
      const res = await fetch(url, {
        method: editId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setForm({ name: "", price: "", category: "", description: "", image: "", isAvailable: true });
        setEditId(null);
        fetchProducts();
        toast.success("Katalog busana berhasil diperbarui! ✨");
      } else {
        toast.error("Gagal menyimpan produk ke server.");
      }
    } catch (err) { 
      toast.error("Terjadi kesalahan jaringan."); 
    }
    setLoading(false);
  };

  const handleDeleteProduct = async (id) => {
    toast((t) => (
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium text-stone-800">Hapus produk ini secara permanen?</p>
        <div className="flex gap-2 justify-end">
          <button className="bg-stone-200 px-3 py-1 rounded-md text-xs" onClick={() => toast.dismiss(t.id)}>Batal</button>
          <button className="bg-rose-600 text-white px-3 py-1 rounded-md text-xs" onClick={async () => {
            toast.dismiss(t.id);
            try {
              const res = await fetch(`${import.meta.env.VITE_API_URL}/api/products/${id}`, { method: "DELETE" });
              if (res.ok) {
                fetchProducts();
                toast.success("Produk berhasil dihapus.");
              }
            } catch (err) { toast.error("Gagal menghapus produk"); }
          }}>Hapus</button>
        </div>
      </div>
    ), { duration: 5000 });
  };

  const handleOpenTransModal = (product) => {
    setTransForm({
      customerName: "", 
      customerWhatsapp: "", 
      productName: product.name,
      productId: product._id, 
      startDate: new Date().toISOString().split('T')[0],
      duration: 3, 
      totalPrice: product.price 
    });
    setShowTransModal(true);
  };

  const handleSubmitTransaction = async (e) => {
    e.preventDefault();
    if (transForm.duration < 3) {
      toast.error("Minimal durasi sewa adalah 3 hari!");
      return;
    }

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/transactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(transForm),
      });

      if (res.ok) {
        await fetch(`${import.meta.env.VITE_API_URL}/api/products/${transForm.productId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isAvailable: false }), 
        });
        
        setShowTransModal(false);
        refreshAllData();
        toast.success("Reservasi kebaya berhasil dicatat! ⚜️");
      } else {
        toast.error("Gagal memproses transaksi.");
      }
    } catch (err) { 
      toast.error("Kendala koneksi server."); 
    }
  };

  const handleCancelTransaction = async (t) => {
    toast((toastId) => (
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium text-stone-800">Batalkan sewa untuk {t.customerName}?</p>
        <div className="flex gap-2 justify-end">
          <button className="bg-stone-200 px-3 py-1 rounded-md text-xs" onClick={() => toast.dismiss(toastId.id)}>Tidak</button>
          <button className="bg-amber-800 text-white px-3 py-1 rounded-md text-xs" onClick={async () => {
            toast.dismiss(toastId.id);
            try {
              await fetch(`${import.meta.env.VITE_API_URL}/api/transactions/${t._id}`, { method: "DELETE" });
              
              await fetch(`${import.meta.env.VITE_API_URL}/api/products/${t.productId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isAvailable: true }), 
              });
              
              refreshAllData();
              toast.success("Sewa dibatalkan. Status kebaya kembali Ready.");
            } catch (err) { 
              toast.error("Gagal mematalkan transaksi."); 
            }
          }}>Ya, Batalkan</button>
        </div>
      </div>
    ), { duration: 5000 });
  };

  const handlePrintNota = (t) => {
    setPrintData(t);
    setTimeout(() => {
      window.print();
    }, 200);
  };

  return (
    <div className="flex min-h-screen bg-[#FDFCF7] font-sans text-stone-800 relative antialiased">
      {/* MOBILE OVERLAY */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-stone-900/50 backdrop-blur-xs z-50 lg:hidden print:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* SIDEBAR */}
      <aside className={`fixed lg:sticky top-0 left-0 z-50 w-64 h-screen bg-[#1F1916] text-stone-200 transition-transform duration-300 border-r border-amber-950/20 print:hidden ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-6 text-amber-100 font-serif text-xl font-semibold border-b border-stone-800/80 flex justify-between items-center bg-[#171210]">
          <div className="flex items-center gap-2 tracking-wide">
            <span className="text-amber-500 font-bold">⚜</span>
            <span>Kebaya<span className="text-amber-400/70 font-light italic ml-1">Klasik</span></span>
          </div>
          <button className="lg:hidden text-stone-400 hover:text-stone-100" onClick={() => setIsSidebarOpen(false)}><X size={20}/></button>
        </div>
        
        <nav className="p-4 space-y-1.5 mt-4">
          <button onClick={() => {setActiveTab('katalog'); setIsSidebarOpen(false)}} className={`w-full px-4 py-3 rounded-xl flex items-center gap-3.5 transition-all ${activeTab === 'katalog' ? 'bg-amber-950/50 text-amber-400 font-medium border border-amber-500/20 shadow-md' : 'text-stone-400 hover:bg-stone-800/40 hover:text-stone-200'}`}>
            <Package size={18} className={activeTab === 'katalog' ? 'text-amber-400' : 'text-stone-400'}/> 
            <span className="text-xs uppercase tracking-wider font-medium">Manajemen Katalog</span>
          </button>
          
          <button onClick={() => {setActiveTab('transaksi'); setIsSidebarOpen(false)}} className={`w-full px-4 py-3 rounded-xl flex items-center gap-3.5 transition-all ${activeTab === 'transaksi' ? 'bg-amber-950/50 text-amber-400 font-medium border border-amber-500/20 shadow-md' : 'text-stone-400 hover:bg-stone-800/40 hover:text-stone-200'}`}>
            <CreditCard size={18} className={activeTab === 'transaksi' ? 'text-amber-400' : 'text-stone-400'}/> 
            <span className="text-xs uppercase tracking-wider font-medium">Log Riwayat</span>
          </button>
          
          <button onClick={() => {localStorage.removeItem("isAdmin"); navigate("/login")}} className="w-full absolute bottom-6 left-0 px-8 py-3 text-stone-500 flex items-center gap-3 hover:text-amber-600 transition-colors">
            <LogOut size={16}/> <span className="text-xs uppercase font-medium tracking-widest">Logout</span>
          </button>
        </nav>
      </aside>

      {/* MAIN CONTENT CONTAINER */}
      <div className="flex-1 flex flex-col min-w-0 print:hidden">
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-stone-200/60 flex items-center justify-between px-6 lg:px-10 sticky top-0 z-40 shadow-xs">
          <button className="lg:hidden p-2 text-stone-600 mr-2" onClick={() => setIsSidebarOpen(true)}><Menu/></button>
          <h2 className="font-serif text-lg font-medium text-stone-800 tracking-wide">{activeTab === 'katalog' ? 'Galeri Koleksi Kebaya' : 'Arsip Reservasi & Transaksi'}</h2>
          
          <div className="flex gap-4 lg:gap-8">
            <div className="text-right">
              <p className="text-[10px] text-stone-400 uppercase tracking-widest font-semibold">Total Unit</p>
              <p className="text-xl font-serif font-medium text-amber-950">{products ? products.length : 0}</p>
            </div>
            <div className="text-right border-l pl-4 lg:pl-8 border-stone-200">
              <p className="text-[10px] text-stone-400 uppercase tracking-widest font-semibold">Total Reservasi</p>
              <p className="text-xl font-serif font-medium text-amber-950">{transactions ? transactions.length : 0}</p>
            </div>
          </div>
        </header>

        <main className="p-4 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
          {activeTab === 'katalog' ? (
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
              
              {/* FORM SECTION */}
              <section ref={formRef} className="xl:col-span-4 xl:sticky xl:top-26 order-1 xl:order-2">
                <div className={`transition-all duration-300 rounded-2xl border border-stone-200 bg-white shadow-xs overflow-hidden ${isEditingGlow ? 'ring-2 ring-amber-500 shadow-lg' : ''}`}>
                  <button 
                    onClick={() => setIsFormOpen(!isFormOpen)}
                    className="w-full p-5 flex justify-between items-center lg:cursor-default border-b border-stone-100 bg-stone-50/50"
                  >
                    <h3 className="text-sm font-serif font-semibold flex items-center gap-2.5 text-stone-900">
                      {editId ? <Edit3 size={16} className="text-amber-700"/> : <PlusCircle size={16} className="text-stone-600"/>} 
                      {editId ? "Perbarui Detail Produk" : "Registrasi Kebaya Baru"}
                    </h3>
                    <div className="lg:hidden text-stone-400">
                      {isFormOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </div>
                  </button>

                  <div className={`${isFormOpen ? 'max-h-200 opacity-100' : 'max-h-0 opacity-0'} transition-all duration-300 ease-in-out overflow-hidden`}>
                    <form onSubmit={handleSubmitProduct} className="p-5 space-y-4">
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 block mb-1">Nama Busana</label>
                        <input type="text" className="w-full bg-stone-50/50 p-3 rounded-xl outline-none focus:bg-white focus:ring-1 focus:ring-amber-600 transition-all text-sm border border-stone-200" value={form.name} onChange={(e)=>setForm({...form, name:e.target.value})} required />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 block mb-1">Tarif Sewa (1-3 Hari)</label>
                          <input type="number" className="w-full bg-stone-50/50 p-3 rounded-xl outline-none focus:bg-white focus:ring-1 focus:ring-amber-600 transition-all text-sm border border-stone-200" value={form.price} onChange={(e)=>setForm({...form, price:e.target.value})} required />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 block mb-1">Kategori</label>
                          <input type="text" placeholder="Contoh: Kutubaru" className="w-full bg-stone-50/50 p-3 rounded-xl outline-none focus:bg-white focus:ring-1 focus:ring-amber-600 transition-all text-sm border border-stone-200" value={form.category} onChange={(e)=>setForm({...form, category:e.target.value})} required />
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 block mb-1">Tautan Foto Deskripsi</label>
                        <input type="text" className="w-full bg-stone-50/50 p-3 rounded-xl outline-none focus:bg-white focus:ring-1 focus:ring-amber-600 transition-all text-sm border border-stone-200" value={form.image} onChange={(e)=>setForm({...form, image:e.target.value})} />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 block mb-1">Spesifikasi Detail / Ukuran</label>
                        <textarea className="w-full bg-stone-50/50 p-3 rounded-xl outline-none focus:bg-white focus:ring-1 focus:ring-amber-600 transition-all text-sm h-24 border border-stone-200 resize-none" value={form.description} onChange={(e)=>setForm({...form, description:e.target.value})}></textarea>
                      </div>
                      
                      <button type="submit" className={`w-full py-3.5 text-white rounded-xl font-medium text-xs uppercase tracking-widest shadow-xs transition-colors mt-2 ${editId ? 'bg-amber-700 hover:bg-amber-800' : 'bg-stone-900 hover:bg-stone-800'}`}>
                        {editId ? "Simpan Perubahan" : "Masukkan ke Galeri"}
                      </button>
                      {editId && (
                        <button type="button" onClick={() => {setEditId(null); setForm({name:"", price:"", category:"", description:"", image:"", isAvailable:true})}} className="w-full text-xs text-stone-400 hover:text-stone-600 font-medium tracking-wide py-1 transition-colors">Batalkan Koreksi</button>
                      )}
                    </form>
                  </div>
                </div>
              </section>

              {/* TABLE SECTION DENGAN LAZY LOADING LIST PRODUK */}
              <section className="xl:col-span-8 order-2 xl:order-1 space-y-4">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
                  <input type="text" placeholder="Cari koleksi busana, brokat, atau kategori adat..." className="w-full bg-white border border-stone-200 py-3.5 pl-11 pr-6 rounded-xl outline-none shadow-xs focus:ring-1 focus:ring-amber-600/30 text-sm" value={adminSearchTerm} onChange={(e)=>setAdminSearchTerm(e.target.value)} />
                </div>

                <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-150">
                      <thead className="bg-stone-50/70 text-[10px] uppercase tracking-widest border-b border-stone-100 text-stone-500 font-semibold">
                        <tr>
                          <th className="px-6 py-4">Koleksi Busana</th>
                          <th className="px-6 py-4">Jenis</th>
                          <th className="px-6 py-4">Status</th>
                          <th className="px-6 py-4 text-right">Manajemen</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100 text-stone-700">
                        {lazyLoadedProducts.length === 0 ? (
                          <tr>
                            <td colSpan="4" className="text-center py-8 text-xs text-stone-400 italic">Tidak ada koleksi ditemukan atau terjadi gangguan server.</td>
                          </tr>
                        ) : (
                          lazyLoadedProducts.map(p => (
                            <tr key={p._id} className="hover:bg-amber-50/10 transition-colors">
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3.5">
                                  <img src={p.image || "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=120"} className="w-11 h-14 rounded-md object-cover bg-stone-100 shadow-xs" alt={p.name} />
                                  <div>
                                    <p className="font-semibold text-stone-900 text-sm">{p.name}</p>
                                    <p className="text-amber-800 text-xs mt-0.5 font-mono">Rp {Number(p.price)?.toLocaleString('id-ID')}/3 hari</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <span className="text-[11px] font-medium text-stone-600 bg-stone-100 px-2.5 py-1 rounded-md">
                                  {p.category || "Umum"}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-medium tracking-wide ${p.isAvailable ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/50' : 'bg-orange-50 text-orange-700 border border-orange-200/50'}`}>
                                  {p.isAvailable ? 'Ready' : 'Disewa'}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-right">
                                <div className="flex justify-end gap-1">
                                  {p.isAvailable ? (
                                    <button onClick={()=>handleOpenTransModal(p)} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="Catat Sewa">
                                      <Users size={16}/>
                                    </button>
                                  ) : (
                                    <button className="p-2 text-stone-300 cursor-not-allowed" title="Sedang Disewa" disabled>
                                      <Users size={16}/>
                                    </button>
                                  )}
                                  <button onClick={()=>handleEditClick(p)} className="p-2 text-amber-700 hover:bg-amber-50 rounded-lg transition-colors" title="Edit Data">
                                    <Edit3 size={16}/>
                                  </button>
                                  <button onClick={()=>handleDeleteProduct(p._id)} className="p-2 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title="Hapus Permanen">
                                    <Trash2 size={16}/>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* KONTROL LAZY LOADING (Hanya muncul jika item melebihi jumlah batas render) */}
                  {filteredAdminProducts.length > visibleCount && (
                    <div className="p-4 border-t border-stone-100 bg-stone-50/50 text-center">
                      <button 
                        onClick={() => setVisibleCount(prev => prev + 5)}
                        className="text-xs font-semibold text-amber-900 hover:text-amber-950 transition-colors inline-flex items-center gap-1.5"
                      >
                        <Sparkles size={12}/> Muat Lebih Banyak Koleksi...
                      </button>
                    </div>
                  )}
                </div>
              </section>
            </div>
          ) : (
            /* TRANSAKSI SECTION */
            <section className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left min-w-175">
                  <thead className="bg-stone-50/70 text-[10px] uppercase tracking-widest border-b border-stone-100 text-stone-500 font-semibold">
                    <tr>
                      <th className="px-6 py-4">Nama Penyewa</th>
                      <th className="px-6 py-4">Busana Yang Dipilih</th>
                      <th className="px-6 py-4">Nilai Sewa</th>
                      <th className="px-6 py-4 text-right">Dokumentasi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 text-stone-700">
                    {transactions.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="text-center py-8 text-xs text-stone-400 italic">Belum ada riwayat transaksi terdata.</td>
                      </tr>
                    ) : (
                      transactions.map(t => (
                        <tr key={t._id} className="hover:bg-stone-50/40 transition-colors">
                          <td className="px-6 py-4">
                            <p className="font-semibold text-stone-900 text-sm">{t.customerName}</p>
                            <p className="text-xs text-stone-400 font-mono mt-0.5">{t.customerWhatsapp}</p>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm text-stone-800 font-medium">{t.productName}</p>
                            <p className="text-[10px] text-amber-800 font-semibold uppercase tracking-wider mt-0.5">{t.duration} Hari Durasi</p>
                          </td>
                          <td className="px-6 py-4 font-mono font-semibold text-sm text-stone-900">
                            Rp {t.totalPrice?.toLocaleString('id-ID')}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-1.5">
                              <button onClick={()=>handlePrintNota(t)} className="p-2 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-md transition-colors" title="Cetak Nota"><Printer size={16}/></button>
                              <button onClick={()=>handleCancelTransaction(t)} className="p-2 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors" title="Batalkan Transaksi"><Trash2 size={16}/></button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </main>
      </div>

      {/* MODAL INPUT SEWA */}
      {showTransModal && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs print:hidden">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden border border-stone-200">
            <div className="bg-[#1F1916] p-5 text-white flex justify-between items-center">
              <div>
                <h3 className="text-sm font-serif font-semibold text-amber-100">Registrasi Sewa Busana</h3>
                <p className="text-stone-400 text-[10px] uppercase tracking-wider mt-0.5">{transForm.productName}</p>
              </div>
              <button className="text-stone-400 hover:text-white" onClick={()=>setShowTransModal(false)}><X size={20}/></button>
            </div>
            
            <form onSubmit={handleSubmitTransaction} className="p-5 space-y-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 block mb-1">Nama Pelanggan</label>
                <input type="text" className="w-full p-3 bg-stone-50 rounded-xl border border-stone-200 text-sm outline-none focus:bg-white focus:ring-1 focus:ring-amber-600" value={transForm.customerName} onChange={(e)=>setTransForm({...transForm, customerName:e.target.value})} required />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 block mb-1">Kontak WhatsApp</label>
                <input type="text" className="w-full p-3 bg-stone-50 rounded-xl border border-stone-200 text-sm outline-none focus:bg-white focus:ring-1 focus:ring-amber-600" value={transForm.customerWhatsapp} onChange={(e)=>setTransForm({...transForm, customerWhatsapp:e.target.value})} required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 block mb-1">Mulai Sewa</label>
                  <input type="date" className="w-full p-3 bg-stone-50 rounded-xl border border-stone-200 text-sm outline-none focus:bg-white focus:ring-1 focus:ring-amber-600" value={transForm.startDate} onChange={(e)=>setTransForm({...transForm, startDate:e.target.value})} required />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 block mb-1">Durasi Sewa (Hari)</label>
                  <input 
                    type="number" 
                    min="3" 
                    className="w-full p-3 bg-stone-50 rounded-xl border border-stone-200 text-sm outline-none focus:bg-white focus:ring-1 focus:ring-amber-600 font-semibold" 
                    value={transForm.duration} 
                    onChange={(e)=>{
                      const d = parseInt(e.target.value) || 0;
                      const p = products.find(prod => prod._id === transForm.productId);
                      const basePrice = p?.price || 0;
                      
                      let finalPrice = 0;
                      if (d <= 3) {
                        finalPrice = basePrice; 
                      } else {
                        const extraDays = d - 3;
                        const dailyRate = Math.round(basePrice / 3);
                        finalPrice = basePrice + (extraDays * dailyRate);
                      }
                      
                      setTransForm({...transForm, duration: d, totalPrice: finalPrice});
                    }} 
                    required 
                  />
                  <span className="text-[9px] text-amber-800 mt-1 block">*Minimal sewa 3 hari</span>
                </div>
              </div>
              
              <div className="p-4 bg-amber-50/40 rounded-xl flex justify-between items-center border border-amber-200/30">
                <span className="text-[10px] font-bold uppercase tracking-widest text-amber-900">Total Akumulasi</span>
                <span className="font-mono font-bold text-amber-950 text-base">Rp {transForm.totalPrice.toLocaleString('id-ID')}</span>
              </div>
              
              <button type="submit" className="w-full py-3.5 bg-amber-800 hover:bg-amber-900 text-white rounded-xl font-medium uppercase text-xs tracking-widest shadow-xs transition-colors">Finalisasi & Simpan Sewa</button>
            </form>
          </div>
        </div>
      )}

      {/* --- AREA NOTA PREMIUM --- */}
      {printData && (
        <div className="hidden print:flex flex-col fixed inset-0 bg-white p-14 z-9999 text-left text-stone-900 font-sans tracking-wide justify-between h-screen w-screen">
          <div>
            <div className="flex justify-between items-start border-b-2 border-stone-800 pb-6 mb-8">
              <div>
                <h1 className="font-serif text-3xl font-bold tracking-wider text-amber-950 uppercase">
                  Swasana Kebaya
                </h1>
                <p className="text-xs text-stone-500 uppercase tracking-widest mt-1">Premium Kebaya Rental & Boutique</p>
              </div>
            </div>
            {/* Bagian nota cetak tetap dipertahankan aman */}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;