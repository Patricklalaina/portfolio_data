#!/usr/bin/env node
/**
 * One-off / re-runnable script that writes the real project data directly
 * into the "projects" row of portfolio_sections, overwriting whatever is
 * already stored there (including the placeholder seed data used the very
 * first time the section was read). Unlike the lazy getOrSeedSection()
 * fallback in the API — which only ever inserts data when the row doesn't
 * exist yet — this always overwrites, so it's safe to run again after
 * editing PROJECTS below to push further updates straight to the database.
 *
 * Usage:
 *   DATABASE_URL=postgres://... node seed-projects.mjs
 */
// Force IPv4 DNS resolution — same constraint as migrate.mjs on Vercel builds.
import { setDefaultResultOrder } from "node:dns";
setDefaultResultOrder("ipv4first");

import pg from "pg";

const { Pool } = pg;

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set");
  process.exit(1);
}

const pool = new Pool({
  connectionString: url,
  ssl: { rejectUnauthorized: false },
  family: 4,
});

const PROJECTS = [
  // ─── Data Science ───────────────────────────────────────────────────────────
  {
    id: 1,
    name: "ft_linear_regression",
    description:
      "First hands-on machine learning project: implemented linear regression trained via gradient descent from scratch to predict car prices, without relying on ML libraries.",
    tech: ["Python", "Gradient Descent", "NumPy"],
    stars: 0,
    liveUrl: "#",
    githubUrl: "#",
    iconKey: "trending-up",
    colorKey: "amber",
    category: "Data Science",
  },
  {
    id: 2,
    name: "DSLR — Data Science x Logistic Regression",
    description:
      "Reimplementing a Hogwarts-sorting classifier using multiclass logistic regression built from scratch, including data exploration, feature engineering, and gradient descent optimization. (In progress)",
    tech: ["Python", "Logistic Regression", "Pandas"],
    stars: 0,
    liveUrl: "#",
    githubUrl: "#",
    iconKey: "graduation-cap",
    colorKey: "amber",
    category: "Data Science",
  },
  {
    id: 3,
    name: "Multilayer Perceptron",
    description:
      "Neural network implemented from scratch (forward/backward propagation, gradient descent) to classify breast cancer diagnoses — no deep learning framework involved. (In progress)",
    tech: ["Python", "Neural Networks", "NumPy"],
    stars: 0,
    liveUrl: "#",
    githubUrl: "#",
    iconKey: "network",
    colorKey: "amber",
    category: "Data Science",
  },
  {
    id: 4,
    name: "Total Perspective Vortex",
    description:
      "Brain-computer interface project: processes and classifies EEG signals in near real-time to predict motor imagery, combining signal processing with machine learning pipelines. (In progress)",
    tech: ["Python", "Signal Processing", "scikit-learn"],
    stars: 0,
    liveUrl: "#",
    githubUrl: "#",
    iconKey: "activity",
    colorKey: "amber",
    category: "Data Science",
  },
  {
    id: 5,
    name: "Leaffliction",
    description:
      "Computer vision pipeline for plant disease classification from leaf images — covers data augmentation, image transformation, and a CNN-based classifier. (In progress)",
    tech: ["Python", "Computer Vision", "Deep Learning"],
    stars: 0,
    liveUrl: "#",
    githubUrl: "#",
    iconKey: "leaf",
    colorKey: "amber",
    category: "Data Science",
  },

  // ─── Web ────────────────────────────────────────────────────────────────────
  {
    id: 6,
    name: "ft_transcendence",
    description:
      "Full-stack real-time multiplayer Monopoly game with in-game chat and full user management, built with complete architectural freedom. Real-time state synchronization powered by Socket.IO, backed by a full observability stack (Prometheus + Grafana) for live monitoring.",
    tech: ["React", "Express", "Socket.IO", "Prometheus", "Grafana"],
    stars: 0,
    liveUrl: "#",
    githubUrl: "#",
    iconKey: "gamepad-2",
    colorKey: "blue",
    category: "Web App",
  },

  // ─── DevOps / Infrastructure ────────────────────────────────────────────────
  {
    id: 7,
    name: "Inception",
    description:
      "Production-style infrastructure orchestrated with Docker Compose: NGINX with SSL/TLS, WordPress on php-fpm, and MariaDB, each running in its own hardened container.",
    tech: ["Docker", "NGINX", "MariaDB"],
    stars: 0,
    liveUrl: "#",
    githubUrl: "#",
    iconKey: "container",
    colorKey: "emerald",
    category: "DevOps",
  },
  {
    id: 8,
    name: "Inception-of-Things",
    description:
      "Extends container orchestration to Kubernetes — multi-node cluster setup with K3s/K3d and GitOps-driven deployments. (In progress)",
    tech: ["Kubernetes", "Docker", "GitOps"],
    stars: 0,
    liveUrl: "#",
    githubUrl: "#",
    iconKey: "boxes",
    colorKey: "emerald",
    category: "DevOps",
  },
  {
    id: 9,
    name: "cloud-1",
    description:
      "Deploys a web application on a remote virtual machine with automated infrastructure provisioning and persistent data storage. (In progress)",
    tech: ["Docker", "PostgreSQL", "Linux"],
    stars: 0,
    liveUrl: "#",
    githubUrl: "#",
    iconKey: "cloud",
    colorKey: "emerald",
    category: "DevOps",
  },
  {
    id: 10,
    name: "Born2beroot",
    description:
      "Hardened virtual machine setup (Debian/Rocky) with strict security policies, custom sudo rules, LVM-encrypted partitions, and a system monitoring script.",
    tech: ["Linux", "Bash", "System Administration"],
    stars: 0,
    liveUrl: "#",
    githubUrl: "https://github.com/Patricklalaina/born2beroot",
    iconKey: "server",
    colorKey: "emerald",
    category: "DevOps",
  },

  // ─── Systems Programming ────────────────────────────────────────────────────
  {
    id: 11,
    name: "cub3d",
    description:
      "Raycasting engine inspired by Wolfenstein 3D — real-time first-person rendering of a dynamic maze from a 2D map, built in C with minilibx.",
    tech: ["C", "Raycasting", "Graphics"],
    stars: 0,
    liveUrl: "#",
    githubUrl: "#",
    iconKey: "box",
    colorKey: "violet",
    category: "Systems Programming",
  },
  {
    id: 12,
    name: "ft_irc",
    description:
      "IRC server built from scratch in C++98, compatible with standard IRC clients, handling multiple simultaneous connections via non-blocking I/O.",
    tech: ["C++", "Sockets", "Networking"],
    stars: 0,
    liveUrl: "#",
    githubUrl: "#",
    iconKey: "message-square",
    colorKey: "violet",
    category: "Systems Programming",
  },
  {
    id: 13,
    name: "minishell",
    description:
      "A working Unix shell implementation supporting pipes, redirections, environment variables, and built-in commands.",
    tech: ["C", "Unix", "Process Management"],
    stars: 0,
    liveUrl: "#",
    githubUrl: "#",
    iconKey: "terminal",
    colorKey: "violet",
    category: "Systems Programming",
  },
  {
    id: 14,
    name: "Philosophers",
    description:
      "Classic dining philosophers problem solved with multithreading — deadlock avoidance and precise timing constraints under concurrent execution.",
    tech: ["C", "Multithreading", "Concurrency"],
    stars: 0,
    liveUrl: "#",
    githubUrl: "#",
    iconKey: "users",
    colorKey: "violet",
    category: "Systems Programming",
  },
  {
    id: 15,
    name: "push_swap",
    description:
      "Sorting algorithm challenge: sorts data across two stacks using a restricted instruction set, optimized for the minimum number of moves.",
    tech: ["C", "Algorithms", "Sorting"],
    stars: 0,
    liveUrl: "#",
    githubUrl: "#",
    iconKey: "arrow-up-down",
    colorKey: "violet",
    category: "Systems Programming",
  },
  {
    id: 16,
    name: "C++ Fundamentals (Modules 00–09)",
    description:
      "Progressive deep-dive into C++: OOP, operator overloading, inheritance, polymorphism, templates, STL containers, and exception handling.",
    tech: ["C++", "OOP", "STL"],
    stars: 0,
    liveUrl: "#",
    githubUrl: "#",
    iconKey: "code",
    colorKey: "violet",
    category: "Systems Programming",
  },
];

try {
  await pool.query(
    `INSERT INTO portfolio_sections (section, data, updated_at)
     VALUES ($1, $2::jsonb, NOW())
     ON CONFLICT (section) DO UPDATE SET data = EXCLUDED.data, updated_at = NOW()`,
    ["projects", JSON.stringify(PROJECTS)],
  );
  console.log(`Seeded ${PROJECTS.length} projects into the database.`);
} catch (err) {
  console.error("Seeding failed:", err.message);
  process.exit(1);
} finally {
  await pool.end();
}
