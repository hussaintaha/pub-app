import { SHOPINFOQUERY, RECURRINGAPPLICATIONCHARGESQUERY } from "../graphql/queries";
import { Subscription } from "../models";
import { authenticate } from "../shopify.server";

export const loader = async({request}) =>{
    try {
        if(request.method !== "GET") return {status: 405, success: false, error:"Method not allowed."}

        const {session, admin} = await authenticate.admin(request)

        if(!session) return {status: 401, success: false, error:"Unathorized to perform this action."}

        const {shop} = session

        if(!shop) return {status: 403, success: false, error: "Forbidden access."}

        // Check if the shop is a development store
        const shopResponse = await admin.graphql(SHOPINFOQUERY)

        const shopData = await shopResponse.json();

        const isDevelopmentStore = shopData.data?.shop?.plan?.partnerDevelopment? true : false;

        // check if subscription is active
        const response = await admin.graphql(RECURRINGAPPLICATIONCHARGESQUERY)
        
        const data = await response.json();
        
        const activeSubscriptionsData = data?.data?.currentAppInstallation?.activeSubscriptions?.[0];

        const subscriptionDataFound = await Subscription.findOne({shop})

        if(!subscriptionDataFound){
            await Subscription.create({ status: 'INACTIVE', planName: 'Free Plan', isDevelopmentStore, shop})
        }

        const subscriptionDataFromDB = await Subscription.findOne({shop});

        const responseData = {activeSubscriptionsData, subscriptionDataFromDB, apikey: process.env.SHOPIFY_API_KEY}

        return {status: 200, success: true, data: responseData}

    } catch (error) {
        if(error instanceof Error){
            console.log(`An error occurred while getting subscription: ${error.message}.`);
        }else{
            console.log('Something went wrong.');
        }
    }
    return {status: 500, success: false, error:"Internal server error."}
}