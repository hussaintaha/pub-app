import mongoose from "mongoose";

const RecentActivity = new mongoose.Schema({
  timestamp: { type: Date },
  type: { type: String },
  customer_info: {
    location: String,
    device: String,
    session_duration: Number,
    product_category: String,
    issue_category: String,
  }
})

const AnalyticsUpdateSchema = new mongoose.Schema({
  event_type: { type: String, required: true },
  trigger_type: { type: String, required: true },
  shopify_domain: { type: String, required: true },
  webhook_url: { type: String, required: true },
  timestamp: { type: Date, required: true },
  analytics: {
    total_conversations: Number,
    conversion_rate: Number,
    resolution_rate: Number,
    response_time_avg: Number,
    escalation_rate: Number,
    unique_visitors: Number,
    recent_activity: { type: [RecentActivity] },
    trends: {
      conversations_by_day: { type: Map, of: Number },
      messages_by_hour: { type: Map, of: Number },
      top_intents: [
        {
          intent: String,
          count: Number,
          percentage: Number,
        },
      ],
      user_satisfaction: {
        positive: Number,
        neutral: Number,
        negative: Number,
      },
    },
    geographic_data: [
      {
        country: String,
        conversations: Number,
        conversion_rate: Number,
      },
    ],
    performance: {
      uptime_percentage: Number,
      error_rate: Number,
      peak_usage_hour: String,
      avg_concurrent_chats: Number,
    },
  },
});

const AnalyticsUpdate =
  mongoose.models.AnalyticsUpdate ||
  mongoose.model("AnalyticsUpdate", AnalyticsUpdateSchema);

export default AnalyticsUpdate;
