// AWS Lambda Function: Auto-tagging Notes
// This function analyzes note content and generates relevant tags
// Can be invoked asynchronously from the main API

export const handler = async (event) => {
  try {
    // Parse the incoming event
    const { title = "", description = "" } = event;

    if (!title && !description) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "No title or description provided" })
      };
    }

    // Combine title and description for analysis
    const content = `${title} ${description}`.toLowerCase();

    // Generate tags based on keywords
    const tags = generateTags(content);

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        tags,
        message: `Generated ${tags.length} tags for the note`
      })
    };
  } catch (error) {
    console.error("Error in auto-tagging Lambda:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: error.message
      })
    };
  }
};

/**
 * Generate tags based on content analysis
 * This is a simple keyword-based approach
 * For production, consider using AWS Comprehend or similar services
 */
function generateTags(content) {
  const tags = new Set();

  // Define keyword groups
  const tagKeywords = {
    urgent: ["urgent", "asap", "critical", "important", "emergency"],
    meeting: ["meeting", "discussion", "call", "standup", "sync", "conference"],
    todo: ["todo", "task", "action", "do", "need to", "must", "should"],
    project: ["project", "initiative", "campaign", "release", "sprint"],
    bug: ["bug", "issue", "error", "fix", "broken", "problem"],
    feature: ["feature", "implement", "add", "new", "enhancement"],
    documentation: ["doc", "document", "readme", "guide", "tutorial"],
    research: ["research", "investigate", "explore", "study", "analyze"],
    personal: ["personal", "private", "reminder", "note to self"],
    work: ["work", "job", "professional", "business", "office"]
  };

  // Check content against keywords
  for (const [tag, keywords] of Object.entries(tagKeywords)) {
    if (keywords.some(keyword => content.includes(keyword))) {
      tags.add(tag);
    }
  }

  // Generate tags based on word count (complexity indicator)
  const words = content.split(/\s+/);
  if (words.length > 100) {
    tags.add("detailed");
  } else if (words.length > 50) {
    tags.add("moderate");
  } else {
    tags.add("brief");
  }

  return Array.from(tags).sort();
}
