const pdf = require('pdf-parse');
import mammoth from 'mammoth';

export class ResumeService {
    static async parsePDF(buffer: Buffer): Promise<string> {
        try {
            const data = await pdf(buffer);
            return data.text;
        } catch (error) {
            console.error('PDF Parsing Error:', error);
            throw new Error('Failed to parse PDF resume');
        }
    }

    static async parseDOCX(buffer: Buffer): Promise<string> {
        try {
            const result = await mammoth.extractRawText({ buffer });
            return result.value;
        } catch (error) {
            console.error('DOCX Parsing Error:', error);
            throw new Error('Failed to parse DOCX resume');
        }
    }

    static async extractText(buffer: Buffer, mimetype: string): Promise<string> {
        if (mimetype === 'application/pdf') {
            return this.parsePDF(buffer);
        } else if (
            mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
            mimetype === 'application/msword'
        ) {
            return this.parseDOCX(buffer);
        } else {
            throw new Error('Unsupported file format. Please upload PDF or DOCX.');
        }
    }
}
