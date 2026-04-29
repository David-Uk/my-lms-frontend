'use client';

import { useState } from 'react';
import { cn } from '@/utils/cn';
import { CourseContent, ContentType } from '@/types';
import { Folder, FileText, HelpCircle, ChevronRight, ChevronDown, Plus, Edit2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ContentTreeProps {
  contents: CourseContent[];
  onSelect: (content: CourseContent) => void;
  onAdd: (parentId?: string) => void;
  onEdit: (content: CourseContent) => void;
  onDelete: (contentId: string) => void;
  selectedId?: string;
  readOnly?: boolean;
}

export function ContentTree({
  contents,
  onSelect,
  onAdd,
  onEdit,
  onDelete,
  selectedId,
  readOnly = false,
}: ContentTreeProps) {
  return (
    <div className="space-y-1">
      {contents.map((content) => (
        <TreeNode
          key={content.id}
          content={content}
          onSelect={onSelect}
          onAdd={onAdd}
          onEdit={onEdit}
          onDelete={onDelete}
          selectedId={selectedId}
          readOnly={readOnly}
          level={0}
        />
      ))}
    </div>
  );
}

interface TreeNodeProps extends Omit<ContentTreeProps, 'contents'> {
  content: CourseContent;
  level: number;
}

function TreeNode({
  content,
  onSelect,
  onAdd,
  onEdit,
  onDelete,
  selectedId,
  readOnly,
  level,
}: TreeNodeProps) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = content.children && content.children.length > 0;
  const isSelected = selectedId === content.id;

  const getIcon = (type: ContentType) => {
    switch (type) {
      case 'section':
        return <Folder className="h-4 w-4 text-blue-500" />;
      case 'lesson':
        return <FileText className="h-4 w-4 text-green-500" />;
      case 'assessment':
        return <HelpCircle className="h-4 w-4 text-purple-500" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div>
      <div
        className={cn(
          'flex items-center gap-2 rounded-lg px-2 py-1.5 cursor-pointer transition-colors',
          isSelected ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50'
        )}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
      >
        {hasChildren ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(!expanded);
            }}
            className="p-0.5 hover:bg-gray-200 rounded"
          >
            {expanded ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronRight className="h-3 w-3" />
            )}
          </button>
        ) : (
          <span className="w-4" />
        )}

        <div
          className="flex-1 flex items-center gap-2"
          onClick={() => onSelect(content)}
        >
          {getIcon(content.contentType)}
          <span className="text-sm font-medium truncate">{content.topic}</span>
        </div>

        {!readOnly && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 hover:opacity-100">
            {content.contentType === 'section' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onAdd(content.id);
                }}
              >
                <Plus className="h-3 w-3" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(content);
              }}
            >
              <Edit2 className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(content.id);
              }}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        )}
      </div>

      {expanded && hasChildren && (
        <div>
          {content.children.map((child) => (
            <TreeNode
              key={child.id}
              content={child}
              onSelect={onSelect}
              onAdd={onAdd}
              onEdit={onEdit}
              onDelete={onDelete}
              selectedId={selectedId}
              readOnly={readOnly}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
