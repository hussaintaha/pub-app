import { useCallback, useEffect, useState } from "react";
import {
  Form,
  FormLayout,
  TextField,
  Button,
  InlineError,
  Banner,
  ChoiceList,
  Card,
  TextContainer,
  ButtonGroup,
} from "@shopify/polaris";
import useFetchScript from "../../hooks/useFetchScript";

const ScriptInject = () => {
  const [scriptContent, setScriptContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [mode, setMode] = useState("manual");
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [edit, setEdit] = useState(false);

  const { script, refetch } = useFetchScript();

  useEffect(() => {
    if (script && !edit) {
      setScriptContent(script);
      setEdit(true);
    }
  }, [script, edit]);

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    setSuccess(false);
    setHasSubmitted(true);

    const options = {
      method: !edit ? 'POST' : 'PATCH',
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({injectMethod: mode,script: mode === "manual" ? scriptContent : "",})
    };

    const endpoint = !edit ? "/api/v1/widget-scripts/create" : "/api/v1/widget-scripts/update";

    try {
      const response = await fetch(endpoint, {...options});

      const data = await response.json();
      console.log('data: ', data);

      if (data.success) {
        setSuccess(true);
        setEdit(true);
        await refetch(); 
      } else {
        setError(data.message || "Something went wrong.");
      }
    } catch (err) {
      setError("Failed to save script.");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveScript = useCallback(async () => {
    try {
      const response = await fetch("/api/v1/widget-scripts/delete", {
        method: "DELETE",
      });
      const data = await response.json();
      const { success, error } = data;
      if (error && !success) {
        shopify.toast.show(error, { duration: 5000, isError: true });
      } else if (success && !error) {
        setScriptContent("");
        setEdit(false);
        setSuccess(false);
        setHasSubmitted(false);
        setMode("manual");
        await refetch(); // Sync state with backend
        shopify.toast.show("Script removed successfully!", {
          duration: 5000,
          isError: false,
        });
      }
    } catch (error) {
      console.log(error);
    }
  }, [refetch]);

  return (
    <>
      <TextContainer spacing="tight">
        <Banner
          title="How to add the Cartia widget to your store"
          status="info"
        >
          <p>
            You can choose how you'd like to add the Cartia widget to your
            store:
          </p>
          <ul>
            <li>
              <strong>Manual:</strong> Paste the widget code into the text box
              below. That’s all you need to do — we’ll handle the rest in the
              background.
            </li>
            <li>
              <strong>Automatic:</strong> Just click the button. Cartia will
              automatically add the widget to your store for you.
            </li>
          </ul>
          <p>
            To make any changes to your widget later, visit your{" "}
            <a
              href="https://dashboard.cartia.ai"
              target="_blank"
              rel="noopener noreferrer"
            >
              Cartia Dashboard
            </a>
            .
          </p>
        </Banner>
      </TextContainer>

      <div style={{ marginTop: "16px", height:"250px",overflowY:'auto' }}>
        <Card background="bg-surface-secondary">
          <Form onSubmit={handleSubmit}>
            <FormLayout>
              {!edit && (
                <ChoiceList
                  title="Script Injection Mode"
                  choices={[
                    { label: "Manual", value: "manual" },
                    { label: "Automatic", value: "automatic" },
                  ]}
                  selected={[mode]}
                  onChange={(value) => {
                    setMode(value[0]);
                    setError("");
                    setSuccess(false);
                    setHasSubmitted(false);
                  }}
                />
              )}

              {mode === "manual" && (
                <>
                  <TextField
                    label="Custom Script"
                    value={scriptContent}
                    onChange={setScriptContent}
                    multiline={6}
                    placeholder="<script>console.log('Hello World')</script>"
                    helpText="Insert valid script tags. This will be rendered via a theme extension block."
                  />
                  {hasSubmitted && error && (
                    <InlineError message={error} fieldID="script" />
                  )}
                  {success && (
                    <Banner
                      status="success"
                      title="Script saved successfully!"
                    />
                  )}

                  <ButtonGroup>
                    <Button submit size="large" loading={loading} primary>
                      {script ? "Update Script" : "Save Script"}
                    </Button>
                    {edit && (
                      <Button
                        onClick={handleRemoveScript}
                        size="large"
                        tone="critical"
                      >
                        Remove Script
                      </Button>
                    )}
                  </ButtonGroup>
                </>
              )}

              {mode === "automatic" && (
                <>
                  {success && (
                    <Banner
                      status="success"
                      title="Script injected automatically!"
                    />
                  )}
                  {error && (
                    <InlineError message={error} fieldID="auto-script" />
                  )}
                 <ButtonGroup>
                   <Button submit size="large" loading={loading} primary>
                    Inject Script
                  </Button>
                  {edit && (
                      <Button
                        onClick={handleRemoveScript}
                        size="large"
                        tone="critical"
                      >
                        Remove Script
                      </Button>
                    )}
                 </ButtonGroup>
                </>
              )}
            </FormLayout>
          </Form>
        </Card>
      </div>
    </>
  );
};

export default ScriptInject;
