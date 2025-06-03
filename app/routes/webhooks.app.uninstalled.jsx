// Webhook requests can trigger multiple times and after an app has already been uninstalled.
  // If this webhook already ran, the session may have been deleted previously.

import { authenticate } from "../shopify.server";
import { ShopifySession } from "../models";

export const action = async ({ request }) => {
  try {
    const { shop, topic } = await authenticate.webhook(request);
    console.log(`Received ${topic} webhook for ${shop}`);

    await ShopifySession.findOneAndDelete({shop})

    return new Response(null, { status: 200 });

  } catch (err) {
    console.error("Error processing APP_UNINSTALLED webhook:", err);
  }
};
