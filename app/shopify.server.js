import "@shopify/shopify-app-remix/adapters/node";
import {ApiVersion,AppDistribution,shopifyApp,BillingInterval,DeliveryMethod} from "@shopify/shopify-app-remix/server";
import { MongoDBSessionStorage } from "@shopify/shopify-app-session-storage-mongodb";
import dotenv from "dotenv";
import dbconnection from "./db.server";

// Load environment variables from .env file
dotenv.config();

// mongoDB connection
dbconnection();

export const CARTIA_GROWTH_PLAN = "Cartia Growth Plan";
export const CARTIA_PRO_PLAN = "Cartia Pro Plan";
export const CARTIA_ENTERPRISE_PLAN = "Cartia Enterprise Plan"

const shopify = shopifyApp({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET || "",
  apiVersion: ApiVersion.January25,
  scopes: process.env.SCOPES?.split(","),
  appUrl: process.env.SHOPIFY_APP_URL || "",
  authPathPrefix: "/auth",

  // The session storage is used to store the session data for the app.
  // This is used to store the session data for the app.
  sessionStorage:
    process.env.NODE_ENV === "production"
      ? new MongoDBSessionStorage(process.env.MONGODB_URI)
      : new MongoDBSessionStorage("mongodb://localhost:27017", "cartia"),
  distribution: AppDistribution.AppStore,

  // webhook handlers
  webhooks: {
    APP_SUBSCRIPTIONS_UPDATE: {
      deliveryMethod: DeliveryMethod.Http,
      callbackUrl: "/webhooks/app_subscriptions/update",
    },
    APP_UNINSTALLED: {
      deliveryMethod: DeliveryMethod.Http,
      callbackUrl: "/webhooks/app/uninstalled",
    },
  },

  // Billing
  // This is used to register the billing plan for the app.
  billing: {
    [CARTIA_GROWTH_PLAN]: {
      lineItems: [
        {
          amount: 29.99,
          currencyCode: "USD",
          interval: BillingInterval.Every30Days,
        },
      ],
    },
    [CARTIA_PRO_PLAN]: {
      lineItems: [
        {
          amount: 79.99,
          currencyCode: "USD",
          interval: BillingInterval.Every30Days,
        },
      ],
    },
     [CARTIA_ENTERPRISE_PLAN]: {
      lineItems: [
        {
          amount: 99.99,
          currencyCode: "USD",
          interval: BillingInterval.Every30Days,
        },
      ],
    },
  },

  // Webhook Registration
  hooks: {
    afterAuth: async ({ session }) => {
      shopify.registerWebhooks({ session });
    },
  },

  future: {
    unstable_newEmbeddedAuthStrategy: true,
    removeRest: true,
  },
  ...(process.env.SHOP_CUSTOM_DOMAIN
    ? { customShopDomains: [process.env.SHOP_CUSTOM_DOMAIN] }
    : {}),
});

export default shopify;
export const apiVersion = ApiVersion.January25;
export const addDocumentResponseHeaders = shopify.addDocumentResponseHeaders;
export const authenticate = shopify.authenticate;
export const unauthenticated = shopify.unauthenticated;
export const login = shopify.login;
export const registerWebhooks = shopify.registerWebhooks;
export const sessionStorage = shopify.sessionStorage;
