"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

// ─── Types ────────────────────────────────────────────────────────────────────

interface TimePickerProps {
    value: string; // "HH:MM" or ""
    onChange: (value: string) => void;
    label: string;
}

interface DrumColumnProps {
    items: string[];
    selected: number;
    onSelect: (index: number) => void;
    label: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const ITEM_HEIGHT = 40;
const VISIBLE_ITEMS = 5;
const DRAG_THRESHOLD = 3;

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"));

// ─── Hook ─────────────────────────────────────────────────────────────────────

function useIsDesktop() {
    const [isDesktop, setIsDesktop] = useState(false);
    useEffect(() => {
        const mq = window.matchMedia("(min-width: 640px)");
        setIsDesktop(mq.matches);
        const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
        mq.addEventListener("change", handler);
        return () => mq.removeEventListener("change", handler);
    }, []);
    return isDesktop;
}

// ─── DrumColumn ───────────────────────────────────────────────────────────────

function DrumColumn({ items, selected, onSelect, label }: DrumColumnProps) {
    const drumRef = useRef<HTMLDivElement>(null);
    const isDragging = useRef(false);
    const startY = useRef(0);
    const startSelected = useRef(selected);
    const lastSelected = useRef(selected);
    const velocity = useRef(0);
    const lastY = useRef(0);
    const lastTime = useRef(0);
    const animFrame = useRef<number>(0);

    const clamp = (v: number) => Math.max(0, Math.min(items.length - 1, v));
    const getOffset = (idx: number) => -(idx * ITEM_HEIGHT);

    const runInertia = useCallback(
        (vel: number, current: number) => {
            let v = vel;
            let pos = current;
            const step = () => {
                v *= 0.88;
                pos -= v;
                if (Math.abs(v) < 0.5) { onSelect(clamp(Math.round(pos / ITEM_HEIGHT))); return; }
                onSelect(clamp(Math.round(pos / ITEM_HEIGHT)));
                animFrame.current = requestAnimationFrame(step);
            };
            animFrame.current = requestAnimationFrame(step);
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [items.length, onSelect]
    );

    const onPointerDown = (e: React.PointerEvent) => {
        e.stopPropagation();
        cancelAnimationFrame(animFrame.current);
        isDragging.current = false;
        startY.current = e.clientY;
        lastY.current = e.clientY;
        lastTime.current = performance.now();
        startSelected.current = selected;
        lastSelected.current = selected;
        velocity.current = 0;
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    };

    const onPointerMove = (e: React.PointerEvent) => {
        e.stopPropagation();
        if (!e.buttons) return;
        const dy = e.clientY - startY.current;
        if (Math.abs(dy) > DRAG_THRESHOLD) isDragging.current = true;
        if (!isDragging.current) return;
        const now = performance.now();
        const dt = now - lastTime.current;
        if (dt > 0) velocity.current = (e.clientY - lastY.current) / dt;
        lastY.current = e.clientY;
        lastTime.current = now;
        const moved = -dy / ITEM_HEIGHT;
        const next = clamp(Math.round(startSelected.current + moved));
        if (next !== lastSelected.current) { lastSelected.current = next; onSelect(next); }
    };

    const onPointerUp = (e: React.PointerEvent) => {
        if (!isDragging.current) {
            const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
            const relY = e.clientY - rect.top;
            const center = (VISIBLE_ITEMS * ITEM_HEIGHT) / 2;
            onSelect(clamp(selected + Math.round((relY - center) / ITEM_HEIGHT)));
        } else {
            const vel = -velocity.current * 16;
            if (Math.abs(vel) > 1) runInertia(vel, selected * ITEM_HEIGHT);
        }
        isDragging.current = false;
    };

    const onWheel = (delta: number) => {
        cancelAnimationFrame(animFrame.current);
        onSelect(clamp(selected + delta));
    };

    // Block scroll propagation with non-passive listeners (React's onWheel is passive by default)
    useEffect(() => {
        const el = drumRef.current;
        if (!el) return;

        const handleWheel = (e: WheelEvent) => {
            e.preventDefault();
            e.stopPropagation();
            onSelect(clamp(selected + (e.deltaY > 0 ? 1 : -1)));
        };

        const handleTouch = (e: TouchEvent) => {
            e.stopPropagation();
        };

        el.addEventListener("wheel", handleWheel, { passive: false });
        el.addEventListener("touchmove", handleTouch, { passive: false });
        return () => {
            el.removeEventListener("wheel", handleWheel);
            el.removeEventListener("touchmove", handleTouch);
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selected, onSelect]);

    const containerHeight = VISIBLE_ITEMS * ITEM_HEIGHT;
    const translateY = (containerHeight / 2 - ITEM_HEIGHT / 2) + getOffset(selected);

    return (
        <div className="flex flex-col items-center gap-1 select-none">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground/50 font-medium">{label}</span>
            <div
                ref={drumRef}
                className="relative overflow-hidden cursor-grab active:cursor-grabbing"
                style={{ height: containerHeight, width: 72 }}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
            >
                <div
                    className="absolute inset-0 z-10 pointer-events-none"
                    style={{
                        background:
                            "linear-gradient(to bottom, var(--drum-bg) 0%, transparent 35%, transparent 65%, var(--drum-bg) 100%)",
                    }}
                />
                <div
                    className="absolute left-0 right-0 z-10 pointer-events-none rounded-lg border border-ring/20 bg-muted/40"
                    style={{ top: "50%", transform: "translateY(-50%)", height: ITEM_HEIGHT }}
                />
                <motion.div
                    className="absolute left-0 right-0"
                    animate={{ y: translateY }}
                    transition={{ type: "spring", stiffness: 500, damping: 42, mass: 0.7 }}
                >
                    {items.map((item, idx) => {
                        const dist = Math.abs(idx - selected);
                        return (
                            <div
                                key={item}
                                className="flex items-center justify-center font-mono font-semibold tabular-nums"
                                style={{
                                    height: ITEM_HEIGHT,
                                    fontSize: dist === 0 ? 26 : 17,
                                    opacity: dist === 0 ? 1 : dist === 1 ? 0.45 : 0.18,
                                    transform: `scale(${dist === 0 ? 1 : dist === 1 ? 0.88 : 0.78})`,
                                    transition: "opacity 0.15s, transform 0.15s, font-size 0.15s",
                                    color: dist === 0 ? "hsl(var(--foreground))" : "hsl(var(--muted-foreground))",
                                }}
                            >
                                {item}
                            </div>
                        );
                    })}
                </motion.div>
            </div>
        </div>
    );
}

// ─── DrumPicker ───────────────────────────────────────────────────────────────

interface DrumPickerProps {
    hour: number;
    minute: number;
    setHour: (h: number) => void;
    setMinute: (m: number) => void;
    onConfirm: () => void;
    onClear: () => void;
}

function DrumPicker({ hour, minute, setHour, setMinute, onConfirm, onClear }: DrumPickerProps) {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-center gap-3">
                <DrumColumn items={HOURS} selected={hour} onSelect={setHour} label="hora" />
                <span className="font-mono font-bold text-2xl text-muted-foreground/40 select-none mt-5">:</span>
                <DrumColumn items={MINUTES} selected={minute} onSelect={setMinute} label="min" />
            </div>
            <div className="flex gap-2">
                <button
                    type="button"
                    onClick={onClear}
                    className="flex-1 h-10 rounded-xl border border-input text-sm text-muted-foreground hover:bg-muted transition-colors"
                >
                    Limpar
                </button>
                <button
                    type="button"
                    onClick={onConfirm}
                    className="flex-1 h-10 rounded-xl bg-primary text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                    OK
                </button>
            </div>
        </div>
    );
}

// ─── TimePicker ───────────────────────────────────────────────────────────────

export function TimePicker({ value, onChange, label }: TimePickerProps) {
    const [open, setOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const isDesktop = useIsDesktop();

    const parsed = value.match(/^(\d{2}):(\d{2})$/);
    const [hour, setHour] = useState(parsed ? parseInt(parsed[1]) : 8);
    const [minute, setMinute] = useState(parsed ? parseInt(parsed[2]) : 0);

    useEffect(() => {
        if (open) {
            const p = value.match(/^(\d{2}):(\d{2})$/);
            setHour(p ? parseInt(p[1]) : 8);
            setMinute(p ? parseInt(p[2]) : 0);
        }
    }, [open]);

    const confirm = () => {
        onChange(`${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`);
        setOpen(false);
    };

    const clear = () => {
        onChange("");
        setOpen(false);
    };

    // Desktop: close on outside click
    useEffect(() => {
        if (!open || !isDesktop) return;
        const handler = (e: PointerEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("pointerdown", handler);
        return () => document.removeEventListener("pointerdown", handler);
    }, [open, isDesktop]);

    const triggerClass =
        "w-full rounded-lg border border-input bg-muted/30 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-all cursor-pointer select-none text-left";

    const trigger = (
        <button type="button" className={triggerClass} onClick={() => setOpen((v) => !v)}>
            {value
                ? <span className="font-mono tabular-nums">{value}</span>
                : <span className="text-muted-foreground/50">--:--</span>
            }
        </button>
    );

    // ── Mobile: inline expand ─────────────────────────────────────────────────
    if (!isDesktop) {
        return (
            <div
                className="flex-1 space-y-1"
                style={{ "--drum-bg": "hsl(var(--card))" } as React.CSSProperties}
            >
                <span className="text-[10px] text-muted-foreground/60 uppercase tracking-wide">{label}</span>
                {trigger}

                <AnimatePresence initial={false}>
                    {open && (
                        <motion.div
                            key="inline-picker"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{
                                opacity: 1,
                                height: "auto",
                                transition: { duration: 0.25, ease: [0.25, 0.1, 0.25, 1] },
                            }}
                            exit={{
                                opacity: 0,
                                height: 0,
                                transition: { duration: 0.18, ease: [0.4, 0, 1, 1] },
                            }}
                            className="overflow-hidden"
                        >
                            <div className="pt-3 pb-1">
                                <DrumPicker
                                    hour={hour}
                                    minute={minute}
                                    setHour={setHour}
                                    setMinute={setMinute}
                                    onConfirm={confirm}
                                    onClear={clear}
                                />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        );
    }

    // ── Desktop: popover ──────────────────────────────────────────────────────
    return (
        <div
            ref={wrapperRef}
            className="relative flex-1 space-y-1"
            style={{ "--drum-bg": "hsl(var(--card))" } as React.CSSProperties}
        >
            <span className="text-[10px] text-muted-foreground/60 uppercase tracking-wide">{label}</span>
            {trigger}

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.94, y: -6 }}
                        animate={{ opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 420, damping: 28 } }}
                        exit={{ opacity: 0, scale: 0.94, y: -4, transition: { duration: 0.14 } }}
                        className="absolute z-30 left-1/2 -translate-x-1/2 top-full mt-2 w-56 rounded-2xl border border-border bg-card shadow-2xl overflow-hidden p-4"
                        onPointerDown={(e) => e.stopPropagation()}
                    >
                        <div className="absolute inset-0 rounded-2xl pointer-events-none ring-1 ring-inset ring-white/5" />
                        <DrumPicker
                            hour={hour}
                            minute={minute}
                            setHour={setHour}
                            setMinute={setMinute}
                            onConfirm={confirm}
                            onClear={clear}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}