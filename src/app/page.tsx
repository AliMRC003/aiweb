'use client';

import { useState } from 'react';
import Editor from '@monaco-editor/react';
import FileTree from './components/FileTree';
import CommandInput from './components/CommandInput';
import DiffViewer from './components/DiffViewer';

interface FileNode {
  name: string;
  type: 'file' | 'directory';
  children?: FileNode[];
}

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showDiff, setShowDiff] = useState(false);
  const [code, setCode] = useState('// Start coding here...');
  const [modifiedCode, setModifiedCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [userId] = useState('user123'); // TODO: Get from auth
  const [error, setError] = useState<string | null>(null);
  const [projectId, setProjectId] = useState<string | null>(null);

  // Sample file tree data
  const fileTreeData: FileNode = {
    name: 'project',
    type: 'directory',
    children: [
      {
        name: 'src',
        type: 'directory',
        children: [
          {
            name: 'index.html',
            type: 'file'
          },
          {
            name: 'styles.css',
            type: 'file'
          }
        ]
      }
    ]
  };

  const handleLogin = async () => {
    try {
      setError(null);
      // Redirect to VM login page
      window.location.href = `${process.env.NEXT_PUBLIC_VM_ENDPOINT}/login`;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Login failed');
      console.error('Login error:', error);
    }
  };

  const handleCreateProject = async () => {
    const newProjectId = prompt("Enter new project name (e.g., my-new-app):");
    if (!newProjectId || !newProjectId.trim()) return;

    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/create-project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, projectId: newProjectId }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create project');
      }

      const data = await response.json();
      setProjectId(newProjectId);
      setSelectedFile('index.html');
      setCode(data.initialContent || '// New project created. index.html is empty.');
      setModifiedCode('');
      setShowDiff(false);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create project');
      console.error('Project creation error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCommand = async (command: string) => {
    if (!selectedFile) {
      setError('Please select a file first');
      return;
    }

    if (!projectId) {
      setError('Please create or select a project first');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/run-command', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          command,
          userId,
          projectId,
          filePath: selectedFile,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setModifiedCode(data.modifiedContent);
        setShowDiff(true);
      } else {
        throw new Error(data.error || 'Failed to execute command');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to execute command');
      console.error('Error executing command:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = async (path: string) => {
    if (!projectId) {
      setError('Please create or select a project first');
      return;
    }

    setSelectedFile(path);
    setShowDiff(false);
    setError(null);
    
    try {
      const response = await fetch(`/api/files/${userId}/${projectId}/${path}`);
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to load file');
      }
      const data = await response.json();
      setCode(data.content);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load file');
      console.error('Error loading file:', error);
      setCode('// Error loading file content');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Welcome to Cursor AI Platform
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Sign in to start coding with AI
            </p>
          </div>
          <button
            onClick={handleLogin}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Sign in to VM
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-primary-600">Cursor AI Platform</h1>
              </div>
            </div>
            <div className="flex items-center">
              <button
                onClick={handleCreateProject}
                disabled={isLoading}
                className="ml-4 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
              >
                {isLoading ? 'Creating...' : 'New Project'}
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <div className="flex h-[calc(100vh-8rem)]">
          <FileTree data={fileTreeData} onFileSelect={handleFileSelect} />
          
          <div className="flex-1 flex flex-col ml-4">
            <div className="mb-4">
              <CommandInput 
                onCommand={handleCommand} 
                isLoading={isLoading}
                selectedFile={selectedFile}
                projectId={projectId}
              />
            </div>
            
            <div className="flex-1 border rounded-lg overflow-hidden">
              {showDiff ? (
                <DiffViewer
                  original={code}
                  modified={modifiedCode}
                  language="javascript"
                />
              ) : (
                <Editor
                  height="100%"
                  defaultLanguage="javascript"
                  value={code}
                  theme="vs-dark"
                  onChange={(value) => setCode(value || '')}
                  options={{
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    wordWrap: 'on'
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 