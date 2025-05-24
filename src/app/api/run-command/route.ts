import { NextResponse } from 'next/server';
import { CursorAI } from '@/app/lib/cursor';
import * as fs from 'fs/promises';
import * as path from 'path';

export async function POST(request: Request) {
  try {
    const { command, userId, projectId, filePath } = await request.json();

    // Validate request
    if (!command || !userId || !projectId || !filePath) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Get the full file path
    const userDir = path.join(process.cwd(), 'users', userId, projectId);
    const fullFilePath = path.join(userDir, filePath);

    // Ensure the file exists
    try {
      await fs.access(fullFilePath);
    } catch {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }

    // Initialize Cursor AI
    const cursorAI = CursorAI.getInstance();
    try {
      await cursorAI.initialize();
    } catch (error) {
      return NextResponse.json(
        { error: 'Failed to initialize CursorAI' },
        { status: 500 }
      );
    }

    // Validate command
    const isValidCommand = await cursorAI.validateCommand(command);
    if (!isValidCommand) {
      return NextResponse.json(
        { error: 'Invalid command' },
        { status: 400 }
      );
    }

    // Execute command on VM
    const result = await cursorAI.executeCommand(command, fullFilePath, userId, projectId);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to execute command' },
        { status: 500 }
      );
    }

    // Get the modified content
    const modifiedContent = await fs.readFile(fullFilePath, 'utf-8');

    return NextResponse.json({
      success: true,
      diff: result.diff,
      modifiedContent,
      output: result.output,
    });
  } catch (error) {
    console.error('Error processing command:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 