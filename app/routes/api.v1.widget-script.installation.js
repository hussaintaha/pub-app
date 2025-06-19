import { Script } from "../models";

export const loader = async ({ request }) => {
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  return new Response(null, { status: 405 }); 
};

export const action = async ({ request }) => {
  try {
    console.log("Webhook triggered. /api/v1/widget-script/installation");

    if (request.method !== "POST") {
      return {
        status: 405,
        success: false,
        error: "Method not allowed.",
      };
    }

    const { shopify_domain, widget_script } = await request.json();
    console.log('shopify_domain, widget_script: ----------', shopify_domain, widget_script);

    if (!shopify_domain || !widget_script) {
      return {
        status: 400,
        success: false,
        error: "Shopify domain or widget script is missing.",
      };
    }

    const normalizeDomain = (domain, keepWWW = false) => {
      if (typeof domain !== "string") return "";
      let normalized = domain.trim().toLowerCase();
      normalized = normalized.replace(/^https?:\/\//, "");
      if (!keepWWW) {
        normalized = normalized.replace(/^www\./, "");
      }
      normalized = normalized.replace(/\/+$/, "");
      return normalized;
    };

    const normalizedShop = normalizeDomain(shopify_domain);

    const existingScript = await Script.findOne({ shop: normalizedShop });

    if (!existingScript) {
      const newScript = new Script({
        shop: normalizedShop,
        script: widget_script,
      });
      await newScript.save();

      console.log('New script injected...');

      return {
        status: 200,
        success: true,
        message: "Widget injected successfully.",
      };
    } else {
      const updatedScript = await Script.findOneAndUpdate(
        { shop: normalizedShop },
        { $set: { script: widget_script } },
        { new: true }
      ).lean();

      if (!updatedScript) {
        return {
          status: 404,
          success: false,
          error: "Script not found.",
        };
      }

      console.log(`Existing script updated...`);

      const productSyncResponse = await fetch(`${process.env.SHOPIFY_APP_URL}/api/v1/lovable/sync-products`, {method:'GET'})

      const data = await productSyncResponse.json()

      const {success, error, message} = data

      if(!success && !message && error){
        console.log(`Error occured in product syncing while widget setup: ${error}`);
      }else if(success && message && !error){
        console.log(`Product sync completed while widget setup.`);
      }

      return {
        status: 200,
        success: true,
        message: "Widget updated successfully.",
      };
    }
  } catch (error) {
    console.error("Error occurred:", error);

    return {
      status: 500,
      success: false,
      error: "Internal server error.",
    };
  }
};
