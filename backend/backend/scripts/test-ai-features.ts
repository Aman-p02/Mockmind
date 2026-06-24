import "dotenv/config";
import { AIService } from "../src/services/aiService";

async function testAptitude() {
    console.log("\n--- Testing Aptitude Question Generation ---");
    try {
        const questions = await AIService.generateAptitudeQuestions("Probability", "Medium", 2);
        console.log("✅ Success! Generated JSON:");
        console.log(JSON.stringify(questions, null, 2));
    } catch (error) {
        console.error("❌ Aptitude Generation Failed:", error);
    }
}

async function testDSA() {
    console.log("\n--- Testing DSA Question Generation ---");
    try {
        const question = await AIService.generateDSAQuestion("Binary Search Tree", "Hard");
        console.log("✅ Success! Generated JSON:");
        console.log(JSON.stringify(question, null, 2));
    } catch (error) {
        console.error("❌ DSA Generation Failed:", error);
    }
}

async function testEvaluation() {
    console.log("\n--- Testing Interview Evaluation ---");
    const question = "What is polymorphism in Object-Oriented Programming?";
    const answer = "Polymorphism allows objects of different classes to be treated as objects of a common superclass. The most common use is when a parent class reference is used to refer to a child class object.";

    try {
        const evaluation = await AIService.evaluateInterviewResponse(question, answer, "Technical");
        console.log("✅ Success! Generated Evaluation:");
        console.log(JSON.stringify(evaluation, null, 2));
    } catch (error) {
        console.error("❌ Evaluation Failed:", error);
    }
}

async function runAllTests() {
    console.log("🧪 Testing AI Features...");
    await testAptitude();
    await testDSA();
    await testEvaluation();
    console.log("\n✨ AI Feature tests complete!");
    process.exit(0);
}

runAllTests();
