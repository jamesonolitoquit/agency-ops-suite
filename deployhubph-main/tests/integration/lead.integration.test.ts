import { spawn, ChildProcess } from 'child_process';
import path from 'path';
import net from 'net';
import express from 'express';
import supertest from 'supertest';

async function getFreePort(): Promise<number> {
  return await new Promise((resolve, reject) => {
    const server = net.createServer();
    server.on('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      if (address && typeof address === 'object') {
        const { port } = address;
        server.close(() => resolve(port));
        return;
      }
      server.close(() => reject(new Error('Unable to allocate a free port')));
    });
  });
}

function startNext(env: Record<string, string>): ChildProcess {
  const nextBin = path.join(process.cwd(), 'node_modules', 'next', 'dist', 'bin', 'next');
  const proc = spawn(process.execPath, [nextBin, 'dev'], {
    cwd: process.cwd(),
    env: { ...process.env, ...env },
    stdio: 'pipe',
  });

  const forward = (stream: NodeJS.ReadableStream | null, label: string) => {
    stream?.on('data', (chunk) => {
      process.stdout.write(`[next:${label}] ${chunk.toString()}`);
    });
  };

  forward(proc.stdout, 'stdout');
  forward(proc.stderr, 'stderr');

  return proc;
}

describe('Lead intake integration', () => {
  let mockServer: any;
  let nextProc: ChildProcess | null = null;
  let nextPort = 0;
  let mockPort = 0;

  beforeAll(async () => {
    nextPort = await getFreePort();
    mockPort = await getFreePort();

    // Start mock suite intake server
    const app = express();
    app.use(express.json());
    app.post('/api/intake/lead', (req, res) => {
      // simple acceptance response
      return res.status(201).json({ leadId: 'mock-suite-1', ok: true });
    });
    mockServer = app.listen(mockPort);

    // Start Next server (assumes project already built)
    nextProc = startNext({
      PORT: String(nextPort),
      INTERNAL_INTAKE_ENDPOINT: `http://127.0.0.1:${mockPort}`,
      INTAKE_WEBHOOK_SECRET: 'test-secret',
      RESEND_API_KEY: 'test-resend-key',
    });

    // wait for next to be ready by polling
    const max = Date.now() + 30000;
    let connected = false;
    while (Date.now() < max && !connected) {
      try {
        const res = await fetch(`http://127.0.0.1:${nextPort}`);
        if (res.ok || res.status === 200 || res.status === 404) connected = true;
      } catch (e) {
        await new Promise((r) => setTimeout(r, 500));
      }
    }
    if (!connected) throw new Error('Next server failed to start');
    // give Next a moment to register routes
    await new Promise((r) => setTimeout(r, 2000));
  }, 60000);

  afterAll(async () => {
    await new Promise<void>((resolve) => {
      if (!mockServer) {
        resolve();
        return;
      }
      mockServer.close(() => resolve());
    });

    await new Promise<void>((resolve) => {
      if (!nextProc) {
        resolve();
        return;
      }

      nextProc.once('exit', () => resolve());
      nextProc.kill();
    });
  });

  test('POST /api/lead accepts a valid lead and forwards to suite', async () => {
    const req = supertest(`http://127.0.0.1:${nextPort}`);
    const res = await req.post('/api/lead').send({
      name: 'QA Tester',
      email: 'qa@example.com',
      serviceNeeded: 'website',
      budgetRange: '$1k-$5k',
      projectDetails: 'Test project',
    });

    if (![200, 201].includes(res.status)) {
      throw new Error(`Unexpected status ${res.status}: ${JSON.stringify(res.body)}`);
    }
    expect(res.body).toHaveProperty('success', true);
    expect(res.body).toHaveProperty('leadId');
  }, 30000);
});
