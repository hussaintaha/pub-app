import { createAdminApiClient } from "@shopify/admin-api-client";
import ShopifySession from "../models/shopifySession.model";
import { apiVersion } from "../shopify.server";
import DiscountHandlerFactory from "../handlers/DiscountHandlerFactory";
import { DiscountNormalizer } from '../utils/DiscountNormalizer';

export async function action({ request }) {
    if (request.method !== "POST") {
        return new Response(
            JSON.stringify({ success: false, error: "Method not allowed" }),
            { status: 405 }
        );
    }

    try {
        const requestData = await request.json();
        console.log("Discount create request received.");

        let discountData, storeDomain;

        if (requestData.discount_data && requestData.store_domain) {
            discountData = requestData.discount_data;
            storeDomain = requestData.store_domain;
        } else if (requestData.incomingDiscountRequest) {
            const { store_domain, discount_data } = requestData.incomingDiscountRequest;
            discountData = discount_data;
            storeDomain = store_domain;
        } else {
            throw new Error("Invalid request format. Expected discount_data and store_domain");
        }

        console.log(process.env.SHOPIFY_APP_URL);

        const session = await ShopifySession.findOne({ shop: storeDomain });
        if (!session?.accessToken) {
            throw new Error("Missing session or access token");
        }

        const admin = createAdminApiClient({
            apiVersion: apiVersion,
            accessToken: session.accessToken,
            storeDomain: storeDomain,
        });

        const query = `
        query GetSegments {
            segments(first: 10) {
            edges {
                node {
                id
                name
                query
                }
            }
            }
        }
        `;

        const response = await admin.fetch(query);
        const segmentData = await response.json();

        const segment = segmentData?.data?.segments?.edges?.find(edge =>
            edge.node.name.toLowerCase().includes("haven't purchased") ||
            edge.node.name.toLowerCase().includes("first time")
        );

        const segment_id = segment?.node?.id


        discountData.discount_type = DiscountNormalizer.normalizeDiscountType(discountData.discount_type);
        discountData.trigger_type = DiscountNormalizer.normalizeTriggerType(discountData.trigger_type);

        const handler = DiscountHandlerFactory.createHandler(
            discountData.discount_type,
            discountData.trigger_type
        );

        handler.validate(discountData);
        const input = handler.buildInput({ ...discountData, segment_id });
        console.log('input: 000000000000000000000000000000', JSON.stringify(input, null, 2));

        const result = await handler.createDiscount(admin, input);

        return new Response(
            JSON.stringify({
                success: true,
                ...result
            }),
            { status: 201 }
        );
    } catch (err) {
        console.error("Discount API error:", err);
        return new Response(
            JSON.stringify({ success: false, error: err.message }),
            { status: 500 }
        );
    }
}