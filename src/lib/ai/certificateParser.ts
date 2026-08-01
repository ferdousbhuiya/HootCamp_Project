import { callAIWithFallback } from './unified';

export interface CertificateMetadata {
  title: string;
  issuer: string;
  issueDate?: string;
  expiryDate?: string;
  credentialId?: string;
  verificationUrl?: string;
  skills: string[];
}

export async function extractCertificateMetadata(text: string): Promise<CertificateMetadata> {
  const prompt = `Extract certificate information from this text. Return a JSON object with:
- title: certificate name/title
- issuer: organization that issued the certificate
- issueDate: date issued (YYYY-MM-DD format if possible)
- expiryDate: expiration date (YYYY-MM-DD format if possible)
- credentialId: certificate ID or credential number
- verificationUrl: any URL mentioned for verification
- skills: array of skills/technologies covered

Certificate text:
${text}

Return ONLY valid JSON object. If a field is not found, return empty string or empty array.`;

  const result = await callAIWithFallback(prompt);
  let cleaned = '';
  try {
    cleaned = result.replace(/```json/gi, '').replace(/```/g, '').trim();
    const json: any = JSON.parse(cleaned);
    
    return {
      title: json?.title || '',
      issuer: json?.issuer || '',
      issueDate: json?.issueDate || '',
      expiryDate: json?.expiryDate || '',
      credentialId: json?.credentialId || '',
      verificationUrl: json?.verificationUrl || '',
      skills: Array.isArray(json?.skills) ? json.skills : [],
    };
  } catch (error) {
    console.error('Failed to parse certificate metadata JSON:', error);
    return {
      title: '',
      issuer: '',
      issueDate: '',
      expiryDate: '',
      credentialId: '',
      verificationUrl: '',
      skills: [],
    };
  }
}
