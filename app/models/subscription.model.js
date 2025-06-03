import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema(
  {
    graphQlID: {
      type: String,
      default: null,
    },
    status: {
      required: true,
      type: String,
    },
    planName: {
      required: true,
      type: String,
      enum: ["Cartia Growth Plan", "Cartia Pro Plan", "Cartia Enterprise Plan", "Free Plan"],
      default:"Free Plan"
    },
    isDevelopmentStore: {
      required: true,
      type: Boolean,
    },
    shop: {
      requred: true,
      type: String,
    },
  },
  { timestamps: true },
);

const Subcription = mongoose.models.Subscription || mongoose.model('Subscription', subscriptionSchema)

export default Subcription
