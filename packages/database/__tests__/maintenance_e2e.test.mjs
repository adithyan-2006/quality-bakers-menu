/* eslint-disable */
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log(
    '--- Step 1: Query initial maintenance setting from PostgreSQL SystemSetting table ---',
  );
  const initial = await prisma.systemSetting.findUnique({
    where: { key: 'maintenance' },
  });
  console.log('Initial DB record:', initial);

  console.log('\n--- Step 2: Simulate Admin activating maintenance mode in PostgreSQL ---');
  const activatedPayload = {
    enabled: true,
    activatedAt: new Date().toISOString(),
    deactivatedAt: null,
    activatedBy: 'owner@qualitybakers.com',
    message: 'We are currently upgrading our baking systems. Back shortly!',
    retryAfter: 300,
  };

  const savedActive = await prisma.systemSetting.upsert({
    where: { key: 'maintenance' },
    update: {
      value: JSON.stringify(activatedPayload),
      updatedAt: new Date(),
      updatedBy: activatedPayload.activatedBy,
    },
    create: {
      key: 'maintenance',
      value: JSON.stringify(activatedPayload),
      updatedAt: new Date(),
      updatedBy: activatedPayload.activatedBy,
    },
  });
  console.log('Active DB record:', savedActive);
  const parsedActive = JSON.parse(savedActive.value);
  if (!parsedActive.enabled) throw new Error('Failed to set maintenance to active');
  console.log('✓ Successfully activated maintenance mode in database.');

  console.log('\n--- Step 3: Simulate Customer App reading state ---');
  const customerRead = await prisma.systemSetting.findUnique({
    where: { key: 'maintenance' },
  });
  const customerParsed = JSON.parse(customerRead.value);
  console.log('Customer app read:', customerParsed);
  if (!customerParsed.enabled) throw new Error('Customer app did not see active maintenance');
  console.log('✓ Customer app successfully sees active maintenance mode.');

  console.log('\n--- Step 4: Deactivate maintenance mode (normal operations) ---');
  const deactivatedPayload = {
    enabled: false,
    activatedAt: null,
    deactivatedAt: new Date().toISOString(),
    activatedBy: null,
    message: 'The system is undergoing scheduled maintenance.',
    retryAfter: 300,
  };

  const savedDeactive = await prisma.systemSetting.upsert({
    where: { key: 'maintenance' },
    update: {
      value: JSON.stringify(deactivatedPayload),
      updatedAt: new Date(),
      updatedBy: null,
    },
    create: {
      key: 'maintenance',
      value: JSON.stringify(deactivatedPayload),
      updatedAt: new Date(),
      updatedBy: null,
    },
  });
  console.log('Deactivated DB record:', savedDeactive);
  const parsedDeactive = JSON.parse(savedDeactive.value);
  if (parsedDeactive.enabled) throw new Error('Failed to deactivate maintenance');
  console.log('✓ Successfully deactivated maintenance mode in database.');

  console.log('\nAll E2E database synchronization checks PASSED successfully!');
}

main()
  .catch((err) => {
    console.error('Test FAILED:', err);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
