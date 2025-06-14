import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { Card, Text, BlockStack, InlineStack, Grid } from "@shopify/polaris";

const COLORS = ["#5C6AC4", "#F49342", "#50B83C", "#E32727", "#00848E"];

const AnalyticsTrends = ({ trends }) => {
  const conversationData = Object.entries(trends.conversations_by_day).map(
    ([date, value]) => ({
      date,
      conversations: value,
    }),
  );

  const messageData = Object.entries(trends.messages_by_hour).map(
    ([hour, value]) => ({
      hour: `${hour}:00`,
      messages: value,
    }),
  );

  const topIntentData = trends.top_intents.map((intent) => ({
    name: intent.intent,
    value: intent.count,
  }));

  const satisfactionData = [
    { name: "Positive", value: trends.user_satisfaction.positive },
    { name: "Neutral", value: trends.user_satisfaction.neutral },
    { name: "Negative", value: trends.user_satisfaction.negative },
  ];

  const ChartCard = ({ title, children }) => (
    <Card padding="400" roundedAbove="sm">
      <BlockStack gap="300">
        <Text variant="headingSm" as="h3">
          {title}
        </Text>
        <div style={{ width: "100%", height: 250 }}>{children}</div>
      </BlockStack>
    </Card>
  );

  return (
    <>
      <div style={{ marginTop: "16px" }}>
        <Grid>
          <Grid.Cell columnSpan={{ xs: 12, sm: 6, md: 6, lg: 6, xl: 6 }}>
            <ChartCard title="Conversations by Day">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={conversationData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="conversations"
                    stroke="#5C6AC4"
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>
          </Grid.Cell>
          <Grid.Cell columnSpan={{ xs: 12, sm: 6, md: 6, lg: 6, xl: 6 }}>
            <ChartCard title="Messages by Hour">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={messageData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="messages" fill="#F49342" />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </Grid.Cell>

          <Grid.Cell columnSpan={{ xs: 12, sm: 6, md: 6, lg: 6, xl: 6 }}>
            <ChartCard title="Top Intents">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={topIntentData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {topIntentData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>
          </Grid.Cell>

          <Grid.Cell columnSpan={{ xs: 12, sm: 6, md: 6, lg: 6, xl: 6 }}>
            <ChartCard title="User Satisfaction">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={satisfactionData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {satisfactionData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>
          </Grid.Cell>
        </Grid>
      </div>
    </>
  );
};

export default AnalyticsTrends;
