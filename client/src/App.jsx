import { useState, useMemo, useEffect, lazy, Suspense } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import ProductCard from "./components/ProductCard";
import Footer from "./components/Footer";

// --- FUNGSI CUSTOM UNTUK MEMBERI JEDA (DELAY) PADA LAZY LOADING ---
// Fungsi ini memaksa komponen menunggu minimal 1500ms (1.5 detik) agar animasi loading terlihat
const lazyWithDelay = (importFunction, delay = 1500) => {
  return lazy(() =>
    Promise.all([
      importFunction(),
      new Promise((resolve) => setTimeout(resolve, delay))
    ]).then(([moduleExports]) => moduleExports)
  );
};

// --- LAZY LOADING PAGES (DENGAN DELAY BUATAN) ---
const ProductDetail = lazyWithDelay(() => import("./pages/ProductDetail"));
const AdminDashboard = lazyWithDelay(() => import("./pages/AdminDashboard"));
const Login = lazyWithDelay(() => import("./pages/Login"));

// --- KOMPONEN LOADING DENGAN ANIMASI SPINNER ---
const PageLoader = () => (
  <div className="flex flex-col h-96 items-center justify-center gap-4 bg-[#FDFCF8]">
    {/* Animasi Spinner Bulat Tailwind */}
    <div className="w-12 h-12 border-4 border-stone-200 border-t-amber-950 rounded-full animate-spin"></div>
    <p className="text-stone-600 font-serif italic tracking-wide animate-pulse">
      Memuat koleksi kebaya...
    </p>
  </div>
);

function App() {
  const [dbProducts, setDbProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua");

  // --- STATE PAGINATION ---
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 8;

  const location = useLocation();
  const isAdminPage =
    location.pathname.startsWith("/admin") || location.pathname === "/login";

  // 1. Fetch Data Produk
  useEffect(() => {
    const API_URL = import.meta.env.VITE_API_URL;
    fetch(`${API_URL}/api/products`)
      .then((res) => res.json())
      .then((data) => setDbProducts(data))
      .catch((err) => console.error("Gagal load data:", err));
  }, []);

  // 2. LOGIKA SMOOTH SCROLL SAAT SEARCHING
  useEffect(() => {
    if (searchTerm.length > 2) {
      const element = document.getElementById("katalog-produk");
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [searchTerm]);

  // Reset ke halaman 1 jika filter berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory]);

  const categories = useMemo(() => {
    return ["Semua", ...new Set(dbProducts.map((p) => p.category))].filter(
      Boolean,
    );
  }, [dbProducts]);

  const filteredProducts = useMemo(() => {
    return dbProducts.filter((p) => {
      const matchesSearch = (p.name || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesCategory =
        selectedCategory === "Semua" || p.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory, dbProducts]);

  // --- LOGIKA SLICE PRODUK ---
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(
    indexOfFirstProduct,
    indexOfLastProduct,
  );
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    document
      .getElementById("katalog-produk")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FDFCF8] font-sans relative">
      {!isAdminPage && <Navbar onSearch={setSearchTerm} />}

      <div className="grow">
        {/* Membungkus Routes dengan Suspense agar lazy loading bekerja */}
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route
              path="/"
              element={
                <>
                  <Hero />
                  <main
                    id="katalog-produk"
                    className="container mx-auto px-6 py-20"
                  >
                    <div className="flex flex-col items-center mb-12">
                      <h2 className="text-3xl font-serif text-stone-800 mb-6">
                        Koleksi Pilihan
                      </h2>
                      <div className="flex flex-wrap justify-center gap-3">
                        {categories.map((cat) => (
                          <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all duration-300 ${
                              selectedCategory === cat
                                ? "bg-amber-900 text-white shadow-xl scale-105"
                                : "bg-white text-stone-500 border border-stone-200 hover:border-amber-700"
                            }`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </div>

                    {currentProducts.length > 0 ? (
                      <>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 md:gap-12">
                          {currentProducts.map((product) => (
                            <ProductCard key={product._id} product={product} />
                          ))}
                        </div>

                        {/* --- KONTROL PAGINATION (Limit 5) --- */}
                        {totalPages > 1 && (
                          <div className="flex justify-center items-center mt-16 gap-1 md:gap-2">
                            <button
                              onClick={() => paginate(currentPage - 1)}
                              disabled={currentPage === 1}
                              className="px-2 md:px-4 py-2 text-[10px] md:text-xs font-bold uppercase tracking-widest text-stone-400 disabled:opacity-30 hover:text-amber-900 transition-colors"
                            >
                              Prev
                            </button>

                            {(() => {
                              let startPage = Math.max(1, currentPage - 2);
                              let endPage = Math.min(totalPages, startPage + 4);

                              if (endPage - startPage < 4) {
                                startPage = Math.max(1, endPage - 4);
                              }

                              const pageNumbers = [];
                              for (let i = startPage; i <= endPage; i++) {
                                pageNumbers.push(i);
                              }

                              return pageNumbers.map((number) => (
                                <button
                                  key={number}
                                  onClick={() => paginate(number)}
                                  className={`w-9 h-9 md:w-10 md:h-10 rounded-full text-xs font-bold transition-all duration-300 ${
                                    currentPage === number
                                      ? "bg-amber-900 text-white shadow-lg"
                                      : "bg-white text-stone-500 border border-stone-100 hover:border-amber-700"
                                  }`}
                                >
                                  {number}
                                </button>
                              ));
                            })()}

                            <button
                              onClick={() => paginate(currentPage + 1)}
                              disabled={currentPage === totalPages}
                              className="px-2 md:px-4 py-2 text-[10px] md:text-xs font-bold uppercase tracking-widest text-stone-400 disabled:opacity-30 hover:text-amber-900 transition-colors"
                            >
                              Next
                            </button>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-center py-20 italic text-stone-400">
                        Model belum tersedia...
                      </div>
                    )}
                  </main>
                </>
              }
            />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/login" element={<Login />} />
            <Route path="/admin" element={<AdminDashboard />} />
          </Routes>
        </Suspense>
      </div>

      {!isAdminPage && <Footer />}
    </div>
  );
}

export default App;