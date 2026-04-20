import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Package, LogOut, PlusCircle, Edit3, Trash2, 
  CreditCard, Search, Users, Printer, X, Menu, ChevronDown, ChevronUp
} from "lucide-react";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const formRef = useRef(null); // Untuk smooth scroll

  // --- STATE MANAGEMENT ---
  const [activeTab, setActiveTab] = useState('katalog'); 
  const [products, setProducts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editId, setEditId] = useState(null);
  const [adminSearchTerm, setAdminSearchTerm] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(true); // Toggle form di mobile
  const [isEditingGlow, setIsEditingGlow] = useState(false);
  
  const [form, setForm] = useState({
    name: "", price: "", category: "", description: "", image: "", isAvailable: true 
  });

  const [showTransModal, setShowTransModal] = useState(false);
  const [transForm, setTransForm] = useState({
    customerName: "", customerWhatsapp: "", productName: "",
    productId: "", startDate: "", duration: 1, totalPrice: 0
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
      setProducts(data);
    } catch (err) { console.error(err); }
  };

  const fetchTransactions = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/transactions`);
      const data = await res.json();
      setTransactions(data);
    } catch (err) { console.error(err); }
  };

  const filteredAdminProducts = useMemo(() => {
    return products.filter(p => 
      p.name.toLowerCase().includes(adminSearchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(adminSearchTerm.toLowerCase())
    );
  }, [products, adminSearchTerm]);

  // --- HANDLERS ---
  const handleEditClick = (p) => {
    setEditId(p._id);
    setForm(p);
    setIsFormOpen(true);
    setIsEditingGlow(true);
    
    // Smooth Scroll ke Form
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    // Hilangkan efek glow setelah 3 detik
    setTimeout(() => setIsEditingGlow(false), 3000);
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
        alert("Data produk berhasil diperbarui! ✨");
      }
    } catch (err) { alert("Error simpan produk"); }
    setLoading(false);
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm("Hapus produk ini secara permanen?")) {
      await fetch(`${import.meta.env.VITE_API_URL}/api/products/${id}`, { method: "DELETE" });
      fetchProducts();
    }
  };

  const handleOpenTransModal = (product) => {
    setTransForm({
      customerName: "", customerWhatsapp: "", productName: product.name,
      productId: product._id, startDate: new Date().toISOString().split('T')[0],
      duration: 1, totalPrice: product.price
    });
    setShowTransModal(true);
  };

  const handleSubmitTransaction = async (e) => {
    e.preventDefault();
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
        alert("Sewa tercatat ✅");
      }
    } catch (err) { alert("Gagal proses sewa"); }
  };

  const handleCancelTransaction = async (t) => {
    if (window.confirm(`Batalkan sewa ${t.customerName}?`)) {
      try {
        await fetch(`${import.meta.env.VITE_API_URL}/api/transactions/${t._id}`, { method: "DELETE" });
        await fetch(`${import.meta.env.VITE_API_URL}/api/products/${t.productId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isAvailable: true }), 
        });
        refreshAllData();
      } catch (err) { alert("Gagal batalkan transaksi"); }
    }
  };

  const handlePrintNota = (t) => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head><title>Nota - ${t.customerName}</title></head>
        <body onload="window.print();window.close()">${t.customerName} - ${t.productName}</body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="flex min-h-screen bg-[#FDFCF8] font-sans text-stone-800 relative">
      {/* MOBILE OVERLAY */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 lg:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* SIDEBAR */}
      <aside className={`fixed lg:sticky top-0 left-0 z-50 w-64 h-screen bg-stone-950 transition-transform duration-300 border-r border-amber-900/20 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-8 text-amber-500 font-serif text-2xl font-bold border-b border-stone-900 flex justify-between items-center">
          <span>Kebaya<span className="text-stone-100 font-light text-xl">Klasik</span></span>
          <button className="lg:hidden text-stone-400" onClick={() => setIsSidebarOpen(false)}><X/></button>
        </div>
        <nav className="p-6 space-y-3">
          <button onClick={() => {setActiveTab('katalog'); setIsSidebarOpen(false)}} className={`w-full px-4 py-3 rounded-xl flex items-center gap-3 ${activeTab === 'katalog' ? 'bg-amber-900/20 text-amber-500' : 'text-stone-400'}`}>
            <Package size={18}/> <span className="text-sm font-bold uppercase">Katalog</span>
          </button>
          <button onClick={() => {setActiveTab('transaksi'); setIsSidebarOpen(false)}} className={`w-full px-4 py-3 rounded-xl flex items-center gap-3 ${activeTab === 'transaksi' ? 'bg-amber-900/20 text-amber-500' : 'text-stone-400'}`}>
            <CreditCard size={18}/> <span className="text-sm font-bold uppercase">Riwayat</span>
          </button>
          <button onClick={() => {localStorage.removeItem("isAdmin"); navigate("/login")}} className="w-full mt-10 px-4 py-3 text-stone-500 flex items-center gap-3 hover:text-red-400">
            <LogOut size={18}/> <span className="text-sm font-bold uppercase">Logout</span>
          </button>
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-20 bg-white/80 backdrop-blur-md border-b flex items-center justify-between px-6 lg:px-10 sticky top-0 z-40">
          <button className="lg:hidden p-2" onClick={() => setIsSidebarOpen(true)}><Menu/></button>
          <h2 className="hidden md:block font-serif text-lg">{activeTab === 'katalog' ? 'Manajemen Koleksi' : 'Log Transaksi'}</h2>
          <div className="flex gap-4 lg:gap-8">
            <div className="text-right"><p className="text-[10px] text-stone-400 uppercase font-bold">Produk</p><p className="lg:text-xl font-serif text-amber-900">{products.length}</p></div>
            <div className="text-right border-l pl-4 lg:pl-8 border-stone-200"><p className="text-[10px] text-stone-400 uppercase font-bold">Transaksi</p><p className="lg:text-xl font-serif text-amber-900">{transactions.length}</p></div>
          </div>
        </header>

        <main className="p-4 lg:p-10 max-w-7xl mx-auto w-full space-y-8">
          {activeTab === 'katalog' ? (
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
              
              {/* FORM SECTION - COLLAPSIBLE ON MOBILE */}
              <section ref={formRef} className="xl:col-span-4 order-1 xl:order-2">
                <div className={`transition-all duration-500 rounded-3xl border bg-white shadow-xl overflow-hidden ${isEditingGlow ? 'ring-4 ring-amber-500 shadow-[0_0_25px_rgba(245,158,11,0.4)]' : ''}`}>
                  <button 
                    onClick={() => setIsFormOpen(!isFormOpen)}
                    className="w-full p-6 flex justify-between items-center lg:cursor-default"
                  >
                    <h3 className="text-xl font-serif flex items-center gap-3">
                      {editId ? <Edit3 className="text-amber-600"/> : <PlusCircle className="text-stone-600"/>} 
                      {editId ? "Edit Produk" : "Tambah Koleksi"}
                    </h3>
                    <div className="lg:hidden">
                      {isFormOpen ? <ChevronUp /> : <ChevronDown />}
                    </div>
                  </button>

                  <div className={`${isFormOpen ? 'max-h-250 opacity-100' : 'max-h-0 opacity-0'} transition-all duration-300 ease-in-out`}>
                    <form onSubmit={handleSubmitProduct} className="p-6 pt-0 space-y-4">
                      <input type="text" placeholder="Nama Produk" className="w-full bg-stone-50 p-3.5 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 text-sm border" value={form.name} onChange={(e)=>setForm({...form, name:e.target.value})} required />
                      <input type="number" placeholder="Harga Sewa" className="w-full bg-stone-50 p-3.5 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 text-sm border" value={form.price} onChange={(e)=>setForm({...form, price:e.target.value})} required />
                      <input type="text" placeholder="Kategori" className="w-full bg-stone-50 p-3.5 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 text-sm border" value={form.category} onChange={(e)=>setForm({...form, category:e.target.value})} required />
                      <input type="text" placeholder="URL Gambar" className="w-full bg-stone-50 p-3.5 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 text-sm border" value={form.image} onChange={(e)=>setForm({...form, image:e.target.value})} />
                      <textarea placeholder="Deskripsi" className="w-full bg-stone-50 p-3.5 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 text-sm h-24 border" value={form.description} onChange={(e)=>setForm({...form, description:e.target.value})}></textarea>
                      <button type="submit" className={`w-full py-4 text-white rounded-xl font-bold text-xs uppercase tracking-widest transition-colors ${editId ? 'bg-amber-600 hover:bg-amber-700' : 'bg-stone-900 hover:bg-stone-800'}`}>
                        {editId ? "Update Produk" : "Simpan Koleksi"}
                      </button>
                      {editId && (
                        <button type="button" onClick={() => {setEditId(null); setForm({name:"", price:"", category:"", description:"", image:"", isAvailable:true})}} className="w-full text-xs text-stone-400 font-bold uppercase py-2">Batal Edit</button>
                      )}
                    </form>
                  </div>
                </div>
              </section>

              {/* TABLE SECTION */}
              <section className="xl:col-span-8 order-2 xl:order-1 space-y-6">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                  <input type="text" placeholder="Cari kebaya..." className="w-full bg-white border py-4 pl-12 pr-6 rounded-2xl outline-none shadow-sm focus:ring-2 focus:ring-amber-500/20" value={adminSearchTerm} onChange={(e)=>setAdminSearchTerm(e.target.value)} />
                </div>

                <div className="bg-white rounded-3xl border shadow-xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-150">
                      <thead className="bg-stone-50 text-[10px] uppercase tracking-widest border-b">
                        <tr><th className="px-8 py-5">Produk</th><th className="px-8 py-5">Status</th><th className="px-8 py-5 text-right">Aksi</th></tr>
                      </thead>
                      <tbody className="divide-y">
                        {filteredAdminProducts.map(p => (
                          <tr key={p._id} className="hover:bg-amber-50/30 transition-colors">
                            <td className="px-8 py-5">
                              <div className="flex items-center gap-4">
                                <img src={p.image} className="w-12 h-12 rounded-lg object-cover bg-stone-100" />
                                <div><p className="font-bold text-sm">{p.name}</p><p className="text-amber-700 text-xs">Rp {p.price?.toLocaleString()}</p></div>
                              </div>
                            </td>
                            <td className="px-8 py-5">
                              <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${p.isAvailable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {p.isAvailable ? 'Ready' : 'Disewa'}
                              </span>
                            </td>
                            <td className="px-8 py-5 text-right">
                              <div className="flex justify-end gap-2">
                                {p.isAvailable && <button onClick={()=>handleOpenTransModal(p)} className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Users size={16}/></button>}
                                <button onClick={()=>handleEditClick(p)} className="p-2 bg-amber-50 text-amber-700 rounded-lg"><Edit3 size={16}/></button>
                                <button onClick={()=>handleDeleteProduct(p._id)} className="p-2 bg-red-50 text-red-400 rounded-lg"><Trash2 size={16}/></button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>
            </div>
          ) : (
            /* TRANSAKSI SECTION */
            <section className="bg-white rounded-3xl border shadow-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left min-w-175">
                  <thead className="bg-stone-50 text-[10px] uppercase tracking-widest border-b">
                    <tr><th className="px-8 py-5">Penyewa</th><th className="px-8 py-5">Produk</th><th className="px-8 py-5">Total</th><th className="px-8 py-5 text-right">Aksi</th></tr>
                  </thead>
                  <tbody className="divide-y">
                    {transactions.map(t => (
                      <tr key={t._id}>
                        <td className="px-8 py-5"><p className="font-bold text-sm">{t.customerName}</p><p className="text-xs text-stone-400">{t.customerWhatsapp}</p></td>
                        <td className="px-8 py-5"><p className="text-sm">{t.productName}</p><p className="text-[10px] text-amber-600 font-bold uppercase">{t.duration} Hari</p></td>
                        <td className="px-8 py-5 font-bold text-sm">Rp {t.totalPrice?.toLocaleString()}</td>
                        <td className="px-8 py-5 text-right flex justify-end gap-2">
                          <button onClick={()=>handlePrintNota(t)} className="p-2.5 bg-stone-100 text-stone-600 rounded-lg"><Printer size={16}/></button>
                          <button onClick={()=>handleCancelTransaction(t)} className="p-2.5 bg-red-50 text-red-400 rounded-lg"><Trash2 size={16}/></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </main>
      </div>

      {/* MODAL TRANSAKSI */}
      {showTransModal && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden">
            <div className="bg-stone-950 p-6 lg:p-8 text-white flex justify-between items-center">
              <div><h3 className="text-xl font-serif">Catat Sewa</h3><p className="text-stone-400 text-[10px] uppercase mt-1">{transForm.productName}</p></div>
              <button onClick={()=>setShowTransModal(false)}><X/></button>
            </div>
            <form onSubmit={handleSubmitTransaction} className="p-6 lg:p-8 space-y-4">
              <input type="text" placeholder="Nama Pelanggan" className="w-full p-4 bg-stone-50 rounded-2xl border text-sm" value={transForm.customerName} onChange={(e)=>setTransForm({...transForm, customerName:e.target.value})} required />
              <input type="text" placeholder="WhatsApp" className="w-full p-4 bg-stone-50 rounded-2xl border text-sm" value={transForm.customerWhatsapp} onChange={(e)=>setTransForm({...transForm, customerWhatsapp:e.target.value})} required />
              <div className="grid grid-cols-2 gap-4">
                <input type="date" className="w-full p-4 bg-stone-50 rounded-2xl border text-sm" value={transForm.startDate} onChange={(e)=>setTransForm({...transForm, startDate:e.target.value})} required />
                <input type="number" placeholder="Hari" className="w-full p-4 bg-stone-50 rounded-2xl border text-sm" value={transForm.duration} onChange={(e)=>{
                  const d = e.target.value;
                  const p = products.find(prod => prod._id === transForm.productId);
                  setTransForm({...transForm, duration:d, totalPrice: d * (p?.price || 0)});
                }} required />
              </div>
              <div className="p-5 bg-amber-50 rounded-2xl flex justify-between items-center font-bold">
                <span className="text-xs uppercase text-amber-900">Total</span>
                <span className="font-serif text-amber-900 text-xl">Rp {transForm.totalPrice.toLocaleString()}</span>
              </div>
              <button type="submit" className="w-full py-4 bg-amber-600 text-white rounded-2xl font-bold uppercase text-xs tracking-widest shadow-lg">Simpan Sewa</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;