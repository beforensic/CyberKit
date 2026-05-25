import { useState, useEffect, useRef } from 'react';
import { Loader } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface KeywordTooltipProps {
  keyword: string;
  children: React.ReactNode;
}

const explanationCache = new Map<string, string>();

export default function KeywordTooltip({ keyword, children }: KeywordTooltipProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [tooltipOffset, setTooltipOffset] = useState(0);
  const timeoutRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (showTooltip && containerRef.current && tooltipRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const spacing = 8;

      const centerLeft = containerRect.left + containerRect.width / 2 - tooltipRect.width / 2;
      const centerRight = centerLeft + tooltipRect.width;

      let offset = 0;

      if (centerRight > viewportWidth - spacing) {
        offset = viewportWidth - spacing - centerRight;
      } else if (centerLeft < spacing) {
        offset = spacing - centerLeft;
      }

      setTooltipOffset(offset);
    }
  }, [showTooltip, explanation, loading, error]);

  const fetchExplanation = async () => {
    if (explanationCache.has(keyword)) {
      setExplanation(explanationCache.get(keyword)!);
      return;
    }

    setLoading(true);
    setError(false);

    try {
      const { data, error } = await supabase.functions.invoke('explain-keyword', {
        body: { keyword },
      });

      if (error) throw error;
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

  const handleMouseEnter = () => {
    setShowTooltip(true);
    if (!explanation && !loading && !error) {
      fetchExplanation();
    }
  };

  const handleMouseLeave = () => {
    setShowTooltip(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    e.stopPropagation();
    if (!showTooltip) {
      setShowTooltip(true);
      if (!explanation && !loading && !error) {
        fetchExplanation();
      }

      timeoutRef.current = window.setTimeout(() => {
        setShowTooltip(false);
      }, 5000);
    } else {
      setShowTooltip(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
    >
      {children}

      {showTooltip && (
        <div
          ref={tooltipRef}
          className="absolute z-50 text-sm bg-slate-800 text-white rounded-lg shadow-lg pointer-events-none -top-2 left-1/2 -translate-x-1/2 -translate-y-full min-w-[220px] max-w-[320px] w-max whitespace-normal break-words"
          style={{
            padding: '10px 14px',
            lineHeight: '1.5',
            transform: `translate(calc(-50% + ${tooltipOffset}px), -100%)`,
            top: '-8px'
          }}
        >
          <div className="absolute w-2 h-2 bg-slate-800 transform rotate-45 left-1/2 -translate-x-1/2 -bottom-1"></div>

          {loading ? (
            <div className="flex items-center justify-center py-2">
              <Loader className="w-4 h-4 animate-spin" />
            </div>
          ) : error ? (
            <p className="text-xs leading-relaxed">
              Explication temporairement indisponible.
            </p>
          ) : explanation ? (
            <p className="text-xs leading-relaxed">
              {explanation}
            </p>
          ) : null}
        </div>
      )}
    </div>
  );
}
