import React, { useState, useRef, useEffect } from "react";
import * as THREE from "three";
import { type Settings, type Pt } from "@/lib/dungeon/model";
import { cn } from "@/lib/utils";

interface ViewCubeProps {
  settings: Settings;
  onUpdateSettings: (patch: Partial<Settings>) => void;
  onResetView: () => void;
  className?: string;
}

export function ViewCube({ settings, onUpdateSettings, onResetView, className }: ViewCubeProps) {
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef<{ x: number; y: number; yaw: number; pitch: number } | null>(null);
  const cubeRef = useRef<HTMLDivElement>(null);

  const yaw = settings.cameraYaw;
  const pitch = settings.cameraPitch;

  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY, yaw, pitch };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !dragStart.current) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;

    const sensitivity = 0.5;
    let nextYaw = dragStart.current.yaw - dx * sensitivity;
    let nextPitch = dragStart.current.pitch + dy * sensitivity;

    // Clamp pitch to avoid gimbal lock or flipping
    nextPitch = Math.max(5, Math.min(85, nextPitch));

    onUpdateSettings({
      cameraYaw: nextYaw,
      cameraPitch: nextPitch,
    });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    dragStart.current = null;

    // Snap to nearest 45/90 if close?
    // For now keep it free-form as requested for drag.
  };

  const setOrientation = (y: number, p: number) => {
    onUpdateSettings({ cameraYaw: y, cameraPitch: p });
  };

  const Face = ({
    label,
    y,
    p,
    className: faceClass,
  }: {
    label: string;
    y: number;
    p: number;
    className?: string;
  }) => (
    <div
      className={cn(
        "absolute inset-0 flex items-center justify-center text-[10px] font-bold uppercase select-none cursor-pointer border border-white/20 bg-black/60 text-white/80 hover:bg-primary/40 hover:text-white transition-colors",
        faceClass,
      )}
      onClick={(e) => {
        e.stopPropagation();
        setOrientation(y, p);
      }}
    >
      {label}
    </div>
  );

  // CSS 3D Cube faces
  // Rotations for the cube container to match camera yaw/pitch
  // Note: We're looking at the cube, so the cube's rotation should reflect the world orientation.
  const style: React.CSSProperties = {
    transform: `rotateX(${pitch - 90}deg) rotateZ(${-yaw}deg)`,
    transformStyle: "preserve-3d",
  };

  return (
    <div className={cn("relative group", className)}>
      <div
        ref={cubeRef}
        className="w-16 h-16 relative"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <div className="w-full h-full transition-transform duration-200 ease-out" style={style}>
          {/* Top (Z+) */}
          <div
            className="absolute inset-0 border border-white/20 bg-blue-500/20"
            style={{ transform: "translateZ(32px)" }}
          >
            <Face label="Top" y={yaw} p={90} className="bg-blue-600/40" />
          </div>
          {/* Bottom (Z-) */}
          <div
            className="absolute inset-0 border border-white/20 bg-blue-900/20"
            style={{ transform: "rotateX(180deg) translateZ(32px)" }}
          >
            <Face label="Bottom" y={yaw} p={5} className="bg-blue-900/60" />
          </div>
          {/* Front (Y-) */}
          <div
            className="absolute inset-0 border border-white/20 bg-green-500/20"
            style={{ transform: "rotateX(90deg) translateZ(32px)" }}
          >
            <Face label="Front" y={-90} p={45} className="bg-green-600/40" />
          </div>
          {/* Back (Y+) */}
          <div
            className="absolute inset-0 border border-white/20 bg-green-900/20"
            style={{ transform: "rotateX(-90deg) translateZ(32px)" }}
          >
            <Face label="Back" y={90} p={45} className="bg-green-900/60" />
          </div>
          {/* Right (X+) */}
          <div
            className="absolute inset-0 border border-white/20 bg-red-500/20"
            style={{ transform: "rotateY(90deg) translateZ(32px)" }}
          >
            <Face label="Right" y={0} p={45} className="bg-red-600/40" />
          </div>
          {/* Left (X-) */}
          <div
            className="absolute inset-0 border border-white/20 bg-red-900/20"
            style={{ transform: "rotateY(-90deg) translateZ(32px)" }}
          >
            <Face label="Left" y={180} p={45} className="bg-red-900/60" />
          </div>
        </div>
      </div>

      {/* Reset/Home Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onResetView();
        }}
        className="absolute -bottom-6 right-0 text-[9px] uppercase font-bold text-muted-foreground hover:text-primary transition-colors bg-black/40 px-1 rounded border border-white/10"
      >
        Home
      </button>
    </div>
  );
}
