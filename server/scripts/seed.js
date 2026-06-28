import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { User } from "../src/models/User.js";
import { ColumnDefinition } from "../src/models/ColumnDefinition.js";
import { TableTemplate } from "../src/models/TableTemplate.js";

dotenv.config();

const ensure = async (value, label) => {
  if (value) return value;
  const rl = readline.createInterface({ input, output });
  const answer = await rl.question(`${label}: `);
  rl.close();
  if (!answer) throw new Error(`${label} is required`);
  return answer;
};

const upsertColumn = async (payload) => {
  return ColumnDefinition.findOneAndUpdate({ key: payload.key }, payload, {
    upsert: true,
    new: true
  });
};

const main = async () => {
  const mongoUri = await ensure(process.env.MONGODB_URI, "MONGODB_URI");
  const adminName = await ensure(process.env.SEED_SUPER_ADMIN_NAME, "SEED_SUPER_ADMIN_NAME");
  const adminEmail = await ensure(process.env.SEED_SUPER_ADMIN_EMAIL, "SEED_SUPER_ADMIN_EMAIL");
  const adminPassword = await ensure(process.env.SEED_SUPER_ADMIN_PASSWORD, "SEED_SUPER_ADMIN_PASSWORD");

  await mongoose.connect(mongoUri);

  let admin = await User.findOne({ email: adminEmail });
  if (!admin) {
    const passwordHash = await User.hashPassword(adminPassword);
    admin = await User.create({
      name: adminName,
      email: adminEmail,
      passwordHash,
      role: "super_admin",
      factoryIds: []
    });
  }

  const baseColumns = await Promise.all([
    upsertColumn({ key: "target", label: "Target", dataType: "number", isSystem: true }),
    upsertColumn({ key: "actual", label: "Actual", dataType: "number", isSystem: true }),
    upsertColumn({ key: "gap", label: "Gap", dataType: "computed", computeRule: "target-actual", isSystem: true }),
    upsertColumn({ key: "comments", label: "Comments", dataType: "text", isSystem: true }),
    upsertColumn({ key: "quality_defects", label: "Quality Defects", dataType: "number", isSystem: false }),
    upsertColumn({ key: "scrap", label: "Scrap", dataType: "number", isSystem: false }),
    upsertColumn({ key: "problem_code", label: "Problem Code", dataType: "text", isSystem: false }),
    upsertColumn({ key: "countermeasure", label: "Countermeasure", dataType: "text", isSystem: false })
  ]);

  const byKey = Object.fromEntries(baseColumns.map((c) => [c.key, c]));

  const templates = [
    {
      name: "Standard Hour-by-Hour",
      description: "Target, actual, gap, and comments for hourly tracking",
      includesHourByHour: true,
      isPublished: true,
      createdBy: admin._id,
      columns: ["target", "actual", "gap", "comments"].map((key, idx) => ({
        columnDefId: byKey[key]._id,
        key: byKey[key].key,
        label: byKey[key].label,
        dataType: byKey[key].dataType,
        dropdownOptions: byKey[key].dropdownOptions || [],
        computeRule: byKey[key].computeRule || "",
        order: idx,
        width: 140
      }))
    },
    {
      name: "Hour-by-Hour + Quality",
      description: "Adds quality defects and scrap columns",
      includesHourByHour: true,
      isPublished: true,
      createdBy: admin._id,
      columns: ["target", "actual", "gap", "quality_defects", "scrap", "comments"].map((key, idx) => ({
        columnDefId: byKey[key]._id,
        key: byKey[key].key,
        label: byKey[key].label,
        dataType: byKey[key].dataType,
        dropdownOptions: byKey[key].dropdownOptions || [],
        computeRule: byKey[key].computeRule || "",
        order: idx,
        width: 140
      }))
    },
    {
      name: "Delivery + Countermeasures",
      description: "Adds problem code and countermeasure tracking",
      includesHourByHour: true,
      isPublished: true,
      createdBy: admin._id,
      columns: ["target", "actual", "gap", "problem_code", "countermeasure", "comments"].map((key, idx) => ({
        columnDefId: byKey[key]._id,
        key: byKey[key].key,
        label: byKey[key].label,
        dataType: byKey[key].dataType,
        dropdownOptions: byKey[key].dropdownOptions || [],
        computeRule: byKey[key].computeRule || "",
        order: idx,
        width: 140
      }))
    }
  ];

  for (const template of templates) {
    await TableTemplate.findOneAndUpdate({ name: template.name }, template, {
      upsert: true,
      new: true
    });
  }

  console.log("Seed completed");
  await mongoose.disconnect();
};

main().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect();
  process.exit(1);
});
