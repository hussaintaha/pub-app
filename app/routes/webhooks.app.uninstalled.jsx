// Webhook requests can trigger multiple times and after an app has already been uninstalled.
// If this webhook already ran, the session may have been deleted previously.

import { authenticate } from "../shopify.server";
import {
  Activity,
  AnalyticsUpdate,
  ProductSyncStatus,
  Script,
  ShopifySession,
  Subscription,
} from "../models";

export const action = async ({ request }) => {
  try {
    const { shop, topic } = await authenticate.webhook(request);
    console.log(`Received ${topic} webhook for ${shop}`);

    const subscription = await Subscription.findOne({ shop });
    console.log('subscription: ', subscription);

    if (!subscription || subscription?.status === "INACTIVE" ) {
      await Activity.findOneAndDelete({shopify_domain: shop });
      await AnalyticsUpdate.findOneAndDelete({shopify_domain: shop });
      await ProductSyncStatus.findOneAndDelete({ shop });
      await Script.findOneAndDelete({ shop });
      await Subscription.findOneAndDelete({shop})
    }

    await ShopifySession.findOneAndDelete({ shop });

    return new Response(null, { status: 200 });
  } catch (err) {
    console.error("Error processing APP_UNINSTALLED webhook:", err);
  }
};
