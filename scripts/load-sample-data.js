// MongoDB Sample Data - Notes Collection
// This file can be used to load sample data into your MongoDB database
// Run: node scripts/load-sample-data.js

import mongoose from "mongoose";
import Note from "../app/model/note.js";
import dotenv from "dotenv";

dotenv.config();

const SAMPLE_NOTES = [
  {
    title: "Project Kickoff Meeting",
    description:
      "Discuss project roadmap, timeline, and deliverables with the team. Assign responsibilities.",
    tags: ["meeting", "project", "work"]
  },
  {
    title: "Bug Fix: Payment Processing",
    description:
      "Critical issue with payment processing failing for international cards. Need immediate fix to prevent revenue loss.",
    tags: ["urgent", "bug", "work"]
  },
  {
    title: "Code Review Notes",
    description:
      "Review PR #456: Improve database query optimization. Check for n+1 queries and add caching.",
    tags: ["work", "documentation"]
  },
  {
    title: "Team Building Event",
    description:
      "Plan quarterly team building event. Options: bowling, hiking, or escape room. Collect preferences from team.",
    tags: ["personal", "work"]
  },
  {
    title: "API Documentation",
    description:
      "Create comprehensive API documentation for REST endpoints. Include request/response examples and error codes.",
    tags: ["documentation", "work"]
  },
  {
    title: "Database Migration",
    description:
      "Migrate user data from PostgreSQL to MongoDB. Requires data transformation and validation.",
    tags: ["work", "project"]
  },
  {
    title: "Performance Optimization",
    description:
      "Analyze application performance metrics and identify bottlenecks. Implement caching strategies.",
    tags: ["work", "research"]
  },
  {
    title: "Learning: AWS Lambda",
    description:
      "Study AWS Lambda best practices for Node.js applications. Research cold start optimization techniques.",
    tags: ["research", "learning"]
  },
  {
    title: "Client Feedback Review",
    description:
      "Review customer feedback from last quarter. Identify top feature requests and bug reports.",
    tags: ["work", "research"]
  },
  {
    title: "Personal TODO",
    description:
      "Remember to schedule dentist appointment and renew car insurance next week.",
    tags: ["personal"]
  }
];

async function loadSampleData() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI;
    console.log("Connecting to MongoDB...");
    await mongoose.connect(mongoUri);
    console.log("✓ Connected to MongoDB");

    // Clear existing notes
    console.log("Clearing existing notes...");
    await Note.deleteMany({});
    console.log("✓ Cleared existing notes");

    // Insert sample data
    console.log(`Loading ${SAMPLE_NOTES.length} sample notes...`);
    const result = await Note.insertMany(SAMPLE_NOTES);
    console.log(`✓ Successfully loaded ${result.length} sample notes`);

    // Display summary
    console.log("\n--- Sample Data Summary ---");
    const allNotes = await Note.find();
    console.log(`Total notes: ${allNotes.length}`);

    const tags = new Set();
    allNotes.forEach(note => {
      note.tags.forEach(tag => tags.add(tag));
    });
    console.log(`Total unique tags: ${tags.size}`);
    console.log(`Tags: ${Array.from(tags).sort().join(", ")}`);

    console.log("\n✓ Sample data loaded successfully!");
  } catch (error) {
    console.error("Error loading sample data:", error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
  }
}

loadSampleData();
