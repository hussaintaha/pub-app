import React from "react";
import { authenticate } from "../shopify.server";
import { Banner, BlockStack, Button, InlineGrid, Page, Text } from "@shopify/polaris";
import { useOutletContext, useSubmit } from "@remix-run/react";
import { useFetchProducts } from "../hooks";
import { TitleBar } from "@shopify/app-bridge-react";
import { PricingCard } from "../components";

export const action = async ({ request }) => {
  if (request.method !== "POST")
    return { status: 405, success: false, error: "Method not allowed." };

  const { billing } = await authenticate.admin(request);

  if (!billing)
    return { status: 403, success: false, error: "Forbidden error." };

  const formData = await request.formData();
  const planName = formData.get("planName");
  const isCancel = formData.get("isCancel");

  return await billing.require({
    plans: [planName],
    isTest: true,
    onFailure: async () =>
      await billing.request({
        plan: planName,
        isTest: true,
        returnUrl: process.env.SHOPIFY_APP_URL,
      }),
  });
};

const Subscription = () => {
  const submit = useSubmit();
  const { hasActiveSubscription, planName, loading, activeSubscriptionsData } = useOutletContext();

  const plans = [
    {
      id: "plan-1",
      planName: "Cartia Growth Plan",
      price: 29.99,
      description:
        "Perfect for individuals or small teams starting with AI chat automation.",
      features: [
        "Up to 1,000 messages/month",
        "Basic analytics",
        "Email support",
        "1 chatbot instance",
      ],
    },
    {
      id: "plan-2",
      planName: "Cartia Pro Plan",
      price: 79.99,
      description:
        "Great for growing businesses needing more volume and insights.",
      features: [
        "Up to 10,000 messages/month",
        "Advanced analytics & reporting",
        "Priority email support",
        "Up to 3 chatbot instances",
        "Integration with CRM tools",
      ],
    },
    {
      id: "plan-3",
      planName: "Cartia Enterprise Plan",
      price: 99.99,
      description:
        "Custom solutions for high-volume teams and enterprise needs.",
      features: [
        "Unlimited messages",
        "Dedicated account manager",
        "24/7 support",
        "Custom integrations",
        "White-labeling options",
        "SLA & security compliance",
      ],
    },
  ];

  const handleSubscription = (plan) => {

    if(plan){
      const planToBeSubscribe = plans.filter(e=> e.planName === plan)[0]
      const formData = new FormData();
      formData.append("planName", planToBeSubscribe.planName);
      formData.append("amount", planToBeSubscribe.price);
      formData.append("isCancel", false);
      submit(formData, { method: "POST" });
    }else{
      shopify.toast.show("Please select a plan.", {duration: 5000, isError:true})
    }
  };

  return (
    <>
      <Page
        title="Choose the right plan for your business"
        subtitle="Upgrade anytime to access more features and increase your conversation limit."
        backAction={{
          content: "Dashboard",
          url: "/app",
        }}
      >
        <TitleBar title="Pricing Plans" />
        <BlockStack gap="800">
          {hasActiveSubscription && (
            <Banner tone="success">
              <Text variant="bodyMd" as="p">
                You are currently on the <strong>{planName}</strong> plan.
                Choosing a different plan will replace your current
                subscription.
              </Text>
            </Banner>
          )}

          <InlineGrid
          columns={{
            xs: "1fr",
            md:`repeat(${plans.length}, 1fr)`,
            lg: `repeat(${Math.min(plans.length, 4)}, 1fr)`,
          }}
          gap={{ xs: "400", md: "200" }}
        >
          {
            plans.map((plan, index)=><PricingCard key={`plan-${index}`} planName={plan.planName} activePlan={activeSubscriptionsData?.name} price={plan.price} features={plan.features} handleSubscription={handleSubscription} />)
          }
        </InlineGrid>
        </BlockStack>
      </Page>
    </>
  );
};

export default Subscription;
