import BaseDiscountHandler from './BaseDiscountHandler';
import { DISCOUNT_AUTOMATIC_FREE_SHIP } from '../graphql/mutations/freeShipping/automatic';

export default class FreeShippingAutomaticHandler extends BaseDiscountHandler {
  constructor() {
    super();
    this.mutation = DISCOUNT_AUTOMATIC_FREE_SHIP;
    this.inputKey = "freeShippingAutomaticDiscount";
  }

  validate(data) {
    super.validate(data); 
    
    // Validate date logic
    if (data.end_date && data.start_date) {
      const startDate = new Date(data.start_date);
      const endDate = new Date(data.end_date);
      
      if (endDate <= startDate) {
        throw new Error("Invalid discount input: end_date must be after start_date");
      }
    }
    
    if (data.geographic_restrictions && !Array.isArray(data.geographic_restrictions)) {
      throw new Error("Geographic restrictions must be an array of country codes");
    }
    
    if (data.region && data.region.country_codes && !Array.isArray(data.region.country_codes)) {
      throw new Error("Region country codes must be an array");
    }
    
    if (data.maximum_shipping_price && (isNaN(data.maximum_shipping_price) || data.maximum_shipping_price <= 0)) {
      throw new Error("Maximum shipping price must be a positive number");
    }
  }

  buildInput(data) {
    console.log('data: $$$$$$$$$$$$$$$$$$$$$', data);
    
    let endsAt = null;
    if (data.end_date) {
      const startDate = new Date(data.start_date);
      const endDate = new Date(data.end_date);
      
      // If end date is same as or before start date, add 1 hour to make it valid
      if (endDate <= startDate) {
        endDate.setHours(startDate.getHours() + 1);
      }
      endsAt = endDate.toISOString();
    }
    
    return {
      title: data.rule_name || 'Free Shipping Discount',
      startsAt: new Date(data.start_date).toISOString(),
      endsAt: endsAt,
      appliesOnOneTimePurchase: true,
      appliesOnSubscription: data.applies_on_subscription || false,
      destination: this.buildDestination(data),
      maximumShippingPrice: this.buildMaximumShippingPrice(data),
      minimumRequirement: this.buildMinimumRequirement(data),
      combinesWith: this.buildCombinesWith(data)
    };
  }

 buildDestination(data) {
  const allCountries = [
    ...(data.geographic_restrictions || []),
    ...(data.region?.country_codes || [])
  ];

  const uniqueCountries = [...new Set(allCountries)].filter(Boolean);

  if (uniqueCountries.length === 0) {
    return { all: true };
  }

  return {
    countries: {
      add: uniqueCountries,
      includeRestOfWorld: data.include_rest_of_world || false
    }
  };
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
    const allowStacking = data.stacking_policy === "allowed" || data.stacking_policy === "allow_stacking";
    return {
      orderDiscounts: allowStacking,
      productDiscounts: allowStacking,
      shippingDiscounts: false 
    };
  }
}
