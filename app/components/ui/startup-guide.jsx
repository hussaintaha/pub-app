import {
  Text,
  Card,
  BlockStack,
  InlineStack,
  Button,
  Divider,
  TextContainer,
  Banner,
} from "@shopify/polaris";
import { CreditCard, Rocket, LayoutDashboard } from "lucide-react";

const StartupGuide = () => {
  return (
    <>
      <Card>
        <TextContainer spacing="tight">
          <Banner
            title="Important: Setup Required to Run Cartia AI"
            status="warning"
          >
            <p>
              The Cartia app will only start working after you log in and
              complete the setup in the{" "}
              <a
                href="https://preview--cartia2.lovable.app/register"
                target="_blank"
                rel="noopener noreferrer"
              >
                Cartia Dashboard
              </a>
              .
            </p>
            <p>
              Once setup is complete and the agent is configured, the Cartia AI
              widget will be displayed on your store.
            </p>
            <p>
              For accurate AI analysis and personalized recommendations, make
              sure to index all your products in{" "}
              <strong>Quick Startup - Step 2</strong> inside the quickstart
            </p>
          </Banner>
        </TextContainer>

        <div style={{ marginTop: "16px" }}>
          <BlockStack gap="400">
            {/* quick setup */}
            <InlineStack gap="300" align="space-between" blockAlign="center">
              <InlineStack gap="300" blockAlign="center">
                <LayoutDashboard size={20} color="#5c6ac4" />
                <BlockStack gap="100">
                  <Text variant="headingMd" as="h2">
                    Cartia AI Setup Guide
                  </Text>
                  <Text as="p" variant="bodyMd">
                    Learn how to configure and enable Cartia AI for your Shopify
                    store via the Cartia dashboard.
                  </Text>
                </BlockStack>
              </InlineStack>
              <Button variant="primary" url="/app/cartia-dashboard-setup">
                Setup Cartia AI Agent
              </Button>
            </InlineStack>
          </BlockStack>
          <div style={{ margin: "16px" }}>
            <Divider />
          </div>
          <BlockStack gap="400">
            {/* quick setup */}
            <InlineStack gap="300" align="space-between" blockAlign="center">
              <InlineStack gap="300" blockAlign="center">
                <Rocket size={20} color="#5c6ac4" />
                <BlockStack gap="100">
                  <Text variant="headingMd" as="h2">
                    Setup cartia app
                  </Text>
                  <Text as="p" variant="bodyMd">
                    Follow our step-by-step guide to enable cartia ai on your
                    store.
                  </Text>
                </BlockStack>
              </InlineStack>
              <Button variant="primary" url="/app/quickstart">
                Enable Cartia AI Agent
              </Button>
            </InlineStack>
          </BlockStack>
        </div>
      </Card>
    </>
  );
};

export default StartupGuide;
