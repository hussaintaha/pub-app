import { authenticate, apiVersion } from "../shopify.server";

export const loader = async ({ request }) => {
    try {
        if (request.method !== "GET") return { status: 405, success: false, error: "Method not allowed." }

        const { session } = await authenticate.admin(request);

        if (!session || !apiVersion) return { status: 401, success: false, error: "Unauthorized to perform this action." };

        const { shop: shopify_domain, accessToken: access_token } = session

        const endpoint = `${process.env.BASE_URL}/auth`

        const options = {
            method: "POST",
            body: JSON.stringify({ shopify_domain, access_token, api_version: apiVersion }),
            headers: {
                'Content-Type': `application/json`,
                'X-Shopify-Access-Token': access_token,
                'X-Shopify-Shop-Domain': shopify_domain
            }
        }

        const response = await fetch(endpoint, { ...options })

        const data = await response.json()

        return {}

    } catch (error) {
        if (error instanceof Error) {
            console.error(`Error occurred while authenticating: ${error.message}`);
        } else {
            console.error("An unknown error occurred.", error);
        }

        return { status: 500, success: false, error: "Internal server error." };
    }
};
