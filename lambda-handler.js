// Lambda handler for Express app
// This wraps the Express application to run on AWS Lambda

import app from "./index.js";

// For AWS Lambda Web Adapter
// Simply export the Express app
export const handler = app;

// Alternative: For direct Lambda invocation with API Gateway
// Uncomment below if using API Gateway Lambda proxy integration
/*
export const lambdaHandler = async (event, context) => {
  // Convert API Gateway event to Express-like request
  const method = event.httpMethod || event.requestContext?.http?.method || "GET";
  const path = event.path || event.rawPath || "/";
  const body = event.body ? JSON.parse(event.body) : undefined;
  const headers = event.headers || {};

  // Create a mock request object
  const req = {
    method,
    path,
    url: path,
    headers,
    body,
    query: event.queryStringParameters || {}
  };

  // Handle response
  return new Promise((resolve) => {
    app(req, {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "Success" }),
      send: (data) => resolve({
        statusCode: 200,
        body: JSON.stringify(data)
      }),
      json: (data) => resolve({
        statusCode: 200,
        body: JSON.stringify(data)
      })
    });
  });
};
*/
