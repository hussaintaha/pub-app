import { authenticate } from '../shopify.server';

export const loader = async ({ request }) => {
    try {
        if (request.method !== "GET") {
            return { status: 405, success: false, error: "Method not allowed." };
        }

        const { admin } = await authenticate.admin(request);

        if (!admin) {
            return { status: 401, success: false, error: "Unauthorized to perform this action." };
        }

        let hasNextPage = true;
        let cursor = null;
        const allProducts = [];

        // Fetch all products using GraphQL with pagination
        while (hasNextPage) {
            const query = `
    query {
        products(first: 250${cursor ? `, after: "${cursor}"` : ''}) {
            edges {
                node {
                    id
                    title
                    handle
                }
                cursor
            }
            pageInfo {
                hasNextPage
            }
        }
    }
`;

            // Send the GraphQL request
            const response = await admin.graphql(query);
            const data = await response.json();

            // Extract products and update pagination cursor
            const edges = data.data.products.edges;
            allProducts.push(...edges.map(edge => edge.node));

            // Update pagination state
            hasNextPage = data.data.products.pageInfo.hasNextPage;
            cursor = edges.length ? edges[edges.length - 1].cursor : null;
        }

        // Return all products in response
        return {
            status: 200,
            success: true,
            data: allProducts
        };

    } catch (error) {
        console.error("Error occurred while fetching products:", error instanceof Error ? error.message : 'Unknown error');

        return {
            status: 500,
            success: false,
            error: "Internal server error."
        };
    }
};
