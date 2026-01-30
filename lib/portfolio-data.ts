// Portfolio data store - RAG source of truth
// All information about Shivam Gawali - NO HALLUCINATION ALLOWED
// Gemini must ONLY use data from this file

// Content images for different query types
export const contentImages: Record<string, { url: string; alt: string; dominantColor: string }> = {
  summary: {
    url: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1600&q=80",
    alt: "Developer workspace with code on screen",
    dominantColor: "#1a365d", // dark blue
  },
  projects: {
    url: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1600&q=80",
    alt: "Code on multiple screens",
    dominantColor: "#1e3a5f", // navy blue
  },
  skills: {
    url: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1600&q=80",
    alt: "Technology and programming tools",
    dominantColor: "#0f172a", // slate
  },
  resume: {
    url: "https://images.unsplash.com/photo-1586281380349-502baa1986e2?w=1600&q=80",
    alt: "Professional document workspace",
    dominantColor: "#1f2937", // gray
  },
  learning_path: {
    url: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=1600&q=80",
    alt: "Learning and education journey",
    dominantColor: "#312e81", // indigo
  },
  failure: {
    url: "https://images.unsplash.com/photo-1493836512294-502baa1986e2?w=1600&q=80",
    alt: "Growth through challenges",
    dominantColor: "#3f3f46", // zinc
  },
  contact: {
    url: "https://images.unsplash.com/photo-1423666639041-f56000c27a9a?w=1600&q=80",
    alt: "Connect and communicate",
    dominantColor: "#1e40af", // blue
  },
  unknown: {
    url: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1600&q=80",
    alt: "Abstract technology background",
    dominantColor: "#0c0a09", // black
  },
}

