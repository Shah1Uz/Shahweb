const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();
const serverEnvPath = path.resolve(__dirname, '.env');
if (fs.existsSync(serverEnvPath)) {
  dotenv.config({ path: serverEnvPath });
}
const rootEnvPath = path.resolve(__dirname, '../.env');
if (fs.existsSync(rootEnvPath)) {
  dotenv.config({ path: rootEnvPath });
}

const schemaPath = path.join(__dirname, 'prisma/schema.prisma');
const dbUrl = process.env.DATABASE_URL || '';

if (fs.existsSync(schemaPath)) {
  let schema = fs.readFileSync(schemaPath, 'utf8');
  if (dbUrl.startsWith('postgres://') || dbUrl.startsWith('postgresql://')) {
    schema = schema.replace(/provider\s*=\s*"sqlite"/, 'provider = "postgresql"');
    console.log('⚡ Prisma configured for PostgreSQL datasource');
  } else {
    schema = schema.replace(/provider\s*=\s*"postgresql"/, 'provider = "sqlite"');
    console.log('⚡ Prisma configured for SQLite datasource');
  }
  fs.writeFileSync(schemaPath, schema);
}
