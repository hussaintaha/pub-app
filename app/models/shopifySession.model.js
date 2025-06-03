// Shopify Session 

import mongoose from "mongoose";

const shopifySessionSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
  },
  shop: {
    type: String,
    required: true,
  },
  state: {
    type: String,
  },
  isOnline: {
    type: Boolean,
  },
  scope: {
    type: String,
  },
  accessToken: {
    type: String,
  },
}, {timestamps: true});

const ShopifySession = mongoose.models.Shopify_Session || mongoose.model('Shopify_Session', shopifySessionSchema)

export default ShopifySession
