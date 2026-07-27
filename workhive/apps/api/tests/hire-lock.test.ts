import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '../src/lib/prisma';
import { proposalService } from '../src/services/proposal.service';

describe('Hire-Lock Concurrent Test', () => {
  let jobId: string;
  let workerId: string;
  let clientId: string;

  beforeAll(async () => {
    // Create test users
    const client = await prisma.user.create({
      data: {
        email: 'hire-lock-test-client@example.com',
        password_hash: 'test_hash',
        name: 'Test Client',
        role: 'client',
      },
    });
    clientId = client.id;

    const worker = await prisma.user.create({
      data: {
        email: 'hire-lock-test-worker@example.com',
        password_hash: 'test_hash',
        name: 'Test Worker',
        role: 'freelancer',
      },
    });
    workerId = worker.id;

    // Create a test job
    const job = await prisma.job.create({
      data: {
        title: 'Hire Lock Test Job',
        description: 'Test job for hire-lock',
        budget_paise: 100000, // ₹1000
        skills: ['test'],
        status: 'posted',
        client_id: clientId,
      },
    });
    jobId = job.id;

    // Create 20 proposals from different workers
    const workers = await Promise.all(
      Array.from({ length: 20 }, (_, i) =>
        prisma.user.create({
          data: {
            email: `hire-lock-worker-${i}@example.com`,
            password_hash: 'test_hash',
            name: `Worker ${i}`,
            role: 'freelancer',
          },
        })
      )
    );

    await Promise.all(
      workers.map((worker) =>
        prisma.proposal.create({
          data: {
            job_id: jobId,
            freelancer_id: worker.id,
            amount_paise: 100000,
            message: `Proposal from ${worker.name}`,
            status: 'pending',
          },
        })
      )
    );
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.proposal.deleteMany({ where: { job_id: jobId } });
    await prisma.job.delete({ where: { id: jobId } });
    await prisma.user.deleteMany({
      where: {
        email: {
          startsWith: 'hire-lock',
        },
      },
    });
  });

  it('should accept exactly 1 proposal when 20 concurrent accept requests are made', async () => {
    // Get all proposals for the job
    const proposals = await prisma.proposal.findMany({
      where: { job_id: jobId },
    });

    expect(proposals.length).toBe(20);

    // Simulate 20 concurrent accept requests
    const acceptPromises = proposals.map((proposal) =>
      proposalService.acceptProposal(clientId, proposal.id).catch((err) => {
        // Expected: 19 should fail
        return { error: err.message };
      })
    );

    const results = await Promise.all(acceptPromises);

    // Count successes and failures
    const successes = results.filter((r) => !r.error);
    const failures = results.filter((r) => r.error);

    // Exactly 1 should succeed
    expect(successes.length).toBe(1);
    // 19 should fail
    expect(failures.length).toBe(19);

    // Verify job status
    const job = await prisma.job.findUnique({ where: { id: jobId } });
    expect(job?.status).toBe('assigned');

    // Verify exactly 1 contract exists
    const contracts = await prisma.contract.findMany({ where: { job_id: jobId } });
    expect(contracts.length).toBe(1);

    // Verify all other proposals are rejected
    const rejectedProposals = await prisma.proposal.findMany({
      where: { job_id: jobId, status: 'rejected' },
    });
    expect(rejectedProposals.length).toBe(19);

    // Verify exactly 1 proposal is accepted
    const acceptedProposal = await prisma.proposal.findFirst({
      where: { job_id: jobId, status: 'accepted' },
    });
    expect(acceptedProposal).toBeTruthy();
  });
});
