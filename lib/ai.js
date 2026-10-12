import { GoogleGenerativeAI } from '@google/generative-ai';
import { computeYearsOfExperience } from './utils';

const AI_API_KEY = process.env.AI_API_KEY;
// For dev safety, if key is missing or dummy, we fallback to mock
const USE_MOCK = !AI_API_KEY || AI_API_KEY === 'your_ai_api_key_here';

const genAI = USE_MOCK ? null : new GoogleGenerativeAI(AI_API_KEY);

/**
 * Generates a structured job description based on parameters.
 */
export async function generateJobDescription(params) {
  if (USE_MOCK) {
    // ... existing mock logic
    const skillsList = params.skills ? params.skills.join(', ') : 'relevant technologies';
    return `### About the Role\nWe are looking for a ${params.experienceLevel} ${params.title} to join our ${params.department} team.\n\n### What you bring\n- Strong background in ${skillsList}.`;
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `Write a professional job description for a ${params.experienceLevel} ${params.title} in the ${params.department} department. 
    Required skills: ${params.skills?.join(', ')}. 
    Responsibilities: ${params.responsibilities?.join(', ')}.
    Format as Markdown.`;

    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (e) {
    console.error("AI Error:", e);
    return "Failed to generate job description via AI.";
  }
}

/**
 * Years of professional experience from a candidate experience list.
 * @param {Array} experience - CandidateProfile.experience entries
 * @returns {number} Total years (1 decimal)
 */
export { computeYearsOfExperience };

// Fallback heuristic so the product stays fully functional without an AI key.
// Skill overlap drives the score; strengths/gaps are derived from real data.
function heuristicMatch(job, candidate) {
  const jobSkills = (job.skills || []).map((s) => String(s).toLowerCase().trim()).filter(Boolean);
  const candSkills = new Set((candidate.skills || []).map((s) => String(s).toLowerCase().trim()));
  const matched = jobSkills.filter((s) => candSkills.has(s));
  const missing = jobSkills.filter((s) => !candSkills.has(s)).slice(0, 4);

  const experience = candidate.experience || [];
  const years = computeYearsOfExperience(experience);
  const latest = experience.find((e) => e.current) || experience[0];
  const relevant = experience.some((e) => /saas|b2b|platform|software|tech/i.test(`${e.company || ''} ${e.title || ''} ${e.description || ''}`));

  const jobLocation = (job.location || '').toLowerCase().trim();
  const candidateLocation = (candidate.location || '').toLowerCase().trim();

  const strengths = [];
  if (matched.length > 0) strengths.push(`${matched.length} of ${jobSkills.length} required skills matched (${matched.join(', ')})`);
  if (years > 0 && latest) strengths.push(`${years} yrs ${latest.title}${latest.company ? ` at ${latest.company}` : ''}`);
  else if (candSkills.size > 0) strengths.push('Relevant skills listed on profile');
  if (relevant) strengths.push('Relevant product/tech company experience');

  const gaps = [];
  if (missing.length > 0) gaps.push(`Missing required skill${missing.length > 1 ? 's' : ''}: ${missing.join(', ')}`);
  if (jobLocation && candidateLocation && jobLocation !== candidateLocation) gaps.push('May require relocation');

  const ratio = jobSkills.length ? matched.length / jobSkills.length : 0;
  const score = Math.max(30, Math.min(97, Math.round(45 + ratio * 50)));
  const recommendation =
    score >= 75
      ? 'Strong technical match based on the candidate\u2019s experience and required skills.'
      : score >= 50
        ? 'Moderate fit \u2014 review in an interview to gauge experience depth.'
        : 'The candidate meets few of the required skills \u2014 review carefully before advancing.';

  return {
    score,
    strengths,
    gaps,
    recommendation,
    reasoning: `Heuristic evaluation (no AI_API_KEY configured). Score driven by ${jobSkills.length} required skill(s), ${matched.length} matched. ${recommendation}`,
  };
}

function normalizeAIBreakdown(input) {
  const asList = (value) =>
    Array.isArray(value) ? value.map((s) => String(s).trim()).filter(Boolean).slice(0, 6) : [];
  const score = Number(input?.score);
  return {
    score: Number.isFinite(score) ? Math.max(0, Math.min(100, Math.round(score))) : 50,
    strengths: asList(input?.strengths),
    gaps: asList(input?.gaps),
    recommendation: String(input?.recommendation || '').trim() || 'No recommendation provided.',
  };
}

/**
 * Calculates a match score between a candidate profile and job requirements.
 * @param {Object} job - The job document
 * @param {Object} candidate - The candidate profile document
 * @returns {Promise<Object>} { score: Number, strengths: [String], gaps: [String], recommendation: String, reasoning: String }
 */
export async function calculateMatchScore(job, candidate) {
  if (USE_MOCK) {
    return heuristicMatch(job, candidate);
  }

  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: { responseMimeType: "application/json" }
    });

    const prompt = `
    You are an expert technical recruiter evaluating a candidate for a job.
    
    JOB REQUIREMENTS:
    Title: ${job.title}
    Department: ${job.department}
    Skills: ${(job.skills || []).join(', ')}
    Experience Level: ${job.experienceLevel}
    Location: ${job.location}
    
    CANDIDATE PROFILE:
    Skills: ${(candidate.skills || []).join(', ')}
    Experience: ${JSON.stringify(candidate.experience || [])}
    Education: ${JSON.stringify(candidate.education || [])}
    Location: ${candidate.location || 'Not specified'}
    
    Task: Score how well the candidate fits the job from 0 to 100. List concrete strengths
    (skills, experience length, relevant industry) and potential gaps or risks (missing skills,
    relocation). Give a one-sentence recommendation for the recruiter. You only advise: the
    recruiter makes the final hiring decision.
    
    Respond STRICTLY with JSON:
    {
      "score": 85,
      "strengths": ["4 years React experience", "JavaScript proficiency"],
      "gaps": ["No AWS experience"],
      "recommendation": "Strong technical match based on the candidate's experience and required skills."
    }
    `;

    const result = await model.generateContent(prompt);
    const json = JSON.parse(result.response.text());
    const breakdown = normalizeAIBreakdown(json);

    return {
      ...breakdown,
      reasoning: breakdown.recommendation,
    };
  } catch (e) {
    console.error("AI Score Error:", e);
    return heuristicMatch(job, candidate);
  }
}

