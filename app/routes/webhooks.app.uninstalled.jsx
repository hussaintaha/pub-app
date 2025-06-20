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

const cleanup = async({shop})=>{
 const subscription = await Subscription.findOne({ shop });
    console.log('subscription: ', subscription);

    if (!subscription || subscription?.status === "INACTIVE" ) {
      await Activity.findOneAndDelete({shopify_domain: shop });
      await AnalyticsUpdate.findOneAndDelete({shopify_domain: shop });
      await ProductSyncStatus.findOneAndDelete({ shop });
      await Script.findOneAndDelete({ shop });
      await Subscription.findOneAndDelete({shop})

      const response = await fetch(`https://iwxnvshrfopgbpueafye.supabase.co/functions/v1/app-uninstall-cleanup`,{method:'POST', body: JSON.stringify({shop})})
      const data = await response.json()

      const {success, message} = data

      if(success && message){
        console.log(message);
      }

    }

    await ShopifySession.findOneAndDelete({ shop });
}

export const action = async ({ request }) => {
  try {
    const { shop, topic } = await authenticate.webhook(request);
    console.log(`Received ${topic} webhook for ${shop}`);

   cleanup()

    return new Response(null, { status: 200 });
  } catch (err) {
    console.error("Error processing APP_UNINSTALLED webhook:", err);
  }
};
