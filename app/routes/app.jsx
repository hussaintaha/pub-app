import {
  Link,
  Outlet,
  useLoaderData,
  useRouteError,
  useNavigation,
} from "@remix-run/react";
import { boundary } from "@shopify/shopify-app-remix/server";
import { AppProvider } from "@shopify/shopify-app-remix/react";
import { NavMenu } from "@shopify/app-bridge-react";
import polarisStyles from "@shopify/polaris/build/esm/styles.css?url";
import { authenticate } from "../shopify.server";
import { useCallback, useEffect, useState } from "react";
import { Frame, Loading } from "@shopify/polaris";
import { RedirectionComponent } from "../components";
import getFirstTimeBuyerSegment from "../utils/getFirstTimeBuyerSegment";

export const links = () => [{ rel: "stylesheet", href: polarisStyles }];

export const loader = async ({ request }) => {
  await authenticate.admin(request);
  return {
    apiKey: process.env.SHOPIFY_API_KEY || "",
    appUrl: process.env.SHOPIFY_APP_URL || "",
  };
};

export default function App() {
  const { apiKey, appUrl } = useLoaderData();
  const [setupStatus, setSetupStatus] = useState(false);
  const [segmentId, setSegmentId] = useState(null);
  const navigation = useNavigation();
  const isLoading = navigation.state !== "idle";

  const loadingStyles = {
    opacity: isLoading ? 0.6 : 1,
    transition: "opacity 0.2s ease-in-out",
  };

  const fetchAgentSetupStatus = useCallback(async () => {
    try {
      const response = await fetch("/api/v1/agent-setup-check", {
        method: "GET",
      });
      const data = await response.json();
      const { error, success, setupCompleted } = data;

      if (error && !success) {
        shopify.toast.show(error, { isError: true });
      } else {
        setSetupStatus(setupCompleted);
      }
    } catch (error) {
      console.log(error);
    }
  }, []);

  useEffect(() => {
    fetchAgentSetupStatus();
  }, [fetchAgentSetupStatus]);


    useEffect(() => {
    const fetchSegmentId = async () => {
      if (appUrl) {
        const id = await getFirstTimeBuyerSegment(appUrl);
        setSegmentId(id);
      }
    };
    fetchSegmentId();
  }, [appUrl]);

  return (
    <AppProvider isEmbeddedApp apiKey={apiKey}>
      <Frame>
        {isLoading && <Loading />}
        <NavMenu>
          <Link to="/app" rel="home">
            Home
          </Link>
          {setupStatus && (
            <>
              <Link to="/app/analytics">Analytics</Link>
              <Link to="/app/quickstart">Quickstart</Link>
            </>
          )}
        </NavMenu>
        <div style={loadingStyles}>
          {setupStatus ? <Outlet /> : <RedirectionComponent />}
        </div>
      </Frame>
    </AppProvider>
  );
}

// Shopify needs Remix to catch some thrown responses, so that their headers are included in the response.
export function ErrorBoundary() {
  return boundary.error(useRouteError());
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};