export const portfolioData = {
  identity: {
    name: "Shivam Gawali",
    role: "AI & Data Science Student",
    summary:
      "I am a college student studying Artificial Intelligence and Data Science with a strong interest in software engineering fundamentals and backend system design. I build small, focused systems to understand how they work internally, prioritizing correctness, clarity, and learning through iteration over feature count or polish.",
    philosophy:
      "I prefer understanding fundamentals deeply before moving to abstractions, and I learn best by building end-to-end systems and documenting mistakes instead of hiding them.",
  },

  links: {
    github: "https://github.com/shiv669",
    linkedin: "https://www.linkedin.com/in/shivam-gawali-0b7122224",
    instagram: "https://www.instagram.com/thpersnshivam",
    devto: "https://dev.to/shiv669",
    devpost: "https://devpost.com/shivamgawali585",
    leetcode: "https://leetcode.com/u/Glorious-Vulture/",
  },

  dsa: {
    status: "Currently learning DSA and trying to grind LeetCode. I might be early but I am still learning and trying to do DSA in C++ to grasp a strong foundation on every topic."
  },

  projects: [
    {
      name: "Still",
      status: "Completed",
      category: "Web system / community platform",
      tagline: "A forum where answers expire unless they're still true.",
      problem:
        "Most technical forums reward popularity and upvotes, even when answers become outdated. This leads to stale information ranking higher than correctness.",
      approach: [
        "Introduced time-based freshness windows depending on topic volatility",
        "Used confidence scores instead of permanent upvotes",
        "Allowed community verification through 'Still True' and 'Outdated' signals",
        "Ensured the system works even without AI using deterministic fallbacks",
      ],
      behavior:
        "Answers automatically decay over time and can be marked stale regardless of popularity, enforcing honesty by default.",
      role: "End-to-end system design and implementation",
      recognition: "Featured Selection — Vercel x Foru.ms Hackathon",
      links: {
        github: "https://github.com/shiv669/still",
        live: "https://still-systems.vercel.app/",
      },
    },

    {
      name: "Code Review System",
      status: "Learning-focused / Active",
      category: "Backend system design exploration",
      tagline: "A minimal code review workflow focused on preserving context over time.",
      problem:
        "Code review discussions often lose context as code evolves, leading to ambiguous or outdated feedback.",
      approach: [
        "Modeled immutable revisions",
        "Explicit state transitions for review lifecycle",
        "Revision-scoped feedback instead of global comments",
      ],
      learningFocus:
        "Understanding how real review systems model state, history, and feedback to avoid ambiguity.",
      links: {
        github: "https://github.com/shiv669/code-review-system",
      },
    },

    {
      name: "Trace",
      status: "Conceptual / Prototype",
      category: "AI + spatial interaction",
      tagline: "A cognitive continuity concept exploring interruption recovery.",
      problem:
        "Frequent interruptions break cognitive flow and make it difficult for users to resume tasks effectively.",
      approach: [
        "Explored spatial cues and behavioral signals",
        "Focused on guiding users back rather than instructing them",
        "Designed with privacy-first and local processing principles in mind",
      ],
      context: "Imagine Cup 2026 submission",
      links: {
        github: "https://github.com/trace-spatial",
      },
    },

    {
      name: "TRINERA",
      status: "Hackathon / Prototype",
      category: "AI-powered application",
      tagline: "An agricultural pest detection assistant for farmers.",
      problem:
        "Farmers often lack immediate access to expert knowledge for identifying and managing crop pests.",
      approach: [
        "Computer vision for pest identification",
        "Conversational AI for guidance",
        "FastAPI backend with Next.js frontend",
      ],
      techStack: ["Next.js", "FastAPI", "Python"],
      links: {
        github: "https://github.com/shiv669/TRINERA",
      },
    },

    {
      name: "LocalAid Connect",
      status: "Completed (Hackathon)",
      category: "Community platform",
      tagline: "A real-time emergency response platform for local communities.",
      problem:
        "During crises, people in need often struggle to connect quickly with nearby helpers.",
      approach: [
        "Real-time coordination using Appwrite",
        "Simple role-based flows for helpers and requesters",
        "Focused on reliability over visual complexity",
      ],
      context: "Appwrite Hacktoberfest 2025",
      links: {
        github: "https://github.com/shiv669/LocalAid",
        live: "https://localaid.appwrite.network/",
      },
    },

    {
      name: "Memory Manager (C++)",
      status: "Ongoing",
      category: "Systems programming",
      tagline: "A learning project to understand memory management internals.",
      learningFocus:
        "Exploring how low-level memory allocation works in C++ and how design decisions affect correctness and safety.",
    },

    {
      name: "Ravel Core",
      status: "Exploratory",
      category: "System design learning",
      learningFocus:
        "Understanding core system design concepts through small, focused experiments.",
    },

    {
      name: "Ravel Insights",
      status: "Exploratory",
      category: "Applied ML learning",
      learningFocus:
        "Exploring how monitoring and insights can be built on top of system data.",
    },
  ],

  skills: {
    languages: ["JavaScript", "C", "C++", "SQL"],
    backend: ["Node.js", "Express", "REST APIs"],
    databases: ["SQLite", "MySQL", "Relational data modeling"],
    frontend: ["React", "Vite", "Basic UI integration"],
    tools: ["Git", "GitHub", "Docker", "Linux basics"],
    focus:
      "Backend system design, correctness, explicit state modeling, and learning how data models affect system behavior over time.",
  },

  creativeWork: {
    domain: "Video editing and visual storytelling",
    experience:
      "Freelance video editor working with creators in India and internationally, primarily on educational long-form and short-form content.",
    tools: ["After Effects", "Premiere Pro", "CapCut"],
    perspective:
      "My interest in video editing influences how I think about pacing, clarity, and structure in software and user experience.",
  },

  openSourceAndCommunity: {
    programs: ["Hacktoberfest"],
    contributions: [
      "Top 10 contributor at Goose",
      "Contributions to Goose and Travel-Grid repositories",
    ],
    learning:
      "Learned collaborative development through issues, pull requests, and reviews.",
  },

  learningStyle: [
    "Build end-to-end systems",
    "Validate assumptions through implementation",
    "Document mistakes instead of hiding them",
    "Refine mental models through iteration",
  ],
}

// Type exports
export type PanelType =
  | "summary"
  | "projects"
  | "skills"
  | "resume"
  | "learning_path"
  | "failure"
  | "contact"
  | "unknown"

export interface ResultContent {
  title: string
  description: string
  highlightedWords?: string[]
  bulletPoints?: string[]
  imageUrl?: string
  imageAlt?: string
  deeperContext?: string
}

export interface Citation {
  key: string
  title: string
  subtitle: string
  imageUrl: string
  link?: string
}

export interface PanelResponse {
  title: string
  type: PanelType
  content: ResultContent
  suggestions: string[]
  canContinue: boolean
  searchPlaceholder?: string
  citations?: Citation[]
}

