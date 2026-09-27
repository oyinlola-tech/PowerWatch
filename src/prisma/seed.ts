import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const prisma = new PrismaClient({
  adapter: new (await import('@prisma/adapter-mariadb')).PrismaMariaDb({
    host: process.env.DB_HOST ?? 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER ?? 'root',
    password: process.env.DB_PASSWORD ?? '',
    database: process.env.DB_NAME ?? 'powerwatch',
  }),
});

interface StateData {
  name: string;
  capital: string;
  lgas: string[];
  towns: string[];
}

function loadData(): StateData[] {
  const filePath = path.join(__dirname, 'seed-data.json');
  const raw = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(raw) as StateData[];
}

const NEIGHBORHOODS = ['Central', 'East Ward', 'West Ward', 'South Ward'];

async function seedLocations(data: StateData[]) {
  const existingCountries = await prisma.country.count();
  if (existingCountries > 0) {
    console.log('Location data already exists. Skipping location seed.');
    return;
  }

  console.log('Seeding location data...');

  await prisma.country.create({ data: { id: 1, name: 'Nigeria' } });

  const stateRecords = data.map((s, i) => ({
    id: i + 1,
    name: s.name,
    countryId: 1,
  }));
  await prisma.state.createMany({ data: stateRecords });

  let lgaId = 0;
  const lgaRecords: { id: number; name: string; stateId: number }[] = [];
  for (let si = 0; si < data.length; si++) {
    for (const lgaName of data[si]!.lgas) {
      lgaId++;
      lgaRecords.push({ id: lgaId, name: lgaName, stateId: si + 1 });
    }
  }
  await prisma.lGA.createMany({ data: lgaRecords });
  console.log(`Created ${stateRecords.length} states, ${lgaRecords.length} LGAs.`);

  let cityId = 0;
  const cityRecords: { id: number; name: string; lgaId: number }[] = [];
  for (const lga of lgaRecords) {
    cityId++;
    cityRecords.push({ id: cityId, name: lga.name, lgaId: lga.id });
  }
  await prisma.city.createMany({ data: cityRecords });
  console.log(`Created ${cityRecords.length} cities.`);

  let townId = 0;
  const townRecords: { id: number; name: string; cityId: number }[] = [];

  for (let si = 0; si < data.length; si++) {
    const stateData = data[si]!;
    const stateLgas = stateData.lgas;
    const stateTowns = stateData.towns;

    const firstCityIdForState = lgaRecords.findIndex((l) => l.stateId === si + 1) + 1;

    if (stateTowns.length > 0) {
      for (let ti = 0; ti < stateTowns.length; ti++) {
        townId++;
        const cityIndex = ti % stateLgas.length;
        const cityIdNum = firstCityIdForState + cityIndex;
        townRecords.push({ id: townId, name: stateTowns[ti]!, cityId: cityIdNum });
      }
    } else {
      for (let ci = 0; ci < stateLgas.length; ci++) {
        townId++;
        const cityIdNum = firstCityIdForState + ci;
        townRecords.push({ id: townId, name: stateLgas[ci]!, cityId: cityIdNum });
      }
    }
  }

  await prisma.town.createMany({ data: townRecords });
  console.log(`Created ${townRecords.length} towns.`);

  let neighborhoodId = 0;
  const neighborhoodRecords: { id: number; name: string; townId: number }[] = [];
  for (let ti = 0; ti < townId; ti++) {
    for (const hood of NEIGHBORHOODS) {
      neighborhoodId++;
      neighborhoodRecords.push({ id: neighborhoodId, name: hood, townId: ti + 1 });
    }
  }
  await prisma.neighborhood.createMany({ data: neighborhoodRecords });
  console.log(`Created ${neighborhoodRecords.length} neighborhoods.`);
}

async function seedAdmin() {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    console.log('No admin credentials in .env. Skipping admin seed.');
    return;
  }

  const normalizedEmail = adminEmail.toLowerCase().trim();
  const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });

  if (existing) {
    console.log('Admin user already exists. Skipping.');
    return;
  }

  const passwordHash = await bcrypt.hash(
    adminPassword,
    Number(process.env.BCRYPT_SALT_ROUNDS) || 12,
  );

  await prisma.user.create({
    data: {
      id: crypto.randomUUID(),
      firstName: process.env.ADMIN_FIRST_NAME ?? 'Super',
      lastName: process.env.ADMIN_LAST_NAME ?? 'Admin',
      email: normalizedEmail,
      passwordHash,
      role: 'ADMIN',
      emailVerified: true,
      notificationEnabled: false,
    },
  });

  console.log(`Admin user "${normalizedEmail}" seeded successfully.`);
}

async function main() {
  const data = loadData();
  await seedLocations(data);
  await seedAdmin();
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
