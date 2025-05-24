'use client';

import { useState, useEffect } from 'react';
import { ChevronRight, ChevronDown, File, Folder } from 'lucide-react';

interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  children?: FileNode[];
}

interface FileTreeProps {
  onFileSelect: (path: string) => void;
  projectId: string;
  userId: string;
}

export default function FileTree({ onFileSelect, projectId, userId }: FileTreeProps) {
  const [files, setFiles] = useState<FileNode[]>([]);
  const [expandedDirs, setExpandedDirs] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchFiles();
  }, [projectId, userId]);

  const fetchFiles = async () => {
    try {
      const response = await fetch(`/api/list-files?userId=${userId}&projectId=${projectId}`);
      if (!response.ok) throw new Error('Failed to fetch files');
      const data = await response.json();
      setFiles(data);
    } catch (error) {
      console.error('Error fetching files:', error);
    }
  };

  const toggleDir = (path: string) => {
    setExpandedDirs(prev => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  };

  const renderNode = (node: FileNode) => {
    const isExpanded = expandedDirs.has(node.path);
    const isDirectory = node.type === 'directory';

    return (
      <div key={node.path} className="ml-4">
        <div 
          className="flex items-center py-1 px-2 hover:bg-gray-700 rounded cursor-pointer"
          onClick={() => isDirectory ? toggleDir(node.path) : onFileSelect(node.path)}
        >
          {isDirectory ? (
            <>
              {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              <Folder className="w-4 h-4 ml-1" />
            </>
          ) : (
            <File className="w-4 h-4 ml-5" />
          )}
          <span className="ml-2 text-sm">{node.name}</span>
        </div>
        {isDirectory && isExpanded && node.children?.map(child => renderNode(child))}
      </div>
    );
  };

  return (
    <div className="w-64 h-full bg-gray-800 text-gray-200 p-2 overflow-auto">
      {files.map(node => renderNode(node))}
    </div>
  );
} 