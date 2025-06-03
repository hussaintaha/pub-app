import React,{useState} from 'react'
import { authenticate } from '../shopify.server';
import {Page,Text,BlockStack,Card,Button,Box,Banner,Modal,Layout,} from "@shopify/polaris";
import { useActionData, useLoaderData, useOutletContext, useSubmit } from "@remix-run/react";

export const CARTIA_GROWTH_PLAN = "Cartia Growth Plan";
export const CARTIA_PRO_PLAN = "Cartia Pro Plan";
export const CARTIA_ENTERPRISE_PLAN = "Cartia Enterprise Plan"
export const SUBSCRIPTION_PLANS_KEYS_LIST = [
  CARTIA_GROWTH_PLAN,
  CARTIA_PRO_PLAN,
  CARTIA_ENTERPRISE_PLAN,
];

export const action = async ({ request }) => {
  if (request.method !== "POST")
    return { status: 405, success: false, error: "Method not allowed." };

  const { billing } = await authenticate.admin(request);

  if (!billing)
    return { status: 403, success: false, error: "Forbidden error." };

  const { appSubscriptions } = await billing.check({
      plans: [...(SUBSCRIPTION_PLANS_KEYS_LIST)],
      isTest: true,
    });

    if (appSubscriptions.length === 0) {
      return {
        status: "error",
        message: "No active subscription found to cancel.",
      }
    }

    const formData = await request.formData();
    const subscriptionId = formData.get("subscriptionId");

    // Use the billing.cancel method to cancel the subscription
    // The app also listens for the "subscription_contracts/cancel" webhook
    // to process any follow-up actions when cancellations happen
    const cancelledSubscription = await billing.cancel({
      subscriptionId: subscriptionId,
      isTest: true,
      prorate: true,
    });

    return{
      status: "success",
      message: "Subscription cancelled successfully",
      cancelledSubscription,
    };
};

const SubscriptionCancel = () => {
  const { hasActiveSubscription, loading, planName, activeSubscriptionsData } = useOutletContext();
  const actionData = useActionData();
  const submit = useSubmit();
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);

  const handleCancel = () => {
    setConfirmModalOpen(true);
  };

  const confirmCancellation = () => {
    const formData = new FormData();
    formData.append("subscriptionId", activeSubscriptionsData?.id);
    submit(formData, { method: "post" });
    setConfirmModalOpen(false);
  };
  
  return (
    <>
     <Page title="Cancel Subscription">
      <Layout>
        <Layout.Section>
          <BlockStack gap="400">
            {actionData?.status === "success" ? (
              <Banner
                title="Subscription Cancelled"
                tone="success"
                onDismiss={() => {}}
              >
                <p>Your subscription has been successfully cancelled.</p>
              </Banner>
            ) : actionData?.status === "error" ? (
              <Banner title="Error" tone="critical" onDismiss={() => {}}>
                <p>{actionData.message}</p>
              </Banner>
            ) : null}

            <Card>
              <BlockStack gap="400">
                <BlockStack gap="200">
                  <Text as="h2" variant="headingMd">
                    Cancel {planName} Subscription
                  </Text>
                  <Text as="p" variant="bodyMd">
                    We're sorry to see you go. Before you cancel your
                    subscription, please note:
                  </Text>
                </BlockStack>

                <BlockStack gap="200">
                  <Text as="h3" variant="headingSm">
                    What happens when you cancel:
                  </Text>
                  <ul style={{ paddingLeft: "20px", marginTop: "8px" }}>
                    <li>
                      <Text as="span" variant="bodyMd">
                        You'll have access to your current plan features until
                        the end of your current billing period.
                      </Text>
                    </li>
                    <li>
                      <Text as="span" variant="bodyMd">
                        Your account will be downgraded to the free plan after
                        the current billing period ends.
                      </Text>
                    </li>
                    <li>
                      <Text as="span" variant="bodyMd">
                        Any prorated refund will be applied according to
                        Shopify's billing policies.
                      </Text>
                    </li>
                  </ul>
                </BlockStack>

                <Box paddingBlockStart="400">
                  <BlockStack gap="400" align="center">
                    <Box
                      paddingBlock="400"
                      borderWidth="025"
                      borderStyle="dashed"
                      borderColor="border-critical"
                      borderRadius="300"
                      background="bg-surface-critical"
                      paddingInline="400"
                      width="100%"
                    >
                      <BlockStack gap="200" align="center">
                        <Text
                          as="p"
                          variant="bodyMd"
                          fontWeight="semibold"
                          alignment="center"
                        >
                          Are you sure you want to cancel your subscription?
                        </Text>
                        <Button
                          variant="primary"
                          tone="critical"
                          onClick={handleCancel}
                          disabled={actionData?.status === "success"}
                        >
                          Cancel Subscription
                        </Button>
                      </BlockStack>
                    </Box>

                    <Button variant="plain" url="/app/pricing">
                      Back to Plans
                    </Button>
                  </BlockStack>
                </Box>
              </BlockStack>
            </Card>
          </BlockStack>
        </Layout.Section>
      </Layout>

      <Modal
        open={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        title="Confirm Cancellation"
        primaryAction={{
          content: "Yes, Cancel Subscription",
          onAction: confirmCancellation,
        }}
        secondaryActions={[
          {
            content: "Keep My Subscription",
            onAction: () => setConfirmModalOpen(false),
          },
        ]}
      >
        <Modal.Section>
          <Text as="p" variant="bodyMd">
            Are you sure you want to cancel your {planName} subscription? You'll
            lose access to premium features at the end of your current billing
            period.
          </Text>
        </Modal.Section>
      </Modal>
    </Page>
    </>
  )
}

export default SubscriptionCancel