'use client';

import { useEffect, useRef } from 'react';
import * as monaco from '@monaco-editor/react';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language?: string;
  theme?: string;
}

export default function CodeEditor({ 
  value, 
  onChange, 
  language = 'typescript',
  theme = 'vs-dark'
}: CodeEditorProps) {
  const editorRef = useRef<any>(null);

  function handleEditorDidMount(editor: any) {
    editorRef.current = editor;
  }

  return (
    <div className="h-[500px] w-full border border-gray-700 rounded-lg overflow-hidden">
      <monaco.Editor
        height="100%"
        defaultLanguage={language}
        defaultValue={value}
        theme={theme}
        onChange={(value) => onChange(value || '')}
        onMount={handleEditorDidMount}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          lineNumbers: 'on',
          roundedSelection: false,
          scrollBeyondLastLine: false,
          automaticLayout: true,
        }}
      />
    </div>
  );
} 