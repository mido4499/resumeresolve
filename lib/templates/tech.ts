import {
    AlignmentType,
    BorderStyle,
    Document,
    LevelFormat,
    Paragraph,
    Tab,
    TabStopType,
    TextRun,
    type IRunOptions,
} from "docx";
import { allSkillCategories, monthYear, orderSkills, richText } from "./helpers";
import type { EducationEntry, ResumeData, Template } from "./types";

// Measurements copied from the reference resume.
// Sizes are in half-points (21 = 10.5pt); spacing and positions are in twips (20 = 1pt).
const FONT = "Times New Roman";
const SIZE = { name: 34, contact: 19, heading: 23, entry: 21, body: 20 };
const PAGE = { width: 12240, height: 15840, marginX: 560, marginY: 340 }; // US Letter
const RIGHT_EDGE = PAGE.width - 2 * PAGE.marginX;
const BULLET_LIST = "bullet";
const NBSP = "\u00A0";
// About how many characters fit on one 10.5pt line between the margins, with room for the tab gap
// (the reference resume's longest project line that fit was ~111 characters; the first that wrapped was ~118)
const LINE_CHARS = 105;
const SKILL_CATEGORIES = ["Languages", "Frameworks & Libraries", "Databases, Cloud & Tools", "CS Fundamentals"];

// Font and size are set on every run, not just as document defaults,
// because some apps (e.g. Google Docs import, Quick Look) ignore the defaults
function text(value: string, options: IRunOptions = {}) {
    return new TextRun({ font: FONT, size: SIZE.body, ...options, text: value });
}

function bodyText(value: string) {
    return richText(value, { font: FONT, size: SIZE.body });
}

function sectionHeading(title: string) {
    return new Paragraph({
        spacing: { before: 110, after: 50 },
        border: { bottom: { style: BorderStyle.SINGLE, size: 6, space: 1, color: "000000" } },
        children: [text(title.toUpperCase(), { bold: true, size: SIZE.heading })],
    });
}

// Left content with an optional right-aligned date, e.g. "Software Engineer        Jun 2025 – Jul 2025"
function entryLine(left: TextRun[], right?: string, options: { before?: number, rightStyle?: IRunOptions } = {}) {
    return new Paragraph({
        spacing: { before: options.before ?? 0, after: 0 },
        tabStops: [{ type: TabStopType.RIGHT, position: RIGHT_EDGE }],
        children: [
            ...left,
            ...(right
                ? [new TextRun({ font: FONT, size: SIZE.entry, bold: true, ...options.rightStyle, children: [new Tab(), right] })]
                : []),
        ],
    });
}

function bullet(children: TextRun[]) {
    return new Paragraph({
        numbering: { reference: BULLET_LIST, level: 0 },
        spacing: { after: 20 },
        children,
    });
}

// Non-breaking spaces keep the range together, so a long line moves the whole date down
// instead of splitting it as "Jan 2026 –" / "May 2026"
function dateRange(start: string, end: string) {
    return [start, end].map(d => d.replace(/ /g, NBSP)).join(`${NBSP}–${NBSP}`);
}

function educationEntry(edu: EducationEntry): Paragraph[] {
    const paragraphs: Paragraph[] = [];

    if (edu.school) {
        paragraphs.push(entryLine([text(edu.school, { bold: true, size: SIZE.entry })], undefined, { before: 40 }));
    }

    const degree = [edu.major, edu.minor && `Minor in ${edu.minor}`].filter(Boolean).join(", ");
    const graduation = edu.graduationDate &&
        `${edu.graduated ? "" : "Expected "}${monthYear(edu.graduationDate)}`;
    if (degree || graduation) {
        paragraphs.push(entryLine(
            [text(degree, { italics: true, size: SIZE.entry })],
            graduation || undefined,
            { rightStyle: { bold: false, italics: true } },
        ));
    }

    const details: TextRun[] = [];
    if (edu.gpa) {
        details.push(text(`GPA: ${edu.gpa}`, { bold: true }));
    }
    if (edu.achievements) {
        if (details.length) details.push(text("  |  "));
        details.push(...bodyText(edu.achievements));
    }
    if (details.length) {
        paragraphs.push(bullet(details));
    }

    return paragraphs;
}

function render(data: ResumeData): Document {
    const children: Paragraph[] = [
        new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 30 },
            children: [text(data.name, { bold: true, size: SIZE.name })],
        }),
        new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 40 },
            children: [text(data.contact.join("  |  "), { size: SIZE.contact })],
        }),
    ];

    // Coursework only appears under an education entry, never on its own
    if (data.education.length) {
        children.push(sectionHeading("Education"));
        children.push(...data.education.flatMap(educationEntry));
        if (data.coursework) {
            children.push(bullet([text("Relevant Coursework: ", { bold: true }), text(data.coursework)]));
        }
    }

    if (data.experience.length) {
        children.push(sectionHeading("Experience"));
        for (const exp of data.experience) {
            children.push(
                entryLine([text(exp.role, { bold: true, size: SIZE.entry })], dateRange(exp.startDate, exp.endDate), { before: 40 }),
                new Paragraph({ children: [text(exp.place, { italics: true, size: SIZE.entry })] }),
                ...exp.bullets.map(b => bullet(bodyText(b))),
            );
        }
    }

    if (data.projects.length) {
        children.push(sectionHeading("Projects"));
        for (const project of data.projects) {
            const dates = dateRange(project.startDate, project.endDate);
            const technologies = project.technologies.join(", ");
            const title = [text(project.name, { bold: true, size: SIZE.entry })];
            // Technologies go after the name when everything fits on one line, otherwise on their own line below
            const techFitsInline = technologies && `${project.name}  |  ${technologies}${dates}`.length <= LINE_CHARS;
            if (techFitsInline) {
                title.push(text(`  |  ${technologies}`, { italics: true }));
            }
            children.push(
                entryLine(title, dates, { before: 50 }),
                ...(technologies && !techFitsInline
                    ? [new Paragraph({ children: [text(technologies, { italics: true })] })]
                    : []),
                ...project.bullets.map(b => bullet(bodyText(b))),
            );
        }
    }

    const skills = orderSkills(data.skills, allSkillCategories(tech));
    if (skills.length) {
        children.push(sectionHeading("Technical Skills"));
        for (const skill of skills) {
            children.push(new Paragraph({
                spacing: { after: 10 },
                children: [text(`${skill.category}: `, { bold: true }), text(skill.items.join(", "))],
            }));
        }
    }

    return new Document({
        styles: {
            default: { document: { run: { font: FONT, size: SIZE.body, color: "000000" } } },
        },
        numbering: {
            config: [{
                reference: BULLET_LIST,
                levels: [{
                    level: 0,
                    format: LevelFormat.BULLET,
                    text: "•",
                    alignment: AlignmentType.LEFT,
                    style: {
                        paragraph: { indent: { left: 300, hanging: 200 } },
                        run: { font: FONT, size: SIZE.body },
                    },
                }],
            }],
        },
        sections: [{
            properties: {
                page: {
                    size: { width: PAGE.width, height: PAGE.height },
                    margin: { top: PAGE.marginY, bottom: PAGE.marginY, left: PAGE.marginX, right: PAGE.marginX },
                },
            },
            children,
        }],
    });
}

export const tech: Template = {
    id: "tech",
    name: "Tech",
    skillCategories: SKILL_CATEGORIES,
    // The reference resume fits 16 experience/project bullets of up to ~170 characters on one page
    budget: { maxBullets: 16, maxBulletChars: 180 },
    render,
};
