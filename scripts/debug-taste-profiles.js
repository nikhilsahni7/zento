#!/usr/bin/env node

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function debugTasteProfiles() {
  try {
    console.log("🔍 Examining Taste Profile Database...\n");

    // Get all users with taste profiles
    const users = await prisma.user.findMany({
      include: {
        tasteProfile: true,
      },
      where: {
        tasteProfile: {
          isNot: null,
        },
      },
    });

    console.log(`Found ${users.length} users with taste profiles:\n`);

    for (const user of users) {
      console.log(`👤 User: ${user.name || "Anonymous"} (${user.email})`);
      console.log(`   Created: ${user.createdAt.toLocaleDateString()}`);

      if (user.tasteProfile) {
        console.log(
          `   🏠 Home City: ${user.tasteProfile.homeCity || "Not specified"}`
        );
        console.log(
          `   📊 Affinity Tags (${user.tasteProfile.affinityTags.length}):`
        );

        user.tasteProfile.affinityTags.forEach((tag, index) => {
          // Parse Qloo URN to show readable format
          const readable = tag
            .replace(/^urn:tag:[^:]+:/, "")
            .replace(/_/g, " ");
          console.log(`      ${index + 1}. ${tag}`);
          console.log(`         → "${readable}"`);
        });

        console.log(
          `   📅 Profile Created: ${user.tasteProfile.createdAt.toLocaleDateString()}`
        );
        console.log(
          `   🔄 Last Updated: ${user.tasteProfile.updatedAt.toLocaleDateString()}`
        );
      }

      console.log("─".repeat(60));
    }

    // Summary statistics
    const totalProfiles = users.length;
    const totalTags = users.reduce(
      (sum, user) => sum + (user.tasteProfile?.affinityTags.length || 0),
      0
    );
    const avgTagsPerUser =
      totalProfiles > 0 ? (totalTags / totalProfiles).toFixed(1) : 0;

    console.log("\n📈 Summary Statistics:");
    console.log(`   Total Users with Profiles: ${totalProfiles}`);
    console.log(`   Total Affinity Tags: ${totalTags}`);
    console.log(`   Average Tags per User: ${avgTagsPerUser}`);

    // Analyze tag patterns
    const allTags = users.flatMap(
      (user) => user.tasteProfile?.affinityTags || []
    );
    const tagCategories = {};

    allTags.forEach((tag) => {
      const match = tag.match(/^urn:tag:([^:]+):/);
      if (match) {
        const category = match[1];
        tagCategories[category] = (tagCategories[category] || 0) + 1;
      }
    });

    console.log("\n🏷️  Tag Categories:");
    Object.entries(tagCategories)
      .sort(([, a], [, b]) => b - a)
      .forEach(([category, count]) => {
        console.log(`   ${category}: ${count} tags`);
      });
  } catch (error) {
    console.error("❌ Error examining taste profiles:", error);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  debugTasteProfiles();
}

module.exports = { debugTasteProfiles };
