import { useState} from "react";
import { TitleBar } from "@shopify/app-bridge-react";
import { Page } from "@shopify/polaris";
import {  QuickstartStep, ScriptInject, ThemeSelect } from "../components";

const QuickStart = () => {
    // State management
  const [openStep, setOpenStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState([false,false,false,]);

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

  return (
    <>
      <Page
        title="Setup cartia ai"
        subtitle="Follow these steps to enable cartia ai on your store."
        backAction={{
          content: "Dashboard",
          url: "/app",
        }}
      >
        <TitleBar title="Quickstart" />

             <QuickstartStep
              stepNumber={1}
              title="Add the Widget to Your Store"
              isOpen={openStep === 1}
              isFirstStep={true}
              isLastStep={false}
              onToggle={toggleStep}
              onNext={handleNextStep}
              onPrevious={handlePreviousStep}
            >
              <ScriptInject />
            </QuickstartStep>

            <QuickstartStep
              stepNumber={2}
              title="Select Your Store Theme"
              isOpen={openStep === 2}
              isFirstStep={false}
              isLastStep={true}
              onToggle={toggleStep}
              onNext={handleNextStep}
              onPrevious={handlePreviousStep}
            >
              <ThemeSelect />
            </QuickstartStep>
      </Page>
    </>
  );
};

export default QuickStart;
