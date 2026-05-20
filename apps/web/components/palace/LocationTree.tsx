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
  description: string | null;
  memories: Memory[];
  children: Location[];
}

interface LocationTreeProps {
  locations: Location[];
  onSelectMemory: (memory: Memory) => void;
  /** Called when user selects/hovers a location — used to prime AI panel */
  onSelectLocation?: (location: Location) => void;
  /** Called when "Add child" inline button is clicked */
  onAddChild?: (locationId: string, locationName: string) => void;
  /** Called when "+ Memory" inline button is clicked */
  onAddMemory?: (locationId: string) => void;
}

export default function LocationTree({
  locations,
  onSelectMemory,
  onSelectLocation,
  onAddChild,
  onAddMemory,
}: LocationTreeProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [hoveredId, setHoveredId] = useState<string | null>(null);

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
    const hasMemories = location.memories && location.memories.length > 0;
    const isHovered = hoveredId === location.id;

    return (
      <div key={location.id} className="space-y-0.5">
        {/* Location row */}
        <div
          className="group flex items-center gap-1 px-2 py-1.5 rounded-lg hover:bg-[#1F2937] cursor-pointer transition-colors"
          style={{ paddingLeft: `${8 + depth * 14}px` }}
          onMouseEnter={() => {
            setHoveredId(location.id);
            onSelectLocation?.(location);
          }}
          onMouseLeave={() => setHoveredId(null)}
          onClick={() => {
            toggleExpanded(location.id);
            onSelectLocation?.(location);
          }}
        >
          {/* Expand chevron */}
          <button
            onClick={e => { e.stopPropagation(); toggleExpanded(location.id); }}
            className="flex-shrink-0 w-5 h-5 flex items-center justify-center text-[#475569] hover:text-[#94A3B8] rounded transition-colors"
          >
            {(hasChildren || hasMemories) ? (
              <span className="text-[10px]">{isExpanded ? '▼' : '▶'}</span>
            ) : (
              <span className="w-1.5 h-1.5 rounded-full bg-[#334155]/50 inline-block" />
            )}
          </button>

          {/* Location name */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[#F1F5F9] truncate leading-tight">
              {location.name}
            </p>
            {location.memories && location.memories.length > 0 && (
              <p className="text-[10px] text-[#475569] leading-tight">
                {location.memories.length} memor{location.memories.length !== 1 ? 'ies' : 'y'}
              </p>
            )}
          </div>

          {/* Inline action buttons — show on hover */}
          {isHovered && (
            <div className="flex-shrink-0 flex items-center gap-1 ml-1">
              {onAddMemory && (
                <button
                  title="Add memory"
                  onClick={e => { e.stopPropagation(); onAddMemory(location.id); }}
                  className="w-6 h-6 flex items-center justify-center rounded-md bg-[#00F5FF]/10 hover:bg-[#00F5FF]/20 text-[#00F5FF] text-xs font-bold transition-colors"
                >
                  📝
                </button>
              )}
              {onAddChild && (
                <button
                  title="Add child location"
                  onClick={e => { e.stopPropagation(); onAddChild(location.id, location.name); }}
                  className="w-6 h-6 flex items-center justify-center rounded-md bg-[#1F2937] hover:bg-[#334155]/50 text-[#94A3B8] hover:text-[#F1F5F9] text-xs font-bold transition-colors"
                >
                  +
                </button>
              )}
            </div>
          )}
        </div>

        {/* Expanded: child locations */}
        {isExpanded && hasChildren && (
          <div>
            {location.children.map(child => renderLocation(child, depth + 1))}
          </div>
        )}

        {/* Expanded: memories */}
        {isExpanded && hasMemories && location.memories.map(memory => (
          <div
            key={memory.id}
            onClick={() => onSelectMemory(memory)}
            className="flex items-start gap-2 px-3 py-2 rounded-lg hover:bg-[#1F2937]/60 cursor-pointer transition-colors border-l-2 border-[#334155]/20 hover:border-[#00F5FF]/40 ml-2"
            style={{ paddingLeft: `${16 + (depth + 1) * 14}px` }}
          >
            <span className="text-xs mt-0.5 flex-shrink-0">💡</span>
            <p className="text-xs text-[#94A3B8] hover:text-[#F1F5F9] leading-relaxed line-clamp-2 transition-colors">
              {memory.content.length > 60 ? memory.content.slice(0, 60) + '…' : memory.content}
            </p>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-0.5 py-1">
      {locations.map(location => renderLocation(location, 0))}
    </div>
  );
}