// ---------------------------------------------------------------------------
// CV / RESUME → PROFILE EXTRACTION
// ---------------------------------------------------------------------------
// Uploading a CV is one of HireFlow's signature migrations. We turn resume text
// into structured profile suggestions (skills, experience, education, summary)
// that the candidate reviews and merges into their profile. Without an AI key the
// product still works: a deterministic text parser drives the same flow.

const SECTION_RE = /^(work experience|experience|employment history|education|skills?|technologies|tools|expertise|summary|professional summary|about me|certifications)/i;
const SECTION_WORDS = new Set(['summary', 'professional summary', 'skills', 'skill', 'technologies', 'tools', 'expertise', 'education', 'experience', 'work experience', 'employment history', 'about me', 'certifications', 'projects', 'awards']);

// "Education: BSc Computer Science, Rochester Institute of Technology" — a
// section header with content on the same line. Header can be any length; only
// the part after the colon is treated as section content.
const INLINE_SECTION_RE = /^(work experience|employment history|professional summary|about me|summary|education|skills?|technologies|tools|expertise|certifications)\s*:\s*(.+)/i;

function sectionKeyFor(header) {
  const lower = String(header || '').toLowerCase();
  if (/education/i.test(lower)) return 'education';
  if (/skill|technolog|tool|expertise/i.test(lower)) return 'skills';
  if (/experience|employment/i.test(lower)) return 'experience';
  if (/summary|about/i.test(lower)) return 'summary';
  return null;
}

function splitCvSections(text) {
  const lines = String(text || '')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const sections = { summary: [], skills: [], experience: [], education: [], lead: [] };
  let current = 'lead';
  for (const line of lines) {
    const inline = line.match(INLINE_SECTION_RE);
    if (inline) {
      current = sectionKeyFor(inline[1]) || current;
      const content = inline[2].trim();
      if (content) sections[current].push(content);
      continue;
    }
    const matchesSection = SECTION_RE.test(line) && line.length < 45;
    if (matchesSection) {
      current = sectionKeyFor(line) || current;
      continue;
    }
    sections[current] = sections[current] || [];
    sections[current].push(line);
  }
  return sections;
}

function parseSkillLine(line) {
  const cleaned = line
    .replace(/^[•\-–—*·]\s*/, '')
    .replace(/^skills?:?\s*/i, '');
  return cleaned
    .split(/[,•|;&/]+/)
    .map((token) => token.trim().replace(/^[-–—·]\s*/, '').trim())
    .filter((token) => token.length >= 2 && token.length <= 60 && !SECTION_WORDS.has(token.toLowerCase()));
}

