/**
 * Portfolio content data.
 *
 * This is the single file you edit to update every section of the portfolio.
 * All fields are served as-is from the API — no database involved for content.
 * Only contact form submissions are persisted to the database.
 */

import type {
  Profile,
  ExperienceEntry,
  Certification,
  SkillsData,
  Project,
  EducationEntry,
} from "@workspace/api-zod";

// ─── Profile (Navbar, Hero, Footer, Contact) ──────────────────────────────────

export const profile: Profile = {
  name: "Your Name",
  initials: "YN",
  role: "Senior Engineer",
  tagline: "Building precise systems.",
  bio: "I specialize in architecting high-performance web applications and backend systems. Obsessed with clean code, elegant architecture, and shipping products that matter.",
  location: "San Francisco, CA",
  availableForWork: true,
  email: "hello@yourname.com",
  phone: "+1 (555) 000-0000",
  resumeUrl: "/resume.pdf",
  contactMessage:
    "I'm currently open to new opportunities. Whether you have a question, a project proposal, or just want to say hi, I'll try my best to get back to you!",
  contactInfo: [
    { id: 1, label: "Email", value: "hello@yourname.com", url: "mailto:hello@yourname.com", iconKey: "mail" },
    { id: 2, label: "Phone", value: "+1 (555) 000-0000", url: "tel:+15550000000", iconKey: "phone" },
    { id: 3, label: "Location", value: "San Francisco, CA", url: null, iconKey: "map-pin" },
  ],
  socialLinks: [
    { id: 1, platform: "GitHub", url: "https://github.com/yourname", iconKey: "github" },
    { id: 2, platform: "LinkedIn", url: "https://linkedin.com/in/yourname", iconKey: "linkedin" },
    { id: 3, platform: "Twitter", url: "https://twitter.com/yourname", iconKey: "twitter" },
  ],
};

// ─── Experience ───────────────────────────────────────────────────────────────

export const experiences: ExperienceEntry[] = [
  {
    id: 1,
    role: "Senior Software Engineer",
    company: "Acme Systems",
    startDate: "2021-03",
    endDate: null,
    employmentType: "Full-time",
    description:
      "Architected and built the core microservices for a high-traffic fintech platform. Reduced latency by 40% and led a team of 4 engineers in migrating from a legacy monolith to a distributed architecture.",
    tech: ["Go", "TypeScript", "React", "Kubernetes", "PostgreSQL"],
  },
  {
    id: 2,
    role: "Full Stack Developer",
    company: "Nexus Technologies",
    startDate: "2018-06",
    endDate: "2021-02",
    employmentType: "Full-time",
    description:
      "Developed real-time collaborative features for a SaaS enterprise tool. Implemented operational dashboards and internal CRMs, establishing the company's UI component library.",
    tech: ["React", "Node.js", "GraphQL", "Redis", "AWS"],
  },
  {
    id: 3,
    role: "Frontend Engineer",
    company: "Studio Digital",
    startDate: "2016-01",
    endDate: "2018-05",
    employmentType: "Contract",
    description:
      "Built responsive, accessible, and high-performance marketing sites and web applications for Fortune 500 clients.",
    tech: ["JavaScript", "Vue.js", "SASS", "Webpack"],
  },
];

// ─── Certifications ───────────────────────────────────────────────────────────

export const certifications: Certification[] = [
  {
    id: 1,
    name: "AWS Solutions Architect",
    org: "Amazon Web Services",
    date: "2023-03-15",
    credentialId: "AWS-PSA-49281",
    iconKey: "cloud",
  },
  {
    id: 2,
    name: "Certified Kubernetes Admin",
    org: "Cloud Native Computing Foundation",
    date: "2022-11-02",
    credentialId: "CKA-99201",
    iconKey: "box",
  },
  {
    id: 3,
    name: "Google Cloud Professional",
    org: "Google Cloud",
    date: "2022-05-20",
    credentialId: "GCP-PCA-1029",
    iconKey: "server",
  },
  {
    id: 4,
    name: "MongoDB Certified Developer",
    org: "MongoDB",
    date: "2021-08-10",
    credentialId: "MDB-CD-8812",
    iconKey: "database",
  },
  {
    id: 5,
    name: "Security+ Certification",
    org: "CompTIA",
    date: "2020-01-25",
    credentialId: "COMP-SEC-291",
    iconKey: "shield",
  },
  {
    id: 6,
    name: "Certified Ethical Hacker",
    org: "EC-Council",
    date: "2020-09-12",
    credentialId: "CEH-11029",
    iconKey: "lock",
  },
  {
    id: 7,
    name: "React Advanced Patterns",
    org: "Frontend Masters",
    date: "2019-07-01",
    credentialId: "FM-RA-001",
    iconKey: "monitor",
  },
  {
    id: 8,
    name: "Linux Professional",
    org: "LPI",
    date: "2018-04-18",
    credentialId: "LPI-101-992",
    iconKey: "terminal",
  },
];

