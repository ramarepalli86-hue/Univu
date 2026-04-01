import { NextRequest, NextResponse } from 'next/server';
import { generateFullReading } from '@/lib/astrology';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { name, dob, birthplace, gender, location, concern } = body;

    // Validate required fields
    if (!name || !dob || !birthplace || !gender || !location || !concern) {
      return NextResponse.json(
        { error: 'All fields are required.' },
        { status: 400 }
      );
    }

    // Validate date
    const date = new Date(dob);
    if (isNaN(date.getTime())) {
      return NextResponse.json(
        { error: 'Invalid date of birth.' },
        { status: 400 }
      );
    }

    // Generate reading
    const reading = generateFullReading({
      name: name.trim(),
      dob,
      birthplace: birthplace.trim(),
      gender,
      location: location.trim(),
      concern: concern.trim(),
    });

    // Add disclaimer to response
    return NextResponse.json({
      disclaimer: 'This reading is for INFORMATION and ENTERTAINMENT purposes ONLY. It should NOT be used as guidance or a path for life decisions. Please CONSULT A PROFESSIONAL ASTROLOGER for true and accurate details.',
      reading,
    });
  } catch (error) {
    console.error('Reading API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate reading. Please try again.' },
      { status: 500 }
    );
  }
}
