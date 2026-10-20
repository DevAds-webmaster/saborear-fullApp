import { useState } from "react";
import { Star } from "lucide-react";

type Props = {
  /** 0..5; admite decimales en modo solo lectura (estrellas parciales). */
  value: number;
  /** Si se pasa, el componente es editable (1..5). */
  onChange?: (value: number) => void;
  size?: number;
  className?: string;
};

export default function StarRating({ value, onChange, size = 18, className = "" }: Props) {
  const [hover, setHover] = useState<number | null>(null);
  const editable = typeof onChange === "function";
  const shown = hover ?? value;

  const renderStar = (n: number) => {
    const fill = Math.max(0, Math.min(1, shown - (n - 1)));
    return (
      <span className="relative inline-block" style={{ width: size, height: size }}>
        <Star size={size} className="text-gray-300 fill-gray-100" />
        {fill > 0 && (
          <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
            <Star size={size} className="text-amber-400 fill-amber-400" />
          </span>
        )}
      </span>
    );
  };

  if (!editable) {
    return (
      <span
        className={`inline-flex items-center gap-0.5 ${className}`}
        role="img"
        aria-label={`${value.toFixed(1)} de 5 estrellas`}
      >
        {[1, 2, 3, 4, 5].map((n) => (
          <span key={n}>{renderStar(n)}</span>
        ))}
      </span>
    );
  }

  return (
    <div
      className={`inline-flex items-center gap-0.5 ${className}`}
      role="radiogroup"
      aria-label="Calificación"
      onMouseLeave={() => setHover(null)}
    >
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          aria-label={`${n} estrella${n > 1 ? "s" : ""}`}
          onMouseEnter={() => setHover(n)}
          onFocus={() => setHover(n)}
          onBlur={() => setHover(null)}
          onClick={() => onChange(n)}
          className="p-0.5 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
        >
          {renderStar(n)}
        </button>
      ))}
    </div>
  );
}
