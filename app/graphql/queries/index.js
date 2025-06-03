// shopInfo GQL query
export const SHOPINFOQUERY = `query shopInfo {
        shop {
          plan{
            partnerDevelopment
          }
        }
      }`;

export const RECURRINGAPPLICATIONCHARGESQUERY = `#graphql
query GetRecurringApplicationCharges {
  currentAppInstallation {
    activeSubscriptions {
      id
      createdAt
      currentPeriodEnd
      name
      test
      trialDays
      status
      lineItems {
        id
        plan {
          pricingDetails {
            __typename
          }
        }
      }
    }
  }
}`;


export const GET_THEMES = `#graphql
  query {
    themes(first: 250) {
      edges {
        node {
          name
          id
          role
        }
      }
    }
  }`

  export const GET_SHOP_INFO = `#graphql
  query {
    shop {
      name
      email
      myshopifyDomain
      primaryDomain {
        url
        host
      }
      plan {
        shopifyPlus
        partnerDevelopment
      }
    }
  }`;