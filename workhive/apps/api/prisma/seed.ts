import { PrismaClient, Role, JobStatus, ProposalStatus, PaymentStatus, PaymentType } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

const TEST_PASSWORD = 'Test@1234';

async function main() {
  console.log('🌱 Seeding database...');

  const passwordHash = await bcrypt.hash(TEST_PASSWORD, 12);

  // === Create Users ===
  const creator1 = await prisma.user.upsert({
    where: { email: 'creator1@test.com' },
    update: {},
    create: {
      email: 'creator1@test.com',
      password_hash: passwordHash,
      role: Role.client,
      name: 'Priya Sharma',
      headline: 'Startup Founder building AI-powered education tools',
      skills: [],
      wallet_balance_paise: BigInt(50000000), // ₹5,00,000
    },
  });

  const creator2 = await prisma.user.upsert({
    where: { email: 'creator2@test.com' },
    update: {},
    create: {
      email: 'creator2@test.com',
      password_hash: passwordHash,
      role: Role.client,
      name: 'Arjun Mehta',
      headline: 'Product Manager at a fintech company',
      skills: [],
      wallet_balance_paise: BigInt(25000000), // ₹2,50,000
    },
  });

  const worker1 = await prisma.user.upsert({
    where: { email: 'worker1@test.com' },
    update: {},
    create: {
      email: 'worker1@test.com',
      password_hash: passwordHash,
      role: Role.freelancer,
      name: 'Rahul Verma',
      headline: 'Full-stack Developer • React + Node.js',
      skills: ['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'Docker'],
      wallet_balance_paise: BigInt(1500000), // ₹15,000
      rating_avg: 4.5,
    },
  });

  const worker2 = await prisma.user.upsert({
    where: { email: 'worker2@test.com' },
    update: {},
    create: {
      email: 'worker2@test.com',
      password_hash: passwordHash,
      role: Role.freelancer,
      name: 'Anita Desai',
      headline: 'UI/UX Designer • Figma & Framer specialist',
      skills: ['Figma', 'Adobe XD', 'UI/UX Design', 'Framer', 'CSS'],
      wallet_balance_paise: BigInt(800000), // ₹8,000
      rating_avg: 4.8,
    },
  });

  const worker3 = await prisma.user.upsert({
    where: { email: 'worker3@test.com' },
    update: {},
    create: {
      email: 'worker3@test.com',
      password_hash: passwordHash,
      role: Role.freelancer,
      name: 'Karthik Iyer',
      headline: 'Mobile Developer • Flutter & React Native',
      skills: ['Flutter', 'React Native', 'Kotlin', 'Swift', 'Firebase'],
      wallet_balance_paise: BigInt(0),
      rating_avg: 4.2,
    },
  });

  console.log('✅ Users created');

  // === Create Jobs in various statuses ===

  // Job 1: posted (open for proposals)
  const job1 = await prisma.job.create({
    data: {
      client_id: creator1.id,
      title: 'Build a React dashboard for inventory management',
      description:
        'We need a responsive dashboard with charts, data tables, and real-time updates. Must integrate with our REST API. Tech: React, TypeScript, TanStack Query, Recharts.',
      budget_paise: BigInt(8000000), // ₹80,000
      skills_required: ['React', 'TypeScript', 'REST API'],
      deadline: new Date('2026-09-01'),
      status: JobStatus.posted,
    },
  });

  // Job 2: posted (another open job)
  const job2 = await prisma.job.create({
    data: {
      client_id: creator1.id,
      title: 'Design a mobile-first landing page for EdTech startup',
      description:
        'Pixel-perfect conversion-optimized landing page. Must include hero, features, testimonials, pricing, and CTA sections. Deliver as Figma + coded HTML/CSS.',
      budget_paise: BigInt(3500000), // ₹35,000
      skills_required: ['Figma', 'UI/UX Design', 'CSS'],
      deadline: new Date('2026-08-15'),
      status: JobStatus.posted,
    },
  });

  // Job 3: assigned (worker hired, waiting on escrow)
  const job3 = await prisma.job.create({
    data: {
      client_id: creator1.id,
      title: 'Develop a Flutter mobile app for food delivery',
      description:
        'Cross-platform mobile app for a food delivery service. Features: restaurant browse, cart, order tracking, payment integration. Deliver APK + iOS build.',
      budget_paise: BigInt(12000000), // ₹1,20,000
      skills_required: ['Flutter', 'Firebase', 'REST API'],
      deadline: new Date('2026-10-01'),
      status: JobStatus.assigned,
      freelancer_id: worker3.id,
      agreed_amount_paise: BigInt(11000000), // ₹1,10,000
      hired_at: new Date('2026-07-15'),
    },
  });

  // Job 4: escrowed (money in escrow, worker is working)
  const job4 = await prisma.job.create({
    data: {
      client_id: creator2.id,
      title: 'Backend API for a SaaS billing platform',
      description:
        'Node.js + Express API with Stripe integration, subscription management, usage metering, and invoice generation. PostgreSQL database.',
      budget_paise: BigInt(15000000), // ₹1,50,000
      skills_required: ['Node.js', 'TypeScript', 'PostgreSQL'],
      deadline: new Date('2026-09-15'),
      status: JobStatus.escrowed,
      freelancer_id: worker1.id,
      agreed_amount_paise: BigInt(14000000), // ₹1,40,000
      hired_at: new Date('2026-07-10'),
      escrowed_at: new Date('2026-07-12'),
    },
  });

  // Job 5: paid (completed end-to-end)
  const job5 = await prisma.job.create({
    data: {
      client_id: creator2.id,
      title: 'Design system and component library in Figma',
      description:
        'Complete design system with tokens, components, and page templates for a B2B SaaS product. Must include light and dark themes.',
      budget_paise: BigInt(5000000), // ₹50,000
      skills_required: ['Figma', 'UI/UX Design'],
      deadline: new Date('2026-07-01'),
      status: JobStatus.paid,
      freelancer_id: worker2.id,
      agreed_amount_paise: BigInt(4500000), // ₹45,000
      hired_at: new Date('2026-06-01'),
      escrowed_at: new Date('2026-06-03'),
      submitted_at: new Date('2026-06-25'),
      paid_at: new Date('2026-06-28'),
      delivery_note: 'Figma file link: https://figma.com/file/example — includes 48 components, 6 page templates, full token documentation.',
    },
  });

  console.log('✅ Jobs created');

  // === Create Proposals ===

  // Proposals on Job 1 (posted) — multiple workers bidding
  await prisma.proposal.createMany({
    data: [
      {
        job_id: job1.id,
        freelancer_id: worker1.id,
        amount_paise: BigInt(7500000), // ₹75,000
        message:
          'I have 5+ years of React experience and recently built a similar inventory dashboard for a logistics company. I can deliver in 3 weeks with full test coverage.',
        status: ProposalStatus.pending,
      },
      {
        job_id: job1.id,
        freelancer_id: worker3.id,
        amount_paise: BigInt(8000000), // ₹80,000
        message:
          'I can build this with React + TypeScript. I specialize in responsive data-heavy UIs and have experience with Recharts. Would love to discuss the requirements in detail.',
        status: ProposalStatus.pending,
      },
    ],
  });

  // Proposals on Job 2 (posted)
  await prisma.proposal.create({
    data: {
      job_id: job2.id,
      freelancer_id: worker2.id,
      amount_paise: BigInt(3000000), // ₹30,000
      message:
        'This is exactly what I specialize in! I have designed 20+ landing pages with conversion rates above 5%. Happy to share my portfolio.',
      status: ProposalStatus.pending,
    },
  });

  // Proposals on Job 3 (assigned — one accepted, one rejected)
  await prisma.proposal.createMany({
    data: [
      {
        job_id: job3.id,
        freelancer_id: worker3.id,
        amount_paise: BigInt(11000000),
        message: 'Flutter is my primary framework. I can build this with excellent UX.',
        status: ProposalStatus.accepted,
      },
      {
        job_id: job3.id,
        freelancer_id: worker1.id,
        amount_paise: BigInt(12000000),
        message: 'I can handle this with React Native. Similar project experience available.',
        status: ProposalStatus.rejected,
      },
    ],
  });

  console.log('✅ Proposals created');

  // === Create Payment for escrowed job ===
  await prisma.payment.create({
    data: {
      job_id: job4.id,
      owner_id: creator2.id,
      type: PaymentType.escrow,
      amount_paise: BigInt(14000000),
      platform_fee_paise: BigInt(1400000), // 10% fee
      idempotency_key: randomUUID(),
      gateway_ref: 'pay_demo_escrow_001',
      status: PaymentStatus.succeeded,
    },
  });

  // === Payments for paid job ===
  await prisma.payment.create({
    data: {
      job_id: job5.id,
      owner_id: creator2.id,
      type: PaymentType.escrow,
      amount_paise: BigInt(4500000),
      platform_fee_paise: BigInt(450000),
      idempotency_key: randomUUID(),
      gateway_ref: 'pay_demo_escrow_002',
      status: PaymentStatus.succeeded,
    },
  });

  await prisma.payment.create({
    data: {
      job_id: job5.id,
      owner_id: creator2.id,
      type: PaymentType.release,
      amount_paise: BigInt(4050000), // After 10% platform fee
      platform_fee_paise: BigInt(450000),
      idempotency_key: randomUUID(),
      gateway_ref: 'pout_demo_release_001',
      status: PaymentStatus.succeeded,
    },
  });

  console.log('✅ Payments created');

  // === Create Reviews for paid job ===
  await prisma.review.create({
    data: {
      job_id: job5.id,
      reviewer_id: creator2.id,
      reviewee_id: worker2.id,
      rating: 5,
      comment: 'Anita delivered exceptional work. The design system is thorough, well-organized, and exceeded expectations. Highly recommended!',
    },
  });

  await prisma.review.create({
    data: {
      job_id: job5.id,
      reviewer_id: worker2.id,
      reviewee_id: creator2.id,
      rating: 4,
      comment: 'Arjun was clear about requirements and paid promptly. Great to work with.',
    },
  });

  console.log('✅ Reviews created');

  // === Create Audit Log entries ===
  await prisma.auditLog.createMany({
    data: [
      {
        actor_id: creator1.id,
        action: 'job.posted',
        entity_type: 'job',
        entity_id: job1.id,
        metadata: { title: job1.title },
      },
      {
        actor_id: creator1.id,
        action: 'job.posted',
        entity_type: 'job',
        entity_id: job2.id,
        metadata: { title: job2.title },
      },
      {
        actor_id: creator1.id,
        action: 'proposal.accepted',
        entity_type: 'proposal',
        entity_id: job3.id,
        metadata: { freelancer_name: worker3.name },
      },
      {
        actor_id: creator2.id,
        action: 'escrow.funded',
        entity_type: 'payment',
        entity_id: job4.id,
        metadata: { amount_paise: '14000000' },
      },
      {
        actor_id: creator2.id,
        action: 'payment.released',
        entity_type: 'payment',
        entity_id: job5.id,
        metadata: { amount_paise: '4050000' },
      },
    ],
  });

  console.log('✅ Audit logs created');
  console.log('');
  console.log('🎉 Seed complete! Test accounts:');
  console.log('  creator1@test.com / Test@1234 (Client)');
  console.log('  creator2@test.com / Test@1234 (Client)');
  console.log('  worker1@test.com  / Test@1234 (Freelancer)');
  console.log('  worker2@test.com  / Test@1234 (Freelancer)');
  console.log('  worker3@test.com  / Test@1234 (Freelancer)');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
