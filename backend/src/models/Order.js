import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: false
    },
    name: {
      type: String,
      required: true
    },
    image: String,
    price: {
      type: Number,
      required: true,
      min: 0
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    }
  },
  { _id: false }
);

const orderStatusValues = ["Pending", "Confirmed", "In Progress", "Shipped", "Delivered", "Cancelled"];

const statusHistorySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: orderStatusValues,
      required: true
    },
    note: {
      type: String,
      trim: true,
      default: ""
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      trim: true,
      uppercase: true,
      unique: true,
      sparse: true,
      index: true
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    customerName: {
      type: String,
      required: [true, "Customer name is required"],
      trim: true
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true
    },
    email: {
      type: String,
      trim: true,
      lowercase: true
    },
    address: {
      type: String,
      required: [true, "Address is required"],
      trim: true
    },
    items: {
      type: [orderItemSchema],
      validate: [(value) => value.length > 0, "Order must contain at least one item"]
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0
    },
    paymentMethod: {
      type: String,
      enum: ["COD", "WhatsApp", "Razorpay"],
      default: "WhatsApp"
    },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Failed", "Refunded"],
      default: "Pending"
    },
    orderStatus: {
      type: String,
      enum: orderStatusValues,
      default: "Pending"
    },
    statusHistory: {
      type: [statusHistorySchema],
      default: () => [{ status: "Pending", note: "Order received" }]
    },
    paymentInfo: {
      razorpayOrderId: String,
      razorpayPaymentId: String,
      razorpaySignature: String
    }
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);

export default Order;
