import { demoUsers, moduleData, schoolProfile } from "../data/demoData";

console.log("Demo seed preview");
console.log(`School: ${schoolProfile.name}`);
console.log(`Users: ${demoUsers.length}`);
console.log(`Modules: ${Object.keys(moduleData).length}`);
console.log("The development API uses in-memory demo records. Use Prisma migrations for persistent PostgreSQL seeding.");
