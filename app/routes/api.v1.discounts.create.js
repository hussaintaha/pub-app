import { buildDiscountPayload } from "../utils/discountStrategies"
import ShopifySession from "../models/shopifySession.model"

export const loader = async ({ request }) => {
    if (request.method === "OPTIONS") {
        return new Response(null, {
            status: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, User-Agent, X-Environment, X-Discount-Type, X-Trigger-Type, X-Store-Domain, Authorization',
            }
        })
    }
    return new Response(JSON.stringify({ success: false, error: "Method not allowed." }), { status: 405 })
}

export const action = async ({ request }) => {
    try {
        if (request.method !== "POST") {
            return errorResponse("Method not allowed", 405);
        }

        const incomingData = await request.json()
        if (!incomingData || Object.keys(incomingData).length === 0) {
            return errorResponse("Provide all required fields", 400);
        }

        const { store_domain: shop } = incomingData?.metadata
        const session = await ShopifySession.findOne({ shop })
        if (!session) return errorResponse("Forbidden error", 403)

        const { discount_type } = incomingData.basic_settings
        const { trigger_type } = incomingData.conditions

        if (trigger_type === "code" && !incomingData.basic_settings.code) {
            return errorResponse("Discount code is required.", 400)
        }

        let customerGets = {
            items: {},
            value: {},
        };

        const exceptionProductIds = Array.isArray(incomingData?.advanced?.exception_product_ids)
            ? incomingData.advanced.exception_product_ids
            : [];

        const exceptionCollectionIds = Array.isArray(incomingData?.advanced?.exception_categories)
            ? incomingData.advanced.exception_categories
            : [];

        const excludedProductIds = Array.isArray(incomingData?.guardrails?.excluded_products)
            ? incomingData.guardrails.excluded_products
            : [];

        const excludedCollectionIds = Array.isArray(incomingData?.guardrails?.excluded_categories)
            ? incomingData.guardrails.excluded_categories
            : [];

        const includedCollectionIds = Array.isArray(incomingData?.conditions?.product_category_filter)
            ? incomingData.conditions.product_category_filter
            : [];

        const productsToRemove = [...new Set([...exceptionProductIds, ...excludedProductIds])];
        const collectionsToRemove = [...new Set([...exceptionCollectionIds, ...excludedCollectionIds])];
        const collectionsToAdd = [...new Set(includedCollectionIds)];

        const items = {};

        if (productsToRemove.length > 0) {
            items.products = {
                productsToRemove: productsToRemove.map(id => `gid://shopify/Product/${id}`),
            };
            items.all=false
        }

        if (collectionsToAdd.length > 0 || collectionsToRemove.length > 0) {
            items.collections = {};

            if (collectionsToAdd.length > 0) {
                items.collections.add = collectionsToAdd.map(id => `gid://shopify/Collection/${id}`);
            }

            if (collectionsToRemove.length > 0) {
                items.collections.remove = collectionsToRemove.map(id => `gid://shopify/Collection/${id}`);
            }

            if (Object.keys(items.collections).length === 0) {
                delete items.collections;
            }
        }

        const hasValidItems =
            items.products?.productsToRemove?.length > 0 ||
            items.collections?.add?.length > 0 ||
            items.collections?.remove?.length > 0;

        customerGets.items = hasValidItems ? items : { all: true };

        customerGets.value = discount_type?.includes('percentage')
            ? { percentage: incomingData?.basic_settings?.discount_value / 100 }
            : { amount: incomingData?.basic_settings?.discount_value };

        const { mutation, variables } = buildDiscountPayload({
            discount_type,
            trigger_type,
            customer_gets: customerGets,
            basic: incomingData.basic_settings,
            conditions: incomingData.conditions,
            advanced: incomingData.advanced,
            guardrails: incomingData.guardrails
        })

        console.log(JSON.stringify(variables, null, 10));
        console.log('mutation: ', mutation);

        const res = await fetch(`https://${session.shop}/admin/api/2025-04/graphql.json`, {
            method: "POST",
            body: JSON.stringify({ query: mutation, variables }),
            headers: {
                "X-Shopify-Access-Token": session.accessToken,
                "Content-Type": "application/json"
            }
        })

        const data = await res.json()
        console.log("Shopify Response:", JSON.stringify(data, null, 2))

        return successResponse("Discount created successfully", 201)

    } catch (error) {
        console.error("Error creating discount:", error)
        return errorResponse("Internal server error", 500)
    }
}

const successResponse = (message, status = 200) => new Response(JSON.stringify({ success: true, message }), {
    status,
    headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
    }
})

const errorResponse = (error, status = 500) => new Response(JSON.stringify({ success: false, error }), {
    status,
    headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
    }
})

