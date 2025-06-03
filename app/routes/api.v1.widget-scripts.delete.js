import { authenticate } from "../shopify.server";
import { Script } from "../models";

export const action = async ({ request }) => {
    try {
        if (request.method !== "DELETE") return { status: 405, success: false, error: "Method Not Allowed" };

        const { session } = await authenticate.admin(request);

        if (!session) return { status: 401, success: false, error: "Unauthorized" };

        const { shop } = session;

        const isScriptExists = await Script.findOne({ shop });

        if (!isScriptExists) return { status: 404, success: false, error: "Script not found" };

        await Script.deleteOne({ shop });

        return { status: 200, success: true, message: "Script deleted successfully" };
        
    } catch (error) {
        if (error instanceof Response) {
            console.error('Caught a Response object:', error.statusText);
        }

        if (error instanceof Error) {
            console.error(`An error occurred while deleting scripts: ${error.message}`);
        } else {
            console.error(`An unexpected error occurred:`, error);
        }

        return { status: 500, success: false, error: "Internal Server Error" };
    }
}