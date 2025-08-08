import BaseDiscountHandler from './BaseDiscountHandler';
import { DISCOUNT_CODE_BXGY } from '../graphql/mutations/bxgy/code';

export default class BxgyCodeHandler extends BaseDiscountHandler {
  constructor() {
    super();
    this.mutation = DISCOUNT_CODE_BXGY;
    this.inputKey = 'bxgyCodeDiscount';
  }

  validate(data) {
    super.validate(data);

    if (!data.discount_code) {
      throw new Error("discount_code is required for code-based BXGY discounts.");
    }

    if (!data.buy_quantity || !data.get_quantity) {
      throw new Error("Both buy_quantity and get_quantity are required for BXGY discounts.");
    }

    if (data.discount_type === 'bogo_simple') {
      data.value = 100;
    } else if (
      data.value === undefined ||
      isNaN(data.value) ||
      data.value < 0 ||
      data.value > 100
    ) {
      throw new Error("Discount value must be a number between 0 and 100.");
    }

    const buyIds = data.product_ids || (data.buy_product_id ? [data.buy_product_id] : []);
    const getIds = data.get_product_ids || (data.get_product_id ? [data.get_product_id] : []);

    if (data.product_selection === 'specific_products' && (!Array.isArray(buyIds) || buyIds.length === 0)) {
      throw new Error("At least one buy_product_id is required for 'specific_products'.");
    }

    if (data.product_selection === 'specific_collections' && (!Array.isArray(data.collection_ids) || data.collection_ids.length === 0)) {
      throw new Error("At least one collection_id is required for 'specific_collections'.");
    }

    if (data.get_product_selection === 'specific_products' && (!Array.isArray(getIds) || getIds.length === 0)) {
      throw new Error("At least one get_product_id is required for 'specific_products'.");
    }

    if (data.get_product_selection === 'specific_collections' && (!Array.isArray(data.get_collection_ids) || data.get_collection_ids.length === 0)) {
      throw new Error("At least one get_collection_id is required for 'specific_collections'.");
    }

    data.product_ids = buyIds;
    data.get_product_ids = getIds;
  }

  buildCustomerBuys(data) {
    return {
      items: {
        products: {
          productsToAdd: data.product_ids.map(id =>
            id.startsWith('gid://') ? id : `gid://shopify/Product/${id}`
          )
        }
      },
      value: {
        quantity: data.buy_quantity.toString()
      }
    };
  }


  buildCustomerGets(data) {
    return {
      items: {
        products: {
          productsToAdd: data.get_product_ids.map(id =>
            id.startsWith('gid://') ? id : `gid://shopify/Product/${id}`
          )
        }
      },
      value: {
        discountOnQuantity: {
          quantity: data.get_quantity.toString(),
          effect: {
            percentage: 1.0
          }
        }
      }
    };
  }

  buildCombinesWith(data) {
    const stackingAllowed = data.stacking_policy === 'allow_stacking';
    return {
      orderDiscounts: stackingAllowed,
      productDiscounts: stackingAllowed,
      shippingDiscounts: stackingAllowed
    };
  }

  buildInput(data) {
    const input = {
      title: data.rule_name,
      code: data.discount_code,
      startsAt: new Date(data.start_date).toISOString(),
      endsAt: data.end_date ? new Date(data.end_date).toISOString() : null,
      combinesWith: this.buildCombinesWith(data),
      usesPerOrderLimit: data.uses_per_order ? parseInt(data.uses_per_order, 10) : 1,
      customerBuys: this.buildCustomerBuys(data),
      customerGets: this.buildCustomerGets(data),
      customerSelection: {
        all: true
      }
    };
    return input;
  }

  async createDiscount(adminClient, input) {
    const result = await adminClient.fetch(this.mutation, {
      variables: {
        [this.inputKey]: input,
      },
    });

    const data = await result.json();

    if (data?.errors) {
      throw new Error(`GraphQL Error: ${JSON.stringify(data.errors)}`);
    }

    const discountResult = Object.values(data?.data)[0];
    if (discountResult?.userErrors?.length > 0) {
      const errors = discountResult.userErrors;
      throw new Error(`Discount creation failed: ${errors.map(e => `${e.field}: ${e.message}`).join(', ')}`);
    }

    return {
      success: true,
      discountId: discountResult?.automaticDiscountNode?.id,
      message: "Discount created successfully."
    };
  }

  handleResponse(response) {
    if (response.userErrors?.length > 0) {
      const errors = response.userErrors.map(e => `${e.field}: ${e.message}`).join(', ');
      throw new Error(`Shopify API errors: ${errors}`);
    }

    if (!response.automaticDiscountNode) {
      throw new Error("No discount node returned from API");
    }

    return {
      id: response.automaticDiscountNode.id,
      ...response.automaticDiscountNode.automaticDiscount
    };
  }
}
