import React, { useEffect, useState } from "react";

import {
  Card,
  Select,
  Button,
  Banner,
  TextContainer,
  Form,
  FormLayout,
  InlineError,
  InlineStack,
  BlockStack,
  Text,
} from "@shopify/polaris";
import { useFetchThemes } from "../../hooks";
import { useFetchShopInfo } from "../../hooks/useFetchShopInfo";

const ThemeSelect = () => {
  const { themes } = useFetchThemes();
  const { shopInfo } = useFetchShopInfo();
  const [selectedThemeId, setSelectedThemeId] = useState("");
  const [error, setError] = useState("");

  const themeOptions =
    themes?.map((theme) => ({
      label: theme.name,
      value: theme.id.toString(),
    })) || [];

  useEffect(() => {
    if (themes?.length && !selectedThemeId) {
      const activeTheme = themes.find((theme) => theme.role === "MAIN");
      if (activeTheme) {
        setSelectedThemeId(activeTheme.id.toString());
      }
    }
  }, [themes, selectedThemeId]);

  const activeTheme = themes?.find((theme) => theme.role === "MAIN");

  const handleEnableClick = async () => {
    const selectedTheme = themes.find(
      (theme) => theme.id.toString() === selectedThemeId,
    );

    if (!selectedTheme) {
      setError("Please select a valid theme.");
      return;
    }

    const storeName = shopInfo?.myshopifyDomain.replace(".myshopify.com", "");
    const numericThemeId = selectedTheme.id.split("/").pop();
    const editorUrl = `https://admin.shopify.com/store/${storeName}/themes/${numericThemeId}/editor`;
    window.open(editorUrl, "_blank");
  };

  return (
    <>
      <TextContainer spacing="tight">
        <p>
          Select your current Shopify theme from the dropdown below. Then click{" "}
          <strong>Enable</strong> to open the theme editor and complete setup.
        </p>
      </TextContainer>

      {themes && themes.length > 0 && shopInfo && (
        <div style={{ marginTop: "16px" }}>
          <Card background="bg-surface-secondary">
            <Form onSubmit={handleEnableClick}>
              <FormLayout>
                {activeTheme && (
                  <Banner
                    title={`Current active theme: ${activeTheme.name}`}
                    status="success"
                  />
                )}

                <BlockStack gap="400" align="center">
                  <Text variant="headingSm" as="h6">
                    Select Theme
                  </Text>

                  <InlineStack gap="400">
                    <div style={{ minWidth: "300px" }}>
                      <Select
                        options={themeOptions}
                        value={selectedThemeId}
                        onChange={setSelectedThemeId}
                        placeholder="Choose a theme"
                      />
                    </div>
                    <Button onClick={handleEnableClick} primary>
                      Enable in Theme Editor
                    </Button>
                  </InlineStack>
                  {error && (
                    <InlineError message={error} fieldID="theme-select" />
                  )}
                </BlockStack>
              </FormLayout>
            </Form>
            <div style={{ marginTop: "16px", marginBottom: "16px", width: "52%"}}>
                    <img
                    src="/images/embed-on.png"
                    alt="Embed on Shopify"
                    style={{
                      width: "100%",
                      height: "auto",
                      borderRadius: "8px",
                      boxShadow: "0 0 5px rgba(0,0,0,0.1)",
                    }}
                  />
                </div>
          </Card>
        </div>
      )}
    </>
  );
};

export default ThemeSelect;
