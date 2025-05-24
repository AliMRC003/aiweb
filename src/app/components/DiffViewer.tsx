'use client';

import { DiffEditor } from '@monaco-editor/react';

interface DiffViewerProps {
  original: string;
  modified: string;
  language?: string;
}

export default function DiffViewer({ original, modified, language = 'javascript' }: DiffViewerProps) {
  return (
    <div className="h-full w-full">
      <DiffEditor
        height="100%"
        language={language}
        original={original}
        modified={modified}
        theme="vs-dark"
        options={{
          readOnly: true,
          renderSideBySide: true,
          wordWrap: 'on',
          lineNumbers: 'on',
          scrollBeyondLastLine: false,
          minimap: {
            enabled: false
          }
        }}
      />
    </div>
  );
} 