import Anthropic from "@anthropic-ai/sdk";
import { allSkillCategories, monthYear, OTHER_SKILLS_CATEGORY } from "@/lib/templates/helpers";
import type { Template } from "@/lib/templates/types";
import type { Contribution, Experience } from "@/generated/prisma/client";

export type ExperienceWithEntries = Experience & { contributions: Contribution[] };

const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY
});

const PROMPT = `
    You are an expert technical resume writer.
    Your job is to create a highly targeted, ATS-friendly, ONE-PAGE resume
    using the candidate's experience data and the provided job description.

    Rules:
    1. Only use information provided in the candidate data.
    2. Never invent experience, technologies, metrics, dates, education, or qualifications.
    3. Prioritize experience that is most relevant to the job description.
    4. Remove irrelevant experience when necessary.
    5. Skills and experience sections are mandatory and must be relevant to the job description.
    Projects are optional: when a diary entry describes a distinct project that materially strengthens
    the application, you may present it as a project instead. Never repeat the same work in both
    experience and projects. Return an empty projects list if none qualify.
    6. The resume must fit on ONE page: respect the LENGTH LIMITS given with the job description.
    7. Do not include redundant information.
    8. Take your time to prioritize high-value information over completenes.
    9. Use strong, concise, achievement-oriented bullet points by modifying the wording and structuring of
    the sentences in the candidate data to form a formal, professional resume. You can use
    Google's resume bullet point format: Accomplished [X] as measured by [Y], by doing [Z].
    Decide which bullet points fit into this formula.
    10. Wrap the key result or metric in each bullet in double asterisks, e.g. "Saved **3+ hours** per project".
    11. Write dates as "Mon YYYY" (e.g. "Jun 2025"). Use "Present" as the end date of anything still ongoing.
    12. Put every selected skill into exactly one of the SKILL CATEGORIES given with the job description.
    Use "${OTHER_SKILLS_CATEGORY}" only for relevant skills that fit no other category. Leave out categories with no relevant skills.
    Within each category, order skills by relevance to the job description, and use the job description's
    wording for a skill (e.g. "PostgreSQL" rather than "Postgres") when the candidate data supports it.
    13. For each project, list its main technologies.
    14. List experiences and projects in reverse chronological order. Within each entry, order bullets
    from most to least relevant to the job description.

    You have to decide dynamically:
    - How many experiences to include
    - Which experiences to include
    - How many projects to include (if any)
    - Which projects to include
    - How many skills to include
    - Which skills to include

    Return only the requested structured output.
    Return data in JSON only.
`

// Must stay in sync with resumeSchema below
export type Resume = {
    skills: {
        category: string;       // one of the template's skill categories
        items: string[];
    }[];
    experience: {
        place: string;
        role: string;
        startDate: string;
        endDate: string;
        bullets: string[];
    }[];
    projects: {
        name: string;
        technologies: string[];
        place: string;
        startDate: string;
        endDate: string;
        bullets: string[];
    }[];
}

// Built per template so Claude can only use that template's skill categories
const resumeSchema = (skillCategories: string[]) => ({
    type: "object",
    properties: {
        skills: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    category: {type: "string", enum: skillCategories},
                    items: {
                        type: "array",
                        items: {type: "string"}
                    },
                },
                required: ["category", "items"],
                additionalProperties: false,
            }
        },
        experience: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    place: {type: "string"},
                    role: {type: "string"},
                    startDate: {type: "string"},
                    endDate: {type: "string"},
                    bullets: {
                        type: "array",
                        items: {type: "string"}
                    },
                },
                required: ["place", "role", "startDate", "endDate", "bullets"],
                additionalProperties: false,
            }
        },
        projects: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    name: {type: "string"},
                    technologies: {
                        type: "array",
                        items: {type: "string"}
                    },
                    place: {type: "string"},
                    startDate: {type: "string"},
                    endDate: {type: "string"},
                    bullets: {
                        type: "array",
                        items: {type: "string"}
                    },
                },
                required: ["name", "technologies", "place", "startDate", "endDate", "bullets"],
                additionalProperties: false,
            }
        },
    },
    required: [
        "skills",
        "experience",
        "projects",
    ],
    additionalProperties: false,
})

// Diary data as plain text: one block per role, with every diary entry and its date
function formatExperienceData(experiences: ExperienceWithEntries[]): string {
    return experiences.map(exp => [
        `ROLE: ${exp.role}`,
        `PLACE: ${exp.place}`,
        `DATES: ${monthYear(exp.startDate)} – ${exp.endDate ? monthYear(exp.endDate) : "Present"}`,
        `DIARY ENTRIES:`,
        ...exp.contributions.map(c => `- (${c.createdAt.toISOString().split("T")[0]}) ${c.entry}`),
    ].join("\n")).join("\n\n");
}

export default async function generate(jDescription: string, experiences: ExperienceWithEntries[], template: Template): Promise<Resume> {
    const skillCategories = allSkillCategories(template);
    const experienceData = formatExperienceData(experiences);
    const { maxBullets, maxBulletChars } = template.budget;

    const response = await anthropic.messages.create({
        model: "claude-sonnet-5",
        // Thinking tokens count toward this limit, so leave room beyond the ~1.5k-token resume
        max_tokens: 16000,
        system: PROMPT,
        messages: [
            {
            role: 'user',
            content: `
            JOB DESCRIPTION:
            ${jDescription}

            CANDIDATE EXPERIENCE DATA:
            ${experienceData}

            SKILL CATEGORIES:
            ${skillCategories.join("; ")}

            LENGTH LIMITS:
            At most ${maxBullets} bullets in total across experience and projects, each under ${maxBulletChars} characters.
            `
            }
        ],
        output_config: {
            format: {
                type: "json_schema",
                schema: resumeSchema(skillCategories)
            }
        }
    });

    // In both cases the output may not match the schema
    if (response.stop_reason === "refusal") {
        throw new Error("Claude declined to generate this resume");
    }
    if (response.stop_reason === "max_tokens") {
        throw new Error("Claude's response was cut off before the resume was complete");
    }

    const textBlock = response.content.find(
        block => block.type==="text"
    );

    if (!textBlock || textBlock.type !== "text") {
        throw new Error("Claude did not return resume data");
    }

    const resume: Resume = JSON.parse(textBlock.text);

    return resume;
}