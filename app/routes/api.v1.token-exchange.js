export const action = async ({ request }) => {
    try {
        if (request.method !== 'POST') return { status: 405, success: false, error: "Method not allowed" };

        const { shop } = await request.json();;

        if (!shop) return { status: 400, success: false, error: "Shop not found" };

        const response = await fetch(`https://iwxnvshrfopgbpueafye.supabase.co/functions/v1/shopify-token-exchange`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ shopify_domain: shop })
        });
        const { access_token: token } = await response.json();

        return { status: 200, success: true, token };

    } catch (error) {
        if (error instanceof Error) {
            console.log(`Error is occurred while getting token exchange: ${error.message}`);
        } else {
            console.log(`Unexpected error occurred. Error: ${error}`);
        }

        return { status: 500, success: false, error: "internal server error." }
    }
}