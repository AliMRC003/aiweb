import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as diff from 'diff';

const execAsync = promisify(exec);

export async function POST(request: Request) {
  try {
    const { command, userId, filePath } = await request.json();

    // Validate request
    if (!command || !userId || !filePath) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Create user directory if it doesn't exist
    const userDir = path.join(process.cwd(), 'users', userId);
    await fs.mkdir(userDir, { recursive: true });

    // Create backup of the file
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const backupPath = `${filePath}.backup`;
    await fs.writeFile(backupPath, fileContent);

    // Execute Cursor AI command
    // Note: This is a placeholder. You'll need to implement the actual Cursor AI integration
    const cursorCommand = `cursor ${command} ${filePath}`;
    const { stdout, stderr } = await execAsync(cursorCommand);

    if (stderr) {
      // Restore from backup if there's an error
      await fs.copyFile(backupPath, filePath);
      return NextResponse.json(
        { error: 'Failed to execute Cursor AI command', details: stderr },
        { status: 500 }
      );
    }

    // Get the modified content
    const modifiedContent = await fs.readFile(filePath, 'utf-8');

    // Generate diff
    const diffResult = diff.createPatch(
      path.basename(filePath),
      fileContent,
      modifiedContent
    );

    // Clean up backup
    await fs.unlink(backupPath);

    return NextResponse.json({
      success: true,
      diff: diffResult,
      modifiedContent,
    });
  } catch (error) {
    console.error('Error processing Cursor AI command:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 