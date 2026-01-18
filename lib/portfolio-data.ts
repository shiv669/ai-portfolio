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
    focus: ["Backend system design", "Correctness", "Learning through iteration", "Explicit modeling and invariants"],
    philosophy: "I prefer understanding fundamentals deeply before moving to abstractions.",
  },

  links: {
    github: "https://github.com/shiv669",
    holopin: "https://holopin.io/@shiv669",
    instagram: "https://www.instagram.com/thpersnshivam",
    linkedin: "https://www.linkedin.com/in/shivam-gawali-0b7122224",
  },

  projects: [
    {
      name: "Still",
      tagline: "A forum where answers expire unless they're still true.",
      concept: "Answers fade unless proven correct over time.",
      theme: "Correctness over popularity",
      achievement: "Vercel x Foru.ms Hackathon Featured Winner",
    },
    {
      name: "Trace",
      tagline: "Detects interruptions and guides users back physically.",
      domain: "Cognitive continuity",
      techniques: ["Kalman filtering", "Madgwick fusion", "Behavioral variance detection"],
      principles: ["Privacy first", "Local processing", "Human guidance over instruction"],
    },
    {
      name: "Ravel Core",
      type: "System design learning project",
    },
    {
      name: "Ravel Insights",
      type: "Applied ML monitoring exploration",
    },
  ],

  skills: {
    languages: ["JavaScript", "C", "C++", "SQL"],
    backend: ["Node.js", "Express", "REST APIs"],
    databases: ["SQLite", "MySQL"],
    frontend: ["React", "Vite"],
    tools: ["Git", "Docker", "Linux"],
    learningFocus: ["Relational modeling", "State invariants", "API correctness", "System behavior over time"],
  },

  learningStyle: [
    "Build end to end systems",
    "Validate assumptions through code",
    "Document mistakes",
    "Refine mental models iteratively",
  ],

  failureStory: {
    title: "The Overengineering Trap",
    content: `Early in my journey, I spent three weeks building a "perfect" authentication system 
for a side project. I implemented JWT refresh tokens, rate limiting, OAuth2 flows, and 
session management - before writing a single line of actual application code. The project 
never launched. I learned that correctness matters, but shipping matters more. Now I start 
with the simplest working version and iterate based on real needs, not imagined ones.`,
  },

  learningPath: [
    {
      phase: "Foundation",
      period: "2022",
      focus: "C/C++ fundamentals, data structures, algorithms",
    },
    {
      phase: "Web Development",
      period: "2023",
      focus: "JavaScript, Node.js, React, REST APIs",
    },
    {
      phase: "System Design",
      period: "2024",
      focus: "Database modeling, state machines, distributed systems basics",
    },
    {
      phase: "AI/ML Integration",
      period: "2025-Present",
      focus: "Applied ML, sensor fusion, behavioral modeling, AI-powered applications",
    },
  ],

  resumeText: `SHIVAM GAWALI
AI & Data Science Student

SKILLS
Languages: JavaScript, C, C++, SQL
Backend: Node.js, Express, REST APIs  
Databases: SQLite, MySQL
Frontend: React, Vite
Tools: Git, Docker, Linux

PROJECTS
• Still - Forum where answers expire unless proven correct (Vercel x Foru.ms Hackathon Winner)
• Trace - Cognitive continuity system using Kalman filtering and sensor fusion
• Ravel Core - System design learning project
• Ravel Insights - Applied ML monitoring exploration

FOCUS AREAS
Backend system design, Correctness-first engineering, Explicit modeling and invariants

PHILOSOPHY
Understanding fundamentals deeply before moving to abstractions.`,
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

export interface PanelResponse {
  title: string
  type: PanelType
  content: ResultContent
  suggestions: string[]
  canContinue: boolean
}

