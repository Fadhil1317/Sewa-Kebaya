export const products = [
  { id: 1, name: "Kebaya Kutubaru Klasik", price: 150000, category: "Tradisional", image: "batik-1" },
  { id: 2, name: "Kebaya Brokat Modern Blue", price: 250000, category: "Modern", image: "batik-2" },
  { id: 3, name: "Kebaya Wisuda Simpel", price: 125000, category: "Wisuda", image: "batik-3" },
  { id: 4, name: "Kebaya Encim Motif Bunga", price: 175000, category: "Tradisional", image: "batik-4" },
  // ... bayangkan ada 40 data di sini
];

// Fungsi helper untuk generate data banyak secara otomatis buat testing
export const generateDummyData = (count) => {
  const categories = ["Tradisional", "Modern", "Wisuda", "Pernikahan"];
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: `Kebaya ${categories[i % categories.length]} Type ${i + 1}`,
    price: 150000 + (i * 10000),
    category: categories[i % categories.length],
  }));
};