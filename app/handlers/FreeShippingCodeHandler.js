import BaseDiscountHandler from './BaseDiscountHandler';
import { DISCOUNT_CODE_FREE_SHIP } from '../graphql/mutations/freeShipping/code';

export default class FreeShippingCodeHandler extends BaseDiscountHandler {
  constructor() {
    super();
    this.mutation = DISCOUNT_CODE_FREE_SHIP;
    this.inputKey = "freeShippingCodeDiscount";
  }

  validate(data) {
    super.validate(data);
    
    if (!data.discount_code) {
      throw new Error("Discount code is required");
    }

    if (data.geographic_restrictions && !Array.isArray(data.geographic_restrictions)) {
      throw new Error("Geographic restrictions must be an array of country codes");
    }
  }

  buildInput(data) {
    const baseInput = {
      title: data.rule_name || 'Free Shipping Discount',
      startsAt: new Date(data.start_date).toISOString(),
      endsAt: data.end_date ? new Date(data.end_date).toISOString() : null,
      code: data.discount_code,
      customerSelection: { all: true },
      usageLimit: data.usage_limit ? parseInt(data.usage_limit) : null,
      appliesOncePerCustomer: data.customer_limit === 1,
      destination: this.buildDestination(data),
      maximumShippingPrice: this.buildMaximumShippingPrice(data),
      minimumRequirement: this.buildMinimumRequirement(data),
      combinesWith: this.buildCombinesWith(data)
    };

    return baseInput;
  }

  buildDestination(data) {
    if (data.geographic_restrictions?.length > 0) {
      return {
        countries: {
          add: data.geographic_restrictions,
          includeRestOfWorld: data.include_rest_of_world || false
        }
      };
    }
    return { all: true };
  }

  buildMaximumShippingPrice(data) {
    if (!data.maximum_shipping_price) return null;
    return parseFloat(data.maximum_shipping_price).toFixed(2);
  }

  buildMinimumRequirement(data) {
    const minAmount = data.minimum_order || data.conditions?.minimum_cart_value;
    if (!minAmount) return null;
    
    return {
      subtotal: {
        greaterThanOrEqualToSubtotal: parseFloat(minAmount).toFixed(2)
      }
    };
  }

  buildCombinesWith(data) {
    return {
      orderDiscounts: data.stacking_policy === "allow_stacking",
      productDiscounts: data.stacking_policy === "allow_stacking",
      shippingDiscounts: false
    };
  }
}