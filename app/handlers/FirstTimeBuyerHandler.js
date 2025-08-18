// handlers/FirstTimeBuyerHandler.js
import BaseDiscountHandler from './BaseDiscountHandler';
import { DISCOUNT_CODE_FIRST_TIME_BUYER } from '../graphql/mutations/firstTimeBuyer/code';
import { DISCOUNT_AUTOMATIC_FIRST_TIME_BUYER } from '../graphql/mutations/firstTimeBuyer/automatic';

export default class FirstTimeBuyerHandler extends BaseDiscountHandler {
    constructor(triggerType) {
        super();
        try {
            this.triggerType = triggerType;

            if (!['DISCOUNT_CODE', 'AUTOMATIC'].includes(triggerType)) {
                throw new Error(`Invalid trigger type: ${triggerType}. Must be 'DISCOUNT_CODE' or 'AUTOMATIC'`);
            }

            this.mutation = triggerType === 'DISCOUNT_CODE'
                ? DISCOUNT_CODE_FIRST_TIME_BUYER
                : DISCOUNT_AUTOMATIC_FIRST_TIME_BUYER;
            this.inputKey = triggerType === 'DISCOUNT_CODE'
                ? 'basicCodeDiscount'
                : 'automaticBasicDiscount';

        } catch (error) {
            console.error('FirstTimeBuyerHandler: constructor error: ', error);
            throw error;
        }
    }

    async validate(data) {
        try {
            super.validate(data);
            const errors = [];

            if (!data?.rule_name?.trim()) {
                errors.push("Rule name is required");
            }

            if (data.value === undefined || data.value === null) {
                errors.push("Discount value is required");
            } else if (isNaN(data.value) || data.value < 0 || data.value > 100) {
                errors.push("Percentage value must be between 0 and 100");
            } else if (data.value === 0) {
                errors.push("Discount value cannot be 0%");
            }

            if (this.triggerType === 'DISCOUNT_CODE') {
                if (!data?.discount_code?.trim()) {
                    errors.push("Discount code is required for code-based discounts");
                }
                if (!data?.segment_id?.trim()) {
                    errors.push("Customer segment ID is required for first-time buyer code discounts");
                }
            }

            if (errors.length > 0) {
                throw new Error(`Validation failed: ${errors.join(', ')}`);
            }

        } catch (error) {
            console.error('FirstTimeBuyerHandler: Validation error: ', error);
            throw error;
        }
    }

    buildInput(data) {
        try {
            // Validate required fields
            if (!data?.rule_name?.trim()) {
                throw new Error("Rule name is required");
            }

            // Validate and parse dates
            const startsAt = new Date(data.start_date);
            if (isNaN(startsAt.getTime())) {
                throw new Error("Invalid start date");
            }

            let endsAt = null;
            if (data.end_date) {
                endsAt = new Date(data.end_date);
                if (isNaN(endsAt.getTime())) {
                    throw new Error("Invalid end date");
                }
                if (endsAt <= startsAt) {
                    throw new Error("End date must be after start date");
                }
            }

            // Validate and format discount value
            const discountValue = parseFloat(data.value);
            if (isNaN(discountValue) || discountValue <= 0 || discountValue > 100) {
                throw new Error("Discount value must be a positive number between 0 and 100");
            }

            const baseInput = {
                title: data.rule_name.trim(),
                startsAt: startsAt.toISOString(),
                endsAt: endsAt?.toISOString() || null,
                customerGets: {
                    value: {
                        percentage: Math.min(1, Math.max(0.01, discountValue / 100)) // Ensure between 1-100%
                    },
                    items: {
                        all: true
                    }
                },
                combinesWith: this.buildCombinesWith(data)
            };

            // Handle code-specific fields
            if (this.triggerType === 'DISCOUNT_CODE') {
                if (!data.discount_code?.trim()) {
                    throw new Error("Discount code is required for code-based discounts");
                }
                baseInput.code = data.discount_code.trim();

                if (!data.segment_id) {
                    throw new Error("Customer segment ID is required for first-time buyer code discounts");
                }

                baseInput.customerSelection = {
                    customerSegments: {
                        add: [data.segment_id.startsWith('gid://')
                            ? data.segment_id
                            : `gid://shopify/Segment/${data.segment_id}`]
                    }
                };

                baseInput.appliesOncePerCustomer = Boolean(data.customer_limit === 1 || data.customer_limit === true);
            } else {
                // Automatic discount specific fields
                baseInput.customerSelection = {
                    customerSegments: {
                        add: [data.segment_id || 'gid://shopify/Segment/first-time-buyers']
                    }
                };
            }

            return baseInput;

        } catch (error) {
            console.error('FirstTimeBuyerHandler: buildInput error: ', error);
            throw error;
        }
    }

    buildCombinesWith(data) {
        const stackingAllowed = data.stacking_policy === "allow_stacking" ||
            data.stacking_policy === "allowed" ||
            data.combine_with_other_discounts === true;

        return {
            orderDiscounts: stackingAllowed,
            productDiscounts: stackingAllowed,
            shippingDiscounts: stackingAllowed
        };
    }

    async createDiscount(adminClient, input) {
        try {
            const result = await adminClient.fetch(this.mutation, {
                variables: {
                    [this.inputKey]: input,
                },
            });

            if (!result.ok) {
                throw new Error(`HTTP error! status: ${result.status}`);
            }

            const data = await result.json();

            if (data?.errors?.length > 0) {
                throw new Error(`GraphQL Error: ${JSON.stringify(data.errors)}`);
            }

            const discountResult = Object.values(data?.data || {})[0];
            if (!discountResult) {
                throw new Error("No discount result returned from API");
            }

            if (discountResult?.userErrors?.length > 0) {
                const errors = discountResult.userErrors.map(e =>
                    `${e.field || 'unknown'}: ${e.message} (${e.code || 'unknown'})`
                );
                throw new Error(`Discount creation failed: ${errors.join(', ')}`);
            }

            const discountNode = this.triggerType === 'DISCOUNT_CODE'
                ? discountResult?.codeDiscountNode
                : discountResult?.automaticDiscountNode;

            return {
                success: true,
                discountId: discountNode?.id,
                discountNode: this.handleResponse(discountNode),
                message: `First time buyer discount (${this.triggerType}) created successfully.`
            };
        } catch (error) {
            console.error('Discount creation error:', error);
            throw new Error(`Failed to create discount: ${error.message}`);
        }
    }

    handleResponse(response) {
        try {
            if (!response) {
                throw new Error("No response provided");
            }

            if (response.userErrors?.length > 0) {
                const errors = response.userErrors.map(e =>
                    `${e.field || 'unknown'}: ${e.message} (${e.code || 'unknown'})`
                );
                throw new Error(`Shopify API errors: ${errors.join(', ')}`);
            }

            const discount = this.triggerType === 'DISCOUNT_CODE'
                ? response.codeDiscount
                : response.automaticDiscount;

            if (!discount) {
                throw new Error("No discount data returned from API");
            }

            return {
                id: response.id,
                ...discount,
                type: this.triggerType === 'DISCOUNT_CODE' ? 'CODE' : 'AUTOMATIC'
            };
        } catch (error) {
            console.error('FirstTimeBuyerHandler: handleResponse error: ', error);
            throw error;
        }
    }
}