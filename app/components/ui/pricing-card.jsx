import React from "react";
import {
  Page,
  Text,
  BlockStack,
  Box,
  InlineGrid,
  Banner,
  Card,
  Badge,
  Button,
  InlineStack,
} from "@shopify/polaris";

const PricingCard = ({ planName, activePlan, price, features, handleSubscription }) => {
  const getBadgeTone = (plan) => {
    const badgeTone =
      plan === "Cartia Growth Plan"
        ? "info"
        : plan === "Cartia Pro Plan"
          ? "warning"
          : plan === "Cartia Enterprise Plan"
            ? "attention"
            : "default";

    return badgeTone;
  };

  return (
    <>
      <Card>
        <div className="card">
          <BlockStack gap="400">
            <Box padding="400">
              <BlockStack gap="400">
                <InlineStack align="space-between">
                  <Badge size="medium" tone={getBadgeTone(planName)}>
                    {planName}
                  </Badge>
                  {activePlan === planName && (
                    <Badge tone="success" size="small">
                      Current
                    </Badge>
                  )}
                </InlineStack>
                <Text variant="headingXl" as="p" fontWeight="bold">
                  ${price}
                  <Text variant="bodyMd" as="span" fontWeight="regular">
                    /month
                  </Text>
                </Text>
                <Box>
                    {activePlan === planName ? (
                  <Button
                    variant="primary"
                    tone="critical"
                    url="/app/subscription/cancel"
                    fullWidth
                  >
                    Cancel Subscription
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    fullWidth
                    onClick={()=>handleSubscription(planName)}
                  >
                    Subscribe
                  </Button>
                )}
                </Box>
              </BlockStack>
              <div style={{marginTop:'16px'}}>
                <Box  paddingBlockStart="0">
                <BlockStack gap="200">
                  <Text variant="headingSm" as="h3" fontWeight="semibold">
                    Features
                  </Text>
                  <BlockStack gap="200">
                    {features.map((feature, index) => (
                      <Text key={index} variant="bodyMd" as="p">
                        • {typeof feature === "string" ? feature : feature.name}
                      </Text>
                    ))}
                  </BlockStack>
                </BlockStack>
              </Box>
              </div>
            </Box>
          </BlockStack>
        </div>
      </Card>
    </>
  );
};

export default PricingCard;
