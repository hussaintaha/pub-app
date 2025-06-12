import React, { useCallback, useState, useRef, useEffect } from "react";
import { Text, BlockStack, Card, Button, InlineStack, Spinner } from "@shopify/polaris";

const ProductSyncStep = ({ myshopifyDomain, promotionIngestionStatus }) => {
   const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [progress, setProgress] = useState(0);
  const pollingIntervalRef = useRef(null);

    const pollSyncStatus = useCallback(() => {
    pollingIntervalRef.current = setInterval(async () => {
      try {
        const res = await fetch("/api/v1/lovable/sync-status");
        const { success, result } = await res.json();

        if (success && result) {
          setProgress(result.syncPercentage);
          setSyncing(result.isSync);

          if (!result.isSync || result.syncPercentage >= 100) {
            clearInterval(pollingIntervalRef.current);
            setSyncing(false);
          }
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    }, 3000); 
  }, []);
  
   const handleProductSync = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/v1/lovable/sync-products", { method: "GET" });
      const data = await response.json();
      const { success, error } = data;

      if (!success && error) {
        shopify.toast.show(error, { duration: 5000, isError: true });
      } else {
        setSyncing(true);
        setProgress(0);
        pollSyncStatus(); 
      }
    } catch (error) {
      console.log("Sync error:", error);
    } finally {
      setLoading(false);
    }
  }, [pollSyncStatus]);

  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);


   useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

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
            <Button loading={loading} tone="success" onClick={handleProductSync} disabled={syncing}>
              {syncing ? "Syncing..." : "Start Sync"}
            </Button>
          </div>

          {syncing && (
            <InlineStack align="start" gap="200">
              <Spinner size="small" />
              <Text as="p" variant="bodySm">Sync progress: {progress}%</Text>
            </InlineStack>
          )}

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
