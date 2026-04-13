import { NextRequest, NextResponse } from 'next/server';
import { generateFullReading, ReadingInput } from '@/lib/astrology';
import { apiGuard, sanitise } from '@/lib/apiGuard';

export async function POST(req: NextRequest) {
  const blocked = apiGuard(req);
  if (blocked) return blocked;

  try {
    const body = await req.json();

    const {
      name, dob, timeOfBirth, birthLat, birthLng, birthCity,
      currentCity: rawCurrentCity, currentLat: rawCurrentLat, currentLng: rawCurrentLng,
      gender, maritalStatus, employment, concern, chartType, vedicSystem, tradition, language,
    } = body;

    // Sanitise all string inputs
    const safeName     = sanitise(name, 100);
    const safeDob      = sanitise(dob, 12);
    const safeBirthCity= sanitise(birthCity, 150);
    const safeCurrentCity = sanitise(rawCurrentCity || birthCity, 150);
    const safeGender   = sanitise(gender, 30);
    const safeConcern  = sanitise(concern, 500);

    // Validate required fields
    if (!safeName || !safeDob || !safeBirthCity || !safeGender) {
      return NextResponse.json(
        { error: 'Name, date of birth, birth city, and gender are required.' },
        { status: 400 }
      );
    }

    // Validate date
    const date = new Date(safeDob);
    if (isNaN(date.getTime())) {
      return NextResponse.json(
        { error: 'Invalid date of birth.' },
        { status: 400 }
      );
    }

    const input: ReadingInput = {
      name: safeName,
      dob: safeDob,
      timeOfBirth: sanitise(timeOfBirth, 10) || '12:00',
      birthLat: parseFloat(birthLat) || 28.6139,
      birthLng: parseFloat(birthLng) || 77.2090,
      birthCity: safeBirthCity,
      currentLat: parseFloat(rawCurrentLat) || parseFloat(birthLat) || 28.6139,
      currentLng: parseFloat(rawCurrentLng) || parseFloat(birthLng) || 77.2090,
      currentCity: safeCurrentCity,
      gender: safeGender,
      maritalStatus: sanitise(maritalStatus, 30) || 'single',
      employment: sanitise(employment, 30) || 'employed',
      concern: safeConcern,
      chartType: chartType === 'south' ? 'south' : 'north',
      vedicSystem: (['parashari','kp','jaimini','lal_kitab'].includes(vedicSystem) ? vedicSystem : 'parashari') as 'parashari' | 'kp' | 'jaimini' | 'lal_kitab',
      tradition: tradition || 'all',
      language: sanitise(language, 10) || 'en',
    };

    // Generate reading
    const reading = generateFullReading(input);

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
