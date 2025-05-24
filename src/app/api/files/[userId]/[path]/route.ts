import { NextResponse } from 'next/server';
import * as fs from 'fs/promises';
import * as path from 'path';

export async function GET(
  request: Request,
  { params }: { params: { userId: string; path: string } }
) {
  try {
    const { userId, path: filePath } = params;
    const fullPath = path.join(process.cwd(), 'users', userId, filePath);

    // Check if file exists
    try {
      await fs.access(fullPath);
    } catch {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }

    // Read file content
    const content = await fs.readFile(fullPath, 'utf-8');

    return NextResponse.json({
      success: true,
      content,
    });
  } catch (error) {
    console.error('Error reading file:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { userId: string; path: string } }
) {
  try {
    const { userId, path: filePath } = params;
    const { content } = await request.json();

    if (!content) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    const fullPath = path.join(process.cwd(), 'users', userId, filePath);
    const dirPath = path.dirname(fullPath);

    // Create directory if it doesn't exist
    await fs.mkdir(dirPath, { recursive: true });

    // Write file content
    await fs.writeFile(fullPath, content, 'utf-8');

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error('Error writing file:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 