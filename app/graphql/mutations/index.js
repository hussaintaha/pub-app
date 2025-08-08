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

export const DISCOUNT_AUTOMATIC_BXGY = `
mutation discountAutomaticBxgyCreate($bxgyAutomaticDiscount: DiscountAutomaticBxgyInput!) {
  discountAutomaticBxgyCreate(bxgyAutomaticDiscount: $bxgyAutomaticDiscount) {
    automaticDiscountNode { 
      id 
      automaticDiscount {
        ... on DiscountAutomaticBxgy {
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
