export const DISCOUNT_CODE_BASIC = `
mutation discountCodeBasicCreate($basicCodeDiscount: DiscountCodeBasicInput!) {
  discountCodeBasicCreate(basicCodeDiscount: $basicCodeDiscount) {
    codeDiscountNode {
      id
      codeDiscount {
        ... on DiscountCodeBasic {
          title
          codes(first: 1) {
            nodes {
              code
            }
          }
          status
          startsAt
          endsAt
          summary
          customerGets {
            items {
              ... on DiscountProducts {
                products(first: 10) {
                  nodes {
                    id
                    title
                  }
                }
              }
              ... on DiscountCollections {
                collections(first: 10) {
                  nodes {
                    id
                    title
                  }
                }
              }
              ... on AllDiscountItems {
                allItems
              }
            }
            value {
              ... on DiscountAmount {
                amount {
                  amount
                }
                appliesOnEachItem
              }
              ... on DiscountPercentage {
                percentage
              }
            }
          }
          customerSelection {
            ... on DiscountCustomerAll {
              allCustomers
            }
            ... on DiscountCustomerSegments {
              segments {
                id
              }
            }
          }
        }
      }
    }
    userErrors {
      field
      message
      code
    }
  }
}`;
