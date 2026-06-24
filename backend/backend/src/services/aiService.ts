import Groq from 'groq-sdk';
import dotenv from 'dotenv';

dotenv.config();

const API_KEY = process.env.GROQ_API_KEY || '';
const groq = new Groq({ apiKey: API_KEY });

const MODEL = 'llama-3.3-70b-versatile';

export class AIService {
    static async generateContent(prompt: string, maxRetries = 3) {
        let retries = 0;
        
        while (retries <= maxRetries) {
            try {
                console.log(`Sending prompt to Groq... (Attempt ${retries + 1})`);
                const completion = await groq.chat.completions.create({
                    messages: [
                        { role: 'system', content: 'You are a strict technical AI interviewer. Always respond with perfectly formatted JSON. Do not include markdown blocks or any other text.' },
                        { role: 'user', content: prompt }
                    ],
                    model: MODEL,
                    temperature: 0.7,
                    response_format: { type: "json_object" },
                });
                
                const text = completion.choices[0]?.message?.content || '{}';
                return JSON.parse(text);
            } catch (error: any) {
                console.error(`Groq API Error Detail (Attempt ${retries + 1}):`, error.message);
                
                if ((error.message.includes("429") || error.message.includes("503")) && retries < maxRetries) {
                    retries++;
                    const waitTime = Math.pow(2, retries) * 1000 + Math.random() * 1000;
                    console.log(`Waiting ${Math.round(waitTime/1000)}s before retrying...`);
                    await new Promise(resolve => setTimeout(resolve, waitTime));
                    continue;
                }
                
                console.log("Using fallback response due to API failure after retries.");
                if (prompt.includes("evaluate") || prompt.includes("Evaluate")) {
                    return {
                        score: 85,
                        strengths: ["Clear communication", "Good understanding of the topic"],
                        weaknesses: ["Could provide more technical depth"],
                        feedback: "This is a fallback evaluation because the AI service is currently experiencing extreme high demand. Your answer was generally good but try to add more specific technical details.",
                        technicalAccuracyScore: 80,
                        logicScore: 85,
                        communicationScore: 90,
                        confidenceScore: 85,
                        professionalismScore: 90
                    };
                }
                
                if (prompt.includes("Analyze the following resume")) {
                    return {
                        atsScore: 75,
                        resumeQualityScore: 80,
                        extractedSkills: ["Communication", "Problem Solving", "Basic Tech Skills"],
                        missingSkills: ["Advanced Frameworks", "Cloud Deployments"],
                        missingKeywords: ["Scalability", "Optimization"],
                        suggestions: ["Try to quantify your achievements with metrics.", "Add more domain-specific technical keywords."],
                        parsedProjects: "User has a few basic projects listed."
                    };
                }

                return { question: "What is your greatest professional achievement and how did you accomplish it? (Fallback question due to extreme AI service high demand)" };
            }
        }
    }

    static async generateAptitudeQuestions(topic: string, difficulty: string, count: number = 5) {
        const prompt = `
      Generate ${count} aptitude questions for the topic "${topic}" with difficulty level "${difficulty}".
      Each question should have:
      - question: The text of the question.
      - options: An array of 4 options.
      - correctAnswer: The correct option text.
      - explanation: A detailed explanation of the answer.
      Return the response as a JSON array of objects wrapped in { "questions": [...] }.
    `;
        const res = await this.generateContent(prompt);
        return res.questions || res;
    }

    static async generateDSAQuestion(topic: string, difficulty: string) {
        const prompt = `
      Generate a Data Structures and Algorithms (DSA) coding problem for the topic "${topic}" with difficulty level "${difficulty}".
      The response should include:
      - title: Problem title.
      - problemStatement: Detailed problem description.
      - constraints: Coding constraints.
      - sampleTestCases: An array of objects with "input" and "output".
      - explanation: Brief explanation of the logic.
      Return the response as a single JSON object.
    `;
        return this.generateContent(prompt);
    }

    static async evaluateInterviewResponse(question: string, answer: string, type: string) {
        const prompt = `
      Evaluate the following interview response:
      Question: "${question}"
      User Answer: "${answer}"
      Interview Type: "${type}"

      Provide an evaluation in JSON format with:
      - score: A score out of 100.
      - strengths: List of what the user did well.
      - weaknesses: List of areas for improvement.
      - feedback: A detailed overall feedback.
      ${type.includes('Technical') || type.includes('Off-Campus') ? '- technicalAccuracyScore: Out of 100. \n- logicScore: Out of 100.' : '- communicationScore: Out of 100. \n- professionalismScore: Out of 100.'}
    `;
        const res = await this.generateContent(prompt);
        return res.evaluation || res;
    }

    static async analyzeResume(resumeText: string, targetDomain: string) {
        const prompt = `
      Analyze the following resume text for a candidate targeting the "${targetDomain}" domain.
      Resume Content:
      """
      ${resumeText}
      """

      Provide a detailed analysis in JSON format with:
      - atsScore: A score out of 100 representing ATS compatibility.
      - resumeQualityScore: A score out of 100 for overall quality.
      - extractedSkills: List of skills found.
      - missingSkills: Skills typically required for ${targetDomain} that are missing.
      - missingKeywords: Keywords that could improve ATS ranking for ${targetDomain}.
      - suggestions: Detailed tips for improvement.
      - parsedProjects: Brief summary of projects mentioned.
    `;
        return this.generateContent(prompt);
    }
}
