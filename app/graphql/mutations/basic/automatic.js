export const DISCOUNT_AUTOMATIC_BASIC = `
mutation discountAutomaticBasicCreate($automaticBasicDiscount: DiscountAutomaticBasicInput!) {
  discountAutomaticBasicCreate(automaticBasicDiscount: $automaticBasicDiscount) {
    automaticDiscountNode { 
      id 
      automaticDiscount {
        ... on DiscountAutomaticBasic {
          title
          status
          startsAt
          endsAt
          summary
          customerGets {
            value {
              ... on DiscountPercentage {
                percentage
              }
              ... on DiscountAmount {
                amount {
                  amount
                }
                appliesOnEachItem
              }
            }
            items {
              ... on AllDiscountItems {
                allItems
              }
              ... on DiscountProducts {
                products(first: 50) {
                  nodes {
                    id
                    title
                  }
                }
              }
              ... on DiscountCollections {
                collections(first: 50) {
                  nodes {
                    id
                    title
                  }
                }
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
