import { Activity } from "../models";
import { authenticate } from "../shopify.server";

export const loader = async({request})=>{
    try {
        if(request.method !== "GET") return new Response(JSON.stringify({success: false, error:'Method not allowed.'}), {status: 405})

        const {session} = await authenticate.admin(request)

        if(!session) return new Response(JSON.stringify({success: false, error:'Unauthorized action.'}), {status: 401})

        const {shop: shopify_domain} = session

        if(!shopify_domain) return new Response(JSON.stringify({success: false, error:'Forbidden error'}), {status: 403})

        const activity = await Activity.findOne({shopify_domain})
 
        if(!activity) return new Response(JSON.stringify({success: false, error:'activity not found.'}), {status: 404})

        return new Response(JSON.stringify({success: true, activity}), {status: 200})

    } catch (error) {
        if(error instanceof Error){
            console.log(`An error occurred while fetching analytics: ${error.message}`);
        }else{
            console.log(`An unknown error occurred.`);
        }

        return new Response(JSON.stringify({success: false, error:"Internal server error"}), {status: 500})
    }
}