import { ProductSyncStatus } from "../models";

const syncCollectionsInBackground = async (admin, shop) => {
    let hasNextPage = true;
    let cursor = null;
    const allCollections = [];

    while (hasNextPage) {
        const query = `query {
      collections(first: 100${cursor ? `, after: "${cursor}"` : ''}) {
        edges {
          node {
            id
            title
            handle
            updatedAt
            products(first: 250) {
              edges {
                node {
                  id
                  title
                }
              }
            }
          }
          cursor
        }
        pageInfo {
          hasNextPage
        }
      }
    }`;

        try {
            const response = await admin.graphql(query);
            const data = await response.json();

            const edges = data.data.collections.edges;
            allCollections.push(...edges.map(edge => edge.node));

            hasNextPage = data.data.collections.pageInfo.hasNextPage;
            cursor = edges.length ? edges[edges.length - 1].cursor : null;

        } catch (error) {
            console.error("GraphQL fetch failed:", error);
            break;
        }
    }

  const transformedCollections = allCollections.map(collection => {
  const productEdges = collection.products.edges || [];
  return {
    id: parseInt(collection.id.replace('gid://shopify/Collection/', '')),
    name: collection.title,  
    product_count: productEdges.length,
    updated_at: collection.updatedAt,
    shop:shop
  };
});

console.log(transformedCollections);

    const endpoint = `https://iwxnvshrfopgbpueafye.supabase.co/functions/v1/sync-categories`;

    const chunkSize = 50;
    const chunks = [];
    for (let i = 0; i < transformedCollections.length; i += chunkSize) {
        chunks.push(transformedCollections.slice(i, i + chunkSize));
    }

    let totalProcessed = 0;
    let totalErrors = 0;

    for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        try {
            const response = await fetch(endpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    shopify_domain: shop,
                    categories: chunk,  
                    sync_type: "incremental"
                })
            });

            if (!response.ok) {
                const errorBody = await response.text();
                console.error(`Chunk ${i + 1} failed with status:`, response.status);
                console.error('Error body:', errorBody);
                totalErrors += chunk.length;
            } else {
                const result = await response.json();
                totalProcessed += result.data?.collections_processed || chunk.length;
            }

            const progress = Math.round(((i + 1) / chunks.length) * 100);
            await ProductSyncStatus.findOneAndUpdate(
                { shop },
                {
                    collectionSync: totalProcessed,
                    collectionSyncPercentage: progress
                }
            );

            if (i < chunks.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 500));
            }

        } catch (error) {
            console.error(`Error processing chunk ${i + 1}:`, error);
            totalErrors += chunk.length;
        }
    }

    await ProductSyncStatus.findOneAndUpdate(
        { shop },
        {
            collectionSync: totalProcessed,
            collectionSyncPercentage: 100
        }
    );

    console.log(`✅ Background collection sync completed. Processed: ${totalProcessed}, Failed: ${totalErrors}`);
};

export default syncCollectionsInBackground;
