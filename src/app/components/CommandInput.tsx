'use client';

import { useState } from 'react';
import { SparklesIcon, CommandLineIcon } from '@heroicons/react/24/outline';

interface CommandInputProps {
  onCommand: (command: string) => void;
  isLoading: boolean;
  selectedFile: string | null;
  projectId: string | null;
}

export default function CommandInput({ onCommand, isLoading, selectedFile, projectId }: CommandInputProps) {
  const [command, setCommand] = useState('');
  const [showExamples, setShowExamples] = useState(false);

  const exampleCommands = [
    "Add a responsive navbar with logo and menu items",
    "Create a login form with email and password fields",
    "Add error handling to the API call",
    "Refactor this component to use React hooks",
    "Add TypeScript types to this function",
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (command.trim()) {
      onCommand(command.trim());
      setCommand('');
    }
  };

  return (
    <div className="w-full space-y-4">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          placeholder={!projectId ? "Create a project first" : !selectedFile ? "Select a file first" : "Enter your command..."}
          disabled={isLoading || !projectId || !selectedFile}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500"
        />
        <button
          type="submit"
          disabled={isLoading || !command.trim() || !projectId || !selectedFile}
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Processing...' : 'Send'}
        </button>
      </form>

      {showExamples && (
        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
          <h3 className="text-sm font-medium text-gray-700">Example Commands:</h3>
          <div className="space-y-2">
            {exampleCommands.map((example, index) => (
              <button
                key={index}
                onClick={() => {
                  setCommand(example);
                  setShowExamples(false);
                }}
                className="block w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 