// ─── Skills ───────────────────────────────────────────────────────────────────

export const skills: SkillsData = {
  categories: [
    {
      title: "Frontend",
      iconKey: "monitor",
      skills: [
        { name: "React / Next.js", level: 90 },
        { name: "TypeScript", level: 85 },
        { name: "Tailwind CSS", level: 95 },
        { name: "Framer Motion", level: 75 },
      ],
    },
    {
      title: "Backend",
      iconKey: "server",
      skills: [
        { name: "Node.js", level: 85 },
        { name: "Go", level: 70 },
        { name: "PostgreSQL", level: 80 },
        { name: "Redis", level: 65 },
      ],
    },
    {
      title: "Tooling",
      iconKey: "wrench",
      skills: [
        { name: "Git & CI/CD", level: 90 },
        { name: "Docker", level: 80 },
        { name: "Kubernetes", level: 60 },
        { name: "AWS", level: 75 },
      ],
    },
  ],
  secondary: [
    "GraphQL",
    "REST",
    "WebSockets",
    "Prisma",
    "Drizzle",
    "Jest",
    "Cypress",
    "Vitest",
    "Redux",
    "Zustand",
    "tRPC",
    "Express",
    "Fastify",
    "MongoDB",
    "Vite",
    "Webpack",
    "Linux",
    "Nginx",
    "Figma",
    "Accessibility (a11y)",
    "WebRTC",
    "Stripe API",
    "OAuth",
    "JWT",
    "GitHub Actions",
    "Terraform",
  ],
};

// ─── Projects ─────────────────────────────────────────────────────────────────

export const projects: Project[] = [
  {
    id: 1,
    name: "Aegis Security Scanner",
    description:
      "A fast, concurrent vulnerability scanner for CI/CD pipelines. Analyzes Docker images and code repositories in real-time.",
    tech: ["Go", "Docker", "Goroutines", "PostgreSQL"],
    stars: 342,
    liveUrl: "#",
    githubUrl: "#",
    iconKey: "shield",
    colorKey: "blue",
    category: "DevOps",
  },
  {
    id: 2,
    name: "MetricsFlow UI",
    description:
      "Enterprise observability dashboard. Handles millions of data points smoothly using WebGL charting and optimized React rendering.",
    tech: ["React", "TypeScript", "WebGL", "WebSockets"],
    stars: 128,
    liveUrl: "#",
    githubUrl: "#",
    iconKey: "globe",
    colorKey: "amber",
    category: "Web App",
  },
  {
    id: 3,
    name: "TerminalX",
    description:
      "A web-based terminal emulator with native feel. Includes custom multiplexing, theming, and an embedded plugin system.",
    tech: ["TypeScript", "xterm.js", "Rust", "WASM"],
    stars: 856,
    liveUrl: "#",
    githubUrl: "#",
    iconKey: "terminal",
    colorKey: "emerald",
    category: "Tools",
  },
];

// ─── Education ────────────────────────────────────────────────────────────────

export const education: EducationEntry[] = [
  {
    id: 1,
    degree: "M.Sc. Computer Science",
    institution: "Stanford University",
    startDate: "2014-09",
    endDate: "2016-06",
    focus:
      "Specialized in Distributed Systems and Machine Learning. Thesis on optimizing consensus algorithms in high-latency networks.",
    iconKey: "graduation-cap",
  },
  {
    id: 2,
    degree: "B.Sc. Software Engineering",
    institution: "University of California, Berkeley",
    startDate: "2010-09",
    endDate: "2014-06",
    focus:
      "Core curriculum focused on algorithms, data structures, and computer architecture. Led the university cybersecurity club.",
    iconKey: "library",
  },
];
