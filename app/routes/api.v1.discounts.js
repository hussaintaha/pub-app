
export const action = async ({ request }) => {
    try {
        console.log(`Discount create request received.`);

        if (request.method !== "POST") return new Response(JSON.stringify({ success: false, error: "Method not allowed." }), { status: 405 })

        const incomingDiscountRequest = await request.json()
        console.log('incomingDiscountRequest: ', JSON.stringify(incomingDiscountRequest,null, 2));

        const response = await fetch(`${process.env.SHOPIFY_APP_URL}/api/v1/discounts/create`, { method: 'POST', body: JSON.stringify({incomingDiscountRequest}) })

        const data = await response.json()

        const { error, success, message } = data

        if (error && !success) {
            console.log(error);
        } else if(!error && success) {
            console.log(message,'kkkkkkkkkk');
        }

        return new Response(JSON.stringify({ success: true, message: "Discount created successfully." }), { status: 201 })
    } catch (error) {
        if (error instanceof Error) {
            console.log(`An error occurred while discount webhook handling: ${error.message}`);
        } else {
            console.log(`An unknown error occurred.`);
        }

        return new Response(JSON.stringify({ success: false, error: "Internal server error." }), { status: 500 })
    }
}