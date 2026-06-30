'use client';

import React, { useState, useEffect } from 'react';

export interface AgentConfig {
  id: string;
  agent_name: string;
  provider: string;
  model: string;
  daily_spend_limit: number;
  current_spend: number;
  requires_hitl: boolean;
  hitl_tool_rules: Record<string, boolean>;
  context_window_max: number;
}

export default function AgentConfigPage() {
  const [configs, setConfigs] = useState<AgentConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  const fetchConfigs = async () => {
    try {
      const res = await fetch('/api/agent-config');
      const data = await res.json();
      setConfigs(data.configs || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        await fetchConfigs();
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  const updateConfig = async (id: string, updates: Partial<AgentConfig>) => {
    setSaving(id);
    try {
      await fetch(`/api/agent-config/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      await fetchConfigs();
    } finally {
      setSaving(null);
    }
  };

  if (loading) return React.createElement("div", { className: "p-8" }, "Loading agent configurations...");

  const items = configs.map((config) =>
    React.createElement(
      "div",
      { key: config.id, className: "border border-[#334155] rounded-lg p-6 bg-[#111827]" },
      React.createElement(
        "div",
        { className: "flex justify-between items-start mb-4" },
        React.createElement(
          "div",
          null,
          React.createElement("div", { className: "font-mono text-lg" }, config.agent_name),
          React.createElement("div", { className: "text-sm text-[#94A3B8]" }, `${config.provider} · ${config.model}`)
        ),
        React.createElement(
          "div",
          { className: "text-right" },
          React.createElement("div", { className: "text-sm" }, "Daily Limit"),
          React.createElement(
            "div",
            { className: "text-xl font-semibold" },
            "$" + (config.daily_spend_limit / 100).toFixed(2)
          )
        )
      ),
      React.createElement(
        "div",
        { className: "grid grid-cols-1 md:grid-cols-3 gap-4 mb-4" },
        React.createElement(
          "div",
          null,
          React.createElement("label", { className: "text-xs text-[#94A3B8]" }, "Current Spend"),
          React.createElement("div", { className: "text-lg" }, "$" + (config.current_spend / 100).toFixed(2)),
          React.createElement(
            "div",
            { className: "text-xs text-[#64748B]" },
            Math.round((config.current_spend / config.daily_spend_limit) * 100) + "% used"
          )
        ),
        React.createElement(
          "div",
          null,
          React.createElement("label", { className: "text-xs text-[#94A3B8]" }, "Context Window"),
          React.createElement("input", {
            type: "number",
            value: config.context_window_max,
            onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
              updateConfig(config.id, { context_window_max: parseInt(e.target.value) }),
            className: "bg-[#0A0F1C] border border-[#334155] rounded px-3 py-1 w-full",
          })
        ),
        React.createElement(
          "div",
          { className: "flex items-center gap-2 pt-5" },
          React.createElement("input", {
            type: "checkbox",
            checked: config.requires_hitl,
            onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
              updateConfig(config.id, { requires_hitl: e.target.checked }),
            id: `hitl-${config.id}`,
          }),
          React.createElement(
            "label",
            { htmlFor: `hitl-${config.id}`, className: "text-sm" },
            "Require HITL by default"
          )
        )
      ),
      React.createElement(
        "div",
        { className: "text-xs text-[#64748B]" },
        "Per-tool HITL rules: ",
        React.createElement("code", null, JSON.stringify(config.hitl_tool_rules))
      ),
      saving === config.id ? React.createElement("div", { className: "text-xs mt-2 text-[#00F5FF]" }, "Saving...") : null
    )
  );

  return React.createElement(
    "div",
    { className: "p-8 max-w-5xl" },
    React.createElement("h1", { className: "text-2xl font-semibold mb-6" }, "Agent Configurations & Spend Controls"),
    React.createElement("div", { className: "space-y-6" }, ...items),
    React.createElement(
      "div",
      { className: "mt-8 text-sm text-[#64748B]" },
      "Tip: Use the ",
      React.createElement("code", null, "hitl_tool_rules"),
      " JSON field via API for fine-grained control per tool."
    )
  );
}
