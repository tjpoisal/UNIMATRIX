'use client';

import { useState } from 'react';

interface Memory {
  id: string;
  content: string;
  tags: string[];
}

interface Location {
  id: string;
  name: string;
  description: string;
  memories: Memory[];
  children: Location[];
}

interface LocationTreeProps {
  locations: Location[];
  onSelectMemory: (memory: Memory) => void;
}

export default function LocationTree({ locations, onSelectMemory }: LocationTreeProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedIds);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedIds(newExpanded);
  };

  const renderLocation = (location: Location, depth: number) => {
    const isExpanded = expandedIds.has(location.id);
    const hasChildren = location.children && location.children.length > 0;

    return (
      <div key={location.id} className="space-y-1">
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[#1F2937] cursor-pointer transition-colors group"
          style={{ paddingLeft: `${12 + depth * 16}px` }}
        >
          {hasChildren && (
            <button
              onClick={() => toggleExpanded(location.id)}
              className="flex-shrink-0 w-5 h-5 flex items-center justify-center hover:bg-[#334155]/50 rounded transition-colors"
            >
              {isExpanded ? '▼' : '▶'}
            </button>
          )}
          {!hasChildren && <span className="flex-shrink-0 w-5" />}

          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[#F1F5F9] truncate">
              {location.name}
            </p>
            {location.memories && location.memories.length > 0 && (
              <p className="text-xs text-[#64748B]">
                {location.memories.length} memory{location.memories.length !== 1 ? 'ies' : ''}
              </p>
            )}
          </div>
        </div>

        {/* Children */}
        {isExpanded && hasChildren && (
          <div>
            {location.children.map((child) => renderLocation(child, depth + 1))}
          </div>
        )}

        {/* Memories */}
        {isExpanded &&
          location.memories &&
          location.memories.map((memory) => (
            <div
              key={memory.id}
              onClick={() => onSelectMemory(memory)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[#1F2937]/60 cursor-pointer transition-colors group ml-6 border-l border-[#334155]/30 hover:border-[#00F5FF]/50"
              style={{ paddingLeft: `${12 + (depth + 1) * 16}px` }}
            >
              <span className="text-lg">📝</span>
              <p className="text-sm text-[#94A3B8] group-hover:text-[#F1F5F9] truncate">
                {memory.content.substring(0, 50)}...
              </p>
            </div>
          ))}
      </div>
    );
  };

  return (
    <div className="space-y-1">
      {locations.map((location) => renderLocation(location, 0))}
    </div>
  );
}
