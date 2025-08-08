export default class BaseDiscountHandler {
  validate(data) {
    console.log('data: ', data);
    const errors = [];
    
    if (!data.rule_name) errors.push("rule_name is required");
    if (!data.start_date) errors.push("start_date is required");
    
    if (data.end_date && new Date(data.start_date) >= new Date(data.end_date)) {
      errors.push("end_date must be after start_date");
    }
    
    if (errors.length > 0) {
      throw new Error(`Invalid discount input: ${errors.join(', ')}`);
    }
  }

  async createDiscount(adminClient, input) {
    const result = await adminClient.fetch(this.mutation, {
      variables: {
        [this.inputKey]: input,
      },
    });

    const data = await result.json();
    
    if (data?.errors) {
      throw new Error(`GraphQL Error: ${JSON.stringify(data.errors)}`);
    }

    const discountResult = Object.values(data?.data)[0];
    if (discountResult?.userErrors?.length > 0) {
      const errors = discountResult.userErrors;
      throw new Error(`Discount creation failed: ${errors.map(e => `${e.field}: ${e.message}`).join(', ')}`);
    }

    return {
      success: true,
      discountId: discountResult?.codeDiscountNode?.id || discountResult?.automaticDiscountNode?.id,
      message: "Discount created successfully."
    };
  }
}