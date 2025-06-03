import { authenticate } from "../shopify.server";
import { Script } from "../models";

export const action = async ({ request}) => {
    try {
        if(request.method !== "PATCH") return { status: 405, success: false, error: "Method Not Allowed" };

        const { session } = await authenticate.admin(request);

        if (!session) return { status: 401, success: false, error: "Unauthorized" };

        const { shop } = session;

        const { injectMethod, script } = await request.json();

        if (!injectMethod) return { status: 400, success: false, error: "Inject method is required" };

        if (injectMethod === "manual" && !script) return { status: 400, success: false, error: "Script is required for manual injection" };

        if (injectMethod === "manual" && script) {
            await Script.findOneAndUpdate({ shop }, { script }, { upsert: true, new: true });
        } else if (injectMethod === "automatic") {
            // In your Shopify app action
const response = await fetch(`https://iwxnvshrfopgbpueafye.supabase.co/functions/v1/api/widget/script?shop_url=${encodeURIComponent(shop)}`, {
    method: 'GET',
    headers: {
        'Content-Type': 'application/json',
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml3eG52c2hyZm9wZ2JwdWVhZnllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY5OTI4MDgsImV4cCI6MjA2MjU2ODgwOH0.p9ZURKfzS6jOO_KNXc9sZF5kjpfPVS0ZhGQhMRAPQPQ'
    }
});



            const data = await response.json();
            console.log('data: ', data);
            if (!response.ok) {
                throw new Error(data.error || "Failed to create widget script");
            }
        }

        return { status: 200, success: true, message: "Widget script created successfully" };

    } catch (error) {
        if (error instanceof Response) {
            console.error('Caught a Response object:', error.statusText);
        }

        if (error instanceof Error) {
            console.error(`An error occurred while updating scripts: ${error.message}`);
        } else {
            console.error(`An unexpected error occurred:`, error);
        }

        return { status: 500, success: false, error: "Internal Server Error" };
        
    }
}