import { glyphs } from "./glyphs";
import type { Glyph, GlyphName } from "./glyphs";

interface IconProps {
  name: GlyphName;
  color?: string;
  /** Scales the icon to this width, keeping the design's proportions */
  width?: number;
}

// The exact vectors from the Figma file, shared with the mobile app
const Icon = ({ name, color, width }: IconProps) => {
  const glyph: Glyph = glyphs[name];
  const scale = width ? width / glyph.width : 1;

  return (
    <svg
      width={glyph.width * scale}
      height={glyph.height * scale}
      viewBox={glyph.viewBox}
      fill="none"
      aria-hidden="true"
    >
      {glyph.paths.map((path, index) => (
        <path
          key={index}
          d={path.d}
          fill={path.fill ? (glyph.multiColor ? path.fill : (color ?? path.fill)) : "none"}
          fillOpacity={path.fillOpacity}
          fillRule={path.fillRule}
          clipRule={path.clipRule}
        />
      ))}
    </svg>
  );
};

export default Icon;
