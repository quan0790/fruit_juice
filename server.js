require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const app = express();

// ===== Middleware =====
app.use(express.json()); // replaces bodyParser.json()
app.use(cors()); // allow frontend access
app.use(express.static(path.join(__dirname, "public")));

// ===== MongoDB Connection =====
mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// ===== Schema & Model =====
const orderSchema = new mongoose.Schema({
  juice: { type: String, required: true },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  quantity: { type: Number, required: true },
  instructions: { type: String },
  createdAt: { type: Date, default: Date.now },
});

const Order = mongoose.model("Order", orderSchema);

// ===== API Routes =====

// Place new order
app.post("/api/order", async (req, res) => {
  try {
    const { juice, name, phone, quantity, instructions } = req.body;

    if (!juice || !name || !phone || !quantity) {
      return res.status(400).json({ error: "All required fields must be filled." });
    }

    const newOrder = new Order({ juice, name, phone, quantity, instructions });
    await newOrder.save();

    res.status(201).json({
      message: "✅ Order placed successfully!",
      order: newOrder,
    });
  } catch (err) {
    console.error("Error placing order:", err);
    res.status(500).json({ error: "Failed to place order." });
  }
});

// Get all orders (Dashboard/Admin)
app.get("/api/orders", async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error("Error fetching orders:", err);
    res.status(500).json({ error: "Failed to fetch orders." });
  }
});

// Delete order by ID
app.delete("/api/orders/:id", async (req, res) => {
  try {
    const deleted = await Order.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: "Order not found." });
    }
    res.json({ message: "🗑️ Order deleted successfully." });
  } catch (err) {
    console.error("Error deleting order:", err);
    res.status(500).json({ error: "Failed to delete order." });
  }
});

// ===== Start Server =====
const PORT = process.env.PORT || 5003;
app.listen(PORT, () =>
  console.log(`🚀 Server running at: http://localhost:${PORT}`)
);
