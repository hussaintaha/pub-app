import { authenticate } from "../shopify.server";
import {ProductSyncStatus} from "../models";
import {syncCollectionHelper, syncProductsInBackground} from '../helpers'

export const loader = async ({ request }) => {
  console.log('Product syncing in progress...');
  
  try {
    if (request.method !== "GET")
      return new Response(
        JSON.stringify({
          success: false,
          error: "Method not allowed."
        }),
        { status: 405, headers: { "Content-Type": "application/json" } }
      );

    const { admin, session } = await authenticate.admin(request);

    if (!admin && session)
      return new Response(
        JSON.stringify({
          success: false,
          error: "Unauthorized to perform this action."
        }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );

    const { shop } = session;

    await ProductSyncStatus.findOneAndUpdate(
      { shop },
      {
        isSync: true,
        productSync: 0,
        syncPercentage: 0,
        shop
      },
      { upsert: true, new: true }
    );

    syncCollectionHelper(admin, shop)

    syncProductsInBackground(admin, shop).catch(error => {
      console.error(`Background sync error: ${error.message}`);
      ProductSyncStatus.findOneAndUpdate(
        { shop },
        {
          isSync: false,
          syncPercentage: 100
        }
      ).catch(console.error);
    });

    

    return new Response(
      JSON.stringify({
        success: true,
        message: "Product sync started in background."
      }),
      { status: 202, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error(`Error occurred while initiating product sync:`, error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Internal server error."
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