// Fallback responses when Gemini is unavailable
export const fallbackResponses: Record<string, PanelResponse> = {
  career_summary: {
    title: "Career Summary",
    type: "summary",
    content: {
      title: "Career Summary",
      description: `${portfolioData.identity.name} is an ${portfolioData.identity.role} focused on backend system design and correctness-first engineering. With expertise in JavaScript, C/C++, and SQL, he builds systems that prioritize explicit modeling and invariants. His philosophy: "${portfolioData.identity.philosophy}"`,
      highlightedWords: ["backend system design", "correctness-first engineering", "explicit modeling"],
      bulletPoints: [
        "Vercel x Foru.ms Hackathon Featured Winner with 'Still'",
        "Focus areas: " + portfolioData.identity.focus.join(", "),
        "Approach: Build end-to-end systems and validate through code",
      ],
    },
    suggestions: ["Top projects", "Skills overview", "Learning path"],
    canContinue: true,
  },
  top_projects: {
    title: "Top Projects",
    type: "projects",
    content: {
      title: "Top Projects",
      description: `${portfolioData.identity.name} has built several notable projects focusing on correctness and system design. Still, his hackathon-winning project, explores how answers should fade unless proven correct over time. Trace tackles cognitive continuity using advanced sensor fusion techniques.`,
      highlightedWords: ["Still", "Trace", "correctness", "sensor fusion"],
      bulletPoints: portfolioData.projects.map((p) => `${p.name} - ${p.tagline || p.type}`),
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
    suggestions: ["Top projects", "Learning path", "Resume format"],
    canContinue: true,
  },
  failure_story: {
    title: portfolioData.failureStory.title,
    type: "failure",
    content: {
      title: portfolioData.failureStory.title,
      description: portfolioData.failureStory.content,
      highlightedWords: ["three weeks", "perfect", "never launched", "shipping matters more"],
    },
    suggestions: ["Learning path", "Top projects", "Career summary"],
    canContinue: true,
  },
  learning_path: {
    title: "Learning Path",
    type: "learning_path",
    content: {
      title: "Learning Path",
      description: `The learning journey started with C/C++ fundamentals in 2022, progressed through web development in 2023, moved to system design in 2024, and now focuses on AI/ML integration. The approach: build end-to-end systems, validate assumptions through code, document mistakes, and iteratively refine mental models.`,
      highlightedWords: ["2022", "2023", "2024", "AI/ML integration"],
      bulletPoints: portfolioData.learningPath.map((p) => `${p.phase} (${p.period}): ${p.focus}`),
    },
    suggestions: ["Skills overview", "Top projects", "Career summary"],
    canContinue: true,
  },
  resume_format: {
    title: "Resume",
    type: "resume",
    content: {
      title: "Resume",
      description: portfolioData.resumeText,
      highlightedWords: [],
    },
    suggestions: ["Contact information", "Top projects", "Skills overview"],
    canContinue: false,
  },
  contact_information: {
    title: "Contact Information",
    type: "contact",
    content: {
      title: "Contact Information",
      description: `Connect with ${portfolioData.identity.name} through various platforms. GitHub for code and projects, LinkedIn for professional networking, Instagram for personal updates, and Holopin for developer badges and achievements.`,
      highlightedWords: ["GitHub", "LinkedIn", "Instagram", "Holopin"],
      bulletPoints: Object.entries(portfolioData.links).map(
        ([platform, url]) => `${platform.charAt(0).toUpperCase() + platform.slice(1)}: ${url}`,
      ),
    },
    suggestions: ["Career summary", "Top projects", "Resume format"],
    canContinue: false,
  },
  no_information: {
    title: "No Information Available",
    type: "unknown",
    content: {
      title: "No Information Available",
      description:
        "I don't have information about that in the portfolio. Try asking about projects, skills, career summary, learning path, failure stories, resume, or contact information.",
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
    career_summary: ["career", "summary", "about", "who", "introduction", "intro", "overview"],
    top_projects: ["project", "projects", "work", "portfolio", "built", "made", "still", "trace", "ravel"],
    skills_overview: ["skill", "skills", "tech", "technology", "stack", "languages", "expertise"],
    failure_story: ["failure", "fail", "mistake", "lesson", "learned", "wrong"],
    learning_path: ["learning", "path", "journey", "growth", "education", "progress"],
    resume_format: ["resume", "cv", "download", "pdf", "document"],
    contact_information: ["contact", "email", "reach", "connect", "social", "linkedin", "github", "instagram"],
  }

  for (const [key, keywords] of Object.entries(mappings)) {
    if (keywords.some((kw) => q.includes(kw))) {
      return key
    }
  }

  return null
}
