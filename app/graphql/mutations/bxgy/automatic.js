export const DISCOUNT_AUTOMATIC_BXGY = `
mutation discountAutomaticBxgyCreate($automaticBxgyDiscount: DiscountAutomaticBxgyInput!) {
  discountAutomaticBxgyCreate(automaticBxgyDiscount: $automaticBxgyDiscount) {
    automaticDiscountNode {
      id
      automaticDiscount {
        ... on DiscountAutomaticBxgy {
          id
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
