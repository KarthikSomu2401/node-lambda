import express from "express";
import Crud from "em-crud";
import { LambdaClient, InvokeCommand } from "@aws-sdk/client-lambda";

import Note from "../model/note.js";

const router = express.Router();

// Initialize AWS Lambda client
const lambdaClient = new LambdaClient({ region: process.env.AWS_REGION || "us-east-1" });

// CRUD operations for notes
router.use("/note", Crud({ className: Note }));

/**
 * POST /note/auto-tag
 * Generate tags for a note using Lambda function
 * Body: { title: string, description: string }
 */
router.post("/note/auto-tag", async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title && !description) {
      return res.status(400).json({
        error: "Title or description is required"
      });
    }

    // Invoke the auto-tagging Lambda function
    const command = new InvokeCommand({
      FunctionName: process.env.AUTO_TAG_LAMBDA_FUNCTION || "auto-tag-notes",
      InvocationType: "RequestResponse",
      Payload: JSON.stringify({ title, description })
    });

    const response = await lambdaClient.send(command);

    // Parse Lambda response
    const payload = JSON.parse(
      new TextDecoder().decode(response.Payload)
    );

    // Parse the body returned by Lambda (which is a JSON string)
    const body = typeof payload.body === "string" ? JSON.parse(payload.body) : (payload.body || {});

    if (payload.statusCode !== 200 || !body.success) {
      return res.status(payload.statusCode || 500).json({
        error: body.error || "Failed to generate tags",
        message: body.message
      });
    }

    return res.status(200).json({
      success: true,
      tags: body.tags || []
    });
  } catch (error) {
    console.error("Error invoking auto-tag Lambda:", error);
    res.status(500).json({
      error: "Failed to generate tags",
      message: error.message
    });
  }
});

/**
 * POST /note/with-tags
 * Create a note and automatically generate tags via Lambda
 */
router.post("/note/with-tags", async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title && !description) {
      return res.status(400).json({
        error: "Title or description is required"
      });
    }

    // First, generate tags using Lambda
    const tagCommand = new InvokeCommand({
      FunctionName: process.env.AUTO_TAG_LAMBDA_FUNCTION || "auto-tag-notes",
      InvocationType: "RequestResponse",
      Payload: JSON.stringify({ title, description })
    });

    const tagResponse = await lambdaClient.send(tagCommand);
    const tagPayload = JSON.parse(
      new TextDecoder().decode(tagResponse.Payload)
    );

    // Parse the body returned by Lambda (which is a JSON string)
    const tagBody = typeof tagPayload.body === "string" ? JSON.parse(tagPayload.body) : (tagPayload.body || {});
    const tags = tagBody.tags || [];

    // Create note with generated tags
    const note = new Note({
      title,
      description,
      tags
    });

    await note.save();

    res.status(201).json({
      success: true,
      note,
      tags
    });
  } catch (error) {
    console.error("Error creating note with tags:", error);
    res.status(500).json({
      error: "Failed to create note",
      message: error.message
    });
  }
});

export default router;
