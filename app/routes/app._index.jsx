import React from "react";
import { useOutletContext} from "@remix-run/react";
import { Page, Layout } from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import {  StartupGuide } from "../components";
import Activity from "../components/ui/activity";

export const loader = async ({ request }) => {
  await authenticate.admin(request);
  return null;
};

export default function Index() {
  const { hasActiveSubscription } = useOutletContext();

  return (
    <Page>
      <TitleBar title="Dashboard"></TitleBar>
      <Layout>
        <Layout.Section>
          <StartupGuide hasActiveSubscription={hasActiveSubscription} />
          <Activity />
        </Layout.Section>
      </Layout>
    </Page>
  );
}
