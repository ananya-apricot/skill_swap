require("dotenv").config();
const mongoose = require("mongoose");
const Skill = require("../models/Skill");
const slugify = require("./slugify");

const skills = [
  { name: "React", category: "Programming", aliases: ["reactjs", "react.js"] },
  { name: "JavaScript", category: "Programming", aliases: ["js", "ecmascript"] },
  { name: "Python", category: "Programming", aliases: ["py"] },
  { name: "Node.js", category: "Programming", aliases: ["node", "nodejs"] },
  { name: "UI/UX Design", category: "Design", aliases: ["ux", "ui design", "figma"] },
  { name: "Graphic Design", category: "Design", aliases: ["photoshop", "illustrator"] },
  { name: "Guitar", category: "Music", aliases: ["acoustic guitar", "electric guitar"] },
  { name: "Piano", category: "Music", aliases: ["keyboard"] },
  { name: "Singing", category: "Music", aliases: ["vocals"] },
  { name: "Spanish", category: "Language", aliases: ["espanol"] },
  { name: "English Speaking", category: "Language", aliases: ["spoken english"] },
  { name: "Hindi", category: "Language", aliases: [] },
  { name: "Kannada", category: "Language", aliases: [] },
  { name: "Cooking", category: "Lifestyle", aliases: ["baking", "recipes"] },
  { name: "Yoga", category: "Fitness", aliases: ["meditation"] },
  { name: "Photography", category: "Creative", aliases: ["photo editing"] },
  { name: "Video Editing", category: "Creative", aliases: ["premiere pro", "after effects"] },
  { name: "Public Speaking", category: "Career", aliases: ["presentation skills"] },
  { name: "Excel", category: "Career", aliases: ["spreadsheets"] },
  { name: "Digital Marketing", category: "Business", aliases: ["seo", "social media"] },
];

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);

  for (const s of skills) {
    // upsert = update if it exists, create if it doesn't (safe to run many times)
    await Skill.updateOne(
      { slug: slugify(s.name) },
      { $set: { ...s, slug: slugify(s.name) } },
      { upsert: true }
    );
  }

  console.log(`Seeded ${skills.length} skills`);
  await mongoose.disconnect();
};

run().catch((e) => {
  console.error(e);
  process.exit(1);
});