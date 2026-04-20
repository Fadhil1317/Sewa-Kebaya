import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Package, LogOut, PlusCircle, Edit3, Trash2, 
  CreditCard, LayoutDashboard, Search, 
  CheckCircle2, AlertCircle, Users, Printer, X
} from "lucide-react";

const AdminDashboard = () => {
  const navigate = useNavigate();

  // --- STATE MANAGEMENT ---
  const [activeTab, setActiveTab] = useState('katalog'); 
  const [products, setProducts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editId, setEditId] = useState(null);
  const [adminSearchTerm, setAdminSearchTerm] = useState("");
  
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

  // 1. UPDATE FETCH PRODUK
  const fetchProducts = async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/products`);
      const data = await res.json();
      setProducts(data);
    } catch (err) { console.error(err); }
  };

  // 2. UPDATE FETCH TRANSAKSI
  const fetchTransactions = async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/transactions`);
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

  // --- HANDLERS PRODUK ---
  const handleSubmitProduct = async (e) => {
    e.preventDefault();
    setLoading(true);
    // 3. UPDATE URL SUBMIT PRODUK
    const url = editId 
      ? `${process.env.REACT_APP_API_URL}/api/products/${editId}` 
      : `${process.env.REACT_APP_API_URL}/api/products`;
      
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
      // 4. UPDATE DELETE PRODUK
      await fetch(`${process.env.REACT_APP_API_URL}/api/products/${id}`, { method: "DELETE" });
      fetchProducts();
    }
  };

  // --- LOGIC TRANSAKSI & SINKRONISASI ---
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
      // 5. UPDATE POST TRANSAKSI
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/transactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(transForm),
      });

      if (res.ok) {
        // 6. UPDATE STATUS PRODUK SETELAH SEWA
        await fetch(`${process.env.REACT_APP_API_URL}/api/products/${transForm.productId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isAvailable: false }), 
        });
        setShowTransModal(false);
        refreshAllData();
        alert("Sewa tercatat & produk otomatis diset 'Disewa' ✅");
      }
    } catch (err) { alert("Gagal proses sewa"); }
  };

  const handleCancelTransaction = async (t) => {
    if (window.confirm(`Batalkan sewa ${t.customerName}? Produk akan kembali 'Ready'.`)) {
      try {
        // 7. UPDATE DELETE TRANSAKSI & KEMBALIKAN STATUS PRODUK
        await fetch(`${process.env.REACT_APP_API_URL}/api/transactions/${t._id}`, { method: "DELETE" });
        
        await fetch(`${process.env.REACT_APP_API_URL}/api/products/${t.productId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isAvailable: true }), 
        });
        refreshAllData();
        alert("Transaksi dihapus & produk tersedia kembali! 🔄");
      } catch (err) { alert("Gagal batalkan transaksi"); }
    }
  };

  // FITUR BARU: CETAK NOTA (Tanpa Fetch, hanya HTML)
  const handlePrintNota = (t) => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Nota Sewa - ${t.customerName}</title>
          <style>
            body { font-family: 'Courier New', Courier, monospace; padding: 40px; color: #333; line-height: 1.5; }
            .nota-box { border: 2px solid #333; padding: 20px; max-width: 500px; margin: auto; }
            .header { text-align: center; border-bottom: 2px dashed #333; margin-bottom: 20px; padding-bottom: 10px; }
            .row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px; }
            .total { border-top: 2px dashed #333; margin-top: 20px; padding-top: 10px; font-weight: bold; font-size: 18px; }
            .footer { text-align: center; margin-top: 30px; font-size: 12px; font-style: italic; }
          </style>
        </head>
        <body>
          <div class="nota-box">
            <div class="header">
              <h2 style="margin:0">KEBAYA KLASIK UMKM</h2>
              <p style="margin:5px 0">Nota Resmi Penyewaan</p>
            </div>
            <div class="row"><span>Nama Pelanggan:</span> <span>${t.customerName}</span></div>
            <div class="row"><span>WhatsApp:</span> <span>${t.customerWhatsapp}</span></div>
            <div class="row"><span>Model Kebaya:</span> <span>${t.productName}</span></div>
            <div class="row"><span>Tgl Mulai:</span> <span>${t.startDate}</span></div>
            <div class="row"><span>Durasi:</span> <span>${t.duration} Hari</span></div>
            <div class="row total"><span>TOTAL BAYAR:</span> <span>Rp ${t.totalPrice?.toLocaleString()}</span></div>
            <div class="footer">
              <p>Terima kasih sudah menyewa!<br>Harap menjaga kebersihan produk kami.</p>
            </div>
          </div>
          <script>window.onload = function() { window.print(); window.close(); }</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="flex min-h-screen bg-[#FDFCF8] font-sans text-stone-800">
      {/* SIDEBAR */}
      <aside className="w-64 bg-stone-950 text-stone-400 hidden lg:flex flex-col sticky top-0 h-screen border-r border-amber-900/20">
        <div className="p-8 text-amber-500 font-serif text-2xl font-bold border-b border-stone-900">
          Kebaya<span className="text-stone-100 font-light text-xl">Klasik</span>
        </div>
        <nav className="grow p-6 space-y-3 mt-4">
          <button onClick={() => setActiveTab('katalog')} className={`w-full px-4 py-3 rounded-xl flex items-center gap-3 transition-all ${activeTab === 'katalog' ? 'bg-amber-900/20 text-amber-500 border border-amber-900/30' : 'hover:text-stone-200'}`}>
            <Package size={18} /> <span className="text-sm font-bold uppercase tracking-wider">Katalog</span>
          </button>
          <button onClick={() => setActiveTab('transaksi')} className={`w-full px-4 py-3 rounded-xl flex items-center gap-3 transition-all ${activeTab === 'transaksi' ? 'bg-amber-900/20 text-amber-500 border border-amber-900/30' : 'hover:text-stone-200'}`}>
            <CreditCard size={18} /> <span className="text-sm font-bold uppercase tracking-wider">Riwayat Sewa</span>
          </button>
          <button onClick={() => { localStorage.removeItem("isAdmin"); navigate("/login"); }} className="w-full mt-10 px-4 py-3 text-stone-500 hover:text-red-400 flex items-center gap-3">
            <LogOut size={18} /> <span className="text-sm font-medium uppercase tracking-wider">Logout</span>
          </button>
        </nav>
      </aside>

      <div className="flex-1 flex flex-col">
        {/* HEADER */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b flex items-center justify-between px-10 sticky top-0 z-40">
          <h2 className="text-stone-800 font-serif text-lg">{activeTab === 'katalog' ? 'Manajemen Koleksi' : 'Log Transaksi'}</h2>
          <div className="flex gap-6">
             <div className="text-right"><p className="text-[10px] text-stone-400 uppercase font-bold">Produk</p><p className="text-xl font-serif text-amber-900">{products.length}</p></div>
             <div className="text-right border-l pl-6 border-stone-200"><p className="text-[10px] text-stone-400 uppercase font-bold">Total Transaksi</p><p className="text-xl font-serif text-amber-900">{transactions.length}</p></div>
          </div>
        </header>

        <main className="p-10 max-w-350 mx-auto w-full">
          {activeTab === 'katalog' ? (
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
              {/* FORM PRODUK */}
              <section className="xl:col-span-4">
                <div className="p-8 rounded-3xl border bg-white shadow-xl sticky top-28">
                  <h3 className="text-xl font-serif mb-8 flex items-center gap-3">{editId ? <Edit3/> : <PlusCircle/>} {editId ? "Edit" : "Tambah"} Produk</h3>
                  <form onSubmit={handleSubmitProduct} className="space-y-4">
                    <input type="text" placeholder="Nama Produk" className="w-full bg-stone-50 p-3.5 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 text-sm" value={form.name} onChange={(e)=>setForm({...form, name:e.target.value})} required />
                    <input type="number" placeholder="Harga Sewa" className="w-full bg-stone-50 p-3.5 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 text-sm" value={form.price} onChange={(e)=>setForm({...form, price:e.target.value})} required />
                    <input type="text" placeholder="Kategori" className="w-full bg-stone-50 p-3.5 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 text-sm" value={form.category} onChange={(e)=>setForm({...form, category:e.target.value})} required />
                    <input type="text" placeholder="URL Gambar" className="w-full bg-stone-50 p-3.5 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 text-sm" value={form.image} onChange={(e)=>setForm({...form, image:e.target.value})} />
                    <textarea placeholder="Deskripsi" className="w-full bg-stone-50 p-3.5 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 text-sm h-24" value={form.description} onChange={(e)=>setForm({...form, description:e.target.value})}></textarea>
                    <button type="submit" className="w-full py-4 bg-stone-900 text-white rounded-xl font-bold text-xs uppercase tracking-widest">{editId ? "Simpan Perubahan" : "Tambah Koleksi"}</button>
                  </form>
                </div>
              </section>

              {/* TABEL PRODUK */}
              <section className="xl:col-span-8 space-y-6">
                <div className="relative"><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} /><input type="text" placeholder="Cari..." className="w-full bg-white border py-4 pl-12 pr-6 rounded-2xl outline-none" value={adminSearchTerm} onChange={(e)=>setAdminSearchTerm(e.target.value)} /></div>
                <div className="bg-white rounded-3xl border shadow-xl overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-stone-50 text-[10px] uppercase tracking-widest border-b"><tr><th className="px-8 py-5">Produk</th><th className="px-8 py-5">Status</th><th className="px-8 py-5 text-right">Aksi</th></tr></thead>
                    <tbody className="divide-y">
                      {filteredAdminProducts.map(p => (
                        <tr key={p._id} className="hover:bg-amber-50/30 transition-colors">
                          <td className="px-8 py-5">
                            <div className="flex items-center gap-4">
                              <img src={p.image} className="w-12 h-12 rounded-lg object-cover" />
                              <div><p className="font-bold text-sm">{p.name}</p><p className="text-amber-700 text-xs">Rp {p.price?.toLocaleString()}</p></div>
                            </div>
                          </td>
                          <td className="px-8 py-5">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${p.isAvailable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{p.isAvailable ? 'Ready' : 'Disewa'}</span>
                          </td>
                          <td className="px-8 py-5 text-right flex justify-end gap-2">
                             {p.isAvailable && <button onClick={()=>handleOpenTransModal(p)} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all"><Users size={16}/></button>}
                             <button onClick={()=>{setEditId(p._id); setForm(p);}} className="p-2 bg-amber-50 text-amber-700 rounded-lg hover:bg-amber-600 hover:text-white transition-all"><Edit3 size={16}/></button>
                             <button onClick={()=>handleDeleteProduct(p._id)} className="p-2 bg-red-50 text-red-400 rounded-lg hover:bg-red-600 hover:text-white transition-all"><Trash2 size={16}/></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
          ) : (
            /* TABEL TRANSAKSI */
            <section className="bg-white rounded-3xl border shadow-xl overflow-hidden">
              <table className="w-full text-left">
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
                         <button onClick={()=>handlePrintNota(t)} className="p-2.5 bg-stone-100 text-stone-600 rounded-lg hover:bg-stone-900 hover:text-white transition-all"><Printer size={16}/></button>
                         <button onClick={()=>handleCancelTransaction(t)} className="p-2.5 bg-red-50 text-red-400 rounded-lg hover:bg-red-600 hover:text-white transition-all"><Trash2 size={16}/></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          )}
        </main>
      </div>

      {/* MODAL INPUT TRANSAKSI */}
      {showTransModal && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-6 bg-stone-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden">
            <div className="bg-stone-950 p-8 text-white flex justify-between items-center">
              <div><h3 className="text-2xl font-serif">Catat Sewa</h3><p className="text-stone-400 text-[10px] uppercase mt-1">{transForm.productName}</p></div>
              <button onClick={()=>setShowTransModal(false)}><X size={20}/></button>
            </div>
            <form onSubmit={handleSubmitTransaction} className="p-8 space-y-4">
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
              <div className="p-5 bg-amber-50 rounded-2xl flex justify-between items-center">
                <span className="text-xs font-bold uppercase text-amber-900">Total</span>
                <span className="font-serif font-bold text-amber-900 text-xl">Rp {transForm.totalPrice.toLocaleString()}</span>
              </div>
              <button type="submit" className="w-full py-4 bg-amber-600 text-white rounded-2xl font-bold uppercase text-xs tracking-widest shadow-lg">Simpan & Update Status</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;