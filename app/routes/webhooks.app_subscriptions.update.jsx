// Subscription update webhook route

import { authenticate } from "../shopify.server";
import {
  Activity,
  AnalyticsUpdate,
  ProductSyncStatus,
  Script,
  Subscription,
} from "../models";

const at = "webhook.app_subscriptions.update.jsx";

const processWebhook = async ({ shop, payload }) => {
  try {
    if (shop && payload) {
      const subscriptionDataFound = await Subscription.findOne({ shop });
      if (
        subscriptionDataFound &&
        payload.app_subscription.status !== "DECLINED"
      ) {
        if (payload.app_subscription.status !== "CANCELLED") {
          await Subscription.findOneAndUpdate(
            { shop },
            {
              $set: {
                graphQlID: payload.app_subscription.admin_graphql_api_id,
                status: payload.app_subscription.status,
                planName: payload.app_subscription.name,
              },
            },
          );
        } else if (payload.app_subscription.status === "CANCELLED") {
          await Subscription.findOneAndUpdate(
            { shop },
            {
              $set: {
                graphQlID: payload.app_subscription.admin_graphql_api_id,
                status: "INACTIVE",
                planName: "Free Plan",
              },
            },
          );

          await Activity.findOneAndDelete({ shopify_domain: shop });
          await AnalyticsUpdate.findOneAndDelete({ shopify_domain: shop });
          await ProductSyncStatus.findOneAndDelete({ shop });
          await Script.findOneAndDelete({ shop });

          const response = await fetch(
            `https://iwxnvshrfopgbpueafye.supabase.co/functions/v1/app-uninstall-cleanup`,
            { method: "POST", body: JSON.stringify({ shop }) },
          );
          const data = await response.json();
          console.log("data: ", data);

          const { success, message } = data;

          if (success && message) {
            console.log(message);
          } else {
            console.log("error");
          }
        }
      }
    }
  } catch (error) {
    console.log(`Subscription error ${at}`);
  }
};

export const action = async ({ request }) => {
  try {
    const { shop, payload } = await authenticate.webhook(request);
    console.log("Received subscription webhook for shop:", { shop, payload });

    processWebhook({ payload, shop });

    return new Response({ success: true });
  } catch (error) {
    if (error instanceof Error) {
      console.log(`An error occurred while subscription: ${error.message}`);
    } else {
      console.log("An unknown error occurred.");
    }
    return new Response({
      status: 500,
      success: false,
      error: "Internal server error.",
    });
  }
};
