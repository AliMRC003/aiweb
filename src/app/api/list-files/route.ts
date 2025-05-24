import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  const projectId = searchParams.get('projectId');
  const basePath = searchParams.get('path') || '';

  if (!userId || !projectId) {
    return NextResponse.json(
      { error: 'userId and projectId are required' },
      { status: 400 }
    );
  }

  try {
    const projectPath = path.join(process.env.USER_PROJECTS_BASE_DIR || '', userId, projectId, basePath);
    
    // Security check: Ensure the path is within the user's project directory
    const normalizedPath = path.normalize(projectPath);
    const baseDir = path.join(process.env.USER_PROJECTS_BASE_DIR || '', userId, projectId);
    
    if (!normalizedPath.startsWith(baseDir)) {
      return NextResponse.json(
        { error: 'Invalid path' },
        { status: 403 }
      );
    }

    const items = await fs.promises.readdir(projectPath, { withFileTypes: true });
    
    const fileTree = await Promise.all(
      items.map(async (item) => {
        const itemPath = path.join(projectPath, item.name);
        const relativePath = path.join(basePath, item.name);
        
        if (item.isDirectory()) {
          return {
            name: item.name,
            path: relativePath,
            type: 'directory',
            children: [] // Will be populated when this directory is expanded
          };
        } else {
          return {
            name: item.name,
            path: relativePath,
            type: 'file'
          };
        }
      })
    );

    return NextResponse.json(fileTree);
  } catch (error) {
    console.error('Error listing files:', error);
    return NextResponse.json(
      { error: 'Failed to list files' },
      { status: 500 }
    );
  }
} 