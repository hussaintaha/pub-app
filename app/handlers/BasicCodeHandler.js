import BaseDiscountHandler from './BaseDiscountHandler';
import { DISCOUNT_CODE_BASIC } from '../graphql/mutations/basic/code';

export default class BasicCodeHandler extends BaseDiscountHandler {
  constructor() {
    super();
    this.mutation = DISCOUNT_CODE_BASIC;
    this.inputKey = "basicCodeDiscount";
    this.supportedSelections = ['all_products', 'specific_products', 'specific_collections'];
    this.supportedCurrencies = ['USD', 'INR', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY'];
    this.defaultCurrency = 'INR';
  }

  validate(data) {
    super.validate(data);
    
    // Required fields validation according to Shopify's DiscountCodeBasicInput
    const requiredFields = [
      'rule_name', 'discount_code', 'discount_type', 
      'value', 'start_date', 'product_selection'
    ];
    
    requiredFields.forEach(field => {
      if (!data[field]) {
        throw new Error(`Field '${field}' is required`);
      }
    });

    // Discount value validation
    if (data.discount_type === 'PERCENTAGE_OFF' || data.discount_type === 'percentage') {
      if (data.value < 0 || data.value > 100) {
        throw new Error("Percentage value must be between 0 and 100");
      }
    } else if (data.discount_type === 'FIXED_AMOUNT_OFF' || data.discount_type === 'fixed') {
      if (isNaN(data.value) || data.value <= 0) {
        throw new Error("Fixed amount value must be a positive number");
      }
    }

    // Product selection validation
    if (!this.supportedSelections.includes(data.product_selection)) {
      throw new Error(`Invalid product selection. Must be one of: ${this.supportedSelections.join(', ')}`);
    }

    if (data.product_selection === 'specific_products' && (!data.product_ids || data.product_ids.length === 0)) {
      throw new Error("Product IDs are required for 'specific_products' selection");
    }
    if (data.product_selection === 'specific_collections' && (!data.collection_ids || data.collection_ids.length === 0)) {
      throw new Error("Collection IDs are required for 'specific_collections' selection");
    }
  }

  buildInput(data) {
    // Build input according to DiscountCodeBasicInput schema
    const input = {
      title: data.rule_name,
      code: data.discount_code,
      startsAt: new Date(data.start_date).toISOString(),
      customerSelection: this.buildCustomerSelection(data),
      customerGets: this.buildCustomerGets(data)
    };

    // Optional fields based on DiscountCodeBasicInput
    if (data.end_date) {
      input.endsAt = new Date(data.end_date).toISOString();
    }
    if (data.usage_limit) {
      input.usageLimit = parseInt(data.usage_limit);
    }
    if (data.customer_limit !== undefined) {
      input.appliesOncePerCustomer = Boolean(data.customer_limit === 1);
    }
    if (data.stacking_policy) {
      input.combinesWith = this.buildCombinesWith(data);
    }
    if (data.minimum_order) {
      input.minimumRequirement = this.buildMinimumRequirement(data);
    }
    if (data.recurring_cycle_limit) {
      input.recurringCycleLimit = parseInt(data.recurring_cycle_limit);
    }

    return input;
  }

  buildCustomerSelection(data) {
    // Handle specific customer segment if provided
    if (data.customer_segment_id) {
      return { 
        customerSegments: {
          add: [data.customer_segment_id]
        }
      };
    }

    // Handle specific customers if provided
    if (data.customer_ids && data.customer_ids.length > 0) {
      return {
        customers: {
          add: data.customer_ids.map(id => this.normalizeId(id, 'Customer'))
        }
      };
    }
    
    // Default to all customers (supports any country)
    return { all: true };
  }

  buildCustomerGets(data) {
    // Build according to DiscountCustomerGetsInput schema
    const customerGets = {
      value: this.buildDiscountValue(data),
      items: this.buildItemSelection(data)
    };

    // Add subscription/one-time purchase options if specified
    if (data.applies_on_one_time_purchase !== undefined) {
      customerGets.appliesOnOneTimePurchase = Boolean(data.applies_on_one_time_purchase);
    }
    if (data.applies_on_subscription !== undefined) {
      customerGets.appliesOnSubscription = Boolean(data.applies_on_subscription);
    }

    return customerGets;
  }

  buildDiscountValue(data) {
    // Build according to DiscountCustomerGetsValueInput schema
    if (data.discount_type === 'PERCENTAGE_OFF' || data.discount_type === 'percentage') {
      return { 
        percentage: parseFloat(data.value) / 100 
      };
    } else {
      // For fixed amount discounts, appliesOnEachItem is REQUIRED
      return {
        discountAmount: {
          amount: parseFloat(data.value).toString(),
          appliesOnEachItem: this.determineAppliesOnEachItem(data)
        }
      };
    }
  }

  determineAppliesOnEachItem(data) {
    // Based on Shopify documentation:
    // - true: discount applies to each item individually (e.g., $10 off each item)
    // - false: discount applies proportionally across all items (e.g., $50 off total cart)
    
    // If explicitly specified in data, use that value
    if (data.applies_on_each_item !== undefined) {
      return Boolean(data.applies_on_each_item);
    }
    
    // Default behavior based on product selection:
    // - For specific products: typically applies to each item
    // - For all products: typically applies proportionally to total
    if (data.product_selection === 'specific_products') {
      return true; // Apply discount to each qualifying item
    } else {
      return false; // Apply discount proportionally across all items
    }
  }

  buildItemSelection(data) {
    // Build according to DiscountItemsInput schema
    switch(data.product_selection) {
      case 'specific_products':
        return {
          products: {
            productsToAdd: data.product_ids.map(id => this.normalizeId(id, 'Product'))
          }
        };
      case 'specific_collections':
        return {
          collections: {
            collectionsToAdd: data.collection_ids.map(id => this.normalizeId(id, 'Collection'))
          }
        };
      case 'all_products':
        return { all: true };
      default:
        throw new Error(`Unsupported product selection: ${data.product_selection}`);
    }
  }

  normalizeId(id, resourceType) {
    // Ensure proper GID format for Shopify resources
    return id.startsWith('gid://') ? id : `gid://shopify/${resourceType}/${id}`;
  }

  buildMinimumRequirement(data) {
    // Build according to DiscountMinimumRequirementInput schema
    const minAmount = data.minimum_order || data.conditions?.minimum_cart_value;
    if (!minAmount) return null;
    
    return {
      subtotal: {
        greaterThanOrEqualToSubtotal: parseFloat(minAmount).toString()
      }
    };
  }

  buildCombinesWith(data) {
    // Build according to DiscountCombinesWithInput schema
    const allowStacking = data.stacking_policy === "allow_stacking";
    return {
      orderDiscounts: allowStacking,
      productDiscounts: allowStacking,
      shippingDiscounts: allowStacking
    };
  }

  handleResponse(response) {
    // Handle response from discountCodeBasicCreate mutation
    if (response.userErrors?.length > 0) {
      const errors = response.userErrors.map(e => `${e.field}: ${e.message}`).join('\n');
      throw new Error(`Shopify API errors:\n${errors}`);
    }

    if (!response.codeDiscountNode) {
      throw new Error("No discount node returned from API");
    }

    const discount = response.codeDiscountNode.codeDiscount;
    return {
      id: response.codeDiscountNode.id,
      code: discount.codes?.nodes[0]?.code,
      title: discount.title,
      status: discount.status,
      startsAt: discount.startsAt,
      endsAt: discount.endsAt,
      summary: discount.summary
    };
  }
}
