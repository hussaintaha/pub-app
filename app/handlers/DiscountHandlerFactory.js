import BasicCodeHandler from './BasicCodeHandler';
import BasicAutomaticHandler from './BasicAutomaticHandler';
import FreeShippingCodeHandler from './FreeShippingCodeHandler';
import FreeShippingAutomaticHandler from './FreeShippingAutomaticHandler';
import BxgyCodeHandler from './BxgyCodeHandler';
import BxgyAutomaticHandler from './BxgyAutomaticHandler';
import FirstTimeBuyerHandler from './FirstTimeBuyerHandler';
import { DiscountNormalizer } from '../utils/DiscountNormalizer';

export default class DiscountHandlerFactory {
  static createHandler(discountType, triggerType, options = {}) {
    try {
      const normalizedDiscountType = DiscountNormalizer.normalizeDiscountType(discountType);
      const normalizedTriggerType = DiscountNormalizer.normalizeTriggerType(triggerType);
      const shopifyType = DiscountNormalizer.getShopifyDiscountType(normalizedDiscountType);

      if (normalizedDiscountType === 'FIRST_TIME_BUYER') {
        return new FirstTimeBuyerHandler(normalizedTriggerType);
      }

      // Map to handler classes
      const handlerMap = {
        'BASIC_DISCOUNT_CODE': BasicCodeHandler,
        'BASIC_AUTOMATIC': BasicAutomaticHandler,
        'BASIC_CART_CONDITIONS': BasicAutomaticHandler,
        'FREE_SHIPPING_DISCOUNT_CODE': FreeShippingCodeHandler,
        'FREE_SHIPPING_AUTOMATIC': FreeShippingAutomaticHandler,
        'FREE_SHIPPING_CART_CONDITIONS': FreeShippingAutomaticHandler,
        'BXGY_DISCOUNT_CODE': BxgyCodeHandler,
        'BXGY_AUTOMATIC': BxgyAutomaticHandler,
        'BXGY_CART_CONDITIONS': BxgyAutomaticHandler,
        'FIRST_TIME_BUYER_DISCOUNT_CODE': FirstTimeBuyerHandler,
        'FIRST_TIME_BUYER_AUTOMATIC': FirstTimeBuyerHandler
      };

      const key = `${shopifyType}_${normalizedTriggerType}`;
      console.log('key: ', key);

      if (!handlerMap[key]) {
        throw new Error(`Unsupported combination: ${normalizedDiscountType} with ${normalizedTriggerType}`);
      }

      return new handlerMap[key]();
    } catch (error) {
      throw new Error(`Handler creation failed: ${error.message}`);
    }
  }
}