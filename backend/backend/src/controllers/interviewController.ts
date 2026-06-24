import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { AIService } from '../services/aiService';
import { supabase } from '../config/supabase';

export const startInterview = async (req: AuthRequest, res: Response) => {
    const { type, domain } = req.body; // type: 'Technical' | 'HR' | 'Off-Campus'

    try {
        let prompt = `Generate a ${type} interview question ${domain ? `for the domain ${domain}` : ''}. Return as JSON: { "question": "..." }`;
        
        if (type === 'on-campus') {
            prompt = `You are starting an on-campus placement interview. Round 1 is Aptitude. Generate a medium difficulty Aptitude question. Return as JSON: { "question": "..." }`;
        }

        const { question } = await AIService.generateContent(prompt);

        // 2. Create the interview record in DB
        const { data, error } = await supabase
            .from('interviews')
            .insert({
                user_id: req.user.id,
                type,
                domain,
                transcript: [{ question, answer: null, feedback: null }],
            })
            .select()
            .single();

        if (error) {
            console.error("Supabase insert error in startInterview:", error);
            return res.status(500).json({ error: error.message });
        }

        res.json({ interviewId: data.id, currentQuestion: question });
    } catch (err) {
        console.error("Failed to start interview catch block:", err);
        res.status(500).json({ error: 'Failed to start interview' });
    }
};

export const submitInterviewAnswer = async (req: AuthRequest, res: Response) => {
    const { interviewId, answer } = req.body;

    try {
        // 1. Get the current interview state
        const { data: interview, error: fetchError } = await supabase
            .from('interviews')
            .select('*')
            .eq('id', interviewId)
            .single();

        if (fetchError || !interview) {
            return res.status(404).json({ error: 'Interview not found' });
        }

        const transcript = interview.transcript as any[];
        const currentStep = transcript.find((t) => t.answer === null);

        if (!currentStep) {
            return res.status(400).json({ error: 'Interview is already finished' });
        }

        // 2. Evaluate the answer
        const evaluation = await AIService.evaluateInterviewResponse(currentStep.question, answer, interview.type);

        // 3. Update the transcript
        currentStep.answer = answer;
        currentStep.evaluation = evaluation;

        // 4. Decide if more questions should be generated
        let nextQuestion = null;
        const limit = interview.type === 'on-campus' ? 11 : 5;
        
        if (transcript.length < limit) {
            let prompt = `Based on the interview so far, generate the next logical ${interview.type} question. Previous Transcript: ${JSON.stringify(transcript)}. Return as JSON: { "question": "..." }`;
            
            if (interview.type === 'Off-Campus') {
                prompt = `Based on the interview so far, generate the next highly technical question. 
                RULE 1: You MUST ONLY ask strictly technical questions related to ${interview.domain}.
                RULE 2: DO NOT ask any HR, behavioral, or college-related questions under any circumstances.
                Previous Transcript: ${JSON.stringify(transcript)}. 
                Return as JSON: { "question": "..." }`;
            } else if (interview.type === 'on-campus') {
                const len = transcript.length; // Number of questions asked so far (including the one just answered)
                let phase = "";
                let transition = "";
                
                if (len < 3) {
                    phase = "Aptitude";
                } else if (len === 3) {
                    phase = "Data Structures and Algorithms (DSA)";
                    transition = "Great, that concludes the Aptitude round. Let's move on to Data Structures and Algorithms. ";
                } else if (len < 5) {
                    phase = "Data Structures and Algorithms (DSA)";
                } else if (len === 5) {
                    phase = "Database Management Systems (DBMS)";
                    transition = "Let's move to Database concepts. ";
                } else if (len < 7) {
                    phase = "Database Management Systems (DBMS)";
                } else if (len === 7) {
                    phase = "Operating Systems (OS)";
                    transition = "Moving on to Operating Systems. ";
                } else if (len < 9) {
                    phase = "Operating Systems (OS)";
                } else if (len === 9) {
                    phase = "HR and Behavioral";
                    transition = "That concludes the technical rounds. Let's wrap up with a few HR questions. ";
                } else {
                    phase = "HR and Behavioral";
                }
                
                prompt = `You are conducting an on-campus placement interview. The current round is: ${phase}. 
                ${transition ? `The previous round just ended. Start your question with: "${transition}"` : ''}
                Based on the interview so far, generate the NEXT question specifically for the ${phase} round. Do not repeat previous questions.
                Previous Transcript: ${JSON.stringify(transcript)}. 
                Return as JSON: { "question": "..." }`;
            }

            const nextQResponse = await AIService.generateContent(prompt);
            nextQuestion = nextQResponse.question;
            transcript.push({ question: nextQuestion, answer: null, evaluation: null });
        }

        // 5. Update DB
        const updateData: any = { transcript };

        // If finished, calculate overall scores
        if (nextQuestion === null) {
            const allEvaluations = transcript.map((t) => t.evaluation).filter(Boolean);
            
            const getEvalKey = (evalObj: any, key: string) => {
                const obj = evalObj.evaluation ? evalObj.evaluation : evalObj;
                return obj[key] || 0;
            };

            updateData.score = Math.round(allEvaluations.reduce((acc, curr) => acc + getEvalKey(curr, 'score'), 0) / allEvaluations.length) || 0;

            if (interview.type === 'Technical' || interview.type === 'Off-Campus' || interview.type === 'on-campus') {
                updateData.technical_accuracy_score = Math.round(allEvaluations.reduce((acc, curr) => acc + getEvalKey(curr, 'technicalAccuracyScore'), 0) / allEvaluations.length) || 0;
                updateData.problem_solving_score = Math.round(allEvaluations.reduce((acc, curr) => acc + getEvalKey(curr, 'logicScore'), 0) / allEvaluations.length) || 0;
            } else {
                updateData.communication_score = Math.round(allEvaluations.reduce((acc, curr) => acc + getEvalKey(curr, 'communicationScore'), 0) / allEvaluations.length) || 0;
                updateData.confidence_score = Math.round(allEvaluations.reduce((acc, curr) => acc + getEvalKey(curr, 'confidenceScore'), 0) / allEvaluations.length) || 0;
            }
        }

        const { error: updateError } = await supabase
            .from('interviews')
            .update(updateData)
            .eq('id', interviewId);

        if (updateError) {
            return res.status(500).json({ error: updateError.message });
        }

        res.json({
            evaluation,
            nextQuestion,
            isFinished: nextQuestion === null,
            interviewId,
        });
    } catch (err) {
        console.error('Interview Progress Error:', err);
        res.status(500).json({ error: 'Failed to process interview answer' });
    }
};

