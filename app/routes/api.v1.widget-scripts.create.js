import Script from '../models/script.model';
import { authenticate } from '../shopify.server'

export const action = async ({ request }) => {
    try {
        if (request.method !== 'POST') return { status: 405, success: false, error: "Method not allowed" };

        const { session } = await authenticate.admin(request);

        if (!session) return { status: 401, success: false, error: "Unauthorized" };

        const { shop } = session;

        if (!shop) return { status: 400, success: false, error: "Shop not found" };

        const { injectMethod, script } = await request.json();

        if (!injectMethod) return { status: 400, success: false, error: "Inject method is required" };

        if (injectMethod === "manual" && !script) return { status: 400, success: false, error: "Script is required for manual injection" };

        const isExist = await Script.findOne({shop})

        if (isExist) {
            return { status: 400, success: false, error: "Widget script already exists for this shop" };
        }

        if (injectMethod === "manual" && script) {
            const newScript = new Script({ script, shop });
            await newScript.save();
        } else if (injectMethod === "automatic") {
            // Corrected API call
          const response = await fetch(`https://iwxnvshrfopgbpueafye.supabase.co/functions/v1/widget-api?shop_url=${encodeURIComponent(shop)}`, {
    method: 'GET',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml3eG52c2hyZm9wZ2JwdWVhZnllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY5OTI4MDgsImV4cCI6MjA2MjU2ODgwOH0.p9ZURKfzS6jOO_KNXc9sZF5kjpfPVS0ZhGQhMRAPQPQ',
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml3eG52c2hyZm9wZ2JwdWVhZnllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY5OTI4MDgsImV4cCI6MjA2MjU2ODgwOH0.p9ZURKfzS6jOO_KNXc9sZF5kjpfPVS0ZhGQhMRAPQPQ'
    }
});


            const data = await response.json();
            console.log('Widget API Response:', data);
            
            if (!response.ok) {
                console.error('Widget API Error:', data);
                throw new Error(data.error || data.message || "Failed to fetch widget script");
            }

            // Optional: Save the returned script to your database
            if (data.widget_script) {
                const newScript = new Script({ 
                    script: data.widget_script, 
                    shop,
                    config: data.config || {}
                });
                await newScript.save();
            }
        }

        return { status: 200, success: true, message: "Widget script created successfully" };

    } catch (error) {
        if (error instanceof Error) {
            console.error("Error in widget-script.create action:", error.message);
        } else {
            console.error("Unexpected error in widget-script.create action:", error);
        }

        return { status: 500, success: false, error: "Internal server error" };
    }
}
