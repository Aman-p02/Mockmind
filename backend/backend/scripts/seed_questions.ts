import { AIService } from '../src/services/aiService';
import { supabase } from '../src/config/supabase';

const categories = [
    { category: 'Aptitude', domain: null },
    { category: 'DSA', domain: 'dsa' },
    { category: 'DBMS', domain: null },
    { category: 'OS', domain: null },
    { category: 'HR', domain: 'hr' },
    { category: 'Technical', domain: 'frontend' },
    { category: 'Technical', domain: 'backend' },
    { category: 'Technical', domain: 'fullstack' },
    { category: 'Technical', domain: 'prompt-engineering' },
    { category: 'Technical', domain: 'devops' }
];

const generateBatch = async (category: string, domain: string | null) => {
    let topic = category;
    if (domain) {
        topic = domain;
    }
    
    const prompt = `Generate exactly 20 highly relevant and difficult interview questions for the topic: ${topic}. 
    Ensure a mix of Easy, Medium, and Hard difficulty.
    Return ONLY a valid JSON object with a key "questions" containing an array of objects.
    Example Format: { "questions": [{"difficulty": "Easy", "question_text": "..."}] }`;

    try {
        const response: any = await AIService.generateContent(prompt);
        let questions = response.questions || response;
        if (!Array.isArray(questions)) {
            questions = Object.values(questions)[0] || [];
        }
        return questions;
    } catch (e) {
        console.error(`Failed to generate for ${topic}`, e);
        return [];
    }
}

const seed = async () => {
    console.log("🚀 Starting DB Seeding with Supabase...");
    let totalInserted = 0;
    
    for (const cat of categories) {
        console.log(`\n⏳ Generating questions for ${cat.category} ${cat.domain ? `(${cat.domain})` : ''}...`);
        
        for (let i = 0; i < 5; i++) { // 5 batches of 20 = 100 questions per category
            console.log(`   Batch ${i + 1}/5...`);
            const batch = await generateBatch(cat.category, cat.domain);
            
            if (Array.isArray(batch) && batch.length > 0) {
                const data = batch.map((q: any) => ({
                    category: cat.category,
                    domain: cat.domain,
                    difficulty: q.difficulty || 'Medium',
                    question_text: q.question_text || q.question || 'N/A'
                })).filter(q => q.question_text && q.question_text !== 'N/A');
                
                if (data.length > 0) {
                    const { error } = await supabase.from('questions').insert(data);
                    if (error) {
                        console.error(`   ❌ Failed to insert:`, error.message);
                    } else {
                        totalInserted += data.length;
                        console.log(`   ✅ Inserted ${data.length} questions.`);
                    }
                }
            } else {
                console.log(`   ⚠️ Empty batch returned.`);
            }
            
            // Wait 2 seconds to avoid aggressive rate limiting
            await new Promise(r => setTimeout(r, 2000));
        }
    }
    
    console.log(`\n🎉 Seeding complete! Total questions inserted: ${totalInserted}`);
}

seed()
    .catch(console.error)
    .finally(() => {
        process.exit(0);
    });
