import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

const AdminDashboard = () => {
  const navigate = useNavigate();
  
  // --- STATE DATA ---
  const [products, setProducts] = useState([]); 
  const [transactions, setTransactions] = useState([]);
  const [adminSearchTerm, setAdminSearchTerm] = useState("");
  
  // --- STATE LAZY LOADING INTERNAL LIST ---
  const [visibleProductsCount, setVisibleProductsCount] = useState(5); 

  // --- STATE FORM PRODUK ---
  const [form, setForm] = useState({
    name: "", price: "", category: "", description: "", image: "", isAvailable: true
  });
  const [editId, setEditId] = useState(null);

  // --- STATE FORM SEWA BARU ---
  const [rentForm, setRentForm] = useState({
    productId: "",
    durationDays: 3, // Minimal & default awal 3 hari
    totalPrice: 0,
    status: "disewa" // Status otomatis berubah menjadi disewa
  });

  useEffect(() => {
    const isAdmin = localStorage.getItem("isAdmin");
    if (!isAdmin) {
      navigate("/login");
    } else {
      fetchProducts();
      fetchTransactions();
    }
  }, [navigate]);

  const fetchProducts = () => {
    const API_URL = import.meta.env.VITE_API_URL;
    fetch(`${API_URL}/api/products`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setProducts(data);
        } else {
          setProducts([]);
          console.error("Format data produk dari server bermasalah:", data);
        }
      })
      .catch((err) => {
        console.error("Gagal mengambil data produk:", err);
        setProducts([]); 
      });
  };

  const fetchTransactions = () => {
    const API_URL = import.meta.env.VITE_API_URL;
    fetch(`${API_URL}/api/transactions`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setTransactions(data);
        } else {
          setTransactions([]);
        }
      })
      .catch((err) => {
        console.error("Gagal mengambil data transaksi:", err);
        setTransactions([]);
      });
  };

  // --- LOGIKA FILTER AMAN ---
  const filteredAdminProducts = useMemo(() => {
    if (!Array.isArray(products)) return []; 
    return products.filter((p) => {
      const productName = p?.name ? p.name.toLowerCase() : "";
      const productCategory = p?.category ? p.category.toLowerCase() : "";
      return (
        productName.includes(adminSearchTerm.toLowerCase()) ||
        productCategory.includes(adminSearchTerm.toLowerCase())
      );
    });
  }, [products, adminSearchTerm]);

  // --- LOGIKA LAZY LOADING LIST PRODUK ---
  const displayedProducts = useMemo(() => {
    return filteredAdminProducts.slice(0, visibleProductsCount);
  }, [filteredAdminProducts, visibleProductsCount]);

  const handleEdit = (product) => {
    setEditId(product._id);
    setForm(product);
  };

  // --- OPTIMASI CRUD: Delete Cepat (Optimistic Update) ---
  const handleDelete = (id) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus produk ini?")) {
      // Hapus dari state lokal dulu agar UI langsung update tanpa jeda network
      const previousProducts = [...products];
      setProducts(products.filter(p => p._id !== id));

      const API_URL = import.meta.env.VITE_API_URL;
      fetch(`${API_URL}/api/products/${id}`, { method: "DELETE" })
        .then((res) => {
          if (res.ok) {
            toast.success("Produk berhasil dihapus");
            fetchProducts(); // Sinkronisasi ulang background data
          } else {
            setProducts(previousProducts); // Rollback jika gagal
            toast.error("Gagal menghapus produk");
          }
        })
        .catch(() => {
          setProducts(previousProducts); // Rollback jika error jaringan
          toast.error("Terjadi kesalahan jaringan");
        });
    }
  };

  // --- OPTIMASI CRUD: Submit Cepat (Add/Edit) ---
  const handleSubmit = (e) => {
    e.preventDefault();
    const API_URL = import.meta.env.VITE_API_URL;
    const url = editId ? `${API_URL}/api/products/${editId}` : `${API_URL}/api/products`;
    const method = editId ? "PUT" : "POST";

    // Optimistic state update untuk Edit
    let previousProducts = [...products];
    if (editId) {
      setProducts(products.map(p => p._id === editId ? { ...p, ...form } : p));
    }

    fetch(url, {
      method: method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
      .then((res) => {
        if (res.ok) {
          toast.success(editId ? "Produk diupdate!" : "Produk ditambahkan!");
          setForm({ name: "", price: "", category: "", description: "", image: "", isAvailable: true });
          setEditId(null);
          fetchProducts();
        } else {
          if (editId) setProducts(previousProducts); // Rollback jika edit gagal
          toast.error("Gagal menyimpan data produk");
        }
      })
      .catch(() => {
        if (editId) setProducts(previousProducts); // Rollback jika network error
        toast.error("Terjadi kegagalan jaringan");
      });
  };

  // --- LOGIKA HITUNG HARGA SEWA KELIPATAN 3 HARI ---
  const handleProductSelectChange = (productId) => {
    const selectedProduct = products.find(p => p._id === productId);
    if (selectedProduct) {
      const basePrice = Number(selectedProduct.price); // Ini harga default untuk 3 hari
      const currentDuration = rentForm.durationDays;
      
      // Rumus kalkulasi: (Durasi / 3) * harga default 3 hari
      const calculatedPrice = (currentDuration / 3) * basePrice;

      setRentForm({
        ...rentForm,
        productId,
        totalPrice: calculatedPrice
      });
    } else {
      setRentForm({ ...rentForm, productId: "", totalPrice: 0 });
    }
  };

  const handleDurationChange = (days) => {
    const targetDays = Number(days);
    if (targetDays < 3 || targetDays % 3 !== 0) return; // Validasi kelipatan 3 hari

    const selectedProduct = products.find(p => p._id === rentForm.productId);
    const basePrice = selectedProduct ? Number(selectedProduct.price) : 0;
    const calculatedPrice = (targetDays / 3) * basePrice;

    setRentForm({
      ...rentForm,
      durationDays: targetDays,
      totalPrice: calculatedPrice
    });
  };

  // --- SUBMIT TRANSAKSI SEWA BARU ---
  const handleRentSubmit = (e) => {
    e.preventDefault();
    if (!rentForm.productId) return toast.error("Pilih produk terlebih dahulu");

    const API_URL = import.meta.env.VITE_API_URL;
    fetch(`${API_URL}/api/transactions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(rentForm)
    })
      .then((res) => {
        if (res.ok) {
          toast.success("Transaksi sewa berhasil dibuat, status menjadi DISEWA!");
          setRentForm({ productId: "", durationDays: 3, totalPrice: 0, status: "disewa" });
          fetchTransactions();
          fetchProducts(); // Refresh untuk melihat perubahan availability jika ada relasi
        } else {
          toast.error("Gagal memproses sewa");
        }
      })
      .catch(() => toast.error("Gangguan jaringan pada sistem sewa"));
  };

  return (
    <div className="container mx-auto px-6 py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-serif text-stone-800">Dashboard Manajemen Kebaya</h1>
        <button
          onClick={() => {
            localStorage.removeItem("isAdmin");
            navigate("/login");
          }}
          className="px-4 py-2 bg-stone-800 text-white rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-stone-900 transition-colors"
        >
          Logout
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* PANEL FORM PRODUK */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm h-fit">
          <h2 className="text-xl font-serif mb-4 text-stone-800">
            {editId ? "Edit Detail Busana" : "Tambah Koleksi Baru"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 block mb-1">Nama Kebaya</label>
              <input type="text" className="w-full border border-stone-200 p-2.5 rounded-lg text-sm outline-none focus:border-amber-800" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 block mb-1">Harga Sewa (Default 3 Hari)</label>
              <input type="number" className="w-full border border-stone-200 p-2.5 rounded-lg text-sm outline-none focus:border-amber-800" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 block mb-1">Kategori</label>
              <input type="text" className="w-full border border-stone-200 p-2.5 rounded-lg text-sm outline-none focus:border-amber-800" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 block mb-1">URL Gambar</label>
              <input type="text" className="w-full border border-stone-200 p-2.5 rounded-lg text-sm outline-none focus:border-amber-800" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 block mb-1">Deskripsi / Ukuran</label>
              <textarea className="w-full border border-stone-200 p-2.5 rounded-lg text-sm h-24 outline-none resize-none focus:border-amber-800" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}></textarea>
            </div>
            <button type="submit" className="w-full py-3 bg-amber-900 text-white rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-amber-950 transition-colors">
              {editId ? "Simpan Perubahan" : "Simpan ke Galeri"}
            </button>
          </form>
        </div>

        {/* LIST TABEL PRODUK DENGAN LAZY LOADING */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Cari koleksi di admin..."
              className="w-full border border-stone-200 p-3 rounded-xl text-sm outline-none focus:border-amber-800"
              value={adminSearchTerm}
              onChange={(e) => setAdminSearchTerm(e.target.value)}
            />
          </div>

          <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-stone-50 border-b border-stone-100 text-[10px] font-bold uppercase tracking-widest text-stone-400">
                    <th className="p-4">Produk</th>
                    <th className="p-4">Kategori</th>
                    <th className="p-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-sm">
                  {displayedProducts.length === 0 ? (
                    <tr>
                      <td colSpan="3" className="text-center p-8 text-stone-400 italic text-xs">
                        Koleksi tidak ditemukan atau server mengalami error 500.
                      </td>
                    </tr>
                  ) : (
                    displayedProducts.map((p) => (
                      <tr key={p._id} className="hover:bg-stone-50/50 transition-colors">
                        <td className="p-4 flex items-center gap-3">
                          <img src={p.image || "https://placeholder.com/50"} alt="" className="w-10 h-12 rounded object-cover bg-stone-100" />
                          <div>
                            <p className="font-semibold text-stone-800">{p.name}</p>
                            <p className="text-xs text-amber-950 font-medium">Rp {Number(p.price).toLocaleString("id-ID")}</p>
                          </div>
                        </td>
                        <td className="p-4 text-xs text-stone-500">{p.category}</td>
                        <td className="p-4 text-right space-x-2">
                          <button onClick={() => handleEdit(p)} className="text-xs font-semibold text-amber-900 hover:underline">Edit</button>
                          <button onClick={() => handleDelete(p._id)} className="text-xs font-semibold text-stone-400 hover:text-rose-600 transition-colors">Hapus</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* INTEGRASI LAZY LOADING LIST */}
            {filteredAdminProducts.length > visibleProductsCount && (
              <div className="p-3 bg-stone-50 text-center border-t border-stone-100">
                <button
                  onClick={() => setVisibleProductsCount((prev) => prev + 5)}
                  className="text-xs font-bold text-amber-900 hover:text-amber-950 uppercase tracking-wider"
                >
                  ➕ Muat Produk Lainnya...
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* --- PANEL BARU: FORM TRANSAKSI SEWA (MEMENUHI SYARAT 3 & 4) --- */}
      <div className="mt-12 bg-white p-6 rounded-2xl border border-stone-200 shadow-sm max-w-xl">
        <h2 className="text-xl font-serif mb-2 text-stone-800">Form Transaksi Sewa Busana</h2>
        <p className="text-xs text-stone-500 mb-4">Penyewaan diatur wajib per kelipatan 3 Hari dengan akumulasi harga proporsional.</p>
        
        <form onSubmit={handleRentSubmit} className="space-y-4">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 block mb-1">Pilih Produk Kebaya</label>
            <select 
              className="w-full border border-stone-200 p-2.5 rounded-lg text-sm bg-white outline-none focus:border-amber-800"
              value={rentForm.productId}
              onChange={(e) => handleProductSelectChange(e.target.value)}
              required
            >
              <option value="">-- Pilih Koleksi --</option>
              {products.map(p => (
                <option key={p._id} value={p._id}>{p.name} (Rp {Number(p.price).toLocaleString("id-ID")}/3 hari)</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 block mb-1">Jumlah Hari Sewa</label>
              <input 
                type="number" 
                min="3" 
                step="3" 
                className="w-full border border-stone-200 p-2.5 rounded-lg text-sm outline-none focus:border-amber-800" 
                value={rentForm.durationDays} 
                onChange={(e) => handleDurationChange(e.target.value)}
                required 
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 block mb-1">Status Sewa</label>
              <input type="text" className="w-full border border-stone-200 p-2.5 rounded-lg text-sm bg-stone-100 font-semibold text-amber-900 outline-none" value={rentForm.status.toUpperCase()} readOnly />
            </div>
          </div>

          <div className="p-4 bg-amber-50/50 rounded-xl border border-amber-100">
            <span className="text-xs text-stone-500 block">Total Biaya Sewa:</span>
            <span className="text-xl font-bold text-amber-950">Rp {rentForm.totalPrice.toLocaleString("id-ID")}</span>
          </div>

          <button type="submit" className="w-full py-3 bg-stone-800 text-white rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-stone-900 transition-colors">
            Konfirmasi Penyewaan (Status: Disewa)
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminDashboard;