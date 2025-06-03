import React from "react";
import { useOutletContext} from "@remix-run/react";
import { Page, Layout } from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import { StartupGuide } from "../components";

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
        </Layout.Section>
      </Layout>
    </Page>
  );
}
