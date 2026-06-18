import { NextRequest, NextResponse } from 'next/server';
import { createAccount } from '@/lib/dataSync';
import { getSession } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Get the current admin's session
    const session = await getSession();
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' },
        { status: 401 }
      );
    }

    // Only admins can create accounts
    if (session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden - Only admins can create accounts' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { full_name, email, role, temp_password } = body;

    // Validate required fields
    if (!full_name || !email || !role) {
      return NextResponse.json(
        { error: 'Missing required fields: full_name, email, role' },
        { status: 400 }
      );
    }

    // If creating a staff account, assign to the current admin
    let assigned_to = undefined;
    if (role === 'staff') {
      assigned_to = session.user.id;
    }

    const result = await createAccount({
      full_name,
      email,
      role,
      temp_password: temp_password || undefined,
      assigned_to,
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Create account error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create account' },
      { status: 500 }
    );
  }
}