// "- React, Next.js, TypeScript" bullets → keep each bullet as one skill.
function bulletSkillTokens(line) {
  const bullets = line.split(/\s+[•·]\s+|(?<=^|\n)\s*[-–—]\s+/);
  const out = [];
  for (const part of bullets) {
    const trimmed = part.trim().replace(/^[-–—•·]\s*/, '');
    if (!trimmed) continue;
    if (/[,;|&]/.test(trimmed)) {
      out.push(...parseSkillLine(trimmed));
    } else if (trimmed.length >= 2) {
      out.push(trimmed);
    }
  }
  return out;
}

const YEAR_RANGE_RE = /(\d{4})\s*[-–—to]+\s*(present|current|now|today|\d{4})/i;

function parseExperienceLine(line, results) {
  // "Senior Frontend Engineer @ Vega Software, 2019 - Present"
  const atMatch = line.match(/^(.+?)\s+@\s+(.+?),\s*(\d{4})\s*[-–—to]+\s*(present|current|now|today|\d{4})/i);
  if (atMatch) {
    const startYear = Number(atMatch[3]);
    const current = /present|current|now|today/i.test(atMatch[4]);
    const endYear = current ? null : Number(atMatch[4]);
    results.push({
      title: atMatch[1].trim(),
      company: atMatch[2].trim(),
      startDate: `${startYear}-01-01`,
      endDate: current ? '' : `${endYear}-01-01`,
      current,
    });
    return;
  }
  // "Senior Frontend Engineer, Vega Software, 2019-2021"
  const commaMatch = line.match(/^(.+?),\s*(.+?),\s*(\d{4})\s*[-–—to]+\s*(present|current|now|today|\d{4})/i);
  if (commaMatch) {
    const startYear = Number(commaMatch[3]);
    const current = /present|current|now|today/i.test(commaMatch[4]);
    const endYear = current ? null : Number(commaMatch[4]);
    results.push({
      title: commaMatch[1].trim(),
      company: commaMatch[2].trim(),
      startDate: `${startYear}-01-01`,
      endDate: current ? '' : `${endYear}-01-01`,
      current,
    });
    return;
  }
  // Bare year-range line — treat text before the range as a role.
  const bareMatch = line.match(/^(.+?)\s+(\d{4})\s*[-–—to]+\s*(present|current|now|today|\d{4})/i);
  if (bareMatch) {
    const startYear = Number(bareMatch[2]);
    const current = /present|current|now|today/i.test(bareMatch[3]);
    const endYear = current ? null : Number(bareMatch[3]);
    results.push({
      title: bareMatch[1].trim().replace(/[,:|-]+$/, ''),
      company: '',
      startDate: `${startYear}-01-01`,
      endDate: current ? '' : `${endYear}-01-01`,
      current,
    });
  }
}

const DEGREE_RE = /^(b\.?s\.?c?\.?|b\.?a\.?|m\.?s\.?c?\.?|m\.?a\.?|m\.?b\.?a\.?|ph\.?d\.?|bachelor|master|doctorate|associate|diploma|degree)\b/i;

function parseEducationLine(line, results) {
  const raw = line.replace(/^[•\-–—·]\s*/, '');
  // Anchored at the start so sentence-like lead lines ("…design systems.")
  // don't false-positive on a stray "ms" token inside a word.
  if (!DEGREE_RE.test(raw)) return;
  const parts = raw.split(',').map((part) => part.trim()).filter(Boolean);
  // "BSc Computer Science, Rochester Institute of Technology, 2016 - 2020"
  const noYears = parts.filter((part) => !YEAR_RANGE_RE.test(part));
  const degree = noYears[0] || '';
  const institution = noYears.slice(1).join(', ');
  results.push({
    degree,
    fieldOfStudy: '',
    institution: institution || '',
    startDate: '',
    endDate: '',
  });
}

function normalizeExperienceDates(entry) {
  const iso = (v, fill) => {
    if (!v) return fill;
    const d = new Date(v);
    return Number.isNaN(d.getTime()) ? fill : d.toISOString().slice(0, 10);
  };
  return {
    ...entry,
    startDate: iso(entry.startDate, ''),
    endDate: iso(entry.endDate, ''),
  };
}

