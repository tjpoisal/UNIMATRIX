'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import * as d3 from 'd3';

interface GraphNode {
  id: string;
  content: string;
  importance_score: number;
  space_id: string | null;
  space_name: string | null;
  memory_class: string | null;
  digest_level: string | null;
  created_at: string;
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  fx?: number | null;
  fy?: number | null;
}

interface GraphEdge {
  source: string | GraphNode;
  target: string | GraphNode;
  weight: number;
}

interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

interface UserTier {
  tier: 'free' | 'pro' | 'team';
}

const CLASS_COLORS: Record<string, string> = {
  person: '#e74c3c',
  concept: '#3498db',
  event: '#2ecc71',
  organization: '#9b59b6',
  technology: '#f39c12',
  default: '#00F5FF',
};

const SPACE_COLOR_PALETTE = [
  '#00F5FF', '#e74c3c', '#3498db', '#2ecc71', '#9b59b6',
  '#f39c12', '#1abc9c', '#e67e22', '#34495e', '#95a5a6',
];

export default function GraphPage() {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [userTier, setUserTier] = useState<UserTier | null>(null);
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; node: GraphNode } | null>(null);
  const simulationRef = useRef<d3.Simulation<GraphNode, GraphEdge> | null>(null);
  const zoomRef = useRef<d3.ZoomBehavior<Element, unknown> | null>(null);

  // Fetch user tier
  useEffect(() => {
    async function loadUser() {
      try {
        const res = await fetch('/api/user');
        if (!res.ok) throw new Error('Failed to load user');
        const data = await res.json();
        setUserTier(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load user');
        setLoading(false);
      }
    }
    loadUser();
  }, []);

  // Fetch graph data
  useEffect(() => {
    if (!userTier) return;
    if (userTier.tier !== 'pro' && userTier.tier !== 'team') {
      setLoading(false);
      return;
    }

    async function loadGraph() {
      try {
        const res = await fetch('/api/explorer/memories?limit=100&embedding_neighbors=true');
        if (!res.ok) throw new Error('Failed to load graph data');
        const data = await res.json();

        const nodes: GraphNode[] = (data.data ?? []).map((m: any) => ({
          id: m.id,
          content: m.content_preview ?? m.content ?? 'Untitled memory',
          importance_score: m.importance_score ?? 0.5,
          space_id: m.space_id ?? null,
          space_name: m.space_name ?? m.space?.name ?? 'Unnamed',
          memory_class: m.memory_class ?? null,
          digest_level: m.digest_level ?? null,
          created_at: m.created_at,
        }));

        // Build edges from co-recall: connect memories in same space with weight based on shared search sessions
        const edges: GraphEdge[] = [];
        const spaceMap = new Map<string, GraphNode[]>();
        nodes.forEach(n => {
          const sid = n.space_id ?? 'none';
          if (!spaceMap.has(sid)) spaceMap.set(sid, []);
          spaceMap.get(sid)!.push(n);
        });

        spaceMap.forEach(mems => {
          for (let i = 0; i < mems.length; i++) {
            for (let j = i + 1; j < mems.length; j++) {
              edges.push({
                source: mems[i].id,
                target: mems[j].id,
                weight: 0.3 + (mems[i].importance_score + mems[j].importance_score) * 0.35,
              });
            }
          }
        });

        // Also connect by semantic similarity if embedding_neighbors provided
        if (data.embedding_neighbors) {
          (data.embedding_neighbors as any[]).forEach((n: any) => {
            if (n.neighbor_id && n.similarity > 0.6) {
              edges.push({
                source: n.memory_id,
                target: n.neighbor_id,
                weight: n.similarity,
              });
            }
          });
        }

        setGraphData({ nodes, edges });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load graph');
      } finally {
        setLoading(false);
      }
    }

    loadGraph();
  }, [userTier]);

  // Build space color map
  const spaceColorMap = useCallback(() => {
    if (!graphData) return new Map<string, string>();
    const spaces = Array.from(new Set(graphData.nodes.map(n => n.space_id ?? 'none')));
    const map = new Map<string, string>();
    spaces.forEach((s, i) => map.set(s, SPACE_COLOR_PALETTE[i % SPACE_COLOR_PALETTE.length]));
    return map;
  }, [graphData]);

  // Initialize D3 force simulation
  useEffect(() => {
    if (!graphData || !svgRef.current || !containerRef.current) return;

    const svg = d3.select(svgRef.current);
    const container = d3.select(containerRef.current);
    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    svg.attr('width', width).attr('height', height);
    svg.selectAll('*').remove();

    const g = svg.append('g');

    const colorMap = spaceColorMap();

    // Zoom
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    zoomRef.current = zoom;
    svg.call(zoom as any);

    // Simulation
    const simulation = d3.forceSimulation<GraphNode>(graphData.nodes)
      .force('link', d3.forceLink<GraphNode, GraphEdge>(graphData.edges)
        .id((d: any) => d.id)
        .distance((d: any) => 80 + (1 - d.weight) * 120)
        .strength((d: any) => d.weight * 0.5)
      )
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide<GraphNode>().radius((d: any) => 8 + d.importance_score * 24));

    simulationRef.current = simulation;

    // Edges
    const link = g.append('g')
      .attr('stroke', '#1a2535')
      .attr('stroke-opacity', 0.6)
      .selectAll('line')
      .data(graphData.edges)
      .join('line')
      .attr('stroke-width', (d: any) => Math.max(0.5, d.weight * 2));

    // Nodes
    const node = g.append('g')
      .selectAll('circle')
      .data(graphData.nodes)
      .join('circle')
      .attr('r', (d: any) => 4 + d.importance_score * 16)
      .attr('fill', (d: any) => {
        if (d.memory_class && CLASS_COLORS[d.memory_class]) {
          return CLASS_COLORS[d.memory_class];
        }
        return colorMap.get(d.space_id ?? 'none') ?? CLASS_COLORS.default;
      })
      .attr('stroke', '#0A0F1C')
      .attr('stroke-width', 1.5)
      .style('cursor', 'pointer')
      .call(d3.drag<SVGCircleElement, GraphNode>()
        .on('start', (event, d) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x ?? null;
          d.fy = d.y ?? null;
        })
        .on('drag', (event, d) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on('end', (event, d) => {
          if (!event.active) simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        }) as any
      )
      .on('mouseover', (event: MouseEvent, d: GraphNode) => {
        setTooltip({ x: event.clientX, y: event.clientY, node: d });
      })
      .on('mouseout', () => {
        setTooltip(null);
      })
      .on('click', (_event: MouseEvent, d: GraphNode) => {
        setSelectedNode(d);
      });

    // Tick
    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => (d.source as GraphNode).x ?? 0)
        .attr('y1', (d: any) => (d.source as GraphNode).y ?? 0)
        .attr('x2', (d: any) => (d.target as GraphNode).x ?? 0)
        .attr('y2', (d: any) => (d.target as GraphNode).y ?? 0);

      node
        .attr('cx', (d: any) => d.x ?? 0)
        .attr('cy', (d: any) => d.y ?? 0);
    });

    // Cleanup
    return () => {
      simulation.stop();
      svg.selectAll('*').remove();
    };
  }, [graphData, spaceColorMap]);

  // Handle resize
  useEffect(() => {
    function handleResize() {
      if (!containerRef.current || !svgRef.current || !graphData) return;
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      d3.select(svgRef.current).attr('width', width).attr('height', height);
      if (simulationRef.current) {
        simulationRef.current.force('center', d3.forceCenter(width / 2, height / 2));
        simulationRef.current.alpha(0.3).restart();
      }
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [graphData]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0F1C] flex items-center justify-center">
        <div className="flex items-center gap-3 text-[#94A3B8]">
          <div className="w-5 h-5 border-2 border-[#00F5FF]/30 border-t-[#00F5FF] rounded-full animate-spin" />
          Loading memory graph…
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-[#0A0F1C] flex items-center justify-center">
        <div className="text-center">
          <div className="text-[#EF4444] text-lg font-semibold mb-2">Error</div>
          <div className="text-[#94A3B8] text-sm">{error}</div>
        </div>
      </div>
    );
  }

  // Free user gate
  if (userTier && userTier.tier !== 'pro' && userTier.tier !== 'team') {
    return (
      <div className="min-h-screen bg-[#0A0F1C] flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#111827] border border-[#1a2535] flex items-center justify-center mx-auto mb-6">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#00F5FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-3">Memory Graph</h1>
          <p className="text-[#94A3B8] text-sm leading-relaxed mb-8">
            Visualize how your memories connect through co-recall patterns and semantic similarity.
            Upgrade to Pro or Team to unlock the graph view.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => window.location.href = '/pricing'}
              className="w-full py-3 bg-[#00F5FF] hover:bg-[#00D9FF] text-[#0A0F1C] font-semibold rounded-xl transition-colors"
            >
              Upgrade to Pro
            </button>
            <button
              onClick={() => window.location.href = '/dashboard/memories'}
              className="w-full py-3 bg-[#111827] hover:bg-[#1E293B] border border-[#1a2535] text-[#F1F5F9] font-medium rounded-xl transition-colors"
            >
              Back to Memories
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Empty graph state
  if (!graphData || graphData.nodes.length === 0) {
    return (
      <div className="min-h-screen bg-[#0A0F1C] flex items-center justify-center">
        <div className="text-center">
          <div className="text-[#475569] text-lg font-medium mb-2">No memories yet</div>
          <div className="text-[#94A3B8] text-sm">
            Store some memories to see them visualized here.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0F1C] text-[#F1F5F9] relative">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 px-6 py-4 flex items-center justify-between pointer-events-none">
        <div>
          <h1 className="text-xl font-bold text-white">Memory Graph</h1>
          <p className="text-xs text-[#94A3B8]">
            {graphData.nodes.length} nodes · {graphData.edges.length} connections
          </p>
        </div>
        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            onClick={() => {
              if (zoomRef.current && svgRef.current) {
                d3.select(svgRef.current)
                  .transition()
                  .duration(750)
                  .call(zoomRef.current.transform as any, d3.zoomIdentity);
              }
            }}
            className="px-3 py-1.5 bg-[#111827] border border-[#1a2535] rounded-lg text-xs text-[#94A3B8] hover:text-white transition-colors"
          >
            Reset View
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 z-10 bg-[#111827]/90 border border-[#1a2535] rounded-xl p-3 backdrop-blur-sm">
        <p className="text-[10px] uppercase tracking-widest text-[#475569] mb-2 font-medium">Memory Class</p>
        <div className="space-y-1.5">
          {Object.entries(CLASS_COLORS)
            .filter(([k]) => k !== 'default')
            .map(([cls, color]) => (
              <div key={cls} className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                <span className="text-xs text-[#94A3B8] capitalize">{cls}</span>
              </div>
            ))}
        </div>
      </div>

      {/* Graph Container */}
      <div ref={containerRef} className="w-full h-screen">
        <svg ref={svgRef} className="w-full h-full" />
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="fixed z-50 bg-[#111827] border border-[#1a2535] rounded-xl p-3 shadow-xl max-w-xs pointer-events-none"
          style={{
            left: tooltip.x + 12,
            top: tooltip.y - 12,
          }}
        >
          <p className="text-xs text-[#F1F5F9] line-clamp-3 mb-1.5">{tooltip.node.content}</p>
          <div className="flex items-center gap-2 text-[10px] text-[#94A3B8]">
            <span
              className="px-1.5 py-0.5 rounded bg-[#1E293B]"
              style={{
                color: tooltip.node.memory_class
                  ? CLASS_COLORS[tooltip.node.memory_class] ?? CLASS_COLORS.default
                  : CLASS_COLORS.default,
              }}
            >
              {tooltip.node.memory_class ?? 'memory'}
            </span>
            <span>Importance: {(tooltip.node.importance_score * 100).toFixed(0)}%</span>
          </div>
        </div>
      )}

      {/* Detail Side Panel */}
      {selectedNode && (
        <div className="absolute top-0 right-0 bottom-0 w-80 bg-[#111827] border-l border-[#1a2535] z-20 flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#1a2535]">
            <span className="text-xs uppercase tracking-widest text-[#475569] font-medium">Memory Detail</span>
            <button
              onClick={() => setSelectedNode(null)}
              className="text-[#94A3B8] hover:text-white transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
          <div className="flex-1 overflow-auto p-4 space-y-4">
            <div>
              <p className="text-xs uppercase tracking-widest text-[#475569] mb-1.5 font-medium">Content</p>
              <p className="text-sm text-[#F1F5F9] leading-relaxed">{selectedNode.content}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#0A0F1C] rounded-lg p-3 border border-[#1a2535]">
                <p className="text-[10px] uppercase tracking-widest text-[#475569] mb-1">Class</p>
                <p className="text-sm font-medium capitalize" style={{
                  color: selectedNode.memory_class
                    ? CLASS_COLORS[selectedNode.memory_class] ?? CLASS_COLORS.default
                    : CLASS_COLORS.default
                }}>
                  {selectedNode.memory_class ?? 'Unclassified'}
                </p>
              </div>
              <div className="bg-[#0A0F1C] rounded-lg p-3 border border-[#1a2535]">
                <p className="text-[10px] uppercase tracking-widest text-[#475569] mb-1">Importance</p>
                <p className="text-sm font-medium text-[#F1F5F9]">{(selectedNode.importance_score * 100).toFixed(0)}%</p>
              </div>
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-[#475569] mb-1.5 font-medium">Space</p>
              <p className="text-sm text-[#94A3B8]">{selectedNode.space_name ?? 'No space'}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-[#475569] mb-1.5 font-medium">Created</p>
              <p className="text-sm text-[#94A3B8]">
                {new Date(selectedNode.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-[#475569] mb-1.5 font-medium">Digest Level</p>
              <p className="text-sm text-[#94A3B8] capitalize">{selectedNode.digest_level ?? 'None'}</p>
            </div>
          </div>
          <div className="px-4 py-3 border-t border-[#1a2535]">
            <button
              onClick={() => window.location.href = `/dashboard/memories?memory=${selectedNode.id}`}
              className="w-full py-2.5 bg-[#00F5FF] hover:bg-[#00D9FF] text-[#0A0F1C] font-semibold text-sm rounded-lg transition-colors"
            >
              View in Explorer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
