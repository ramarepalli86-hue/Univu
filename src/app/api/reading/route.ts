import { NextRequest, NextResponse } from 'next/server';
import { generateFullReading, ReadingInput } from '@/lib/astrology';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      name, dob, timeOfBirth, birthLat, birthLng, birthCity,
      currentLat, currentLng, currentCity,
      gender, maritalStatus, employment, concern, chartType, language,
    } = body;

    // Validate required fields
    if (!name || !dob || !birthCity || !gender) {
      return NextResponse.json(
        { error: 'Name, date of birth, birth city, and gender are required.' },
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

    const input: ReadingInput = {
      name: name.trim(),
      dob,
      timeOfBirth: timeOfBirth || '12:00',
      birthLat: parseFloat(birthLat) || 28.6139,
      birthLng: parseFloat(birthLng) || 77.2090,
      birthCity: birthCity.trim(),
      currentLat: parseFloat(currentLat) || parseFloat(birthLat) || 28.6139,
      currentLng: parseFloat(currentLng) || parseFloat(birthLng) || 77.2090,
      currentCity: (currentCity || birthCity || '').trim(),
      gender,
      maritalStatus: maritalStatus || 'single',
      employment: employment || 'employed',
      concern: (concern || '').trim(),
      chartType: chartType || 'north',
      language: language || 'en',
    };

    // Generate reading
    const reading = generateFullReading(input);

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
