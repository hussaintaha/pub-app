import { Activity } from "../models";

export const action = async ({ request }) => {
  try {
    if (request.method !== "POST") {
      return new Response(JSON.stringify({ success: false, error: "Method not allowed." }), { status: 405 });
    }

    const data = await request.json();

    if (!data?.shopify_domain) {
      return new Response(JSON.stringify({ success: false, error: "Missing required field: shopify_domain" }), { status: 400 });
    }

    function normalizeShopifyDomain(url) {
            try {
                const parsedUrl = new URL(url);
                return parsedUrl.hostname.toLowerCase();
            } catch (err) {
                return url
                    .replace(/^https?:\/\//, '')
                    .replace(/\/+$/, '')
                    .toLowerCase();
            }
        }

        const domain = normalizeShopifyDomain(data?.shopify_domain)
        console.log('domain: ', domain);

    const {
      event_type,
      trigger_type,
      shopify_domain,
      timestamp,
      live_activity_feed
    } = data;

    const flatData = {
      event_type,
      trigger_type,
      shopify_domain:domain,
      timestamp,

      all_count: live_activity_feed.summary?.all_count,
      active_count: live_activity_feed.summary?.active_count,
      attention_count: live_activity_feed.summary?.attention_count,

      active_conversations: live_activity_feed.current_metrics?.active_conversations,
      total_today: live_activity_feed.current_metrics?.total_today,
      peak_concurrent_today: live_activity_feed.current_metrics?.peak_concurrent_today,
      current_queue_size: live_activity_feed.current_metrics?.current_queue_size,
      average_wait_time: live_activity_feed.current_metrics?.average_wait_time,
      agents_online: live_activity_feed.current_metrics?.agents_online,

      filter_all_label: live_activity_feed.filters?.all?.label,
      filter_all_count: live_activity_feed.filters?.all?.count,
      filter_active_label: live_activity_feed.filters?.active?.label,
      filter_active_count: live_activity_feed.filters?.active?.count,
      filter_attention_label: live_activity_feed.filters?.attention?.label,
      filter_attention_count: live_activity_feed.filters?.attention?.count,

      // Feed metadata
      feed_last_updated: live_activity_feed.feed_metadata?.last_updated,
      feed_type: live_activity_feed.feed_metadata?.feed_type,
      feed_refresh_interval: live_activity_feed.feed_metadata?.refresh_interval,
      feed_auto_refresh: live_activity_feed.feed_metadata?.auto_refresh,

      // Activities
      activities: (live_activity_feed.activities || []).map((act) => ({
        id: act.id,
        timestamp: act.timestamp,
        time_ago: act.time_ago,
        customer_name: act.customer_name,
        status: act.status,
        message: act.message,
        type: act.type,
        customer_info_full_name: act.customer_info?.full_name,
        customer_info_location: act.customer_info?.location,
        customer_info_device: act.customer_info?.device,
        customer_info_session_id: act.customer_info?.session_id,
      }))
    };

    const updated = await Activity.findOneAndUpdate(
      { shopify_domain },
      { $set: flatData },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return new Response(JSON.stringify({ success: true, data: updated }), { status: 200 });

  } catch (error) {
    console.error("Webhook Error:", error);
    return new Response(JSON.stringify({ success: false, error: "Internal server error." }), { status: 500 });
  }
};
