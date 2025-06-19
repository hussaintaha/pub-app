API Endpoint
URL: 
Method: POST

Key Features
Public Access: No authentication required, works from any third-party website
CORS Enabled: Full cross-origin support for browser-based applications
Domain Normalization: Automatically handles different domain formats
Validation: Comprehensive input validation and error handling
Independent: Works regardless of Supabase app or Lovable project publication status
Request Payload

{
  "shop": "mystore.myshopify.com",
  "shopify_id": 123456789
}
Success Response

{
  "success": true,
  "message": "Product deleted successfully",
  "deleted_product": {
    "id": "uuid",
    "name": "Product Name",
    "shopify_id": 123456789,
    "shop": "mystore.myshopify.com",
    "store_id": "uuid"
  }
}
The API includes comprehensive documentation with examples in multiple programming languages (JavaScript, Python, cURL) and handles all edge cases including validation errors, product not found scenarios, and proper CORS support for third-party integration.