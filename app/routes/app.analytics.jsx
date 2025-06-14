import React from "react";
import { AnalyicsUpdate } from "../components";
import { TitleBar } from "@shopify/app-bridge-react";
import { Page } from "@shopify/polaris";

const Analytics = () => {
  return (
    <>
      <Page
        title="Analytics"
        subtitle=""
        backAction={{
          content: "Dashboard",
          url: "/app",
        }}
      >
        <TitleBar title="Analytics" />
        <AnalyicsUpdate />
      </Page>
    </>
  );
};

export default Analytics;
