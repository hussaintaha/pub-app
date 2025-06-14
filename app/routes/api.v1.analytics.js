import { AnalyticsUpdate } from "../models";
import { authenticate } from "../shopify.server";

export const loader = async({request})=>{
    try {
        if(request.method !== "GET") return new Response(JSON.stringify({success: false, error:'Method not allowed.'}), {status: 405})

        const {session} = await authenticate.admin(request)

        if(!session) return new Response(JSON.stringify({success: false, error:'Unauthorized action.'}), {status: 401})

        const {shop: shopify_domain} = session

        if(!shopify_domain) return new Response(JSON.stringify({success: false, error:'Forbidden error'}), {status: 403})

        const analytics = await AnalyticsUpdate.findOne({shopify_domain})
        console.log('analytics: ', analytics);

        if(!analytics) return new Response(JSON.stringify({success: false, error:'Analytics not found.'}), {status: 404})

        return new Response(JSON.stringify({success: true, analytics}), {status: 200})

    } catch (error) {
        if(error instanceof Error){
            console.log(`An error occurred while fetching analytics: ${error.message}`);
        }else{
            console.log(`An unknown error occurred.`);
        }

        return new Response(JSON.stringify({success: false, error:"Internal server error"}), {status: 500})
    }
}