import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting comprehensive database seed...');

  // 1. Admin Account
  const adminEmail = (process.env.ADMIN_EMAIL || 'shahuztech@gmail.com').toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || 'Shahzod177';
  const passwordHash = await bcrypt.hash(adminPassword, 12);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      passwordHash,
      role: 'ADMIN',
      name: 'Shahzod',
    },
    create: {
      email: adminEmail,
      passwordHash,
      role: 'ADMIN',
      name: 'Shahzod',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    },
  });
  console.log(`✅ Admin account prepared: ${admin.email} (ID: ${admin.id})`);

  // 2. Profile
  await prisma.profile.deleteMany();
  await prisma.profile.create({
    data: {
      name: 'Shahzod',
      title: 'Senior Full-Stack Architect & Digital Product Engineer',
      bio: 'Crafting ultra-scalable distributed systems, cloud-native microservices, and pixel-perfect high-frequency digital experiences. Focused on engineering excellence, speed, and design precision.',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
      heroImageUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80',
      cvUrl: 'https://example.com/shahzod-resume.pdf',
      ctaWorkText: 'Explore Projects',
      ctaContactText: 'Start a Project',
      githubUrl: 'https://github.com/shahuz',
      linkedinUrl: 'https://linkedin.com/in/shahuz',
      twitterUrl: 'https://x.com/shahuz_dev',
      telegramUrl: 'https://t.me/shahuz',
      instagramUrl: 'https://instagram.com/shahuz',
      statsJson: JSON.stringify({
        yearsExperience: 7,
        projectsCompleted: 64,
        happyClients: 42,
        codeCommits: '18.5k',
      }),
    },
  });
  console.log('✅ Profile initialized');

  // 3. Navigation Items
  await prisma.navigationItem.deleteMany();
  const navItems = [
    { label: 'Home', url: '/', sortOrder: 0 },
    { label: 'About', url: '/about', sortOrder: 1 },
    { label: 'Projects', url: '/projects', sortOrder: 2 },
    { label: 'News', url: '/news', sortOrder: 3 },
    { label: 'Blog', url: '/blog', sortOrder: 4 },
    { label: 'Services', url: '/services', sortOrder: 5 },
    { label: 'Contact', url: '/contact', sortOrder: 6 },
  ];
  for (const item of navItems) {
    await prisma.navigationItem.create({ data: item });
  }
  console.log('✅ Navigation items initialized');

  // 4. Skills
  await prisma.skill.deleteMany();
  const skillsData = [
    // Frontend
    { name: 'React 19 / Next.js', icon: 'Code2', category: 'Frontend', percentage: 98, sortOrder: 0 },
    { name: 'TypeScript', icon: 'FileCode2', category: 'Frontend', percentage: 96, sortOrder: 1 },
    { name: 'Tailwind CSS & Framer Motion', icon: 'Palette', category: 'Frontend', percentage: 95, sortOrder: 2 },
    { name: 'Three.js / WebGL', icon: 'Box', category: 'Frontend', percentage: 85, sortOrder: 3 },
    // Backend
    { name: 'Node.js & Express / NestJS', icon: 'Server', category: 'Backend', percentage: 97, sortOrder: 4 },
    { name: 'Go / Golang', icon: 'Cpu', category: 'Backend', percentage: 88, sortOrder: 5 },
    { name: 'GraphQL & RESTful APIs', icon: 'Network', category: 'Backend', percentage: 95, sortOrder: 6 },
    { name: 'Microservices & Event-Driven', icon: 'Workflow', category: 'Backend', percentage: 92, sortOrder: 7 },
    // Database & Cloud
    { name: 'PostgreSQL & Prisma / Redis', icon: 'Database', category: 'Databases', percentage: 94, sortOrder: 8 },
    { name: 'Docker & Kubernetes', icon: 'Container', category: 'DevOps', percentage: 90, sortOrder: 9 },
    { name: 'AWS & Cloudflare Edge', icon: 'Cloud', category: 'DevOps', percentage: 91, sortOrder: 10 },
    { name: 'CI/CD & GitHub Actions', icon: 'GitBranch', category: 'DevOps', percentage: 93, sortOrder: 11 },
  ];
  for (const skill of skillsData) {
    await prisma.skill.create({ data: skill });
  }
  console.log('✅ Skills initialized');

  // 5. Experience & Education
  await prisma.experience.deleteMany();
  const experienceData = [
    {
      type: 'WORK',
      role: 'Principal Software Architect',
      organization: 'ScaleFlow Cloud Technologies',
      location: 'San Francisco, CA (Remote)',
      startDate: '2023',
      endDate: 'Present',
      current: true,
      description: 'Architecting distributed high-throughput event queues, real-time telemetry streaming platforms, and enterprise React applications handling 5M+ daily requests.',
      sortOrder: 0,
    },
    {
      type: 'WORK',
      role: 'Senior Full-Stack Engineer',
      organization: 'Apex Digital Labs',
      location: 'New York, NY',
      startDate: '2021',
      endDate: '2023',
      current: false,
      description: 'Engineered cloud-native web platforms with Next.js, GraphQL, and PostgreSQL. Reduced latency by 45% and mentored 12 mid-level software engineers.',
      sortOrder: 1,
    },
    {
      type: 'WORK',
      role: 'Full-Stack Developer',
      organization: 'Vanguard Systems',
      location: 'Austin, TX',
      startDate: '2019',
      endDate: '2021',
      current: false,
      description: 'Developed scalable CRM dashboards, automated testing suites, and modernized legacy monoliths into lightweight containerized microservices.',
      sortOrder: 2,
    },
    {
      type: 'EDUCATION',
      role: 'M.S. in Computer Science & Distributed Systems',
      organization: 'Tech University',
      location: 'Boston, MA',
      startDate: '2017',
      endDate: '2019',
      current: false,
      description: 'Specialized in Distributed Algorithms, High-Performance Computing, Cryptography, and Advanced Database Architectures. Graduated with Honors.',
      sortOrder: 3,
    },
  ];
  for (const exp of experienceData) {
    await prisma.experience.create({ data: exp });
  }
  console.log('✅ Experience & education initialized');

  // 6. Services
  await prisma.service.deleteMany();
  const servicesData = [
    {
      title: 'Full-Stack Application Architecture',
      description: 'End-to-end engineering of responsive, modern web applications from resilient backend APIs down to fluid 60fps interactive frontends.',
      icon: 'Layers',
      features: JSON.stringify([
        'Modern React / Next.js / TypeScript',
        'Modular REST & GraphQL APIs',
        'State management & TanStack Query caching',
        'Full test coverage & type safety',
      ]),
      sortOrder: 0,
    },
    {
      title: 'Cloud Infrastructure & DevOps',
      description: 'Production containerization, zero-downtime CI/CD automation pipelines, automated monitoring, and multi-region edge deployment.',
      icon: 'CloudLightning',
      features: JSON.stringify([
        'Docker & Kubernetes clusters',
        'Cloudflare Workers & AWS Lambda',
        'PostgreSQL replication & Redis caching',
        'Automated health checks & alerts',
      ]),
      sortOrder: 1,
    },
    {
      title: 'Custom CMS & SaaS Platforms',
      description: 'Bespoke dashboards and content management engines allowing teams to effortlessly control every piece of digital media and copy.',
      icon: 'Settings',
      features: JSON.stringify([
        'Role-Based Access Control (RBAC)',
        'Rich media uploads & storage integration',
        'Real-time analytics & telemetry cards',
        'Granular content scheduling & workflows',
      ]),
      sortOrder: 2,
    },
  ];
  for (const s of servicesData) {
    await prisma.service.create({ data: s });
  }
  console.log('✅ Services initialized');

  // 7. Projects
  await prisma.project.deleteMany();
  const p1 = await prisma.project.create({
    data: {
      title: 'HyperCloud: Global Distributed Kubernetes Observability Platform',
      slug: 'hypercloud-distributed-kubernetes-platform',
      shortDesc: 'A high-concurrency real-time cluster monitoring platform processing 50,000 telemetry events per second with sub-second dashboard rendering.',
      fullDesc: `### HyperCloud Architecture Overview

HyperCloud is a high-concurrency distributed monitoring and observability platform designed for multi-region Kubernetes deployments. Built to overcome the limitations of monolithic telemetry tools, HyperCloud ingests metric streams, logs, and trace spans with minimal overhead.

#### Key Architectural Highlights
- **Distributed Ingestion Engine**: Engineered in Go and Node.js utilizing Kafka streaming and Redis Streams buffer pipelines.
- **Reactive Visualization Layer**: Developed with React 19, WebGL canvas graphing, and WebSocket bi-directional state synchronization.
- **Enterprise Security**: Strict RBAC, mTLS inter-service communication, and encrypted audit logging.
- **Performance**: Capable of processing 50k+ telemetry points/sec with less than 20ms rendering lag on the client.`,
      coverImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
      technologies: JSON.stringify(['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Redis', 'Docker', 'Tailwind CSS']),
      githubUrl: 'https://github.com/shahuz/hypercloud',
      liveDemoUrl: 'https://demo.hypercloud.dev',
      client: 'ScaleFlow Global',
      date: '2026',
      category: 'Cloud Systems',
      featured: true,
      status: 'PUBLISHED',
      sortOrder: 0,
      images: {
        create: [
          {
            url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
            caption: 'Main telemetry live dashboard',
            sortOrder: 0,
          },
          {
            url: 'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?auto=format&fit=crop&w=1200&q=80',
            caption: 'Cluster topology and latency map',
            sortOrder: 1,
          },
          {
            url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80',
            caption: 'Detailed trace performance analytics',
            sortOrder: 2,
          },
        ],
      },
    },
  });

  const p2 = await prisma.project.create({
    data: {
      title: 'ApexFlow: Autonomous Multi-Agent AI Workflow Engine',
      slug: 'apexflow-autonomous-agentic-engine',
      shortDesc: 'Next-generation visual canvas allowing developers to orchestrate autonomous AI agents, tool-calling pipelines, and vector semantic retrieval.',
      fullDesc: `### ApexFlow Agentic Studio

ApexFlow bridges developer workflows and LLM agentic reasoning. With a graph-based node workspace, developers can compose autonomous agents, hook them to real-time APIs, and execute complex asynchronous batch tasks.

#### Highlights
- **Graph Workspace**: Built using custom React Flow nodes with interactive bezier links and real-time execution tokens.
- **Agent Coordination**: Implements actor-model concurrency for resilient agent state tracking and retry mechanisms.
- **Tool Sandbox**: Isolated Docker sandbox execution preventing untrusted code execution risks.`,
      coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
      technologies: JSON.stringify(['Next.js', 'Python', 'FastAPI', 'PostgreSQL', 'LangChain', 'OpenAI', 'Framer Motion']),
      githubUrl: 'https://github.com/shahuz/apexflow',
      liveDemoUrl: 'https://apexflow.ai',
      client: 'NeuroTech Solutions',
      date: '2025',
      category: 'Artificial Intelligence',
      featured: true,
      status: 'PUBLISHED',
      sortOrder: 1,
      images: {
        create: [
          {
            url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
            caption: 'Agent DAG canvas workflow',
            sortOrder: 0,
          },
          {
            url: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=1200&q=80',
            caption: 'Agent memory and vector embedding explorer',
            sortOrder: 1,
          },
        ],
      },
    },
  });

  const p3 = await prisma.project.create({
    data: {
      title: 'PulseDesk: Ultra-Low Latency Algorithmic Trading Interface',
      slug: 'pulsedesk-low-latency-trading-interface',
      shortDesc: 'A high-frequency cryptocurrency and options execution desk with sub-5ms order book depth visualizer and automated strategy triggers.',
      fullDesc: `### PulseDesk Financial Analytics

PulseDesk delivers institutional-grade performance to quantitative trading operations. Leveraging high-frequency WebSockets and zero-allocation memory buffers, order book data renders at fluid 120fps.`,
      coverImage: 'https://images.unsplash.com/photo-1642543492481-44e81e3914a7?auto=format&fit=crop&w=1200&q=80',
      technologies: JSON.stringify(['React', 'TypeScript', 'Rust', 'WebSockets', 'Tailwind CSS', 'Chart.js']),
      githubUrl: 'https://github.com/shahuz/pulsedesk',
      liveDemoUrl: 'https://demo.pulsedesk.trade',
      client: 'QuantEdge Capital',
      date: '2025',
      category: 'FinTech',
      featured: false,
      status: 'PUBLISHED',
      sortOrder: 2,
      images: {
        create: [
          {
            url: 'https://images.unsplash.com/photo-1642543492481-44e81e3914a7?auto=format&fit=crop&w=1200&q=80',
            caption: 'Order book depth heatmap',
            sortOrder: 0,
          },
        ],
      },
    },
  });
  console.log('✅ Projects initialized');

  // 8. News & Countdown Scheduler
  await prisma.news.deleteMany();
  // Scheduled post 3 days in the future for demonstrating the LIVE COUNTDOWN TIMER!
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 3);
  futureDate.setHours(futureDate.getHours() + 4);
  futureDate.setMinutes(futureDate.getMinutes() + 25);

  await prisma.news.create({
    data: {
      title: 'Upcoming Release: NovaCore v3.0 Distributed State Engine',
      slug: 'upcoming-release-novacore-v3-state-engine',
      shortDesc: 'The next major release of NovaCore brings zero-copy serialization, decentralized Byzantine consensus, and automatic WebAssembly edge replication.',
      fullContent: `### NovaCore v3.0 is Launching Soon!

We are ecstatic to reveal that **NovaCore v3.0** is in final security audit stages and scheduled for public unveiling. 

#### What to expect:
- **Zero-Copy Memory Mapping**: Up to 3.5x throughput improvement across distributed node clusters.
- **Wasm Runtime Integration**: Instant deployment of serverless edge handlers without container cold starts.
- **Built-in Telemetry**: Real-time distributed tracing compatible with OpenTelemetry.

Keep an eye on the countdown clock above. The moment the timer reaches zero, the full specification and production release binaries will be instantly unlocked!`,
      coverImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
      category: 'Product Launch',
      tags: JSON.stringify(['NovaCore', 'v3.0', 'Distributed Systems', 'Wasm']),
      author: 'Shahzod',
      featured: true,
      status: 'SCHEDULED',
      scheduledAt: futureDate,
      images: {
        create: [
          {
            url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
            caption: 'Global distributed mesh diagram',
            sortOrder: 0,
          },
          {
            url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80',
            caption: 'Consensus engine benchmark',
            sortOrder: 1,
          },
        ],
      },
    },
  });

  await prisma.news.create({
    data: {
      title: 'Keynote Speaker at International Cloud & Distributed Systems Summit 2026',
      slug: 'keynote-speaker-cloud-distributed-summit-2026',
      shortDesc: 'Honored to deliver the keynote talk on "Designing Resilient Multi-Region Backends with Node.js, Go, and Event Sourcing" in front of 3,000 engineers.',
      fullContent: `Last week, I had the immense privilege of delivering the opening keynote at the 2026 International Cloud Systems Summit in Seattle.

We tackled practical strategies for surviving cross-region latency spikes, failover automation, and implementing event-sourcing with PostgreSQL and Kafka.

The recording and interactive presentation slides are now available for all developers worldwide.`,
      coverImage: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1200&q=80',
      category: 'Conferences',
      tags: JSON.stringify(['Keynote', 'Speaking', 'Cloud', 'Architecture']),
      author: 'Shahzod',
      featured: false,
      status: 'PUBLISHED',
      images: {
        create: [
          {
            url: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1200&q=80',
            caption: 'Keynote stage presentation',
            sortOrder: 0,
          },
        ],
      },
    },
  });
  console.log('✅ News items initialized (including scheduled countdown item)');

  // 9. Blog Posts
  await prisma.blogPost.deleteMany();
  await prisma.blogPost.create({
    data: {
      title: 'Architecting High-Concurrency Microservices with Node.js & Redis Streams',
      slug: 'architecting-high-concurrency-microservices-nodejs-redis',
      excerpt: 'How to build fault-tolerant, horizontally scalable event-driven services that handle millions of messages without dropping packets.',
      content: `### Why Redis Streams Over Classic Pub/Sub?

When designing distributed systems that operate under variable traffic surges, classic pub/sub channels suffer from a fatal flaw: **no persistence**. If a subscriber dies or restarts during a burst, messages are permanently lost.

Redis Streams solves this with an append-only log, consumer groups, and message acknowledgement (\`XACK\`).

\`\`\`typescript
import { createClient } from 'redis';

const redis = createClient({ url: 'redis://localhost:6379' });
await redis.connect();

// Producing events to stream
export async function emitUserOrder(orderId: string, amount: number) {
  const messageId = await redis.xAdd('orders_stream', '*', {
    orderId,
    amount: amount.toString(),
    timestamp: Date.now().toString(),
  });
  console.log(\`[STREAM] Published order event: \${messageId}\`);
  return messageId;
}
\`\`\`

#### Consumer Groups and At-Least-Once Delivery
Using consumer groups allows worker fleets to distribute the processing load seamlessly:

\`\`\`typescript
// Consumer worker
async function processStream() {
  while (true) {
    const response = await redis.xReadGroup(
      'order_processors',
      'worker_node_1',
      [{ key: 'orders_stream', id: '>' }],
      { COUNT: 10, BLOCK: 5000 }
    );

    if (response) {
      for (const stream of response) {
        for (const message of stream.messages) {
          await handleOrder(message.message);
          await redis.xAck('orders_stream', 'order_processors', message.id);
        }
      }
    }
  }
}
\`\`\`

### Key Takeaways
1. **Backpressure**: Streams naturally throttle consumers, preventing memory exhaustion.
2. **Idempotency**: Always design handlers to be idempotent since networks can retry.
3. **Dead-Letter Queues**: Move failed messages to an error stream after 3 retries.`,
      coverImage: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80',
      category: 'Backend Architecture',
      tags: JSON.stringify(['Node.js', 'Redis', 'Microservices', 'Distributed Systems']),
      author: 'Shahzod',
      readingTime: '6 min read',
      seoTitle: 'High-Concurrency Microservices with Node.js & Redis Streams | Shahzod',
      seoDesc: 'Master event-driven architecture using Redis Streams and consumer groups for production Node.js services.',
      seoKeywords: 'Node.js, Redis Streams, Microservices, Event-Driven, Distributed Systems',
      featured: true,
      status: 'PUBLISHED',
      publishedAt: new Date(),
    },
  });

  await prisma.blogPost.create({
    data: {
      title: 'Building Zero-Latency Reactive UIs with React 19 and TanStack Query',
      slug: 'building-zero-latency-reactive-uis-react-tanstack',
      excerpt: 'Deep dive into optimistic mutations, server actions cache invalidation, and keeping UI responsive even over degraded network connections.',
      content: `### The Illusions of Speed: Optimistic UI Updates

Users don't wait for your database write to confirm before wanting to see visual feedback. In modern software engineering, optimistic updates make an application feel instantaneously fast.

\`\`\`tsx
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useUpdateProjectStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await api.put(\`/projects/\${id}\`, { status });
      return res.data;
    },
    onMutate: async ({ id, status }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['projects'] });

      // Snapshot previous value
      const previousProjects = queryClient.getQueryData(['projects']);

      // Optimistically update cache
      queryClient.setQueryData(['projects'], (old: any) =>
        old.map((p: any) => (p.id === id ? { ...p, status } : p))
      );

      return { previousProjects };
    },
    onError: (_err, _vars, context) => {
      // Rollback on failure
      queryClient.setQueryData(['projects'], context?.previousProjects);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}
\`\`\`

#### Micro-Interactions that Delight
Pairing optimistic queries with **Framer Motion layout animations** gives users immediate tactile confirmation, elevating software from good to extraordinary.`,
      coverImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80',
      category: 'Frontend Engineering',
      tags: JSON.stringify(['React', 'TanStack Query', 'TypeScript', 'Performance']),
      author: 'Shahzod',
      readingTime: '5 min read',
      featured: false,
      status: 'PUBLISHED',
      publishedAt: new Date(),
    },
  });
  console.log('✅ Blog posts initialized');

  // 10. Testimonials
  await prisma.testimonial.deleteMany();
  const testimonials = [
    {
      clientName: 'Alexander Vance',
      role: 'Chief Technology Officer',
      company: 'ScaleFlow Global',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      content: 'Shahzod is one of the rare 1% software engineers who can seamlessly design complex distributed cloud backends while crafting breathtaking, high-speed user interfaces. His delivery exceeded all expectations.',
      rating: 5,
      sortOrder: 0,
    },
    {
      clientName: 'Elena Rostova',
      role: 'VP of Product Engineering',
      company: 'NeuroTech Systems',
      avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80',
      content: 'Under Shahzod’s architectural leadership, our web application load times plummeted by 60% and our engineering productivity doubled. A true powerhouse software engineer.',
      rating: 5,
      sortOrder: 1,
    },
  ];
  for (const t of testimonials) {
    await prisma.testimonial.create({ data: t });
  }
  console.log('✅ Testimonials initialized');

  // 11. Audio Tracks
  await prisma.audioTrack.deleteMany();
  const audioTracks = [
    {
      title: 'Neon Cyber Odyssey (Focus Beats)',
      artist: 'Shahzod Beats',
      coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=400&q=80',
      audioUrl: 'https://assets.mixkit.co/music/preview/mixkit-tech-house-vibes-130.mp3',
      duration: '2:40',
      description: 'Atmospheric synthwave lo-fi engineered for deep flow state programming sessions.',
      published: true,
      sortOrder: 0,
    },
    {
      title: 'Deep Architecture Chillwave',
      artist: 'Shahzod Beats',
      coverUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=400&q=80',
      audioUrl: 'https://assets.mixkit.co/music/preview/mixkit-serene-view-443.mp3',
      duration: '3:12',
      description: 'Calm, melodic electronic rhythm for architecture planning and code review.',
      published: true,
      sortOrder: 1,
    },
  ];
  for (const a of audioTracks) {
    await prisma.audioTrack.create({ data: a });
  }
  console.log('✅ Audio tracks initialized');

  // 12. SiteSettings & SeoSettings
  await prisma.siteSettings.deleteMany();
  await prisma.siteSettings.create({
    data: {
      theme: 'dark',
      accentColor: '#00F2FE',
      enableSections: JSON.stringify({
        hero: true,
        about: true,
        skills: true,
        projects: true,
        news: true,
        blog: true,
        services: true,
        stats: true,
        testimonials: true,
        contact: true,
      }),
    },
  });

  await prisma.seoSettings.deleteMany();
  await prisma.seoSettings.create({
    data: {
      siteTitle: 'Shahzod | Senior Full-Stack Engineer & Product Architect',
      siteDescription: 'Production portfolio of Shahzod — Senior Full-Stack Engineer specializing in cloud systems, high-concurrency Node.js architectures, and fluid React applications.',
      keywords: 'Full-Stack Developer, Software Engineer, React, Node.js, TypeScript, PostgreSQL, Portfolio, Cloud Architect',
      canonicalUrl: 'https://shahuz.dev',
      robots: 'index, follow',
      twitterCard: 'summary_large_image',
    },
  });

  console.log('🎉 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
