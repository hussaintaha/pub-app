import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  try {
    if (request.method !== "GET")
      return { status: 405, success: false, error: "Method not allowed." };

    const { admin, session } = await authenticate.admin(request);

    if (!admin && session)
      return { status: 401, success: false, error: "Unauthorized to perform this action." };

    const { shop } = session;

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

      const response = await admin.graphql(query);
      const data = await response.json();

      const edges = data.data.products.edges;
      allProducts.push(...edges.map(edge => edge.node));

      hasNextPage = data.data.products.pageInfo.hasNextPage;
      cursor = edges.length ? edges[edges.length - 1].cursor : null;
    }

    const endpoint = `${process.env.BASE_URL}/sync-products`;

    const options = (product) => ({
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer <lovable_token>',
        'X-Shopify-Shop-Domain': shop
      },
      body: JSON.stringify(product)
    });

    // Send all products concurrently
    await Promise.all(
      allProducts.map(product =>
        fetch(endpoint, options(product))
          .then(res => {
            if (!res.ok) throw new Error(`Failed to sync product ${product.id}`);
          })
      )
    );

    return { status: 200, success: true, message:"Product sync completed." };

  } catch (error) {
    console.error(`Error occurred while syncing products:`, error);
    return { status: 500, success: false, error: "Internal server error." };
  }
};
