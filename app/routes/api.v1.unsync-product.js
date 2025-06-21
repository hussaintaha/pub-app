import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
    try {
        if (request.method !== "GET") return new Response(JSON.stringify({ success: false, error: "Method not allowed." }), { status: 405 })

        const { session } = await authenticate.admin(request)
        console.log('session: ', session);

        if (!session) return new Response(JSON.stringify({ success: false, error: "Forbidden error" }), { status: 403 })

        const { shop } = session
        console.log('shop: ', shop);

        if (!shop) return new Response(JSON.stringify({ success: false, error: "Shop not found" }), { status: 400 })

        const response = await fetch(`https://iwxnvshrfopgbpueafye.supabase.co/functions/v1/app-uninstall-cleanup`, { method: 'POST', body: JSON.stringify({ shop }) })
        const data = await response.json()
        console.log('data: ', data);

        const { success, message } = data

        if (success && message) {
            console.log(message);
        }

        return new Response(JSON.stringify({success: true, message:"Unsync all products and collections"}),{status: 200})

    } catch (error) {
        if (error instanceof Error) {
            console.log(`An unknown error occurred while cleaning up: ${error.message}`);
        } else {
            console.log('An unknown error occurred.');
        }

        return new Response(JSON.stringify({success: false, error:"Internal server error."}),{status: 500})
    }
}