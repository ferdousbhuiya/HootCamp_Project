import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/server';

export const runtime = 'nodejs';

const ALL_FIELDS = {
  course_name: null,
  provider: null,
  platform: null,
  start_date: null,
  expected_completion_date: null,
  progress: null,
  status: null,
  url: null,
  description: null,
};

type FieldName = keyof typeof ALL_FIELDS;

// Map camelCase body keys (frontend) to snake_case DB columns
const BODY_TO_COLUMN: Record<string, FieldName> = {
  courseName: 'course_name',
  provider: 'provider',
  platform: 'platform',
  startDate: 'start_date',
  expectedCompletionDate: 'expected_completion_date',
  progress: 'progress',
  status: 'status',
  url: 'url',
  description: 'description',
};

// Cache of which columns actually exist on the table, so we never hit PGRST204
// when the DB schema lags the app code (e.g. migrations not applied).
let availableFields: Set<string> | null = null;

async function getAvailableFields(supabase: ReturnType<typeof getSupabaseAdmin>): Promise<Set<string>> {
  if (availableFields) return availableFields;

  // Probe every field the app writes; a missing column errors with PGRST204.
  const found = new Set<string>();
  for (const col of Object.keys(ALL_FIELDS)) {
    const { error } = await supabase.from('ongoing_courses').select(col).limit(0);
    if (!error) found.add(col);
  }
  availableFields = found;
  return found;
}

function pickExistingFields(body: Record<string, unknown>, fields: Set<string>): Record<string, unknown> {
  const picked: Record<string, unknown> = {};
  for (const [bodyKey, col] of Object.entries(BODY_TO_COLUMN)) {
    if (!fields.has(col)) continue;
    const value = body[bodyKey];
    if (value !== undefined && value !== null && value !== '') {
      picked[col] = value;
    }
  }
  return picked;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId } = body;
    const courseName = body.courseName ?? body.course_name;

    if (!userId || !courseName) {
      return NextResponse.json({ error: 'User ID and course name are required' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const fields = await getAvailableFields(supabase);
    const insertData = pickExistingFields(body, fields);

    // user_id + course_name are always required and always exist
    insertData.user_id = userId;
    insertData.course_name = courseName;
    insertData.status = (body.status as string) || 'in_progress';

    const { data: course, error } = await supabase
      .from('ongoing_courses')
      .insert(insertData)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ course });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    const code = (error as { code?: string })?.code;
    const details = (error as { details?: string })?.details;
    console.error('Failed to create ongoing course:', message, { code, details }, error);
    return NextResponse.json({ error: `Failed to create ongoing course: ${message}` }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) return NextResponse.json({ error: 'User ID required' }, { status: 400 });

    const supabase = getSupabaseAdmin();

    const { data: courses, error } = await supabase
      .from('ongoing_courses')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      // If table doesn't exist, return empty array instead of error
      if (error.code === '42P01') {
        return NextResponse.json({ courses: [] });
      }
      throw error;
    }

    return NextResponse.json({ courses });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Failed to fetch ongoing courses:', message, error);
    return NextResponse.json({ error: `Failed to fetch ongoing courses: ${message}` }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { courseId } = body;

    if (!courseId) {
      return NextResponse.json({ error: 'Course ID required' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const fields = await getAvailableFields(supabase);
    const updateData = pickExistingFields(body, fields);

    updateData.updated_at = new Date().toISOString();

    const { data: course, error } = await supabase
      .from('ongoing_courses')
      .update(updateData)
      .eq('id', courseId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ course });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Failed to update ongoing course:', message, error);
    return NextResponse.json({ error: `Failed to update ongoing course: ${message}` }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');

    if (!courseId) return NextResponse.json({ error: 'Course ID required' }, { status: 400 });

    const supabase = getSupabaseAdmin();
    const { error } = await supabase
      .from('ongoing_courses')
      .delete()
      .eq('id', courseId);

    if (error) throw error;

    // Also remove skills associated with this course (ignore missing-column errors)
    const { error: skillErr } = await supabase
      .from('skills')
      .delete()
      .eq('ongoing_course_id', courseId);

    if (skillErr && skillErr.code !== 'PGRST204' && skillErr.code !== '42703') {
      console.error('Failed to delete skills for course:', skillErr);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Failed to delete ongoing course:', message, error);
    return NextResponse.json({ error: `Failed to delete ongoing course: ${message}` }, { status: 500 });
  }
}
