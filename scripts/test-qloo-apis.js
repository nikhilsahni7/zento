#!/usr/bin/env node

const QLOO_BASE_URL = "https://hackathon.api.qloo.com/v2";
const QLOO_API_KEY = process.env.QLOO_API_KEY;

if (!QLOO_API_KEY) {
  console.error("❌ QLOO_API_KEY not found in environment variables");
  console.error(
    "Make sure to set QLOO_API_KEY in your environment or .env file"
  );
  process.exit(1);
}

async function qlooFetch(endpoint, params) {
  const url = new URL(`${QLOO_BASE_URL}/${endpoint}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  console.log(`🌐 Making request to: ${url.toString()}`);

  const res = await fetch(url.toString(), {
    headers: {
      "x-api-key": QLOO_API_KEY,
    },
  });

  if (!res.ok) {
    throw new Error(`Qloo API error: ${res.status} - ${res.statusText}`);
  }

  return await res.json();
}

async function testTagsEndpoint() {
  console.log("\n🏷️  Testing /v2/tags endpoint...\n");

  const testQueries = [
    "Science Fiction",
    "Tame Impala",
    "Tokyo",
    "Italian",
    "Action",
    "Jazz",
    "Paris",
    "Sushi",
  ];

  for (const query of testQueries) {
    try {
      console.log(`🔍 Searching for: "${query}"`);
      const data = await qlooFetch("tags", { "filter.query": query });

      console.log(`   Found ${data.results?.tags?.length || 0} tags:`);

      if (data.results?.tags) {
        data.results.tags.slice(0, 3).forEach((tag, index) => {
          console.log(`      ${index + 1}. ${tag.id}`);
        });
        if (data.results.tags.length > 3) {
          console.log(`      ... and ${data.results.tags.length - 3} more`);
        }
      }

      console.log("─".repeat(40));
    } catch (error) {
      console.error(`   ❌ Error for "${query}":`, error.message);
    }
  }
}

async function testInsightsEndpoint() {
  console.log("\n💡 Testing /v2/insights endpoint...\n");

  // First, get some tags to use as signals
  console.log("🏷️  Getting sample tags...");
  const sciFiTags = await qlooFetch("tags", {
    "filter.query": "Science Fiction",
  });
  const tokyoTags = await qlooFetch("tags", { "filter.query": "Tokyo" });

  const sampleTagIds = [
    ...(sciFiTags.results?.tags?.slice(0, 2).map((t) => t.id) || []),
    ...(tokyoTags.results?.tags?.slice(0, 2).map((t) => t.id) || []),
  ];

  console.log(`Using sample tags: ${sampleTagIds.slice(0, 2).join(", ")}`);

  const testCases = [
    {
      name: "Books Recommendation",
      type: "urn:entity:book",
      tagIds: sampleTagIds.slice(0, 2),
      take: 3,
    },
    {
      name: "Places in Tokyo",
      type: "urn:entity:place",
      tagIds: sampleTagIds.slice(0, 2),
      locationQuery: "Tokyo",
      take: 3,
    },
    {
      name: "Movies Recommendation",
      type: "urn:entity:movie",
      tagIds: sampleTagIds.slice(0, 2),
      take: 3,
    },
  ];

  for (const testCase of testCases) {
    try {
      console.log(`\n🎯 Testing: ${testCase.name}`);

      const params = {
        "filter.type": testCase.type,
        "signal.interests.tags": testCase.tagIds.join(","),
        take: testCase.take.toString(),
      };

      if (testCase.locationQuery) {
        params["signal.location.query"] = testCase.locationQuery;
      }

      const data = await qlooFetch("insights", params);

      console.log(`   Results: ${data.results?.insights?.length || 0} items`);

      if (data.results?.insights) {
        data.results.insights.forEach((insight, index) => {
          console.log(
            `      ${index + 1}. ${insight.name || insight.title || "Unnamed"}`
          );
          if (insight.description) {
            console.log(
              `         "${insight.description.substring(0, 100)}..."`
            );
          }
          if (insight.location) {
            console.log(`         📍 ${insight.location}`);
          }
          if (insight.score !== undefined) {
            console.log(`         🎯 Score: ${insight.score}`);
          }
        });
      }

      // Show raw structure of first result
      if (data.results?.insights?.[0]) {
        console.log(`\n   📋 Sample Response Structure:`);
        const sample = data.results.insights[0];
        console.log(`      Keys: ${Object.keys(sample).join(", ")}`);
      }

      console.log("─".repeat(50));
    } catch (error) {
      console.error(`   ❌ Error for ${testCase.name}:`, error.message);
    }
  }
}

async function analyzeResponseStructure() {
  console.log("\n🔬 Analyzing Qloo Response Structures...\n");

  try {
    // Get a comprehensive example
    const tagsResponse = await qlooFetch("tags", { "filter.query": "action" });
    console.log("📋 Tags Response Structure:");
    console.log(JSON.stringify(tagsResponse, null, 2));

    if (tagsResponse.results?.tags?.[0]) {
      const tagId = tagsResponse.results.tags[0].id;

      const insightsResponse = await qlooFetch("insights", {
        "filter.type": "urn:entity:place",
        "signal.interests.tags": tagId,
        take: "1",
      });

      console.log("\n📋 Insights Response Structure:");
      console.log(JSON.stringify(insightsResponse, null, 2));
    }
  } catch (error) {
    console.error("❌ Error analyzing response structure:", error.message);
  }
}

async function main() {
  console.log("🚀 Testing Qloo APIs and Understanding Data Structures\n");
  console.log(`🔑 Using API Key: ${QLOO_API_KEY.substring(0, 8)}...`);

  try {
    await testTagsEndpoint();
    await testInsightsEndpoint();
    await analyzeResponseStructure();

    console.log("\n✅ All tests completed!");
  } catch (error) {
    console.error("\n❌ Test suite failed:", error);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  testTagsEndpoint,
  testInsightsEndpoint,
  analyzeResponseStructure,
};
