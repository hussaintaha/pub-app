import { useState } from "react";
import { Page, Text, Box, Banner, BlockStack, Button } from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import QuickstartStep from "./quickstart/quickstartstep";

export default function CartiaSetupGuide({ setupCompleted }) {
  const [openStep, setOpenStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState([false, false, false]);

  const toggleStep = (stepNumber) => {
    setOpenStep(openStep === stepNumber ? null : stepNumber);
  };

  const handleNextStep = (currentStep) => {
    setCompletedSteps((prev) => {
      const updated = [...prev];
      updated[currentStep - 1] = true;
      return updated;
    });
    setOpenStep(currentStep + 1);
  };

  const handlePreviousStep = (currentStep) => {
    setOpenStep(currentStep - 1);
  };

  const steps = [
    {
      title: "Create Your Cartia Account",
      content: [
        "1. Click 'Sign up for Cartia'",
        "2. Enter your email and create a password",
        "3. Verify your email address",
        "4. Connect your Shopify store by entering your domain",
      ],
      img: ["/images/cartia-signup.png"],
    },
    {
      title: "Store Setup",
      content: [
        "1. Enter your store name",
        "2. Confirm your store URL",
        "3. Add store details",
        "4. Click Continue",
      ],
      img: [
        "/images/store-setup.png",
        "/images/ss-1.png",
        "/images/ss-2.png",
        "/images/ss-3.png",
      ],
    },
    {
      title: "Design Your AI Agent",
      content: [
        "1. Choose Agent Name",
        "2. Set Agent Personality",
        "3. Customize Appearance",
      ],
      img: [
        "/images/ad-1.png",
        "/images/ad-2.png",
        "/images/ad-3.png",
        "/images/ad-4.png",
      ],
    },
    {
      title: "Communication Preferences",
      content: [
        "1. Configure greetings & responses",
        "2. Set escalation rules",
        "3. Test communication style",
      ],
      img: ["/images/ac-1.png"],
    },
    {
      title: "Agent Skills & Capabilities",
      content: [
        "1. Product Recommendations",
        "2. Order Support",
        "3. FAQ Handling",
        "4. Custom Skills",
      ],
      img: ["/images/skill.png"],
    },
    {
      title: "Install Your AI Agent",
      content: [
        "1. Choose Widget Position",
        "2. Customize Widget",
        "3. Install Widget (Auto or Manual)",
      ],
      img: ["/images/ws-1.png", "/images/ws-2.png"],
    },
    {
      title: "Agent Activation",
      content: [
        "1. Review Configuration",
        '2. Click "Activate Agent"',
        "🎉 Congratulations! Your AI agent is now active.",
      ],
      img: ["/images/act.png"],
    },
  ];

  return (
    <Page
      title="Cartia AI Setup Guide"
      subtitle="Learn how to configure and enable Cartia AI for your Shopify store via the Cartia dashboard."
    >
      <TitleBar title="Cartia" />

      <div style={{ marginBottom: "32px" }}>
        <Banner title="Setup Required" tone="informational" hideIcon={false}>
          <p>
            To enable the AI agent on your Shopify store, please complete the
            sign-up and widget setup in the Cartia dashboard.
          </p>
          <div style={{ marginTop: "16px" }}>
            <Button
              variant="primary"
              url="https://your-cartia-dashboard-url.com"
              target="_blank"
              size="large"
            >
              Go to Cartia Dashboard
            </Button>
          </div>
        </Banner>
      </div>

      {steps.map((step, index) => (
        <QuickstartStep
          key={step.title}
          stepNumber={index + 1}
          title={step.title}
          isOpen={openStep === index + 1}
          isFirstStep={index + 1 === 1}
          isLastStep={steps.length === index + 1}
          onToggle={toggleStep}
          onNext={handleNextStep}
          onPrevious={handlePreviousStep}
          setupCompleted={setupCompleted}
        >
          <Box
            padding="4"
            style={{
              maxHeight: "500px",
              overflowY: "auto",
              borderTop: "1px solid #eee",
            }}
          >
            <ul style={{ paddingLeft: "20px", marginBottom: "16px" }}>
              {step.content.map((content) => (
                <li key={content} style={{ marginBottom: "8px" }}>
                  {content}
                </li>
              ))}
            </ul>

            {step?.img?.map((stepImage, idx) => (
              <div key={`${step.title}-${idx}`} style={{ marginTop: "32px" }}>
                <Box paddingBlockEnd="4">
                  <img
                    src={stepImage}
                    alt={`${step.title} screenshot ${idx + 1}`}
                    style={{
                      width: "100%",
                      height: "auto",
                      borderRadius: "8px",
                      boxShadow: "0 0 5px rgba(0,0,0,0.1)",
                    }}
                  />
                  <Box paddingBlockStart="2">
                    <Text alignment="center" variant="bodySm" as="p">
                      Step {idx + 1}
                    </Text>
                  </Box>
                </Box>
              </div>
            ))}
          </Box>
        </QuickstartStep>
      ))}
    </Page>
  );
}
