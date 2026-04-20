import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import dns from "node:dns/promises";

// FIX DNS: Mencegah error ECONNREFUSED pada jaringan tertentu di Indonesia
dns.setServers(["8.8.8.8", "1.1.1.1"]);

dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// --- KONEKSI DATABASE ---
const MONGO_URI = "mongodb+srv://admin_kebaya:kebayaku123@clusterkebaya.fw96hxt.mongodb.net/sewa-kebaya?appName=ClusterKebaya"; 

mongoose.connect(MONGO_URI)
  .then(() => console.log("🔥 Database Terhubung (Jakarta Cloud)!"))
  .catch((err) => console.log("❌ Gagal Connect DB:", err));

// --- SKEMA DATA & MODEL ---

// 1. Model Produk
const productSchema = new mongoose.Schema({
  name: String,
  price: Number,
  category: String,
  description: String,
  image: String,
  isAvailable: { type: Boolean, default: true }
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);

// 2. Model Transaksi
const transactionSchema = new mongoose.Schema({
  customerName: String,
  customerWhatsapp: String,
  productName: String,
  productId: { type: String, required: true }, // ID Produk terkait
  startDate: String,
  duration: Number,
  totalPrice: Number,
  status: { type: String, default: 'Sedang Disewa' },
}, { timestamps: true });

const Transaction = mongoose.model('Transaction', transactionSchema);


// --- API ROUTES PRODUK ---

// Get All Products
app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add New Product
app.post('/api/products', async (req, res) => {
  try {
    const newProduct = new Product(req.body);
    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update Product (Edit / Change Availability)
app.put('/api/products/:id', async (req, res) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true }
    );
    if (!updatedProduct) return res.status(404).json({ message: "Produk tidak ditemukan" });
    res.json(updatedProduct);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete Product
app.delete('/api/products/:id', async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    if (!deletedProduct) return res.status(404).json({ message: "Produk tidak ditemukan" });
    res.json({ message: "Produk berhasil dihapus" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// --- API ROUTES TRANSAKSI ---

// Get All Transactions
app.get('/api/transactions', async (req, res) => {
  try {
    const transactions = await Transaction.find().sort({ createdAt: -1 });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create New Transaction
app.post('/api/transactions', async (req, res) => {
  try {
    const newTransaction = new Transaction(req.body);
    await newTransaction.save();
    res.status(201).json(newTransaction);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete Transaction (Batalkan Sewa)
app.delete('/api/transactions/:id', async (req, res) => {
  try {
    const deleted = await Transaction.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Transaksi tidak ditemukan" });
    res.json({ message: "Transaksi berhasil dihapus" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// --- SERVER LAUNCH ---

app.get('/', (req, res) => {
  res.send('API Sewa Kebaya UMKM Running...');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server lari di http://localhost:${PORT}`);
});

export default app;