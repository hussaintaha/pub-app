import { authenticate } from "../shopify.server";

const ProductSync = async (shop, admin, payload) => {
  try {
    const shopify_id = payload?.id;

    const endpoint = `${process.env.BASE_URL}/delete-product`
    console.log('endpoint: ', endpoint);

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ shop, shopify_id }),
    });

    const data = await response.json();
    console.log("data: ", data);
    const { success, message } = data;
    if (success && message) {
      console.log(message);
    }
  } catch (error) {
    console.log(error);
  }
};

export const action = async ({ request }) => {
  try {
    console.log("Product delete webhook trigger.");
    const { shop, payload, admin } = await authenticate.webhook(request);

    ProductSync(shop, admin, payload);

    return new Response(
      JSON.stringify({ success: true, message: "Product created success" }),
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof Error) {
      console.log(`Error occurred while deleting product: ${error.message}`);
    } else {
      console.log(`An unknown error occurred.`);
    }

    return new Response(
      JSON.stringify({ success: true, error: "Internal server error." }),
      { status: 500 },
    );
  }
};
