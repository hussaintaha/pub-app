// app/utils/DiscountNormalizer.js
export class DiscountNormalizer {
  static normalizeDiscountType(discountType) {
    const typeMap = {
      // Percentage discounts
      'percentage': 'PERCENTAGE_OFF',
      'percentage_off': 'PERCENTAGE_OFF',
      'PERCENTAGE_OFF': 'PERCENTAGE_OFF',
      'percent': 'PERCENTAGE_OFF',

      // Fixed amount discounts
      'fixed_amount': 'FIXED_AMOUNT_OFF',
      'fixed_amount_off': 'FIXED_AMOUNT_OFF',
      'FIXED_AMOUNT_OFF': 'FIXED_AMOUNT_OFF',
      'fixed': 'FIXED_AMOUNT_OFF',
      'amount_off': 'FIXED_AMOUNT_OFF',

      // Free shipping
      'free_shipping': 'FREE_SHIPPING',
      'FREE_SHIPPING': 'FREE_SHIPPING',
      'shipping': 'FREE_SHIPPING',

      "bogo_simple": "bxgy",
      "bogo_auto": "bxgy",
      "bxgy": "bxgy",
      "bogo": "bxgy",
      "buy_one_get_one": "bxgy",
      'BOGO': 'bxgy',
      'BUY_ONE_GET_ONE': 'bxgy',
      'BXGY': 'bxgy',

      'first_time_buyer': 'FIRST_TIME_BUYER',
      'FIRST_TIME_BUYER': 'FIRST_TIME_BUYER',
      'first_time': 'FIRST_TIME_BUYER',
      'new_customer': 'FIRST_TIME_BUYER',
      'welcome_discount': 'FIRST_TIME_BUYER',
    };

    const normalized = typeMap[discountType.toLowerCase()] || discountType.toUpperCase();
    if (!Object.values(typeMap).includes(normalized)) {
      throw new Error(`Invalid discount type: ${discountType}. Valid types are: ${Object.keys(typeMap).join(', ')}`);
    }
    return normalized;
  }

  static normalizeTriggerType(triggerType) {
    const triggerMap = {
      'discount_code': 'DISCOUNT_CODE',
      'DISCOUNT_CODE': 'DISCOUNT_CODE',
      'code': 'DISCOUNT_CODE',

      'automatic': 'AUTOMATIC',
      'AUTOMATIC': 'AUTOMATIC',
      'auto': 'AUTOMATIC',

      'cart_conditions': 'CART_CONDITIONS',
      'CART_CONDITIONS': 'CART_CONDITIONS',
      'cart': 'CART_CONDITIONS',
      'cart_based': 'CART_CONDITIONS',
    };

    const normalized = triggerMap[triggerType.toLowerCase()] || triggerType.toUpperCase();
    if (!Object.values(triggerMap).includes(normalized)) {
      throw new Error(`Invalid trigger type: ${triggerType}. Valid types are: ${Object.keys(triggerMap).join(', ')}`);
    }
    return normalized;
  }

  static getShopifyDiscountType(normalizedType) {
    const shopifyTypeMap = {
      'PERCENTAGE_OFF': 'BASIC',
      'FIXED_AMOUNT_OFF': 'BASIC',
      'FREE_SHIPPING': 'FREE_SHIPPING',
      'BOGO': 'BXGY',
      "bxgy": "BXGY",
      'FIRST_TIME_BUYER': 'FIRST_TIME_BUYER',
    };

    return shopifyTypeMap[normalizedType] || 'BASIC';
  }
}