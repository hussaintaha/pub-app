import { authenticate } from "../shopify.server";
import {syncProductsInBackground} from '../helpers'

const ProductSync= async(shop, admin)=>{
    try {
        syncProductsInBackground(admin, shop)

    } catch (error) {
        console.log(error)
    }
}

export const action = async({request})=>{
    try {
        console.log('Product update webhook trigger.');
        const { shop, admin} = await authenticate.webhook(request);
        
        ProductSync(shop, admin)
        
        return new Response(JSON.stringify({success:true, message:"Product created success"}), {status: 201})
    } catch (error) {
        if(error instanceof Error){
            console.log(`Error occurred while updating product: ${error.message}`);
        }else{
            console.log(`An unknown error occurred.`);
        }

        return new Response(JSON.stringify({success: true, error:"Internal server error."}), {status: 500})
    }
}