import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
    console.log('request: ', request);
  try {
    if (request.method !== "GET") {
      return new Response(
        JSON.stringify({ success: false, error: "Method not allowed." }),
        { status: 405, headers: { "Content-Type": "application/json" } }
      );
    }

    const { session } = await authenticate.admin(request);

    if (!session) {
      return new Response(
        JSON.stringify({ success: false, error: "Authentication failed." }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    const { shop } = session;

    if (!shop) {
      return new Response(
        JSON.stringify({ success: false, error: "Shop not found." }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, shop }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("An error occurred while getting shop:", error);

    return new Response(
      JSON.stringify({ success: false, error: "Internal server error." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
