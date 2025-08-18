import { error } from 'console';
import { authenticate } from '../shopify.server'

export const loader = async ({ request }) => {
  console.log('fetching segments...');
  try {
    if (request.method !== "GET") {
      return new Response(JSON.stringify({ success: false, error: "Method not allowed." }), { status: 405 });
    }

    const { admin } = await authenticate.admin(request);

    const query = `
      query GetSegments {
        segments(first: 10) {
          edges {
            node {
              id
              name
              query
            }
          }
        }
      }
    `;

    const response = await admin.graphql(query);
    const data = await response.json();
    console.log('data: ----------------------', data);

    if (!data?.data?.segments?.edges) {
       return new Response(JSON.stringify({ success: false, error: "Segments not found." }), { status: 404 });
    }

    const segment = data?.data?.segments?.edges?.find(edge =>
      edge.node.name.toLowerCase().includes("haven't purchased") ||
      edge.node.name.toLowerCase().includes("first time")
    );

    if (!segment) {
      return new Response(JSON.stringify({ success: false, error: "Segment not found." }), { status: 404 });
    }

    return new Response(JSON.stringify({ success: true, segment_id: segment?.node?.id }), { status: 200 });

  } catch (error) {
    if (error instanceof Error) {
      console.log(`An error occurred while fetching segments: ${error.message}`);
    } else {
      console.log(`An unknown error occurred.`);
    }

    return new Response(JSON.stringify({ success: false, error: "Internal server error." }), { status: 500 });
  }
}