export const DISCOUNT_CODE_BXGY = `
mutation discountCodeBxgyCreate($bxgyCodeDiscount: DiscountCodeBxgyInput!) {
  discountCodeBxgyCreate(bxgyCodeDiscount: $bxgyCodeDiscount) {
    codeDiscountNode { 
      id 
      codeDiscount {
        ... on DiscountCodeBxgy {
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