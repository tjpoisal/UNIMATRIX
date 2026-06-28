'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import LocationTree from '@/components/palace/LocationTree';
import { deriveKey, encryptMemory } from '@/lib/encryption';

interface Memory {
  id: string;
  content: string;
  tags: string[];
  createdAt?: string;
}

interface LocationRaw {
  id: string;
  name: string;
  description: string | null;
  parentId?: string | null;
  memories: Memory[];
}

interface Location {
  id: string;
  name: string;
  description: string | null;
  memories: Memory[];
  children: Location[];
}

interface Palace {
  id: string;
  name: string;
  description: string | null;
  locations: Location[];
}

interface AddLocationModalProps {
  palaceId: string;
  parentId?: string;
  parentName?: string;
  onClose: () => void;
  onAdd: () => void;
}

function AddLocationModal({ palaceId, parentId, parentName, onClose, onAdd }: AddLocationModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError('Location name is required.'); return; }
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/locations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          palaceId,
          parentId: parentId || null,
          name: name.trim(),
          description: description.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create location');
      onAdd();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-[#111827] border border-[#334155]/50 rounded-2xl p-7 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-[#F1F5F9]">
              {parentId ? `Add Location inside "${parentName}"` : 'Add Location'}
            </h2>
            {parentId && (
              <p className="text-xs text-[#94A3B8] mt-0.5">Child location</p>
            )}
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#1F2937] transition-colors">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-[#94A3B8] mb-1.5">Location Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. The Grand Library, Entrance Hall…"
              autoFocus
              className="w-full bg-[#0A0F1C] border border-[#334155] rounded-lg px-4 py-2.5 text-[#F1F5F9] placeholder-[#475569] text-sm focus:outline-none focus:ring-2 focus:ring-[#00F5FF]/40 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm text-[#94A3B8] mb-1.5">Description <span className="text-[#475569]">(optional)</span></label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="What's memorable about this location?"
              rows={2}
              className="w-full bg-[#0A0F1C] border border-[#334155] rounded-lg px-4 py-2.5 text-[#F1F5F9] placeholder-[#475569] text-sm focus:outline-none focus:ring-2 focus:ring-[#00F5FF]/40 transition-all resize-none"
            />
          </div>
          {error && <p className="text-[#EF4444] text-sm">{error}</p>}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-[#334155]/50 text-[#94A3B8] hover:text-[#F1F5F9] rounded-xl font-medium text-sm transition-colors">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 py-2.5 bg-accent hover:bg-accent/90 text-bg font-semibold rounded-xl text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              {saving ? 'Adding…' : 'Add Location'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface AIPanelProps {
  palaceId: string;
  selectedLocation: Location | null;
  onInsertSuggestion: (text: string) => void;
}

function AIPanel({ palaceId, selectedLocation, onInsertSuggestion }: AIPanelProps) {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [error, setError] = useState('');

  const handleAskAI = async () => {
    if (!selectedLocation) return;
    setLoading(true);
    setError('');
    setSuggestions([]);
    try {
      const existingMemories = selectedLocation.memories.map(m => m.content.slice(0, 200));
      const res = await fetch('/api/llm/assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          palaceId,
          locationName: selectedLocation.name,
          locationDescription: selectedLocation.description || '',
          existingMemories,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'AI assist failed');
      setSuggestions(data.suggestions || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'AI assist failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-2 h-2 rounded-full bg-[#00F5FF]" />
        <h3 className="text-sm font-semibold text-[#F1F5F9] uppercase tracking-widest">AI Assist</h3>
      </div>

      {!selectedLocation ? (
        <div className="flex-1 flex items-center justify-center text-center">
          <div>
            <div className="text-3xl mb-3">✦</div>
            <p className="text-sm text-[#94A3B8]">Select a location to get AI memory suggestions</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col gap-4 overflow-y-auto">
          <div className="bg-[#0A0F1C] border border-[#334155]/30 rounded-xl p-4">
            <p className="text-xs text-[#475569] uppercase tracking-widest mb-1">Location</p>
            <p className="text-sm font-medium text-[#F1F5F9]">{selectedLocation.name}</p>
            {selectedLocation.description && (
              <p className="text-xs text-[#94A3B8] mt-1">{selectedLocation.description}</p>
            )}
          </div>

          <button
            onClick={handleAskAI}
            disabled={loading}
            className="w-full py-3 bg-accent hover:bg-accent/90 text-bg font-semibold rounded-xl text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-[#0A0F1C]/30 border-t-[#0A0F1C] rounded-full animate-spin" />
                Thinking…
              </>
            ) : (
              <>✦ Ask AI</>
            )}
          </button>

          {error && (
            <div className="p-3 bg-[#EF4444]/10 border border-[#EF4444]/30 rounded-xl">
              <p className="text-[#EF4444] text-xs">{error}</p>
            </div>
          )}

          {suggestions.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs text-[#475569] uppercase tracking-widest">Suggestions</p>
              {suggestions.map((suggestion, i) => (
                <div
                  key={i}
                  className="group bg-[#0A0F1C] border border-[#334155]/30 hover:border-[#00F5FF]/40 rounded-xl p-4 transition-all duration-200 cursor-pointer"
                  onClick={() => onInsertSuggestion(suggestion)}
                >
                  <p className="text-sm text-[#94A3B8] group-hover:text-[#F1F5F9] transition-colors leading-relaxed">
                    {suggestion}
                  </p>
                  <p className="text-xs text-[#475569] group-hover:text-[#00F5FF] mt-2 transition-colors">
                    Click to use →
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function PalaceEditorPage() {
  const params = useParams();
  const router = useRouter();
  const palaceId = params.id as string;

  const [palace, setPalace] = useState<Palace | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [editContent, setEditContent] = useState('');
  const [editTags, setEditTags] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [showAddLocation, setShowAddLocation] = useState(false);
  const [addChildFor, setAddChildFor] = useState<{ id: string; name: string } | null>(null);
  const [newMemoryLocationId, setNewMemoryLocationId] = useState<string | null>(null);
  const [isCreatingMemory, setIsCreatingMemory] = useState(false);

  function buildLocationTree(flat: LocationRaw[]): Location[] {
    const byId: Record<string, Location> = {};
    flat.forEach(loc => {
      byId[loc.id] = { id: loc.id, name: loc.name, description: loc.description, memories: loc.memories, children: [] };
    });
    const roots: Location[] = [];
    flat.forEach(loc => {
      if (loc.parentId && byId[loc.parentId]) {
        byId[loc.parentId].children.push(byId[loc.id]);
      } else {
        roots.push(byId[loc.id]);
      }
    });
    return roots;
  }

  const fetchPalace = useCallback(async () => {
    try {
      const res = await fetch(`/api/palaces/${palaceId}`);
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Failed to fetch palace'); return; }
      const locations = buildLocationTree((data.locations || []) as LocationRaw[]);
      setPalace({ ...data, locations });
    } catch {
      setError('Failed to load palace');
    } finally {
      setLoading(false);
    }
  }, [palaceId]);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/palaces/${palaceId}`);
        const data = await res.json();
        if (!res.ok) { setError(data.error || 'Failed to fetch palace'); return; }
        const locations = buildLocationTree((data.locations || []) as LocationRaw[]);
        setPalace({ ...data, locations });
      } catch {
        setError('Failed to load palace');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [palaceId]);

  const handleSelectMemory = (memory: Memory) => {
    setSelectedMemory(memory);
    setEditContent(memory.content);
    setEditTags(memory.tags.join(', '));
    setIsCreatingMemory(false);
    setSaveMsg('');
  };

  const handleSelectLocation = (location: Location) => {
    setSelectedLocation(location);
  };

  const handleSaveMemory = async () => {
    if (!selectedMemory) return;
    setSaving(true);
    setSaveMsg('');
    try {
      const tags = editTags.split(',').map(t => t.trim()).filter(Boolean);
      const res = await fetch(`/api/memories/${selectedMemory.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: editContent, tags }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Save failed');
      setSelectedMemory({ ...selectedMemory, content: editContent, tags });
      setSaveMsg('Saved');
      setTimeout(() => setSaveMsg(''), 2000);
      await fetchPalace();
    } catch (err: unknown) {
      setSaveMsg(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateMemory = async () => {
    if (!newMemoryLocationId || !editContent.trim()) return;
    setSaving(true);
    setSaveMsg('');
    try {
      const tags = editTags.split(',').map(t => t.trim()).filter(Boolean);
      const userPassword = window.prompt('Enter your encryption password to save this memory securely');
      if (!userPassword) {
        throw new Error('Encryption password is required');
      }
      const key = await deriveKey(userPassword);
      const encrypted = await encryptMemory(editContent, key);
      const res = await fetch('/api/memories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          locationId: newMemoryLocationId,
          encryptedContent: encrypted.ciphertext,
          nonce: encrypted.nonce,
          tags,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Create failed');
      setSaveMsg('Memory created!');
      setIsCreatingMemory(false);
      setNewMemoryLocationId(null);
      setEditContent('');
      setEditTags('');
      setTimeout(() => setSaveMsg(''), 2000);
      await fetchPalace();
    } catch (err: unknown) {
      setSaveMsg(err instanceof Error ? err.message : 'Create failed');
    } finally {
      setSaving(false);
    }
  };

  const handleInsertSuggestion = (text: string) => {
    setEditContent(prev => prev ? prev + '\n\n' + text : text);
    if (!isCreatingMemory && !selectedMemory && selectedLocation) {
      setIsCreatingMemory(true);
      setNewMemoryLocationId(selectedLocation.id);
    }
  };

  const handleStartNewMemory = (locationId: string) => {
    setIsCreatingMemory(true);
    setNewMemoryLocationId(locationId);
    setSelectedMemory(null);
    setEditContent('');
    setEditTags('');
    setSaveMsg('');
  };

  const showEditor = selectedMemory !== null || isCreatingMemory;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0F1C] flex items-center justify-center">
        <div className="flex items-center gap-3 text-[#94A3B8]">
          <div className="w-5 h-5 border-2 border-[#00F5FF]/30 border-t-[#00F5FF] rounded-full animate-spin" />
          Loading workspace…
        </div>
      </div>
    );
  }

  if (error || !palace) {
    return (
      <div className="min-h-screen bg-[#0A0F1C] flex items-center justify-center">
        <div className="bg-[#EF4444]/10 border border-[#EF4444]/30 rounded-xl p-6 max-w-md text-center">
          <p className="text-[#EF4444] mb-4">{error || 'Workspace not found'}</p>
          <button onClick={() => router.push('/palace')} className="px-4 py-2 border border-[#334155]/50 text-[#94A3B8] hover:text-[#F1F5F9] rounded-lg text-sm transition-colors">
            Back to Palaces
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#0A0F1C] text-[#F1F5F9] flex flex-col overflow-hidden">
      {/* Top bar */}
      <div className="flex items-center gap-4 px-6 py-3 border-b border-[#334155]/30 bg-[#111827]/60 flex-shrink-0">
        <button
          onClick={() => router.push('/palace')}
          className="text-[#94A3B8] hover:text-[#F1F5F9] transition-colors text-sm"
        >
          ← Workspaces
        </button>
        <span className="text-[#334155]/60">|</span>
        <h1 className="text-base font-bold text-[#F1F5F9] truncate">{palace.name}</h1>
        {palace.description && (
          <span className="text-sm text-[#94A3B8] truncate hidden md:block">{palace.description}</span>
        )}
      </div>

      {/* Modals */}
      {(showAddLocation || addChildFor) && (
        <AddLocationModal
          palaceId={palaceId}
          parentId={addChildFor?.id}
          parentName={addChildFor?.name}
          onClose={() => { setShowAddLocation(false); setAddChildFor(null); }}
          onAdd={async () => {
            setShowAddLocation(false);
            setAddChildFor(null);
            await fetchPalace();
          }}
        />
      )}

      {/* Three-panel layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* LEFT: Location Tree (w-64) */}
        <div className="w-64 flex-shrink-0 bg-[#111827]/60 border-r border-[#334155]/30 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#334155]/20">
            <span className="text-xs font-semibold text-[#94A3B8] uppercase tracking-widest">Locations</span>
            <button
              onClick={() => setShowAddLocation(true)}
              title="Add location"
              className="w-7 h-7 flex items-center justify-center rounded-lg bg-[#00F5FF]/10 hover:bg-[#00F5FF]/20 text-[#00F5FF] text-lg leading-none transition-colors"
            >
              +
            </button>
          </div>

          <div className="flex-1 overflow-y-auto py-2">
            {palace.locations.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <p className="text-xs text-[#475569] mb-3">No locations yet</p>
                <button
                  onClick={() => setShowAddLocation(true)}
                  className="text-xs text-[#00F5FF] hover:text-[#00D9FF] transition-colors"
                >
                  Add first location →
                </button>
              </div>
            ) : (
              <LocationTree
                locations={palace.locations}
                onSelectMemory={handleSelectMemory}
                onSelectLocation={handleSelectLocation}
                onAddChild={(locationId, locationName) => setAddChildFor({ id: locationId, name: locationName })}
                onAddMemory={handleStartNewMemory}
              />
            )}
          </div>
        </div>

        {/* CENTER: Memory Editor (flex-1) */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {showEditor ? (
            <div className="flex-1 flex flex-col p-6 overflow-y-auto">
              {/* Editor header */}
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-[#F1F5F9]">
                  {isCreatingMemory ? 'New Memory' : 'Edit Memory'}
                </h2>
                <div className="flex items-center gap-3">
                  {saveMsg && (
                    <span className={`text-sm ${saveMsg === 'Saved' || saveMsg === 'Memory created!' ? 'text-[#00F5FF]' : 'text-[#EF4444]'}`}>
                      {saveMsg}
                    </span>
                  )}
                  <button
                    onClick={isCreatingMemory ? handleCreateMemory : handleSaveMemory}
                    disabled={saving || !editContent.trim()}
                    className="px-4 py-2 bg-accent hover:bg-accent/90 text-bg font-semibold rounded-lg text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {saving ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-[#0A0F1C]/30 border-t-[#0A0F1C] rounded-full animate-spin" />
                        Saving…
                      </>
                    ) : (
                      isCreatingMemory ? 'Create Memory' : 'Save'
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setSelectedMemory(null);
                      setIsCreatingMemory(false);
                      setSaveMsg('');
                    }}
                    className="px-3 py-2 border border-[#334155]/50 text-[#94A3B8] hover:text-[#F1F5F9] rounded-lg text-sm transition-colors"
                  >
                    Discard
                  </button>
                </div>
              </div>

              {/* Markdown content */}
              <div className="flex-1 flex flex-col gap-4">
                <div className="flex-1">
                  <label className="block text-xs text-[#475569] uppercase tracking-widest mb-2">Content</label>
                  <textarea
                    value={editContent}
                    onChange={e => setEditContent(e.target.value)}
                    placeholder="Write your memory here. Markdown is supported…"
                    className="w-full h-full min-h-[320px] bg-[#111827] border border-[#334155]/50 hover:border-[#334155] focus:border-[#00F5FF]/50 rounded-xl px-5 py-4 text-[#F1F5F9] placeholder-[#475569] text-sm font-mono leading-relaxed focus:outline-none focus:ring-1 focus:ring-[#00F5FF]/20 transition-all resize-none"
                  />
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-xs text-[#475569] uppercase tracking-widest mb-2">
                    Tags <span className="normal-case text-[#334155]">(comma separated)</span>
                  </label>
                  <input
                    type="text"
                    value={editTags}
                    onChange={e => setEditTags(e.target.value)}
                    placeholder="e.g. history, dates, important"
                    className="w-full bg-[#111827] border border-[#334155]/50 hover:border-[#334155] focus:border-[#00F5FF]/50 rounded-lg px-4 py-2.5 text-[#F1F5F9] placeholder-[#475569] text-sm focus:outline-none focus:ring-1 focus:ring-[#00F5FF]/20 transition-all"
                  />
                  {/* Tag preview */}
                  {editTags && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {editTags.split(',').map(t => t.trim()).filter(Boolean).map(tag => (
                        <span key={tag} className="px-2.5 py-0.5 bg-[#00F5FF]/10 border border-[#00F5FF]/30 rounded-full text-xs text-[#00F5FF]">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center max-w-sm">
                <div className="text-5xl mb-4 font-bold text-[#334155]">MEM</div>
                <h2 className="text-lg font-semibold text-[#F1F5F9] mb-2">Select a memory</h2>
                <p className="text-sm text-[#94A3B8] mb-6">
                  Click any memory in the tree to edit it, or select a location and use the AI panel to get suggestions.
                </p>
                {palace.locations.length > 0 && (
                  <button
                    onClick={() => {
                      const firstLoc = palace.locations[0];
                      if (firstLoc) handleStartNewMemory(firstLoc.id);
                    }}
                    className="px-5 py-2.5 border border-[#334155]/50 text-[#94A3B8] hover:text-[#F1F5F9] hover:border-[#334155] rounded-xl text-sm transition-colors"
                  >
                    + New Memory in first location
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT: AI Assist Panel (w-72) */}
        <div className="w-72 flex-shrink-0 bg-[#111827]/60 border-l border-[#334155]/30 overflow-hidden">
          <AIPanel
            palaceId={palaceId}
            selectedLocation={selectedLocation}
            onInsertSuggestion={handleInsertSuggestion}
          />
        </div>
      </div>
    </div>
  );
}