// Fallback responses when Gemini is unavailable
export const fallbackResponses: Record<string, PanelResponse> = {
  career_summary: {
    title: "Career Summary",
    type: "summary",
    content: {
      title: "Career Summary",
      description: `${portfolioData.identity.name} is an ${portfolioData.identity.role} focused on backend system design and correctness-first engineering. ${portfolioData.identity.summary}`,
      highlightedWords: ["backend system design", "correctness", "learning through iteration"],
      bulletPoints: [
        "Vercel x Foru.ms Hackathon Featured Winner with 'Still'",
        "Top 10 contributor at Goose (Open Source)",
        "Focus: Build end-to-end systems and validate through code",
      ],
    },
    suggestions: ["Top projects", "Skills overview", "Open source contributions"],
    canContinue: true,
  },
  top_projects: {
    title: "Top Projects",
    type: "projects",
    content: {
      title: "Top Projects",
      description: `${portfolioData.identity.name} has built several notable projects focusing on correctness and system design. Still, his hackathon-winning project, explores how answers should fade unless proven correct over time. He also built LocalAid Connect for emergency response and TRINERA for agricultural pest detection.`,
      highlightedWords: ["Still", "LocalAid Connect", "TRINERA", "correctness"],
      bulletPoints: portfolioData.projects.slice(0, 5).map((p) => `${p.name} - ${p.tagline}`),
    },
    suggestions: ["Career summary", "Skills overview", "Contact information"],
    canContinue: true,
  },
  skills_overview: {
    title: "Skills Overview",
    type: "skills",
    content: {
      title: "Skills Overview",
      description: `Technical expertise spans across multiple domains: languages like JavaScript, C, C++, and SQL; backend technologies including Node.js, Express, and REST APIs; databases such as SQLite and MySQL; frontend with React and Vite; and tools like Git, Docker, and Linux.`,
      highlightedWords: ["JavaScript", "Node.js", "React", "Docker", "SQL"],
      bulletPoints: [
        `Languages: ${portfolioData.skills.languages.join(", ")}`,
        `Backend: ${portfolioData.skills.backend.join(", ")}`,
        `Databases: ${portfolioData.skills.databases.join(", ")}`,
        `Frontend: ${portfolioData.skills.frontend.join(", ")}`,
        `Tools: ${portfolioData.skills.tools.join(", ")}`,
      ],
    },
    suggestions: ["Top projects", "Open source", "Resume format"],
    canContinue: true,
  },
  contact_information: {
    title: "Contact Information",
    type: "contact",
    content: {
      title: "Contact Information",
      description: `Connect with ${portfolioData.identity.name} through various platforms. GitHub for code and projects, LinkedIn for professional networking, DEV.to for articles, and LeetCode for DSA practice.`,
      highlightedWords: ["GitHub", "LinkedIn", "DEV.to", "LeetCode"],
      bulletPoints: Object.entries(portfolioData.links).map(
        ([platform, url]) => `${platform.charAt(0).toUpperCase() + platform.slice(1)}: ${url}`,
      ),
    },
    suggestions: ["Career summary", "Top projects", "Skills overview"],
    canContinue: false,
  },
  no_information: {
    title: "No Information Available",
    type: "unknown",
    content: {
      title: "No Information Available",
      description:
        "I don't have information about that in the portfolio. Try asking about projects, skills, career summary, open source contributions, or contact information.",
      highlightedWords: [],
    },
    suggestions: ["Career summary", "Top projects", "Skills overview"],
    canContinue: false,
  },
}

// Query mapping for fallback
export function mapQueryToFallback(query: string): string | null {
  const q = query.toLowerCase().trim()

  const mappings: Record<string, string[]> = {
    career_summary: ["career", "summary", "about", "who", "introduction", "intro", "overview", "shivam"],
    top_projects: ["project", "projects", "work", "portfolio", "built", "made", "still", "trace", "ravel", "trinera", "localaid"],
    skills_overview: ["skill", "skills", "tech", "technology", "stack", "languages", "expertise", "know"],
    contact_information: ["contact", "email", "reach", "connect", "social", "linkedin", "github", "instagram", "links"],
  }

  for (const [key, keywords] of Object.entries(mappings)) {
    if (keywords.some((kw) => q.includes(kw))) {
      return key
    }
  }

  return null
}
