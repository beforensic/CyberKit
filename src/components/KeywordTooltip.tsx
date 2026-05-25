import { useState, useEffect, useRef, useId, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Loader } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface KeywordTooltipProps {
  keyword: string;
  children: React.ReactNode;
}

const explanationCache = new Map<string, string>();

const TOOLTIP_MAX_WIDTH = 400;
const TOOLTIP_MAX_HEIGHT = 280;
const VIEWPORT_MARGIN = 12;
const GAP = 10;

type TooltipPosition = {
  top: number;
  left: number;
  width: number;
  placeAbove: boolean;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export default function KeywordTooltip({ keyword, children }: KeywordTooltipProps) {
  const tooltipId = useId();
  const [showTooltip, setShowTooltip] = useState(false);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [position, setPosition] = useState<TooltipPosition | null>(null);
  const touchTimeoutRef = useRef<number | null>(null);
  const closeDelayRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLButtonElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const updatePosition = useCallback(() => {
    const anchor = containerRef.current;
    if (!anchor) return;

    const rect = anchor.getBoundingClientRect();
    const width = Math.min(TOOLTIP_MAX_WIDTH, window.innerWidth - VIEWPORT_MARGIN * 2);
    const spaceAbove = rect.top - VIEWPORT_MARGIN;
    const spaceBelow = window.innerHeight - rect.bottom - VIEWPORT_MARGIN;
    const placeAbove = spaceAbove >= spaceBelow && spaceAbove > 80;

    let left = rect.left + rect.width / 2 - width / 2;
    left = clamp(left, VIEWPORT_MARGIN, window.innerWidth - width - VIEWPORT_MARGIN);

    const top = placeAbove ? rect.top - GAP : rect.bottom + GAP;

    setPosition({ top, left, width, placeAbove });
  }, []);

  useEffect(() => {
    return () => {
      if (touchTimeoutRef.current) clearTimeout(touchTimeoutRef.current);
      if (closeDelayRef.current) clearTimeout(closeDelayRef.current);
    };
  }, []);

  const cancelScheduledClose = () => {
    if (closeDelayRef.current) {
      clearTimeout(closeDelayRef.current);
      closeDelayRef.current = null;
    }
  };

  const scheduleClose = () => {
    cancelScheduledClose();
    closeDelayRef.current = window.setTimeout(() => closeTooltip(), 200);
  };

  useEffect(() => {
    if (!showTooltip) return;

    updatePosition();

    const handleLayoutChange = () => updatePosition();
    window.addEventListener('resize', handleLayoutChange);
    window.addEventListener('scroll', handleLayoutChange, true);

    return () => {
      window.removeEventListener('resize', handleLayoutChange);
      window.removeEventListener('scroll', handleLayoutChange, true);
    };
  }, [showTooltip, explanation, loading, error, updatePosition]);

  useEffect(() => {
    if (!showTooltip || !tooltipRef.current) return;
    updatePosition();
  }, [showTooltip, explanation, loading, error, updatePosition]);

  const fetchExplanation = async () => {
    if (explanationCache.has(keyword)) {
      setExplanation(explanationCache.get(keyword)!);
      return;
    }

    setLoading(true);
    setError(false);

    try {
      const { data, error: invokeError } = await supabase.functions.invoke('explain-keyword', {
        body: { keyword },
      });

      if (invokeError) throw invokeError;
      if (!data?.explanation) throw new Error('Empty explanation');

      const sanitizedExplanation = data.explanation as string;

      explanationCache.set(keyword, sanitizedExplanation);
      setExplanation(sanitizedExplanation);
    } catch (err) {
      console.error('Error fetching explanation:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const openTooltip = () => {
    setShowTooltip(true);
    if (!explanation && !loading && !error) {
      fetchExplanation();
    }
  };

  const closeTooltip = () => {
    cancelScheduledClose();
    setShowTooltip(false);
    setPosition(null);
    if (touchTimeoutRef.current) {
      clearTimeout(touchTimeoutRef.current);
      touchTimeoutRef.current = null;
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    e.stopPropagation();
    if (!showTooltip) {
      openTooltip();
      touchTimeoutRef.current = window.setTimeout(() => {
        closeTooltip();
      }, 8000);
    } else {
      closeTooltip();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      closeTooltip();
    }
  };

  const tooltipContent =
    showTooltip && position ? (
      <div
        id={tooltipId}
        ref={tooltipRef}
        role="tooltip"
        aria-live="polite"
        className="fixed z-[200] rounded-xl bg-slate-800 text-white shadow-2xl ring-1 ring-white/10 pointer-events-auto"
        onMouseEnter={cancelScheduledClose}
        onMouseLeave={scheduleClose}
        style={{
          left: position.left,
          top: position.top,
          width: position.width,
          maxHeight: `min(${TOOLTIP_MAX_HEIGHT}px, calc(100vh - ${VIEWPORT_MARGIN * 2}px))`,
          transform: position.placeAbove ? 'translateY(-100%)' : undefined,
        }}
      >
        <div
          className="overflow-y-auto overscroll-contain px-4 py-3.5 text-sm leading-relaxed break-words"
          style={{ maxHeight: `min(${TOOLTIP_MAX_HEIGHT}px, calc(100vh - ${VIEWPORT_MARGIN * 2}px))` }}
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-3">
              <Loader className="w-4 h-4 animate-spin shrink-0" aria-hidden="true" />
              <span>Chargement…</span>
            </div>
          ) : error ? (
            <p>Explication temporairement indisponible.</p>
          ) : explanation ? (
            <p>{explanation}</p>
          ) : null}
        </div>

        <div
          className="absolute w-2.5 h-2.5 bg-slate-800 rotate-45 left-1/2 -translate-x-1/2"
          style={position.placeAbove ? { bottom: -5 } : { top: -5 }}
          aria-hidden="true"
        />
      </div>
    ) : null;

  return (
    <>
      <button
        type="button"
        ref={containerRef}
        className="focus-ring relative inline-block cursor-help border-0 bg-transparent p-0 font-inherit text-inherit"
        aria-describedby={showTooltip ? tooltipId : undefined}
        aria-expanded={showTooltip}
        aria-busy={loading}
        onMouseEnter={() => {
          cancelScheduledClose();
          openTooltip();
        }}
        onMouseLeave={scheduleClose}
        onFocus={openTooltip}
        onBlur={scheduleClose}
        onKeyDown={handleKeyDown}
        onTouchStart={handleTouchStart}
      >
        {children}
      </button>

      {typeof document !== 'undefined' && tooltipContent
        ? createPortal(tooltipContent, document.body)
        : null}
    </>
  );
}
