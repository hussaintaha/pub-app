import { AnalyticsUpdate } from "../models";

export const action = async ({ request }) => {
    console.log(`Analytics webhook triggered.`);
    try {
        if (request.method !== "POST") return new Response(JSON.stringify({ success: false, error: "Method not allowed." }), { status: 405 })

        const data = await request.json();

        if (!data?.shopify_domain) return new Response(JSON.stringify({ success: false, error: 'Missing required field: shopify_domain' }), { status: 400 })

        const updatedAnalytics = await AnalyticsUpdate.findOneAndUpdate(
            { shopify_domain: data.shopify_domain },
            { $set: data },
            {
                upsert: true,
                new: true,
                setDefaultsOnInsert: true
            }
        );

        if(!updatedAnalytics ) return new Response(JSON.stringify({ success: false, message: "Something went wrong"}), { status: 500 })

        return new Response(JSON.stringify({ success: true, message: "", data }), { status: 200 })

    } catch (error) {
        if (error instanceof Error) {
            console.log(`Error occurred while analyitics: ${error.message}`);
        } else {
            console.log('An unknown error occurred.');
        }

        return new Response(JSON.stringify({ success: false, error: "Internal server error.", }), { status: 500 })
    }
}