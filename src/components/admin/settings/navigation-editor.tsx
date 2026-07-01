"use client";

import { useCallback, useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  GripVertical,
  Link2,
  Plus,
  Trash2,
  CornerDownRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { NavEditorItem } from "@/features/settings/get-settings-data";

function newItem(label = ""): NavEditorItem {
  return {
    clientId: `nav-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    label,
    url: "",
    children: [],
  };
}

function moveItem<T>(items: T[], from: number, to: number): T[] {
  if (to < 0 || to >= items.length) return items;
  const next = [...items];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

type NavigationEditorProps = {
  items: NavEditorItem[];
  onChange: (items: NavEditorItem[]) => void;
};

export function NavigationEditor({ items, onChange }: NavigationEditorProps) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const toggleExpanded = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const updateItem = (index: number, patch: Partial<NavEditorItem>) => {
    const next = [...items];
    next[index] = { ...next[index], ...patch };
    onChange(next);
  };

  const updateChild = (parentIndex: number, childIndex: number, patch: Partial<NavEditorItem>) => {
    const next = [...items];
    const children = [...next[parentIndex].children];
    children[childIndex] = { ...children[childIndex], ...patch };
    next[parentIndex] = { ...next[parentIndex], children };
    onChange(next);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4 rounded-xl border border-stone-200 bg-stone-50/80 p-4">
        <div>
          <h3 className="text-sm font-semibold text-stone-900">Main navigation</h3>
          <p className="mt-1 text-xs text-stone-500">
            Manage header menu links. Add sub-items under any item for dropdown-style menus on mobile.
          </p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={() => onChange([...items, newItem("New link")])}>
          <Plus className="mr-1 h-3.5 w-3.5" />
          Add link
        </Button>
      </div>

      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-stone-300 py-16 text-center">
          <Link2 className="mx-auto mb-2 h-8 w-8 text-stone-300" />
          <p className="text-sm text-stone-500">No menu links yet</p>
          <Button type="button" variant="outline" size="sm" className="mt-3" onClick={() => onChange([newItem("Home")])}>
            Create first link
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item, index) => {
            const isExpanded = expanded.has(item.clientId) || item.children.length > 0;
            return (
              <div key={item.clientId} className="overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm">
                <div className="flex flex-wrap items-center gap-2 border-b border-stone-100 bg-stone-50/50 p-3">
                  <GripVertical className="h-4 w-4 shrink-0 text-stone-300" />
                  <div className="grid min-w-0 flex-1 gap-2 sm:grid-cols-2">
                    <Input
                      value={item.label}
                      onChange={(e) => updateItem(index, { label: e.target.value })}
                      placeholder="Label"
                      className="h-9 bg-white text-sm"
                    />
                    <Input
                      value={item.url}
                      onChange={(e) => updateItem(index, { url: e.target.value })}
                      placeholder="/products/"
                      className="h-9 bg-white font-mono text-sm"
                    />
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <Button type="button" variant="ghost" size="icon" className="h-8 w-8" disabled={index === 0} onClick={() => onChange(moveItem(items, index, index - 1))}>
                      <ChevronUp className="h-4 w-4" />
                    </Button>
                    <Button type="button" variant="ghost" size="icon" className="h-8 w-8" disabled={index === items.length - 1} onClick={() => onChange(moveItem(items, index, index + 1))}>
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => {
                        const next = [...items];
                        next[index] = {
                          ...next[index],
                          children: [...next[index].children, newItem("")],
                        };
                        onChange(next);
                        setExpanded((prev) => new Set(prev).add(item.clientId));
                      }}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-500 hover:text-red-600"
                      onClick={() => onChange(items.filter((_, i) => i !== index))}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {item.children.length > 0 ? (
                  <div className="space-y-2 p-3">
                    <button
                      type="button"
                      className="flex items-center gap-1 text-xs font-medium text-stone-500"
                      onClick={() => toggleExpanded(item.clientId)}
                    >
                      <ChevronDown className={`h-3.5 w-3.5 transition ${isExpanded ? "rotate-0" : "-rotate-90"}`} />
                      {item.children.length} sub-link{item.children.length === 1 ? "" : "s"}
                    </button>

                    {isExpanded ? (
                      <div className="space-y-2 border-l-2 border-stone-200 pl-3">
                        {item.children.map((child, childIndex) => (
                          <div key={child.clientId} className="flex flex-wrap items-center gap-2 rounded-lg border border-stone-100 bg-stone-50/50 p-2">
                            <CornerDownRight className="h-3.5 w-3.5 shrink-0 text-stone-400" />
                            <Input
                              value={child.label}
                              onChange={(e) => updateChild(index, childIndex, { label: e.target.value })}
                              placeholder="Sub label"
                              className="h-8 min-w-[120px] flex-1 bg-white text-sm"
                            />
                            <Input
                              value={child.url}
                              onChange={(e) => updateChild(index, childIndex, { url: e.target.value })}
                              placeholder="/massage-beds/"
                              className="h-8 min-w-[140px] flex-1 bg-white font-mono text-sm"
                            />
                            <div className="flex gap-1">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                disabled={childIndex === 0}
                                onClick={() => {
                                  const next = [...items];
                                  next[index] = {
                                    ...next[index],
                                    children: moveItem(next[index].children, childIndex, childIndex - 1),
                                  };
                                  onChange(next);
                                }}
                              >
                                <ChevronUp className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                disabled={childIndex === item.children.length - 1}
                                onClick={() => {
                                  const next = [...items];
                                  next[index] = {
                                    ...next[index],
                                    children: moveItem(next[index].children, childIndex, childIndex + 1),
                                  };
                                  onChange(next);
                                }}
                              >
                                <ChevronDown className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-red-500"
                                onClick={() => {
                                  const next = [...items];
                                  next[index] = {
                                    ...next[index],
                                    children: next[index].children.filter((_, i) => i !== childIndex),
                                  };
                                  onChange(next);
                                }}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>
                        ))}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="mt-1"
                          onClick={() => {
                            const next = [...items];
                            next[index] = {
                              ...next[index],
                              children: [...next[index].children, newItem("")],
                            };
                            onChange(next);
                          }}
                        >
                          <Plus className="mr-1 h-3.5 w-3.5" />
                          Add sub-link
                        </Button>
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
