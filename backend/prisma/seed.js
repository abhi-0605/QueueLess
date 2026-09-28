import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  await prisma.notification.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.queueEntryHistory.deleteMany();
  await prisma.queueEntry.deleteMany();
  await prisma.queue.deleteMany();
  await prisma.counter.deleteMany();
  await prisma.service.deleteMany();
  await prisma.user.deleteMany();
  await prisma.organization.deleteMany();

  const saltRounds = 10;
  const adminPasswordHash = await bcrypt.hash('admin123', saltRounds);
  const staffPasswordHash = await bcrypt.hash('staff123', saltRounds);
  const userPasswordHash = await bcrypt.hash('user123', saltRounds);

  const organization = await prisma.organization.create({
    data: {
      name: 'City Care Hospital & Wellness Center',
      description: 'Central hospital managing multi-department outpatient queues and counters'
    }
  });

  const adminUser = await prisma.user.create({
    data: {
      organization_id: organization.id,
      name: 'Operations Director',
      email: 'admin@queueless.local',
      password_hash: adminPasswordHash,
      role: 'ROLE_ADMIN'
    }
  });

  const staffUser = await prisma.user.create({
    data: {
      organization_id: organization.id,
      name: 'Counter Officer John',
      email: 'staff@queueless.local',
      password_hash: staffPasswordHash,
      role: 'ROLE_STAFF'
    }
  });

  const regularUser = await prisma.user.create({
    data: {
      name: 'Alex Johnson',
      email: 'user@queueless.local',
      password_hash: userPasswordHash,
      role: 'ROLE_USER'
    }
  });

  const generalOpd = await prisma.service.create({
    data: {
      organization_id: organization.id,
      name: 'General Consultation',
      description: 'Primary physician review and general medical triage',
      avg_service_time_seconds: 300,
      priority_config: {
        rules: [
          { attribute: 'isElderly', boost: 100 },
          { attribute: 'isDisabled', boost: 100 },
          { attribute: 'isEmergency', boost: 200 }
        ]
      },
      is_active: true
    }
  });

  const dermatology = await prisma.service.create({
    data: {
      organization_id: organization.id,
      name: 'Dermatology & Skin Clinic',
      description: 'Specialist skin diagnostics, allergy screening, and treatments',
      avg_service_time_seconds: 480,
      priority_config: {
        rules: [
          { attribute: 'isElderly', boost: 100 },
          { attribute: 'vipTier', boost: 50 }
        ]
      },
      is_active: true
    }
  });

  const counter1 = await prisma.counter.create({
    data: {
      service_id: generalOpd.id,
      name: 'Counter 01',
      status: 'OPEN',
      assigned_staff_id: staffUser.id
    }
  });

  await prisma.counter.create({
    data: {
      service_id: generalOpd.id,
      name: 'Counter 02',
      status: 'CLOSED'
    }
  });

  await prisma.counter.create({
    data: {
      service_id: dermatology.id,
      name: 'Derm Counter A',
      status: 'OPEN'
    }
  });

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const opdQueue = await prisma.queue.create({
    data: {
      service_id: generalOpd.id,
      date: today,
      status: 'OPEN'
    }
  });

  await prisma.queue.create({
    data: {
      service_id: dermatology.id,
      date: today,
      status: 'OPEN'
    }
  });

  const entry1 = await prisma.queueEntry.create({
    data: {
      queue_id: opdQueue.id,
      user_id: regularUser.id,
      counter_id: counter1.id,
      token_number: 'G-101',
      status: 'IN_SERVICE',
      priority_score: 0,
      joined_at: new Date(Date.now() - 20 * 60 * 1000),
      called_at: new Date(Date.now() - 5 * 60 * 1000),
      started_at: new Date(Date.now() - 4 * 60 * 1000)
    }
  });

  await prisma.queueEntry.create({
    data: {
      queue_id: opdQueue.id,
      user_id: regularUser.id,
      token_number: 'G-102',
      status: 'WAITING',
      priority_score: 0,
      joined_at: new Date(Date.now() - 15 * 60 * 1000)
    }
  });

  await prisma.queueEntry.create({
    data: {
      queue_id: opdQueue.id,
      user_id: regularUser.id,
      token_number: 'G-103',
      status: 'WAITING',
      priority_score: 100,
      joined_at: new Date(Date.now() - 10 * 60 * 1000)
    }
  });

  console.log('Seeded successfully with organization, staff, and tokens.');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