export const getInterviewReport = async (req: AuthRequest, res: Response) => {
    const { interviewId } = req.params;

    try {
        const { data, error } = await supabase
            .from('interviews')
            .select('*')
            .eq('id', interviewId)
            .eq('user_id', req.user.id)
            .single();

        if (error || !data) {
            return res.status(404).json({ error: 'Interview report not found' });
        }

        const transcript = data.transcript || [];
        
        const allStrengths = new Set<string>();
        const allWeaknesses = new Set<string>();
        let overallFeedback = data.feedback || "You completed the interview. Review your individual answers below to see specific feedback on your performance.";

        const reviews = transcript.filter((t: any) => t.answer).map((t: any) => {
            let evalData = t.evaluation || {};
            if (evalData.evaluation) evalData = evalData.evaluation; // Unwrap legacy nested evaluation
            
            if (evalData.strengths) evalData.strengths.forEach((s: string) => allStrengths.add(s));
            if (evalData.weaknesses) evalData.weaknesses.forEach((w: string) => allWeaknesses.add(w));

            return {
                question: t.question,
                answer: t.answer || "No answer provided",
                score: Math.round((evalData.score || 0) / 10),
                feedback: evalData.feedback || "No feedback available"
            };
        });

        const calculatedScore = reviews.length > 0 
            ? Math.round(reviews.reduce((acc: number, curr: any) => acc + curr.score, 0) / reviews.length)
            : 0;

        const finalScore = data.score ? Math.round(data.score / 10) : calculatedScore;

        const formattedResult = {
            score: finalScore,
            strengths: allStrengths.size > 0 ? Array.from(allStrengths).slice(0, 5) : ["Good participation", "Clear communication attempt"],
            improvements: allWeaknesses.size > 0 ? Array.from(allWeaknesses).slice(0, 5) : ["Consider providing more detailed technical examples"],
            suggestion: overallFeedback,
            reviews: reviews
        };

        res.json(formattedResult);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch interview report' });
    }
};

export const getInterview = async (req: AuthRequest, res: Response) => {
    const { interviewId } = req.params;

    try {
        const { data, error } = await supabase
            .from('interviews')
            .select('*')
            .eq('id', interviewId)
            .eq('user_id', req.user.id)
            .single();

        if (error || !data) {
            return res.status(404).json({ error: 'Interview not found' });
        }

        res.json(data);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch interview' });
    }
};
