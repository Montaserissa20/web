// backend/scripts/createAdmin.js
require('dotenv').config();
const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL || 'admin@petmarket.test';
  const password = process.env.ADMIN_PASSWORD || 'admin';

  if (!password) {
    throw new Error('ADMIN_PASSWORD environment variable is required');
  }

  const existing = await prisma.users.findUnique({ where: { email } });
  if (existing) {
    console.log('Admin already exists:', email);
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const admin = await prisma.users.create({
    data: {
      name: 'Main Admin',
      email,
      password: passwordHash,
      role: 'admin',
      country: 'Libya',
      city: 'Tripoli',
    },
  });

  console.log('Admin created successfully:');
  console.log('Email:', admin.email);
  console.log('Password:', password);
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
