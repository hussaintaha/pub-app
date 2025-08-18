export const DISCOUNT_AUTOMATIC_FIRST_TIME_BUYER = `
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
            customerSelection {
            ... on DiscountCustomerSegments {
              segments {
                id
                name
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
  }
`;