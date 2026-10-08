import { GoogleGenerativeAI } from '@google/generative-ai';

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
 * Calculates a match score between a candidate profile and job requirements.
 * @param {Object} job - The job document
 * @param {Object} candidate - The candidate profile document
 * @returns {Promise<Object>} { score: Number, reasoning: String }
 */
export async function calculateMatchScore(job, candidate) {
  if (USE_MOCK) {
    return { score: 85, reasoning: "This is a mock score because AI_API_KEY is missing in .env.local." };
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
    
    CANDIDATE PROFILE:
    Skills: ${(candidate.skills || []).join(', ')}
    Experience: ${JSON.stringify(candidate.experience || [])}
    Education: ${JSON.stringify(candidate.education || [])}
    
    Task: Calculate a match score from 0 to 100 representing how well the candidate fits the job. 
    Provide a concise reasoning (2-3 bullet points) for the score.
    
    Respond STRICTLY with JSON matching this schema:
    {
      "score": 85,
      "reasoning": "- Strong match on skills\\n- Sufficient experience"
    }
    `;

    const result = await model.generateContent(prompt);
    const json = JSON.parse(result.response.text());
    
    return {
      score: json.score || 0,
      reasoning: json.reasoning || "No reasoning provided."
    };
  } catch (e) {
    console.error("AI Score Error:", e);
    return { score: 50, reasoning: "AI evaluation failed due to API error." };
  }
}
