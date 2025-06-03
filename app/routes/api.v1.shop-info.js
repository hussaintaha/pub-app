import { GET_SHOP_INFO } from "../graphql/queries";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
    try {

         if (request.method !== "GET") {
      return {
        status: 405,
        success: false,
        error: "Method not allowed.",
      };
    }

        const { admin } = await authenticate.admin(request);

        if (!admin) return {status: 401,success: false,error: "Unauthorized access.",};

         const response = await admin.graphql(GET_SHOP_INFO);
            const result = await response.json();
        
            if (result.errors) {
              console.error("GraphQL errors:", result.errors);
              return {
                status: 400,
                success: false,
                error: "Failed to fetch themes from Shopify.",
              };
            }

        const shop = result?.data?.shop;
        if (!shop) {
            return {status: 404,success: false,error: "Shop not found.",};
        }

        return {
            status: 200,
            success: true,
            shop
        };
        
    } catch (error) {
        if(error instanceof Error) {
            console.error("Error occurred while fetching shop info:", error.message);
        }else{
            console.log('An unexpected error occurred:', error);
        }

        return {status: 500,success: false,error: "Internal Server Error.",};
    }
}