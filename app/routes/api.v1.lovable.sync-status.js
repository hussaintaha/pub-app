import { authenticate } from "../shopify.server";
import {ProductSyncStatus} from "../models";

export const loader = async ({ request }) => {
  try {
    const { session } = await authenticate.admin(request);

    if (!session) return {status: 401 , success: false, error: "Unauthorized to access sync status." }

    const shop = session.shop;

    const syncStatus = await ProductSyncStatus.findOne({ shop });

    if (!syncStatus) return { status: 404, success: false, error: "No sync status found for this shop." }

    return { success: true, result: syncStatus }
  } catch (error) {
    console.error("Error fetching sync status:", error);
    return {status: 500, success: false, error: "Failed to fetch sync status." }
  }
};
