'use client';

import { useState, useEffect } from 'react';
import CodeEditor from './components/CodeEditor';
import FileTree from './components/FileTree';

export default function Home() {
  const [code, setCode] = useState('');
  const [filePath, setFilePath] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [userId] = useState('kullanici_id_123'); // This will be replaced with actual auth
  const [projectId] = useState('proje_1'); // This will be replaced with project selection

  useEffect(() => {
    if (filePath) {
      fetchCode();
    }
  }, [filePath]);

  const fetchCode = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/get-file-content?userId=${userId}&projectId=${projectId}&filePath=${filePath}`);
      if (!response.ok) throw new Error('Failed to fetch file content');
      const data = await response.json();
      setCode(data.content);
      setError('');
    } catch (error) {
      console.error('Error fetching code:', error);
      setError('Failed to load file content');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (path: string) => {
    setFilePath(path);
  };

  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
  };

  const handleExecuteCommand = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/execute-command', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          projectId,
          filePath,
          command: code,
        }),
      });

      if (!response.ok) throw new Error('Failed to execute command');
      const data = await response.json();
      setError('');
      // Handle the response data as needed
    } catch (error) {
      console.error('Error executing command:', error);
      setError('Failed to execute command');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen bg-gray-900 text-white">
      <div className="flex w-full">
        <FileTree
          onFileSelect={handleFileSelect}
          projectId={projectId}
          userId={userId}
        />
        
        <div className="flex-1 p-4">
          <div className="mb-4">
            <h1 className="text-2xl font-bold mb-2">Code Editor</h1>
            {filePath && <p className="text-gray-400">Current file: {filePath}</p>}
          </div>

          <div className="mb-4">
            <CodeEditor
              value={code}
              onChange={handleCodeChange}
              language="typescript"
            />
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-900 text-red-100 rounded">
              {error}
            </div>
          )}

          <button
            onClick={handleExecuteCommand}
            disabled={loading || !filePath}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed"
          >
            {loading ? 'Processing...' : 'Execute Command'}
          </button>
        </div>
      </div>
    </main>
  );
} 