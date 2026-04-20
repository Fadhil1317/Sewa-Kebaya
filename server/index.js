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
// Gunakan process.env.MONGO_URI agar lebih aman saat deploy
const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://admin_kebaya:kebayaku123@clusterkebaya.fw96hxt.mongodb.net/sewa-kebaya?appName=ClusterKebaya"; 

mongoose.connect(MONGO_URI)
  .then(() => console.log("🔥 Database Terhubung!"))
  .catch((err) => console.log("❌ Gagal Connect DB:", err));

// --- SKEMA DATA & MODEL ---

const productSchema = new mongoose.Schema({
  name: String,
  price: Number,
  category: String,
  description: String,
  image: String,
  isAvailable: { type: Boolean, default: true }
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema || mongoose.models.Product);

const transactionSchema = new mongoose.Schema({
  customerName: String,
  customerWhatsapp: String,
  productName: String,
  productId: { type: String, required: true },
  startDate: String,
  duration: Number,
  totalPrice: Number,
  status: { type: String, default: 'Sedang Disewa' },
}, { timestamps: true });

const Transaction = mongoose.model('Transaction', transactionSchema || mongoose.models.Transaction);


// --- API ROUTES ---

app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/products', async (req, res) => {
  try {
    const newProduct = new Product(req.body);
    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.put('/api/products/:id', async (req, res) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedProduct);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Produk dihapus" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/transactions', async (req, res) => {
  try {
    const transactions = await Transaction.find().sort({ createdAt: -1 });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/transactions', async (req, res) => {
  try {
    const newTransaction = new Transaction(req.body);
    await newTransaction.save();
    res.status(201).json(newTransaction);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.delete('/api/transactions/:id', async (req, res) => {
  try {
    await Transaction.findByIdAndDelete(req.params.id);
    res.json({ message: "Transaksi dihapus" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/', (req, res) => {
  res.send('API Sewa Kebaya UMKM Running...');
});

// --- SERVER LAUNCH (PENYESUAIAN VERCEL) ---

// Hanya jalankan app.listen jika tidak sedang dideploy di Vercel
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 Server lokal jalan di http://localhost:${PORT}`);
  });
}

// Penting untuk Vercel:
export default app;