import { Script } from "../models";

export const action = async ({ request }) => {
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers":
          "Content-Type, User-Agent, X-Environment, X-Discount-Type, X-Trigger-Type, X-Store-Domain, Authorization",
      },
    });
  }

  if (request.method !== "POST") {
    return new Response(
      JSON.stringify({
        success: false,
        error: "Method not allowed.",
      }),
      {
        status: 405,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
        },
      }
    );
  }

  try {
    console.log("Webhook triggered: /api/v1/widget-script/installation");

    const { shopify_domain, widget_script } = await request.json();

    if (!shopify_domain || !widget_script) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Shopify domain or widget script is missing.",
        }),
        {
          status: 400,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Content-Type": "application/json",
          },
        }
      );
    }

    const normalizeDomain = (domain, keepWWW = false) => {
      if (typeof domain !== "string") return "";
      let normalized = domain.trim().toLowerCase();
      normalized = normalized.replace(/^https?:\/\//, "");
      if (!keepWWW) normalized = normalized.replace(/^www\./, "");
      normalized = normalized.replace(/\/+$/, "");
      return normalized;
    };

    const normalizedShop = normalizeDomain(shopify_domain);
    const existingScript = await Script.findOne({ shop: normalizedShop });

    if (!existingScript) {
      await new Script({
        shop: normalizedShop,
        script: widget_script,
      }).save();

      console.log("New script injected");
    } else {
      await Script.findOneAndUpdate(
        { shop: normalizedShop },
        { $set: { script: widget_script } },
        { new: true }
      ).lean();

      console.log("Existing script updated");
    }

    const syncRes = await fetch(
      `${process.env.SHOPIFY_APP_URL}/api/v1/lovable/sync-products`,
      {
        method: "GET",
      }
    );

    const syncData = await syncRes.json();
    const { success, error, message } = syncData;

    if (!success && error) {
      console.log("Sync error:", error);
    } else if (success && message) {
      console.log("Sync success:", message);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Widget processed successfully.",
      }),
      {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Unhandled error:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: "Internal server error.",
      }),
      {
        status: 500,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
        },
      }
    );
  }
};
