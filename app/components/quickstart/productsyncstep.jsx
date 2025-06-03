import React, { useState } from "react";
import { Text, BlockStack, Card, Button } from "@shopify/polaris";

const ProductSyncStep = ({ myshopifyDomain, promotionIngestionStatus }) => {
  const [loading, setLoading] = useState(false);
  const handleProductSync = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/v1/loavable/sync-products", {
        method: "GET",
      });
      const data = await response.json();
      const { success, error, message } = data;
      if (!success && !message && error) {
        shopify.toast.show(error, { duration: 5000, isError: true });
        setLoading(false)
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <BlockStack gap="500">
        <Text as="p" variant="bodyMd">
          To complete your cartia ai setup, we need to sync your products. This
          will allow customers to search through your entire catalog using our
          enhanced ai chatbot.
        </Text>

        <Card background="bg-surface-secondary">
          <BlockStack gap="400">
            <Text as="h4" variant="headingSm" fontWeight="semibold">
              Product syncing
            </Text>

            <Text as="p" variant="bodyMd">
              Click the button below to start the syncing process. An email
              notification will be sent to you once syncing is complete. This
              process may take several minutes depending on your catalog size.
            </Text>

            <div>
              <Button loading={loading} tone="success" onClick={handleProductSync}>Start Sync</Button>
            </div>

            <Text as="p" variant="bodySm" tone="subdued">
              Note: You will only see results from the products that have been
              synced. You will receive an email once syncing is complete.
            </Text>
          </BlockStack>
        </Card>
      </BlockStack>
    </>
  );
};

export default ProductSyncStep;
