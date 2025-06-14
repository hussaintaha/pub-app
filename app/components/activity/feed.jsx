import React, { useState } from "react";
import {
  Card,
  Badge,
  Text,
  Box,
  InlineStack,
  BlockStack,
  Tabs,
  Icon,
} from "@shopify/polaris";
import { ClockIcon } from "@shopify/polaris-icons";

const FILTERS = [
  { label: "All", value: "all", countKey: "filter_all_count" },
  { label: "Active", value: "active", countKey: "filter_active_count" },
  {
    label: "Attention",
    value: "needs_attention",
    countKey: "filter_attention_count",
  },
];

const STATUS_BADGE = {
  active: { tone: "info", label: "Active" },
  resolved: { tone: "success", label: "Resolved" },
  needs_attention: { tone: "critical", label: "Needs Attention" },
};

export default function LiveActivityFeed({ data }) {
  const [selectedTab, setSelectedTab] = useState(0);

  const getTabContent = (filterValue) => {
    if (filterValue === "all") return data.activities || [];
    return (data.activities || []).filter((a) => a.status === filterValue);
  };

  const currentFilter = FILTERS[selectedTab];
  const filteredActivities = getTabContent(currentFilter.value);

  return (
    <div style={{ marginTop: "16px" }}>
      <Card roundedBorder>
        <Box padding={5}>
          <BlockStack gap={5}>
            <BlockStack gap={1}>
              <Text as="h2" variant="headingMd">
                Live Activity Feed UI Structure
              </Text>
              <Text as="p" tone="subdued">
                Data structure designed to match your Live Activity Feed
                component
              </Text>
            </BlockStack>

            <Tabs
              tabs={FILTERS.map((f) => ({
                id: f.value,
                content: `${f.label} (${data[f.countKey] || 0})`,
              }))}
              selected={selectedTab}
              onSelect={setSelectedTab}
            />

            {filteredActivities.length > 0 ? (
              <BlockStack gap={4}>
                {filteredActivities.map((activity) => (
                  <div key={activity.id} style={{marginBottom:"8px"}}>
                    <Card roundedBorder>
                      <Box padding={4}>
                        <BlockStack gap={3}>
                          <InlineStack
                            align="space-between"
                            blockAlign="center"
                          >
                            <InlineStack gap={2} blockAlign="center">
                              <Icon source={ClockIcon} tone="subdued" />
                              <Text tone="subdued">{activity.time_ago}</Text>
                            </InlineStack>
                            <Badge
                              tone={
                                STATUS_BADGE[activity.status]?.tone || "default"
                              }
                            >
                              {STATUS_BADGE[activity.status]?.label ||
                                activity.status}
                            </Badge>
                          </InlineStack>

                          <BlockStack gap={1}>
                            <Text fontWeight="medium">
                              {activity.customer_name}
                            </Text>
                            <Text tone="subdued">{activity.message}</Text>
                          </BlockStack>
                        </BlockStack>
                      </Box>
                    </Card>
                  </div>
                ))}
              </BlockStack>
            ) : (
              <Box padding={4}>
                <Text tone="subdued">No activities found for this filter.</Text>
              </Box>
            )}
          </BlockStack>
        </Box>
      </Card>
    </div>
  );
}
