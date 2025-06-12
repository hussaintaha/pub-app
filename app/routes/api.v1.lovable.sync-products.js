import { authenticate } from "../shopify.server";
import {ProductSyncStatus} from "../models";

const syncProductsInBackground = async (admin, shop) => {
  let hasNextPage = true;
  let cursor = null;
  const allProducts = [];

  while (hasNextPage) {
    const query = `query {
      products(first: 250${cursor ? `, after: "${cursor}"` : ''}) {
        edges {
          node {
            id
            title
            handle
            descriptionHtml
            vendor
            productType
            tags
            status
            media(first: 5) {
              edges {
                node {
                  preview {
                    image {
                      url
                      altText
                    }
                  }
                }
              }
            }
            variants(first: 50) {
              edges {
                node {
                  id
                  title
                  sku
                  inventoryQuantity
                  price
                  compareAtPrice
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

    const response = await admin.graphql(query);
    const data = await response.json();

    const edges = data.data.products.edges;
    allProducts.push(...edges.map(edge => edge.node));

    hasNextPage = data.data.products.pageInfo.hasNextPage;
    cursor = edges.length ? edges[edges.length - 1].cursor : null;
  }

  const transformedProducts = allProducts.map(product => {
    const images = [];
    product.media.edges.forEach(edge => {
      const imageNode = edge.node.preview?.image;
      if (imageNode?.url) {
        images.push({
          src: imageNode.url,
          alt: imageNode.altText || product.title
        });
      }
    });

    const variants = product.variants.edges.map(variant => ({
      id: variant.node.id,
      title: variant.node.title,
      price: parseFloat(variant.node.price || 0),
      compare_at_price: parseFloat(variant.node.compareAtPrice || 0),
      sku: variant.node.sku,
      inventory_quantity: variant.node.inventoryQuantity,
      weight: 0
    }));

    const primaryPrice = variants.length > 0 ? variants[0].price : 0;
    const tagsText = Array.isArray(product.tags) ? product.tags.join(', ') : (product.tags || '');
    let primaryImageUrl = null;
    if (product.media.edges.length > 0) {
      const firstImage = product.media.edges[0].node.preview?.image;
      if (firstImage?.url) {
        primaryImageUrl = firstImage.url;
      }
    }

    return {
      shopify_id: parseInt(product.id.replace('gid://shopify/Product/', '')),
      title: product.title,
      description: product.descriptionHtml,
      category: product.productType || "Uncategorized",
      price: primaryPrice,
      compare_at_price: variants[0]?.compare_at_price || 0,
      vendor: product.vendor,
      product_type: product.productType,
      tags: tagsText,
      images,
      variants,
      status: product.status,
      image_url: primaryImageUrl,
      shop: shop
    };
  });

  const endpoint = `https://iwxnvshrfopgbpueafye.supabase.co/functions/v1/shopify-products`;

  const chunkSize = 50;
  const chunks = [];
  for (let i = 0; i < transformedProducts.length; i += chunkSize) {
    chunks.push(transformedProducts.slice(i, i + chunkSize));
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
          products: chunk,
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
        totalProcessed += result.data?.products_processed || chunk.length;
      }

      const progress = Math.round(((i + 1) / chunks.length) * 100);
      await ProductSyncStatus.findOneAndUpdate(
        { shop },
        {
          productSync: totalProcessed,
          syncPercentage: progress
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
      isSync: false,
      syncPercentage: 100,
      productSync: totalProcessed
    }
  );

  console.log(`Background sync completed. Processed: ${totalProcessed}, Failed: ${totalErrors}`);
};


export const loader = async ({ request }) => {
  try {
    if (request.method !== "GET")
      return new Response(
        JSON.stringify({
          success: false,
          error: "Method not allowed."
        }),
        { status: 405, headers: { "Content-Type": "application/json" } }
      );

    const { admin, session } = await authenticate.admin(request);

    if (!admin && session)
      return new Response(
        JSON.stringify({
          success: false,
          error: "Unauthorized to perform this action."
        }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );

    const { shop } = session;

    await ProductSyncStatus.findOneAndUpdate(
      { shop },
      {
        isSync: true,
        productSync: 0,
        syncPercentage: 0,
        shop
      },
      { upsert: true, new: true }
    );

    syncProductsInBackground(admin, shop).catch(error => {
      console.error(`Background sync error: ${error.message}`);
      ProductSyncStatus.findOneAndUpdate(
        { shop },
        {
          isSync: false,
          syncPercentage: 100
        }
      ).catch(console.error);
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: "Product sync started in background."
      }),
      { status: 202, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error(`Error occurred while initiating product sync:`, error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Internal server error."
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
