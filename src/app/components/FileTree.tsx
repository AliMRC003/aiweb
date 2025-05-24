'use client';

import { useState } from 'react';
import { FolderIcon, DocumentIcon, ChevronRightIcon, ChevronDownIcon } from '@heroicons/react/24/outline';

interface FileNode {
  name: string;
  type: 'file' | 'directory';
  children?: FileNode[];
}

interface FileTreeProps {
  data: FileNode;
  onFileSelect: (path: string) => void;
}

export default function FileTree({ data, onFileSelect }: FileTreeProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const toggleExpand = (path: string) => {
    setExpanded(prev => ({
      ...prev,
      [path]: !prev[path]
    }));
  };

  const renderNode = (node: FileNode, path: string = '') => {
    const currentPath = path ? `${path}/${node.name}` : node.name;
    const isExpanded = expanded[currentPath];

    if (node.type === 'directory') {
      return (
        <div key={currentPath} className="ml-4">
          <div
            className="flex items-center py-1 px-2 hover:bg-gray-100 cursor-pointer rounded"
            onClick={() => toggleExpand(currentPath)}
          >
            {isExpanded ? (
              <ChevronDownIcon className="h-4 w-4 text-gray-500" />
            ) : (
              <ChevronRightIcon className="h-4 w-4 text-gray-500" />
            )}
            <FolderIcon className="h-4 w-4 text-yellow-500 ml-1" />
            <span className="ml-2 text-sm">{node.name}</span>
          </div>
          {isExpanded && node.children && (
            <div className="ml-4">
              {node.children.map(child => renderNode(child, currentPath))}
            </div>
          )}
        </div>
      );
    }

    return (
      <div
        key={currentPath}
        className="flex items-center py-1 px-2 hover:bg-gray-100 cursor-pointer rounded ml-4"
        onClick={() => onFileSelect(currentPath)}
      >
        <DocumentIcon className="h-4 w-4 text-blue-500" />
        <span className="ml-2 text-sm">{node.name}</span>
      </div>
    );
  };

  return (
    <div className="w-64 h-full bg-white border-r border-gray-200 overflow-y-auto">
      {renderNode(data)}
    </div>
  );
} 