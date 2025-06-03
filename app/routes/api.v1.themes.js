import { GET_THEMES } from "../graphql/queries";
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

    if (!admin) {
      return {
        status: 401,
        success: false,
        error: "Unauthorized access.",
      };
    }

    const response = await admin.graphql(GET_THEMES);
    const result = await response.json();

    if (result.errors) {
      console.error("GraphQL errors:", result.errors);
      return {
        status: 400,
        success: false,
        error: "Failed to fetch themes from Shopify.",
      };
    }

    const themes = result?.data?.themes?.edges?.map(edge => edge.node) || [];

    return {
      status: 200,
      success: true,
      themes,
    };

  } catch (error) {
    console.error("Error occurred while fetching themes:", error instanceof Error ? error.message : error);

    return {
      status: 500,
      success: false,
      error: "Internal Server Error.",
    };
  }
};
