#!/usr/bin/env node

const QLOO_BASE_URL = "https://hackathon.api.qloo.com/v2";
const QLOO_API_KEY = process.env.QLOO_API_KEY;

if (!QLOO_API_KEY) {
  console.error("❌ QLOO_API_KEY not found in environment variables");
  process.exit(1);
}

async function qlooFetch(endpoint, params) {
  const url = new URL(`${QLOO_BASE_URL}/${endpoint}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  console.log(`🌐 ${url.toString()}`);

  const res = await fetch(url.toString(), {
    headers: { "x-api-key": QLOO_API_KEY },
  });

  if (!res.ok) {
    throw new Error(`Qloo API error: ${res.status} - ${res.statusText}`);
  }
  return await res.json();
}

async function testWorkingQueries() {
  console.log("🧪 Testing specific queries that should work...\n");

  // Test 1: Simple genre + place
  try {
    console.log("📍 Test 1: Simple genre + place");
    const actionTags = await qlooFetch("tags", { "filter.query": "action" });
    const topActionTag = actionTags.results?.tags?.[0]?.id;

    if (topActionTag) {
      const places = await qlooFetch("insights", {
        "filter.type": "urn:entity:place",
        "signal.interests.tags": topActionTag,
        take: "3",
      });
      console.log(
        `   ✅ Found ${places.results?.entities?.length || 0} places for action`
      );

      if (places.results?.entities?.[0]) {
        const place = places.results.entities[0];
        console.log(
          `   📍 "${place.name}" in ${
            place.properties?.geocode?.city || "Unknown"
          }`
        );
      }
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }

  console.log("");

  // Test 2: Restaurant + cuisine
  try {
    console.log("🍝 Test 2: Italian restaurants");
    const italianTags = await qlooFetch("tags", {
      "filter.query": "italian restaurant",
    });
    const italianTag = italianTags.results?.tags?.[0]?.id;

    if (italianTag) {
      const restaurants = await qlooFetch("insights", {
        "filter.type": "urn:entity:place",
        "signal.interests.tags": italianTag,
        "signal.location.query": "New York",
        take: "3",
      });
      console.log(
        `   ✅ Found ${
          restaurants.results?.entities?.length || 0
        } Italian restaurants`
      );

      restaurants.results?.entities?.forEach((place, i) => {
        console.log(
          `   ${i + 1}. "${place.name}" - ${place.properties?.geocode?.city}`
        );
      });
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }

  console.log("");

  // Test 3: Books
  try {
    console.log("📚 Test 3: Science fiction books");
    const scifiTags = await qlooFetch("tags", {
      "filter.query": "science fiction",
    });
    const scifiTag = scifiTags.results?.tags?.find(
      (t) => t.type === "urn:tag:genre:media"
    )?.id;

    if (scifiTag) {
      const books = await qlooFetch("insights", {
        "filter.type": "urn:entity:book",
        "signal.interests.tags": scifiTag,
        take: "5",
      });
      console.log(
        `   ✅ Found ${books.results?.entities?.length || 0} sci-fi books`
      );

      books.results?.entities?.forEach((book, i) => {
        console.log(`   ${i + 1}. "${book.name}"`);
      });
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }

  console.log("");

  // Test 4: Movies
  try {
    console.log("🎬 Test 4: Action movies");
    const actionTags = await qlooFetch("tags", { "filter.query": "action" });
    const movieActionTag = actionTags.results?.tags?.find(
      (t) =>
        t.type === "urn:tag:genre:media" &&
        t.parents?.some((p) => p.type === "urn:entity:movie")
    )?.id;

    if (movieActionTag) {
      const movies = await qlooFetch("insights", {
        "filter.type": "urn:entity:movie",
        "signal.interests.tags": movieActionTag,
        take: "5",
      });
      console.log(
        `   ✅ Found ${movies.results?.entities?.length || 0} action movies`
      );

      movies.results?.entities?.forEach((movie, i) => {
        console.log(`   ${i + 1}. "${movie.name}"`);
      });
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }
}

async function main() {
  console.log("🔬 Testing Qloo Insights with specific queries\n");
  console.log(`🔑 Using API Key: ${QLOO_API_KEY.substring(0, 8)}...\n`);

  await testWorkingQueries();

  console.log("\n💡 Recommendations:");
  console.log("   • Use specific, single tags rather than multiple tags");
  console.log("   • Filter tags by type and parent entities");
  console.log("   • Include location for place queries");
  console.log("   • Limit the number of tags per user to 20-30 max");
}

if (require.main === module) {
  main();
}
