// RAG Chunk definitions with provenance
// Each chunk is a searchable unit with source tracking

import { portfolioData } from '../portfolio-data'

export type ChunkSection = "identity" | "project" | "skills" | "creative" | "community" | "contact" | "dsa"

export interface ChunkSource {
    section: ChunkSection
    projectName?: string
}

export interface Chunk {
    id: string
    text: string
    source: ChunkSource
}

/**
 * Generate all chunks from portfolio data with provenance
 * Each chunk is a semantic unit that can be retrieved independently
 */
export function generateChunks(): Chunk[] {
    const chunks: Chunk[] = []

    // Identity chunk
    chunks.push({
        id: "identity-about",
        text: `${portfolioData.identity.name} is an ${portfolioData.identity.role}. ${portfolioData.identity.summary}`,
        source: { section: "identity" }
    })

    // Philosophy chunk
    chunks.push({
        id: "identity-philosophy",
        text: `Philosophy and approach: ${portfolioData.identity.philosophy}`,
        source: { section: "identity" }
    })

    // Learning style chunk
    chunks.push({
        id: "identity-learning",
        text: `Learning style: ${portfolioData.learningStyle.join(". ")}.`,
        source: { section: "identity" }
    })

    // DSA chunk
    if (portfolioData.dsa) {
        chunks.push({
            id: "dsa-status",
            text: `DSA and LeetCode: ${portfolioData.dsa.status}`,
            source: { section: "dsa" }
        })
    }

    // Project chunks - one per project
    for (const project of portfolioData.projects) {
        let projectText = `Project: ${project.name}. ${project.tagline}`

        if (project.status) {
            projectText += ` Status: ${project.status}.`
        }
        if (project.category) {
            projectText += ` Category: ${project.category}.`
        }
        if (project.problem) {
            projectText += ` Problem: ${project.problem}`
        }
        if (project.approach && Array.isArray(project.approach)) {
            projectText += ` Approach: ${project.approach.join(". ")}.`
        }
        if (project.recognition) {
            projectText += ` Recognition: ${project.recognition}.`
        }
        if (project.learningFocus) {
            projectText += ` Learning focus: ${project.learningFocus}`
        }
        if (project.context) {
            projectText += ` Context: ${project.context}.`
        }
        if (project.links) {
            const linkStr = Object.entries(project.links)
                .map(([k, v]) => `${k}: ${v}`)
                .join(", ")
            projectText += ` Links: ${linkStr}.`
        }

        chunks.push({
            id: `project-${project.name.toLowerCase().replace(/\s+/g, '-')}`,
            text: projectText,
            source: { section: "project", projectName: project.name }
        })
    }

    // Skills chunks - by category
    chunks.push({
        id: "skills-languages",
        text: `Programming languages: ${portfolioData.skills.languages.join(", ")}.`,
        source: { section: "skills" }
    })

    chunks.push({
        id: "skills-backend",
        text: `Backend technologies: ${portfolioData.skills.backend.join(", ")}.`,
        source: { section: "skills" }
    })

    chunks.push({
        id: "skills-databases",
        text: `Database experience: ${portfolioData.skills.databases.join(", ")}.`,
        source: { section: "skills" }
    })

    chunks.push({
        id: "skills-frontend",
        text: `Frontend technologies: ${portfolioData.skills.frontend.join(", ")}.`,
        source: { section: "skills" }
    })

    chunks.push({
        id: "skills-tools",
        text: `Development tools: ${portfolioData.skills.tools.join(", ")}.`,
        source: { section: "skills" }
    })

    chunks.push({
        id: "skills-focus",
        text: `Technical focus: ${portfolioData.skills.focus}`,
        source: { section: "skills" }
    })

    // Creative work chunk
    if (portfolioData.creativeWork) {
        chunks.push({
            id: "creative-work",
            text: `Creative work: ${portfolioData.creativeWork.domain}. ${portfolioData.creativeWork.experience} Tools: ${portfolioData.creativeWork.tools.join(", ")}. ${portfolioData.creativeWork.perspective}`,
            source: { section: "creative" }
        })
    }

    // Open source chunk
    if (portfolioData.openSourceAndCommunity) {
        chunks.push({
            id: "opensource-contributions",
            text: `Open source contributions: ${portfolioData.openSourceAndCommunity.contributions.join(". ")}. Programs: ${portfolioData.openSourceAndCommunity.programs.join(", ")}. ${portfolioData.openSourceAndCommunity.learning}`,
            source: { section: "community" }
        })
    }

    // Contact/Links chunk
    chunks.push({
        id: "contact-links",
        text: `Contact and social links: ${Object.entries(portfolioData.links).map(([k, v]) => `${k}: ${v}`).join(", ")}.`,
        source: { section: "contact" }
    })

    return chunks
}

// Pre-generate chunks for use in embedding script
export const chunks = generateChunks()