// Deterministic, dependency-free resume text → structured profile suggestions.
// Used as the mock fallback and as the pre-filter before handing text to an LLM.
export function heuristicResumeParse(text) {
  const sections = splitCvSections(text);

  const skills = [];
  const seen = new Set();
  for (const line of sections.skills || []) {
    for (const token of bulletSkillTokens(line)) {
      const lower = token.toLowerCase();
      if (!SUGGESTION_STOP_WORDS.has(lower) && !seen.has(lower)) {
        seen.add(lower);
        skills.push(token);
      }
      if (skills.length >= 40) break;
    }
    if (skills.length >= 40) break;
  }

  const experience = [];
  for (const line of sections.experience || []) {
    parseExperienceLine(line, experience);
    if (experience.length >= 10) break;
  }

  const education = [];
  const educationLines = [...(sections.education || []), ...(sections.lead || [])];
  for (const line of educationLines) {
    parseEducationLine(line, education);
    if (education.length >= 5) break;
  }

  const leadSummary = (sections.lead || []).filter(
    (line) => line.length > 30 && !/^[\w.\- ]+@[\w.\-]+\.[a-z]+$/i.test(line) && !/^\d[\d\s().-]*$/.test(line)
  );
  const summary = (sections.summary || []).slice(0, 2).join(' ').slice(0, 600) || leadSummary[0] || '';
  const headline = (sections.lead || []).find(
    (line) => line.length < 80 && !SECTION_RE.test(line) && !/^[\w.\- ]+@[\w.\-]+\.[a-z]+$/i.test(line)
  ) || '';

  return {
    skills: Array.from(new Set(skills)).slice(0, 40),
    experience: experience.slice(0, 10).map(normalizeExperienceDates),
    education: education.slice(0, 5),
    summary,
    headline,
  };
}

const SUGGESTION_STOP_WORDS = new Set([
  'summary', 'experience', 'education', 'skills', 'technologies', 'tools',
  'about', 'work', 'references', 'certifications', 'projects', 'availability',
]);

function normalizeResumeSuggestion(input) {
  const asList = (value, cap) => (Array.isArray(value) ? value : []).map((item) => item).slice(0, cap);
  const asObj = (entry) => {
    if (!entry || typeof entry !== 'object') return null;
    return {
      title: String(entry.title || '').trim(),
      company: String(entry.company || '').trim(),
      startDate: String(entry.startDate || '').trim(),
      endDate: String(entry.endDate || '').trim(),
      current: Boolean(entry.current),
    };
  };
  return {
    skills: asList(input?.skills, 40).map((s) => String(s).trim()).filter(Boolean),
    experience: asList(input?.experience, 10).map(asObj).filter(Boolean),
    education: asList(input?.education, 5)
      .map((e) => ({
        institution: String(e?.institution || '').trim(),
        degree: String(e?.degree || '').trim(),
        fieldOfStudy: String(e?.fieldOfStudy || '').trim(),
        startDate: String(e?.startDate || '').trim(),
        endDate: String(e?.endDate || '').trim(),
      }))
      .filter((e) => e.institution || e.degree),
    summary: String(input?.summary || '').trim().slice(0, 600),
    headline: String(input?.headline || '').trim().slice(0, 100),
  };
}

/**
 * Extracts structured profile suggestions (skills, experience, education,
 * summary, headline) from raw resume text.
 * @param {string} text - Plain-text resume content
 * @returns {Promise<Object>} { skills, experience, education, summary, headline, source }
 */
export async function extractResumeInfo(text) {
  const clean = String(text || '').trim();
  if (!clean) {
    return normalizeResumeSuggestion({ skills: [], experience: [], education: [] });
  }

  if (USE_MOCK) {
    return { ...heuristicResumeParse(clean), source: 'heuristic' };
  }

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: { responseMimeType: 'application/json' },
    });
    const prompt = `You are parsing a candidate's resume into a structured professional profile.
    Resume text:
    ${clean.slice(0, 12000)}
    Respond STRICTLY with JSON:
    {
      "skills": ["React", "TypeScript"],
      "experience": [{"title":"Senior Frontend Engineer","company":"Acme","startDate":"2019-01-01","endDate":"","current":true}],
      "education": [{"institution":"Rochester IT","degree":"BSc Computer Science","fieldOfStudy":"","startDate":"","endDate":""}],
      "summary": "One or two sentences.",
      "headline": "Short professional headline"
    }
    Only include details actually present in the resume.`;
    const result = await model.generateContent(prompt);
    const json = JSON.parse(result.response.text());
    const normalized = normalizeResumeSuggestion(json);
    // Fall back to the deterministic parser for any section the model left empty.
    const heuristic = heuristicResumeParse(clean);
    return {
      skills: normalized.skills.length ? normalized.skills : heuristic.skills,
      experience: normalized.experience.length ? normalized.experience : heuristic.experience,
      education: normalized.education.length ? normalized.education : heuristic.education,
      summary: normalized.summary || heuristic.summary,
      headline: normalized.headline || heuristic.headline,
      source: 'ai',
    };
  } catch (e) {
    console.error('AI Resume Parse Error:', e);
    return { ...heuristicResumeParse(clean), source: 'heuristic' };
  }
}
