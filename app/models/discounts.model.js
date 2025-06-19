import mongoose from 'mongoose';

const AppDiscountTypeSchema = new mongoose.Schema({
    appKey: { type: String, required: true },
    functionId: { type: String, required: true }
}, { _id: false });

const CombinesWithSchema = new mongoose.Schema({
    orderDiscounts: { type: Boolean, required: true },
    productDiscounts: { type: Boolean, required: true },
    shippingDiscounts: { type: Boolean, required: true }
}, { _id: false });

const AutomaticAppDiscountSchema = new mongoose.Schema({
    shopify_domain: {
        type: String,
        required: true
    },
    discounts: [
        {
            discountId: { type: String, required: true },
            title: { type: String, required: true },
            startsAt: { type: Date, required: true },
            endsAt: { type: Date, required: true },
            status: { type: String, required: true },
            appDiscountType: { type: AppDiscountTypeSchema, required: true },
            combinesWith: { type: CombinesWithSchema, required: true }
        }
    ]
}, { timestamps: true });

const Discount = mongoose.models.Discount || mongoose.model('DiscountAutomaticApp', AutomaticAppDiscountSchema);

export default Discount;
