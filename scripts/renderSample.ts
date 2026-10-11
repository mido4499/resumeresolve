// Renders a template with sample data so it can be checked in Word / Google Docs.
// Usage: npx tsx scripts/renderSample.ts [templateId] [outFile]
import { writeFileSync } from "fs";
import { Packer } from "docx";
import { templates } from "@/lib/templates";
import type { ResumeData } from "@/lib/templates/types";

const sample: ResumeData = {
    name: "Jordan Rivera",
    contact: ["Austin, TX", "(512) 555-0142", "jordan.rivera@example.com", "github.com/jrivera", "linkedin.com/in/jordanrivera"],
    education: [{
        school: "University of Texas at Austin",
        major: "B.S. in Computer Science",
        minor: "Mathematics",
        graduationDate: new Date("2027-05-15"),
        graduated: false,
        gpa: "3.92",
        achievements: "Dean's List (**5x**)  |  ACM Programming Team  |  Undergraduate Research Fellowship",
    }],
    coursework: "Data Structures & Algorithms, Operating Systems, Distributed Systems, Databases",
    experience: [
        {
            role: "Software Engineering Intern",
            place: "Northwind Logistics",
            startDate: "Jun 2025",
            endDate: "Aug 2025",
            bullets: [
                "Reduced shipment-tracking API latency by **40%** by adding a Redis cache in front of the PostgreSQL read path",
                "Saved **5+ hours** per week for the operations team by automating daily inventory reconciliation reports in Python",
                "Shipped **3** features to a React dashboard used by 200+ warehouse staff, working from design through code review",
                "Wrote integration tests that raised coverage of the billing service from 52% to **81%**",
            ],
        },
        {
            role: "Teaching Assistant, CS 314",
            place: "University of Texas at Austin",
            startDate: "Jan 2025",
            endDate: "Present",
            bullets: [
                "Ran weekly lab sections and office hours for **60+** students learning data structures in Java",
                "Built an autograder test suite that cut assignment grading time by **50%** for the course staff",
                "Wrote review guides on recursion and graph algorithms used by students across 3 sections",
            ],
        },
        {
            role: "Web Developer (Part-time)",
            place: "Campus Recreation Center",
            startDate: "Sep 2024",
            endDate: "Dec 2024",
            bullets: [
                "Rebuilt the facility booking site in Next.js, cutting page load time from 4s to **1.2s**",
                "Integrated Google Calendar sync so **1,000+** monthly reservations appear in staff calendars automatically",
                "Documented the deployment process so new student developers could ship changes in their first week",
            ],
        },
    ],
    projects: [
        {
            name: "Trailhead — Hiking Route Planner",
            technologies: ["Next.js", "TypeScript", "PostGIS", "Docker"],
            place: "",
            startDate: "Jan 2026",
            endDate: "Present",
            bullets: [
                "Built a full-stack route planner that computes elevation-aware trails using PostGIS spatial queries",
                "Containerized the app with Docker Compose and set up a GitHub Actions pipeline that deploys on every merge",
                "Reached **300+** monthly users after launching on a regional hiking forum",
            ],
        },
        {
            name: "Raft Key-Value Store",
            technologies: ["Go", "gRPC"],
            place: "",
            startDate: "Sep 2025",
            endDate: "Dec 2025",
            bullets: [
                "Implemented leader election, log replication, and snapshotting from the Raft paper in Go",
                "Verified correctness under network partitions with a fault-injection test harness running **10,000+** scenarios",
                "Served **15k** writes per second on a 5-node cluster in benchmarks",
            ],
        },
        {
            name: "Lexer and Parser for a Toy Language",
            technologies: ["C++"],
            place: "",
            startDate: "Mar 2025",
            endDate: "May 2025",
            bullets: [
                "Wrote a hand-built lexer and recursive descent parser producing an abstract syntax tree for a C-like language",
                "Added error recovery that reports multiple syntax errors per run with line and column numbers",
                "Applied formal language theory from coursework to design an unambiguous grammar",
            ],
        },
    ],
    // Deliberately out of order with a repeated category, to exercise orderSkills
    skills: [
        { category: "Others", items: ["Figma", "Agile/Scrum"] },
        { category: "Languages", items: ["Java", "Python", "Go", "C++"] },
        { category: "Languages", items: ["TypeScript", "SQL"] },
        { category: "Frameworks & Libraries", items: ["React", "Next.js", "Node.js", "Express", "Prisma"] },
        { category: "Databases, Cloud & Tools", items: ["PostgreSQL", "Redis", "Docker", "AWS", "Git", "GitHub Actions"] },
        { category: "CS Fundamentals", items: ["Data structures", "algorithms", "distributed systems", "operating systems"] },
    ],
};

const [templateId = "tech", outFile = "sample-resume.docx"] = process.argv.slice(2);
const template = templates[templateId];
if (!template) {
    throw new Error(`Unknown template "${templateId}". Available: ${Object.keys(templates).join(", ")}`);
}

Packer.toBuffer(template.render(sample)).then(buffer => {
    writeFileSync(outFile, buffer);
    console.log(`Wrote ${outFile}`);
});
