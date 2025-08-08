export const DISCOUNT_CODE_FREE_SHIP = `
mutation discountCodeFreeShippingCreate($freeShippingCodeDiscount: DiscountCodeFreeShippingInput!) {
  discountCodeFreeShippingCreate(freeShippingCodeDiscount: $freeShippingCodeDiscount) {
    codeDiscountNode { 
      id 
      codeDiscount {
        ... on DiscountCodeFreeShipping {
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