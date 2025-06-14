import mongoose from 'mongoose';

const ActivitySchema = new mongoose.Schema({
  id: { type: String, required: true },
  timestamp: { type: Date, required: true },
  time_ago: { type: String },
  customer_name: { type: String },
  status: { type: String },
  message: { type: String },
  type: { type: String },

  // Flattened customer info
  customer_full_name: { type: String },
  customer_location: { type: String },
  customer_device: { type: String },
  session_id: { type: String }
}, { _id: false });

const LiveActivitySchema = new mongoose.Schema({
  // Shopify store identifier
  shopify_domain: {
    type: String,
    required: true,
    index: true,
    unique: true // One document per store
  },

  // Summary counts
  all_count: { type: Number },
  active_count: { type: Number },
  attention_count: { type: Number },

  // Customer activities list
  activities: [ActivitySchema],

  // Live metrics
  active_conversations: { type: Number },
  total_today: { type: Number },
  peak_concurrent_today: { type: Number },
  current_queue_size: { type: Number },
  average_wait_time: { type: Number }, // in minutes
  agents_online: { type: Number },

  // Filter tab counts
  filter_all_count: { type: Number },
  filter_active_count: { type: Number },
  filter_attention_count: { type: Number },

  // Feed metadata
  last_updated: { type: Date },
  feed_type: { type: String },
  refresh_interval: { type: Number },
  auto_refresh: { type: Boolean },

  // Event info
  event_type: { type: String },
  trigger_type: { type: String },
  timestamp: { type: Date }
}, {
  timestamps: true // adds createdAt and updatedAt
});

const Activity = mongoose.models.Activity || mongoose.model('Activity', LiveActivitySchema)

export default Activity
