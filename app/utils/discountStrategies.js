import { CREATE_DISCOUNT_CODE_MUTATUTION, DISCOUNT_AUTOMATIC_BASIC_CREATE } from '../graphql/mutations'

export const buildDiscountPayload = ({ discount_type, trigger_type, basic, conditions, customer_gets, guardrails, advanced }) => {
    const strategies = {
        percentage_off: buildPercentageDiscount,
        fixed_amount_off: buildFixedAmountDiscount,
        free_shipping: buildFreeShippingDiscount,
        free_shipping_minimum: buildFreeShippingMinimumDiscount,
        buy_one_get_one: buildBOGODiscount,
        tiered_percentage: buildTieredPercentageDiscount,
        tiered_fixed_amount: buildTieredFixedDiscount,
        first_type_buyer: buildFirstTimeBuyerDiscount,
        flash_sale: buildFlashSaleDiscount,
        location_based: buildLocationBasedDiscount
    }

    const strategy = strategies[discount_type]
    if (!strategy) throw new Error("Unsupported discount type.")

    return strategy({ trigger_type, basic, conditions, customer_gets, guardrails, advanced })
}

function buildPercentageDiscount({ trigger_type, basic, conditions, customer_gets, guardrails, advanced }) {
    if (trigger_type === 'code') {
        return {
            mutation: CREATE_DISCOUNT_CODE_MUTATUTION,
            variables: {
                basicCodeDiscount: {
                    title: basic.rule_name,
                    code: basic.code,
                    startsAt: conditions.start_date,
                    endsAt: conditions.end_date,
                    customerSelection: { all: true },
                    customerGets: customer_gets,
                    minimumRequirement: {
                        subtotal: {
                            greaterThanOrEqualToSubtotal: guardrails?.min_order_value
                        }
                    },
                    usageLimit: guardrails?.usage_limit,
                    appliesOncePerCustomer: guardrails?.max_per_customer === 1
                }
            }
        }
    } else if (trigger_type === "automatic") {
        return {
            mutation: DISCOUNT_AUTOMATIC_BASIC_CREATE,
            variables: {
                automaticBasicDiscount: {
                    title: basic.rule_name,
                    startsAt: conditions.start_date,
                    minimumRequirement: {
                        subtotal: {
                            greaterThanOrEqualToSubtotal: guardrails?.min_order_value
                        }
                    },
                    customerGets: customer_gets,
                    combinesWith: {
                        productDiscounts: advanced?.combine_with_other_discounts,
                        shippingDiscounts: advanced?.combine_with_other_discounts,
                        orderDiscounts: advanced?.combine_with_other_discounts
                    }
                }
            }
        }
    }
    throw new Error("Unsupported trigger type for percentage discount")
}

// Add other strategy builders here...
function buildFixedAmountDiscount({ trigger_type, basic, conditions }) { }

function buildFreeShippingDiscount({ trigger_type, basic, conditions }) { }

function buildFreeShippingMinimumDiscount({ trigger_type, basic, conditions }) { }

function buildBOGODiscount({ trigger_type, basic, conditions }) { }

function buildTieredPercentageDiscount({ trigger_type, basic, conditions }) { }

function buildTieredFixedDiscount({ trigger_type, basic, conditions }) { }

function buildFirstTimeBuyerDiscount({ trigger_type, basic, conditions }) { }

function buildFlashSaleDiscount({ trigger_type, basic, conditions }) { }

function buildLocationBasedDiscount({ trigger_type, basic, conditions }) { }

