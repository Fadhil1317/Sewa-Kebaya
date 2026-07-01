import { useState, useMemo, useEffect, lazy, Suspense } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast"; // Import wrapper notifikasi premium
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import ProductCard from "./components/ProductCard";
import Footer from "./components/Footer";

// --- LAZY LOADING PAGES ---
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const Login = lazy(() => import("./pages/Login"));

// Komponen Loading Spinner Cantik untuk Halaman Utama & Perpindahan Halaman
const PageLoader = () => (
  <div className="flex flex-col h-64 items-center justify-center gap-3 bg-[#FDFCF8]">
    <div className="w-10 h-10 border-4 border-stone-200 border-t-amber-950 rounded-full animate-spin"></div>
    <p className="text-stone-500 font-serif italic text-sm tracking-wide animate-pulse">
      Memuat koleksi kebaya...
    </p>
  </div>
);

function App() {
  const [dbProducts, setDbProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  
  // State indikator muat data (Default TRUE agar saat pertama buka langsung loading)
  const [isLoading, setIsLoading] = useState(true);

  // --- STATE PAGINATION ---
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 8;

  const location = useLocation();
  const isAdminPage =
    location.pathname.startsWith("/admin") || location.pathname === "/login";

  // 1. Fetch Data Produk Instan (Tanpa Delay Buatan)
  useEffect(() => {
    const API_URL = import.meta.env.VITE_API_URL;
    fetch(`${API_URL}/api/products`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setDbProducts(data);
        } else {
          setDbProducts([]);
        }
        setIsLoading(false); // Matikan loading secepat kilat setelah data didapat
      })
      .catch((err) => {
        console.error("Gagal load data:", err);
        setDbProducts([]);
        setIsLoading(false); // Matikan loading jika error agar tidak menggantung
      });
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
      {/* Konfigurasi Toaster Global dengan style elegan senada tema website */}
      <Toaster 
        position="top-right" 
        toastOptions={{
          className: 'font-sans text-xs font-medium text-stone-800 bg-white border border-stone-200 rounded-xl shadow-md p-4',
          success: {
            iconTheme: { primary: '#78350f', secondary: '#fff' }
          },
          error: {
            iconTheme: { primary: '#b91c1c', secondary: '#fff' }
          }
        }} 
      />

      {!isAdminPage && <Navbar onSearch={setSearchTerm} />}

      <div className="grow">
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

                    {/* LOGIKA KONDISIONAL BERDASARKAN STATUS AMBIL DATA */}
                    {isLoading ? (
                      // 1. Tampilkan spinner berputar saat request API sedang berjalan
                      <PageLoader />
                    ) : currentProducts.length > 0 ? (
                      // 2. Jika loading beres dan ada datanya, langsung muncul semua card
                      <>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 md:gap-12">
                          {currentProducts.map((product) => (
                            <ProductCard key={product._id} product={product} />
                          ))}
                        </div>

                        {/* --- KONTROL PAGINATION --- */}
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
                      // 3. Jika loading beres tapi emang datanya kosong / backend error 500
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