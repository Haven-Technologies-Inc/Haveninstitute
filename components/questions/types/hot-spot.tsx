'use client';

import { useState, useRef } from 'react';
import { cn } from '@/lib/utils';
import { MapPin, Check, X } from 'lucide-react';

interface HotSpotProps {
  options?: any;
  userAnswer: { x: number; y: number } | null;
  onAnswerChange: (answer: { x: number; y: number }) => void;
  showResult?: boolean;
  correctAnswers?: any;
  hotSpotData?: {
    imageUrl?: string;
    regions: { x: number; y: number; width: number; height: number; label?: string }[];
  };
  disabled?: boolean;
}

export function HotSpot({
  userAnswer,
  onAnswerChange,
  showResult = false,
  hotSpotData,
  disabled = false,
}: HotSpotProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleClick = (e: React.MouseEvent) => {
    if (disabled || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    onAnswerChange({ x, y });
  };

  const isInRegion = userAnswer && hotSpotData?.regions?.some(
    (region) =>
      userAnswer.x >= region.x &&
      userAnswer.x <= region.x + region.width &&
      userAnswer.y >= region.y &&
      userAnswer.y <= region.y + region.height
  );

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-muted-foreground mb-2">
        Click on the correct area of the image
      </p>
      <div
        ref={containerRef}
        onClick={handleClick}
        className={cn(
          'relative cursor-crosshair rounded-lg border-2 overflow-hidden',
          'bg-muted/30 min-h-[300px]',
          disabled && 'cursor-default'
        )}
      >
        {hotSpotData?.imageUrl ? (
          <img
            src={hotSpotData.imageUrl}
            alt="Hot spot question"
            className="w-full h-auto"
            draggable={false}
          />
        ) : (
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            <div className="text-center">
              <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Click to place your answer</p>
            </div>
          </div>
        )}

        {/* Show correct regions in review mode */}
        {showResult && hotSpotData?.regions?.map((region, i) => (
          <div
            key={i}
            className="absolute border-2 border-dashed border-emerald-500 bg-emerald-500/10 rounded"
            style={{
              left: `${region.x}%`,
              top: `${region.y}%`,
              width: `${region.width}%`,
              height: `${region.height}%`,
            }}
          >
            {region.label && (
              <span className="absolute -top-5 left-0 text-xs font-medium text-emerald-600 bg-white px-1 rounded">
                {region.label}
              </span>
            )}
          </div>
        ))}

        {/* User's click marker */}
        {userAnswer && (
          <div
            className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none"
            style={{ left: `${userAnswer.x}%`, top: `${userAnswer.y}%` }}
          >
            <div className={cn(
              'h-6 w-6 rounded-full border-3 flex items-center justify-center',
              showResult && isInRegion && 'border-emerald-500 bg-emerald-500/30',
              showResult && !isInRegion && 'border-red-500 bg-red-500/30',
              !showResult && 'border-primary bg-primary/30'
            )}>
              {showResult ? (
                isInRegion ? <Check className="h-3 w-3 text-emerald-600" /> : <X className="h-3 w-3 text-red-600" />
              ) : (
                <div className="h-2 w-2 rounded-full bg-primary" />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
