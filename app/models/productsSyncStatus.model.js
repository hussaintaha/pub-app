import mongoose from "mongoose";

const productSyncStatusSchema = new mongoose.Schema({
  isSync: {
    type: Boolean,
    required: true,
    default: false
  },
  productSync: {
    type: Number,
    required: true,
    default: 0
  },
  syncPercentage: {
    type: Number,
    required: true,
    default: 0
  },
  collectionSync: {
    type: Number,
    required: true,
    default: 0
  },
  collectionSyncPercentage: {
    type: Number,
    required: true,
    default: 0
  },
  shop: {
    type: String,
    required: true
  }
}, { timestamps: true });

const ProductSyncStatus = mongoose.models.ProductSyncStatus || mongoose.model("ProductSyncStatus", productSyncStatusSchema);

export default ProductSyncStatus;
