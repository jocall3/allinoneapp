// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

import React, { useMemo } from 'react';
import type { FileNode, SortOption, SortField } from '../types';
import FileItem from './FileItem';

interface FileListProps {
  files: FileNode[];
  sort: SortOption;
  onSortChange: (sort: SortOption) => void;
  selectedIds: Set<string>;
  onSelectionChange: (ids: Set<string>) => void;
  onFileOpen: (file: FileNode) => void;
}

const FileList: React.FC<FileListProps> = ({
  files,
  sort,
  onSortChange,
  selectedIds,
  onSelectionChange,
  onFileOpen,
}) => {
  const sortedFiles = useMemo(() => {
    return [...files].sort((a, b) => {
      if (a.isDirectory && !b.isDirectory) return -1;
      if (!a.isDirectory && b.isDirectory) return 1;

      let comparison = 0;
      if (sort.field === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sort.field === 'size') {
        comparison = a.size - b.size;
      } else if (sort.field === 'modified') {
        comparison = b.modified - a.modified; // Newest first
      }

      return sort.direction === 'asc' ? comparison : -comparison;
    });
  }, [files, sort]);

  const handleSort = (field: SortField) => {
    const direction = sort.field === field && sort.direction === 'asc' ? 'desc' : 'asc';
    onSortChange({ field, direction });
  };
  
  const handleItemClick = (file: FileNode, e: React.MouseEvent) => {
    e.stopPropagation();
    const newSelection = e.ctrlKey || e.metaKey ? new Set(selectedIds) : new Set<string>();
    if (newSelection.has(file.id)) {
      newSelection.delete(file.id);
    } else {
      newSelection.add(file.id);
    }
    onSelectionChange(newSelection);
  };
  
  const handleItemDoubleClick = (file: FileNode) => {
      onFileOpen(file);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        const currentSelection = sortedFiles.findIndex(f => selectedIds.has(f.id));
        let nextIndex = currentSelection;
        
        // FIX: Handle initial selection when navigating with arrow keys in an empty selection.
        if (currentSelection === -1 && sortedFiles.length > 0) {
            nextIndex = e.key === 'ArrowDown' ? 0 : sortedFiles.length - 1; // Select first/last if nothing selected
        } else if (currentSelection === -1) {
            return; // No files to select
        } else if (e.key === 'ArrowDown') {
            nextIndex = currentSelection < sortedFiles.length - 1 ? currentSelection + 1 : sortedFiles.length - 1;
        } else if (e.key === 'ArrowUp') {
            nextIndex = currentSelection > 0 ? currentSelection - 1 : 0;
        }
        
        if (nextIndex !== -1) {
            onSelectionChange(new Set([sortedFiles[nextIndex].id]));
        }
    } else if (e.key === 'Enter') {
        const selectedFile = sortedFiles.find(f => selectedIds.has(f.id));
        if (selectedFile) {
            onFileOpen(selectedFile);
        }
    }
  };


  return (
    <table className="w-full text-left table-fixed" role="grid" onKeyDown={handleKeyDown} tabIndex={0}>
      <thead className="border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
        <tr role="row">
          <th role="columnheader" className="p-2 font-semibold cursor-pointer w-3/5" onClick={() => handleSort('name')}>Name</th>
          <th role="columnheader" className="p-2 font-semibold cursor-pointer w-1/5" onClick={() => handleSort('size')}>Size</th>
          <th role="columnheader" className="p-2 font-semibold cursor-pointer w-1/5" onClick={() => handleSort('modified')}>Date Modified</th>
        </tr>
      </thead>
      <tbody role="rowgroup">
        {sortedFiles.map(file => (
          <FileItem
            key={file.id}
            file={file}
            viewType="list"
            isSelected={selectedIds.has(file.id)}
            onClick={handleItemClick}
            onDoubleClick={handleItemDoubleClick}
          />
        ))}
      </tbody>
    </table>
  );
};

export default FileList;