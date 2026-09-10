import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const rawUserId = searchParams.get('userId') || '42';
    const requestedUserId = rawUserId.trim();

    const cachePath = path.join(process.cwd(), 'hackathon', 'cache', 'demo_data.json');

    if (!fs.existsSync(cachePath)) {
      return NextResponse.json(
        { error: 'Demo cache file not found. Please run python hackathon/train.py first.' },
        { status: 404 }
      );
    }

    const fileContent = fs.readFileSync(cachePath, 'utf-8');
    const demoData = JSON.parse(fileContent);

    const availablePersonas = Object.keys(demoData.personas).map((id) => ({
      userId: Number(id),
      persona: demoData.personas[id].user.persona,
      cohort: demoData.personas[id].user.engagement.cohort,
      score: demoData.personas[id].user.engagement.score,
    }));

    // 1. Check if user is already in demoData cache
    if (demoData.personas[requestedUserId]) {
      const selectedPersonaData = demoData.personas[requestedUserId];
      return NextResponse.json({
        success: true,
        requestedUserId: Number(requestedUserId),
        isFallback: false,
        isCustom: false,
        metadata: demoData.metadata,
        availablePersonas,
        user: selectedPersonaData.user,
        watchlist: selectedPersonaData.watchlist,
      });
    }

    // 2. Dynamic generation for ANY Custom User ID via Python engine
    const numId = parseInt(requestedUserId, 10);
    if (!isNaN(numId) && numId > 0) {
      console.log(`Generating dynamic recommendation payload for custom User #${numId}...`);
      const scriptPath = path.join(process.cwd(), 'hackathon', 'get_user_rec.py');

      try {
        const { stdout } = await execFileAsync('python', [scriptPath, '--user', String(numId)], {
          timeout: 45000,
          cwd: path.join(process.cwd(), 'hackathon'),
        });

        const startIdx = stdout.indexOf('__JSON_START__');
        const endIdx = stdout.indexOf('__JSON_END__');

        if (startIdx !== -1 && endIdx !== -1) {
          const jsonStr = stdout.substring(startIdx + '__JSON_START__'.length, endIdx);
          const customPayload = JSON.parse(jsonStr.trim());

          // Cache this new user into demo_data.json so subsequent loads are 0ms!
          demoData.personas[String(numId)] = customPayload;
          fs.writeFileSync(cachePath, JSON.stringify(demoData, null, 2), 'utf-8');

          // Add to available personas list
          availablePersonas.push({
            userId: numId,
            persona: customPayload.user.persona,
            cohort: customPayload.user.engagement.cohort,
            score: customPayload.user.engagement.score,
          });

          return NextResponse.json({
            success: true,
            requestedUserId: numId,
            isFallback: false,
            isCustom: true,
            metadata: demoData.metadata,
            availablePersonas,
            user: customPayload.user,
            watchlist: customPayload.watchlist,
          });
        }
      } catch (err: any) {
        console.error(`Dynamic generation failed for User #${numId}:`, err.message);
      }
    }

    // 3. Fallback to default persona (42)
    const fallbackData = demoData.personas['42'];
    return NextResponse.json({
      success: true,
      requestedUserId: Number(requestedUserId),
      isFallback: true,
      isCustom: false,
      metadata: demoData.metadata,
      availablePersonas,
      user: fallbackData.user,
      watchlist: fallbackData.watchlist,
    });
  } catch (error: any) {
    console.error('Error serving hackathon recommendation data:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: error.message },
      { status: 500 }
    );
  }
}
