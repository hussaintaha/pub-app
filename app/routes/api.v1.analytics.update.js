import { AnalyticsUpdate } from "../models";

export const action = async ({ request }) => {
    console.log(`Analytics webhook triggered.`);
    try {
        if (request.method !== "POST") return new Response(JSON.stringify({ success: false, error: "Method not allowed." }), { status: 405 })

        const data = await request.json();

        if (!data?.shopify_domain) return new Response(JSON.stringify({ success: false, error: 'Missing required field: shopify_domain' }), { status: 400 })

        function normalizeShopifyDomain(url) {
            try {
                const parsedUrl = new URL(url);
                return parsedUrl.hostname.toLowerCase(); 
            } catch (err) {
                return url
                    .replace(/^https?:\/\//, '')  
                    .replace(/\/+$/, '')          
                    .toLowerCase();               
            }
        }

        console.log('data?.shopify_domain: ', data?.shopify_domain);
        const domain = normalizeShopifyDomain(data?.shopify_domain)
        console.log('domain: ', domain);

        const updatedAnalytics = await AnalyticsUpdate.findOneAndUpdate(
            { shopify_domain: domain},
            { $set: data },
            {
                upsert: true,
                new: true,
            }
        );
        console.log('updatedAnalytics: ', JSON.stringify(updatedAnalytics,null,2));

        if (!updatedAnalytics) return new Response(JSON.stringify({ success: false, message: "Something went wrong" }), { status: 500 })

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