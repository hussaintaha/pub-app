import {
  ButtonGroup,
  Button,
  InlineStack,
  LegacyCard,
  LegacyStack,
  Collapsible,
} from "@shopify/polaris";
import { ChevronUpIcon, ChevronDownIcon } from "lucide-react";
import { SectionHeading } from "../ui/heading";

const QuickstartStep = ({
  stepNumber,
  title,
  isOpen,
  isFirstStep,
  isLastStep,
  children,
  onToggle,
  onNext,
  onPrevious,
  showFinishInsteadOfNext = false,
  setupCompleted
}) => {
  return (
    <>
      <div style={{ marginBottom: '16px' }} >
        <LegacyCard sectioned>
          <LegacyStack vertical>
            <button
              onClick={() => onToggle(stepNumber)}
              ariaExpanded={isOpen}
              ariaControls="basic-collapsible"
              style={{width: '100%', backgroundColor: 'transparent', border: 'none', padding: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}
            >
              <InlineStack gap="400" align="start" blockAlign="center">
                <SectionHeading
                  title={`Step ${stepNumber}: ${title}`}
                  as="h3"
                  variant="headingMd"
                />
              </InlineStack>
              {isOpen ? (
                <ChevronUpIcon className="w-5 h-5 text-gray-500" />
              ) : (
                <ChevronDownIcon className="w-5 h-5 text-gray-500" />
              )}
            </button>
            <Collapsible
            open={isOpen}
            id="basic-collapsible"
            transition={{duration: '500ms', timingFunction: 'ease-in-out'}}
            expandOnPrint
          >
            <div className="p-5 border-t">{children}</div>
            <div style={{marginTop: '16px', display: 'flex', justifyContent: 'flex-end'}}>
                <ButtonGroup>
                  {!isFirstStep && (
                    <Button
                      variant="secondary"
                      onClick={() => onPrevious(stepNumber)}
                    >
                      Back
                    </Button>
                  )}
                  {isLastStep ? (
                    <Button variant="primary" url={setupCompleted ? "/app" :"" }>
                      Finish
                    </Button>
                  ) : (
                    <Button
                      variant="primary"
                      onClick={() => onNext(stepNumber)}
                    >
                      Next
                    </Button>
                  )}
                </ButtonGroup>
            </div>
          </Collapsible>
          </LegacyStack>
        </LegacyCard>
      </div>
    </>
  );
};

export default QuickstartStep;
