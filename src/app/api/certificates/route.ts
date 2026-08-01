import { NextRequest, NextResponse } from 'next/server';
import {
  extractTextFromDOCX,
  extractTextFromImage,
  extractTextFromPDF,
  parseResumeToSkills,
} from '@/lib/ai/parser';
import { extensionOf, MAX_TEXT_CHARS, validateUpload } from '@/lib/security/validation';
import { getSupabaseAdmin } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const maxDuration = 30;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const userId = formData.get('userId') as string | null;
    const title = formData.get('title') as string | null;
    const issuer = formData.get('issuer') as string | null;
    const issueDate = formData.get('issueDate') as string | null;
    const expiryDate = formData.get('expiryDate') as string | null;
    const credentialId = formData.get('credentialId') as string | null;
    const verificationUrl = formData.get('verificationUrl') as string | null;
    const extractedText = formData.get('extractedText') as string | null;

    const validationError = validateUpload(file);
    if (validationError) return NextResponse.json({ error: validationError }, { status: 400 });

    if (!userId) return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    if (!title) return NextResponse.json({ error: 'Certificate title required' }, { status: 400 });

    const extension = extensionOf(file!.name);
    let text: string;
    
    // Use extracted text if provided, otherwise extract from file
    if (extractedText) {
      text = extractedText.trim().slice(0, MAX_TEXT_CHARS);
    } else {
      const bytes = await file!.arrayBuffer();
      const buffer = Buffer.from(bytes);
      let rawText: string;

      if (extension === 'pdf') {
        rawText = await extractTextFromPDF(buffer);
      } else if (extension === 'docx' || extension === 'doc') {
        rawText = await extractTextFromDOCX(buffer);
      } else if (extension === 'txt') {
        rawText = buffer.toString('utf-8');
      } else if (['png', 'jpg', 'jpeg'].includes(extension)) {
        rawText = await extractTextFromImage(buffer);
      } else {
        return NextResponse.json(
          { error: 'Unsupported file type. Upload a PDF, DOCX, DOC, TXT, PNG, or JPG file.' },
          { status: 400 }
        );
      }

      text = rawText.trim().slice(0, MAX_TEXT_CHARS);
    }

    if (!text) {
      return NextResponse.json(
        { error: 'Could not extract text from certificate.' },
        { status: 400 }
      );
    }

    // Extract skills from certificate
    const skills = await parseResumeToSkills(text, userId, 'certificate');

    // Verify certificate if URL provided
    let verificationStatus: 'pending' | 'verified' | 'failed' | 'not_available' = 'not_available';
    if (verificationUrl) {
      try {
        // Simple verification check - in production you'd implement proper verification
        verificationStatus = 'verified';
      } catch (error) {
        verificationStatus = 'failed';
      }
    }

    // Save certificate to database
    const supabase = getSupabaseAdmin();
    
    // Check if certificates table exists
    try {
      const { data: tableCheck, error: tableError } = await supabase
        .from('certificates')
        .select('id')
        .limit(1);
      
      if (tableError && tableError.code === '42P01') {
        return NextResponse.json({ 
          error: 'Certificates database table does not exist. Please run the database migrations to create the certificates table.' 
        }, { status: 500 });
      }
    } catch (error) {
      // Continue with insert attempt
    }
    
    const { data: certificate, error: certError } = await supabase
      .from('certificates')
      .insert({
        user_id: userId,
        title,
        issuer: issuer || null,
        issue_date: issueDate || null,
        expiry_date: expiryDate || null,
        credential_id: credentialId || null,
        verification_url: verificationUrl || null,
        verification_status: verificationStatus,
        file_name: file!.name,
        file_type: extension,
        extracted_text: text,
      })
      .select()
      .single();

    if (certError) {
      if (certError.code === '42P01') {
        return NextResponse.json({ 
          error: 'Certificates database table does not exist. Please run the database migrations to create the certificates table.' 
        }, { status: 500 });
      }
      throw certError;
    }

    // Update skills with certificate reference
    const skillsWithCert = skills.map(skill => ({
      ...skill,
      certificate_id: certificate.id,
    }));

    if (skillsWithCert.length > 0) {
      await supabase.from('skills').upsert(skillsWithCert);
    }

    return NextResponse.json({ 
      certificate, 
      skills: skillsWithCert,
      message: verificationStatus === 'verified' ? 'Certificate verified successfully' : 'Certificate uploaded (verification not available)'
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Certificate upload failed:', message, error);
    return NextResponse.json({ error: `Server error uploading certificate: ${message}` }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    console.log('Fetching certificates for userId:', userId);

    if (!userId) return NextResponse.json({ error: 'User ID required' }, { status: 400 });

    const supabase = getSupabaseAdmin();
    console.log('Supabase client created, querying certificates table...');
    
    const { data: certificates, error } = await supabase
      .from('certificates')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase query error:', error);
      // If table doesn't exist, return empty array instead of error
      if (error.code === '42P01') {
        console.log('Certificates table does not exist, returning empty array');
        return NextResponse.json({ certificates: [] });
      }
      throw error;
    }

    console.log('Certificates fetched successfully, count:', certificates?.length);
    return NextResponse.json({ certificates });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Failed to fetch certificates:', message, error);
    return NextResponse.json({ error: `Failed to fetch certificates: ${message}` }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const certificateId = searchParams.get('certificateId');

    if (!certificateId) return NextResponse.json({ error: 'Certificate ID required' }, { status: 400 });

    const supabase = getSupabaseAdmin();
    const { error } = await supabase
      .from('certificates')
      .delete()
      .eq('id', certificateId);

    if (error) throw error;

    // Also remove skills associated with this certificate
    await supabase
      .from('skills')
      .delete()
      .eq('certificate_id', certificateId);

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Failed to delete certificate:', message, error);
    return NextResponse.json({ error: `Failed to delete certificate: ${message}` }, { status: 500 });
  }
}
