import {
  Link,
  Outlet,
  useLoaderData,
  useRouteError,
  useNavigate,
  useNavigation,
  useLocation,
} from "@remix-run/react";
import { boundary } from "@shopify/shopify-app-remix/server";
import { AppProvider } from "@shopify/shopify-app-remix/react";
import { NavMenu } from "@shopify/app-bridge-react";
import polarisStyles from "@shopify/polaris/build/esm/styles.css?url";
import { authenticate } from "../shopify.server";
import { useCallback, useEffect, useState } from "react";
import { Frame, Loading } from "@shopify/polaris";

export const links = () => [{ rel: "stylesheet", href: polarisStyles }];

export const loader = async ({ request }) => {
  await authenticate.admin(request);

  return { apiKey: process.env.SHOPIFY_API_KEY || "" };
};

export default function App() {
  const { apiKey } = useLoaderData();
  const [subscriptionData, setSubscriptionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const navigation = useNavigation();
  const location = useLocation();
  const isLoading = navigation.state !== "idle";

  const fetchActiveSubscription = useCallback(async () => {
    try {
      const response = await fetch("/api/v1/subscriptions", { method: "GET" });
      const data = await response.json();
      const { success, data: resData, error } = data;

      if (success && resData) {
        setSubscriptionData(resData);
        setLoading(false);
      } else if (!success && !resData && error) {
        setLoading(false);
        shopify.toast.show(error, { duration: 5000, isError: true });
      }
    } catch (error) {
      console.log(error);
    }
  }, []);

  useEffect(() => {
    fetchActiveSubscription();
  }, [fetchActiveSubscription]);

  const { activeSubscriptionsData, subscriptionDataFromDB: subscription } = subscriptionData || {};

  const hasActiveSubscription =
    activeSubscriptionsData?.status === "ACTIVE" &&
    subscription?.status === "ACTIVE";

  // Redirect to pricing page if no active subscription
  useEffect(() => {
    if (!loading && !hasActiveSubscription && location.pathname !== "/app/pricing") {
      navigate("/app/pricing", { replace: true });
    }
  }, [hasActiveSubscription, loading, location.pathname, navigate]);

  const loadingStyles = {
    opacity: isLoading ? 0.6 : 1,
    transition: "opacity 0.2s ease-in-out",
  };

  const context = {
    hasActiveSubscription,
    planName: subscription?.planName,
    loading,
    activeSubscriptionsData,
  };

  return (
    <AppProvider isEmbeddedApp apiKey={apiKey}>
      <Frame>
        {isLoading && <Loading />}
        <NavMenu>
          <Link to="/app" rel="home">
            Home
          </Link>
          <Link to="/app/analytics">Analytics</Link>
          <Link to="/app/quickstart">Quickstart</Link>
          <Link to="/app/pricing">Pricing</Link>
        </NavMenu>
        <div style={loadingStyles}>
          <Outlet context={{ ...context }} />
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
