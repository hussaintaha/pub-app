
export const DISCOUNT_CODE_FIRST_TIME_BUYER = `mutation discountCodeBasicCreate($basicCodeDiscount: DiscountCodeBasicInput!) {
  discountCodeBasicCreate(basicCodeDiscount: $basicCodeDiscount) {
    codeDiscountNode {
      id
      codeDiscount {
        ... on DiscountCodeBasic {
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
}`;