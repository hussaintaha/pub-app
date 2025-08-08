import {
  DISCOUNT_CODE_BASIC,
  DISCOUNT_AUTOMATIC_BASIC,
  DISCOUNT_CODE_FREE_SHIP,
  DISCOUNT_AUTOMATIC_FREE_SHIP,
  DISCOUNT_CODE_BXGY,
  DISCOUNT_AUTOMATIC_BXGY,
} from "../graphql/mutations/index.js";



function normalizeDiscountType(discountType) {
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
        
        // BOGO/BXGY
        'bogo': 'BOGO',
        'BOGO': 'BOGO',
        'buy_one_get_one': 'BOGO',
        'BUY_ONE_GET_ONE': 'BOGO',
        'bxgy': 'BOGO',
        'BXGY': 'BOGO',
    };
    
    const normalized = typeMap[discountType.toLowerCase()] || discountType.toUpperCase();
    if (!Object.values(typeMap).includes(normalized)) {
        throw new Error(`Invalid discount type: ${discountType}. Valid types are: ${Object.keys(typeMap).join(', ')}`);
    }
    return normalized;
}

// Trigger type normalization
function normalizeTriggerType(triggerType) {
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

function getShopifyDiscountType(normalizedType) {
    const shopifyTypeMap = {
        'PERCENTAGE_OFF': 'BASIC',
        'FIXED_AMOUNT_OFF': 'BASIC',
        'FREE_SHIPPING': 'FREE_SHIPPING',
        'BOGO': 'BXGY',
    };
    
    return shopifyTypeMap[normalizedType] || 'BASIC';
}

// Main function to get the appropriate mutation
export function getDiscountMutation(data) {
    const { discount_type, trigger_type } = data;

    if (!discount_type || !trigger_type) {
        console.log("discount_type and trigger_type are required");
        throw new Error("discount_type and trigger_type are required");
    }

    const normalizedDiscountType = normalizeDiscountType(discount_type);
    const normalizedTriggerType = normalizeTriggerType(trigger_type);
    const shopifyType = getShopifyDiscountType(normalizedDiscountType);

    // Map to actual Shopify mutations
    const mutationMap = {
        'BASIC_DISCOUNT_CODE': {
            mutationName: "discountCodeBasicCreate",
            mutation: DISCOUNT_CODE_BASIC,
            inputKey: "basicCodeDiscount",
        },
        'BASIC_AUTOMATIC': {
            mutationName: "discountAutomaticBasicCreate",
            mutation: DISCOUNT_AUTOMATIC_BASIC,
            inputKey: "automaticBasicDiscount",
        },
        'BASIC_CART_CONDITIONS': {
            mutationName: "discountAutomaticBasicCreate",
            mutation: DISCOUNT_AUTOMATIC_BASIC,
            inputKey: "automaticBasicDiscount",
        },
        'FREE_SHIPPING_DISCOUNT_CODE': {
            mutationName: "discountCodeFreeShippingCreate",
            mutation: DISCOUNT_CODE_FREE_SHIP,
            inputKey: "freeShippingCodeDiscount",
        },
        'FREE_SHIPPING_AUTOMATIC': {
            mutationName: "discountAutomaticFreeShippingCreate",
            mutation: DISCOUNT_AUTOMATIC_FREE_SHIP,
            inputKey: "freeShippingAutomaticDiscount",
        },
        'FREE_SHIPPING_CART_CONDITIONS': {
            mutationName: "discountAutomaticFreeShippingCreate",
            mutation: DISCOUNT_AUTOMATIC_FREE_SHIP,
            inputKey: "freeShippingAutomaticDiscount",
        },
        'BXGY_DISCOUNT_CODE': {
            mutationName: "discountCodeBxgyCreate",
            mutation: DISCOUNT_CODE_BXGY,
            inputKey: "bxgyCodeDiscount",
        },
        'BXGY_AUTOMATIC': {
            mutationName: "discountAutomaticBxgyCreate",
            mutation: DISCOUNT_AUTOMATIC_BXGY,
            inputKey: "bxgyAutomaticDiscount",
        },
        'BXGY_CART_CONDITIONS': {
            mutationName: "discountAutomaticBxgyCreate",
            mutation: DISCOUNT_AUTOMATIC_BXGY,
            inputKey: "bxgyAutomaticDiscount",
        },
    };

    const key = `${shopifyType}_${normalizedTriggerType}`;

    if (!mutationMap[key]) {
        throw new Error(`Unsupported combination: ${normalizedDiscountType} with ${normalizedTriggerType}`);
    }
    
    return {
        ...mutationMap[key],
        originalDiscountType: normalizedDiscountType,
        originalTriggerType: normalizedTriggerType
    };
}

export function buildDiscountInput(data) {
    const normalizedDiscountType = normalizeDiscountType(data.discount_type);
    const normalizedTriggerType = normalizeTriggerType(data.trigger_type);
    const shopifyType = getShopifyDiscountType(normalizedDiscountType);

    validateDiscountInput(data, normalizedDiscountType, normalizedTriggerType);

    // Route to appropriate builder
    if (shopifyType === 'FREE_SHIPPING') {
        return buildFreeShippingInput(data, normalizedTriggerType);
    }
    
    if (shopifyType === 'BXGY') {
        return buildBxgyInput(data);
    }
    
    return buildBasicDiscountInput(data, normalizedDiscountType, normalizedTriggerType);
}

function validateDiscountInput(data, discountType, triggerType) {
    const errors = [];
    
    if (!data.rule_name) errors.push("rule_name is required");
    if (!data.start_date) errors.push("start_date is required");
    
    if (discountType === 'PERCENTAGE_OFF' || discountType === 'FIXED_AMOUNT_OFF') {
        if (data.value === undefined || data.value === null) {
            errors.push("value is required for this discount type");
        } else if (isNaN(data.value)) {
            errors.push("value must be a number");
        } else if (discountType === 'PERCENTAGE_OFF' && (data.value < 0 || data.value > 100)) {
            errors.push("percentage value must be between 0 and 100");
        }
    }
    
    // Discount code validation
    if (triggerType === 'DISCOUNT_CODE' && !data.discount_code) {
        errors.push("discount_code is required for code-based discounts");
    }
    
    // Date validation
    if (data.end_date && new Date(data.start_date) >= new Date(data.end_date)) {
        errors.push("end_date must be after start_date");
    }
    
    if (errors.length > 0) {
        throw new Error(`Invalid discount input: ${errors.join(', ')}`);
    }
}

// Builder for basic discounts (percentage and fixed amount)
// Builder for basic discounts (percentage and fixed amount)
// Builder for basic discounts (percentage and fixed amount)
function buildBasicDiscountInput(data, discountType, triggerType) {
    const isAutomatic = triggerType !== 'DISCOUNT_CODE';
    
    const input = {
        title: data.rule_name,
        startsAt: new Date(data.start_date).toISOString(),
        endsAt: data.end_date ? new Date(data.end_date).toISOString() : null,
        combinesWith: {
            orderDiscounts: data.stacking_policy === "allow_stacking",
            productDiscounts: data.stacking_policy === "allow_stacking",
            shippingDiscounts: data.stacking_policy === "allow_stacking"
        }
    };

    // For code discounts only
    if (!isAutomatic) {
        input.code = data.discount_code || "";
        input.customerSelection = { all: true };
        input.usageLimit = data.usage_limit ? parseInt(data.usage_limit) : null;
        input.appliesOncePerCustomer = data.customer_limit === 1;
    }

    // Set minimum requirements if provided
    if (data.minimum_order || data.conditions?.minimum_cart_value) {
        const minAmount = parseFloat(data.minimum_order || data.conditions.minimum_cart_value).toFixed(2);
        
        if (isAutomatic) {
            // For automatic discounts, use a decimal string directly
            input.minimumRequirement = {
                subtotal: {
                    greaterThanOrEqualToSubtotal: minAmount
                }
            };
        } else {
            // For code discounts
            input.minimumRequirement = {
                subtotal: {
                    greaterThanOrEqualTo: minAmount
                }
            };
        }
    }

    // Set discount value - DIFFERENT STRUCTURE FOR AUTOMATIC VS CODE DISCOUNTS
    if (discountType === 'PERCENTAGE_OFF') {
        input.customerGets = {
            value: { 
                percentage: parseFloat(data.value) / 100
            },
            items: {
                all: true
            }
        };
    } else if (discountType === 'FIXED_AMOUNT_OFF') {
        if (isAutomatic) {
            // For automatic discounts, fixed amount is specified differently
            input.customerGets = {
                value: {
                    fixedAmount: {
                        amount: parseFloat(data.value).toFixed(2),
                        currencyCode: data.currency_code || "USD"
                    }
                },
                items: {
                    all: true
                }
            };
        } else {
            // For code discounts
            input.customerGets = {
                value: {
                    amount: {
                        amount: parseFloat(data.value).toFixed(2),
                        currencyCode: data.currency_code || "USD"
                    }
                },
                items: {
                    all: true
                }
            };
        }
    }

    return input;
}

// Builder for free shipping discounts
function buildFreeShippingInput(data, triggerType) {
    const input = {
        title: data.rule_name,
        startsAt: new Date(data.start_date).toISOString(),
        endsAt: data.end_date ? new Date(data.end_date).toISOString() : null,
        appliesOnOneTimePurchase: true,
        appliesOnSubscription: false,
        destination: data.geographic_restrictions?.length > 0 ? {
            countries: data.geographic_restrictions,
            includeRestOfWorld: false,
        } : { allCountries: true },
    };

    // Set maximum shipping price if specified
    if (data.maximum_shipping_price) {
        input.maximumShippingPrice = {
            amount: parseFloat(data.maximum_shipping_price).toString(),
            currencyCode: data.currency_code || "USD",
        };
    }

    // Set minimum requirements
    if (data.minimum_order || data.conditions?.minimum_cart_value) {
        input.minimumRequirement = {
            subtotal: {
                greaterThanOrEqualTo: parseFloat(data.minimum_order || data.conditions.minimum_cart_value).toString(),
            },
        };
    }

    // Add code-specific fields
    if (triggerType === "DISCOUNT_CODE") {
        input.code = data.discount_code;
        input.usageLimit = data.usage_limit ? parseInt(data.usage_limit) : null;
        input.appliesOncePerCustomer = data.customer_limit === 1;
        input.customerSelection = { all: true };
    }

    return input;
}

// Builder for BOGO/BXGY discounts
function buildBxgyInput(data) {
    // Determine what customers need to buy
    const customerBuysItems = {};
    if (data.product_ids?.length > 0) {
        customerBuysItems.products = {
            ids: data.product_ids.map(id => 
                id.startsWith('gid://') ? id : `gid://shopify/Product/${id}`
            )
        };
    }
    if (data.collection_ids?.length > 0) {
        customerBuysItems.collections = {
            ids: data.collection_ids.map(id => 
                id.startsWith('gid://') ? id : `gid://shopify/Collection/${id}`
            )
        };
    }

    const input = {
        title: data.rule_name,
        startsAt: new Date(data.start_date).toISOString(),
        endsAt: data.end_date ? new Date(data.end_date).toISOString() : null,
        customerBuys: {
            value: { quantity: parseInt(data.buy_quantity || 1) },
            items: Object.keys(customerBuysItems).length > 0 ? customerBuysItems : { all: true },
        },
        customerGets: {
            value: { 
                percentage: parseFloat(data.get_discount_percentage || 100) / 100 
            },
            items: Object.keys(customerBuysItems).length > 0 ? customerBuysItems : { all: true },
            quantity: parseInt(data.get_quantity || 1),
        },
        usesPerOrderLimit: 1,
    };

    // Add code-specific fields
    if (data.trigger_type === "DISCOUNT_CODE") {
        input.code = data.discount_code;
        input.usageLimit = data.usage_limit ? parseInt(data.usage_limit) : null;
        input.appliesOncePerCustomer = data.customer_limit === 1;
    }

    return input;
}