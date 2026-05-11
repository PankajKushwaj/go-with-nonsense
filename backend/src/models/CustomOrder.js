import mongoose from "mongoose";

const customOrderSchema = new mongoose.Schema(
  {
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
    productType: {
      type: String,
      required: [true, "Product type is required"],
      trim: true
    },
    designDetails: {
      type: String,
      required: [true, "Design details are required"],
      trim: true
    },
    referenceImage: {
      type: String,
      default: ""
    },
    budget: {
      type: Number,
      min: 0
    },
    deliveryDate: Date,
    status: {
      type: String,
      enum: ["Pending", "Discussing", "Accepted", "In Progress", "Completed", "Cancelled"],
      default: "Pending"
    }
  },
  { timestamps: true }
);

const CustomOrder = mongoose.model("CustomOrder", customOrderSchema);

export default CustomOrder;
