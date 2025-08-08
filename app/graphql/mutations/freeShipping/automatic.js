export const DISCOUNT_AUTOMATIC_FREE_SHIP = `
mutation discountAutomaticFreeShippingCreate($freeShippingAutomaticDiscount: DiscountAutomaticFreeShippingInput!) {
  discountAutomaticFreeShippingCreate(freeShippingAutomaticDiscount: $freeShippingAutomaticDiscount) {
    automaticDiscountNode { 
      id 
      automaticDiscount {
        ... on DiscountAutomaticFreeShipping {
          title
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