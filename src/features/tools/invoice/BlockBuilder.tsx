"use client";

import { useState } from "react";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Building2,
  CreditCard,
  Eye,
  EyeOff,
  FileText,
  GripVertical,
  Minus,
  MoveVertical,
  PenLine,
  Plus,
  Receipt,
  StickyNote,
  Table,
  Trash2,
  Type,
  User,
} from "lucide-react";

import { glass } from "../shared";
import type { Tokens } from "../shared";
import { ADDABLE_BLOCKS, BLOCK_META, type Block, type BlockType } from "./engine";

const ICONS: Record<BlockType, typeof FileText> = {
  brand: Building2,
  meta: FileText,
  client: User,
  items: Table,
  totals: Receipt,
  signature: PenLine,
  payment: CreditCard,
  notes: StickyNote,
  text: Type,
  divider: Minus,
  spacer: MoveVertical,
};

function CardInner({
  tokens,
  block,
  selected,
  onSelect,
  onToggleSpan,
  onToggleHidden,
  onDelete,
  dragHandle,
}: {
  tokens: Tokens;
  block: Block;
  selected: boolean;
  onSelect: () => void;
  onToggleSpan: () => void;
  onToggleHidden: () => void;
  onDelete: () => void;
  dragHandle?: React.ReactNode;
}) {
  const Icon = ICONS[block.type];
  const ctrl = (label: string, color: string, onClick: () => void, children: React.ReactNode) => (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      onPointerDown={(e) => e.stopPropagation()}
      style={{
        width: 28,
        height: 28,
        borderRadius: 8,
        border: "none",
        background: `${color}1f`,
        color,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      {children}
    </button>
  );

  return (
    <div
      onClick={onSelect}
      style={{
        ...glass(selected ? "primary" : "secondary"),
        border: `1px solid ${selected ? tokens.blue : "rgba(255,255,255,0.12)"}`,
        borderRadius: tokens.r13,
        padding: "9px 9px 8px",
        cursor: "pointer",
        opacity: block.hidden ? 0.45 : 1,
        transition: "border-color .15s, opacity .15s",
        display: "flex",
        flexDirection: "column",
        gap: 8,
        minHeight: 58,
        height: "100%",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        {dragHandle}
        <Icon size={15} style={{ color: selected ? tokens.blue : tokens.label2, flexShrink: 0 }} />
        <span style={{ fontSize: 12.5, fontWeight: 700, color: tokens.label1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {BLOCK_META[block.type].label}
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: "auto" }}>
        {ctrl(block.span === 2 ? "חצי רוחב" : "רוחב מלא", tokens.label2, onToggleSpan, (
          <span style={{ fontSize: 11, fontWeight: 800 }}>{block.span === 2 ? "½" : "1"}</span>
        ))}
        {ctrl(block.hidden ? "הצג" : "הסתר", block.hidden ? tokens.label3 : tokens.green, onToggleHidden, block.hidden ? <EyeOff size={14} /> : <Eye size={14} />)}
        <div style={{ flex: 1 }} />
        {ctrl("מחק", tokens.red, onDelete, <Trash2 size={14} />)}
      </div>
    </div>
  );
}

function SortableCard(props: {
  tokens: Tokens;
  block: Block;
  selected: boolean;
  onSelect: () => void;
  onToggleSpan: () => void;
  onToggleHidden: () => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: props.block.id });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.35 : 1,
  };
  const handle = (
    <span
      {...attributes}
      {...listeners}
      aria-label="גרור לסידור"
      style={{ display: "flex", alignItems: "center", cursor: "grab", color: props.tokens.label3, marginInlineStart: -2, touchAction: "none" }}
      onClick={(e) => e.stopPropagation()}
    >
      <GripVertical size={16} />
    </span>
  );
  return (
    <div ref={setNodeRef} style={style}>
      <CardInner {...props} dragHandle={handle} />
    </div>
  );
}

export function BlockBuilder({
  tokens,
  blocks,
  selectedId,
  onReorder,
  onSelect,
  onToggleSpan,
  onToggleHidden,
  onDelete,
  onAdd,
}: {
  tokens: Tokens;
  blocks: Block[];
  selectedId: string | null;
  onReorder: (next: Block[]) => void;
  onSelect: (id: string) => void;
  onToggleSpan: (id: string) => void;
  onToggleHidden: (id: string) => void;
  onDelete: (id: string) => void;
  onAdd: (type: BlockType) => void;
}) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [paletteOpen, setPaletteOpen] = useState(false);

  // Long-press / hold to start dragging; a quick tap stays a click (=edit).
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { delay: 200, tolerance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const onDragStart = (e: DragStartEvent) => setActiveId(String(e.active.id));
  const onDragEnd = (e: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIndex = blocks.findIndex((b) => b.id === active.id);
    const newIndex = blocks.findIndex((b) => b.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    onReorder(arrayMove(blocks, oldIndex, newIndex));
  };

  const activeBlock = activeId ? blocks.find((b) => b.id === activeId) ?? null : null;
  const present = new Set(blocks.map((b) => b.type));
  const addable = ADDABLE_BLOCKS.filter((t) => !(BLOCK_META[t].unique && present.has(t)));

  return (
    <div>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={onDragStart} onDragEnd={onDragEnd} onDragCancel={() => setActiveId(null)}>
        <SortableContext items={blocks.map((b) => b.id)} strategy={rectSortingStrategy}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {blocks.map((b) => (
              <SortableCard
                key={b.id}
                tokens={tokens}
                block={b}
                selected={selectedId === b.id}
                onSelect={() => onSelect(b.id)}
                onToggleSpan={() => onToggleSpan(b.id)}
                onToggleHidden={() => onToggleHidden(b.id)}
                onDelete={() => onDelete(b.id)}
              />
            ))}
          </div>
        </SortableContext>
        <DragOverlay>
          {activeBlock ? (
            <CardInner
              tokens={tokens}
              block={activeBlock}
              selected
              onSelect={() => {}}
              onToggleSpan={() => {}}
              onToggleHidden={() => {}}
              onDelete={() => {}}
            />
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Add-block palette */}
      <div style={{ marginTop: 10 }}>
        <button
          type="button"
          onClick={() => setPaletteOpen((o) => !o)}
          style={{
            width: "100%",
            ...glass("thin"),
            border: `1px dashed ${tokens.sep}`,
            borderRadius: tokens.r13,
            padding: "11px 14px",
            color: tokens.label2,
            fontSize: 13.5,
            fontWeight: 700,
            fontFamily: "inherit",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 7,
          }}
        >
          <Plus size={16} /> הוספת בלוק
        </button>
        {paletteOpen ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px,1fr))", gap: 8, marginTop: 8 }}>
            {addable.map((t) => {
              const Icon = ICONS[t];
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => {
                    onAdd(t);
                    setPaletteOpen(false);
                  }}
                  style={{
                    ...glass("ultra"),
                    borderRadius: tokens.r13,
                    border: `1px solid ${tokens.sep}`,
                    padding: "10px 8px",
                    color: tokens.label1,
                    fontSize: 12.5,
                    fontWeight: 600,
                    fontFamily: "inherit",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 7,
                  }}
                >
                  <Icon size={14} style={{ color: tokens.label2 }} /> {BLOCK_META[t].label}
                </button>
              );
            })}
          </div>
        ) : null}
      </div>
    </div>
  );
}
