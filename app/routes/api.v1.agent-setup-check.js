import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
    try {
        if (request.method !== "GET") return new Response(JSON.stringify({ success: false, error: "Method not allowed." }), { status: 405 })

        const { session } = await authenticate.admin(request)

        if (!session) return new Response(JSON.stringify({ success: false, error: "Not authorized to perform this operation." }), { status: 401 })

        const { shop } = session

        if (!shop) return new Response(JSON.stringify({ success: false, error: "Forbidden error." }), { status: 403 })

        const response = await fetch('https://iwxnvshrfopgbpueafye.supabase.co/functions/v1/check-setup-status', {
            method: "POST",
            body: JSON.stringify({ "shopDomain": shop })
        })

        const data = await response.json()

        const { setupCompleted } = data

        return new Response(JSON.stringify({ success: true, setupCompleted }), { status: 200 })

    } catch (error) {
        if (error instanceof Error) {
            console.log(`An error occurred while checking agent setup status: ${error.message}`);
        } else {
            console.log(`An unknown error occurred.`);
        }

        return new Response(JSON.stringify({ success: false, error: "Internal server error" }), { status: 500 })
    }
}