import Svg, { Path } from "react-native-svg";
import { glyphs } from "./glyphs";
import type { Glyph, GlyphName } from "./glyphs";
import type { Palette } from "../../theme";
import { useTheme } from "../../theme/ThemeContext";

interface IconProps {
  name: GlyphName;
  /** Overrides the design colour. Ignored by multi-colour artwork. */
  color?: string;
  /** Scales the icon to this width, keeping the design's proportions */
  width?: number;
}

// Figma fills of the single-colour glyphs, mapped to the palette token with the same
// light value, so icons drawn in their design colour also adapt to dark mode.
// White/near-white fills sit on coloured buttons and stay as they are.
const themedFills: Record<string, keyof Palette> = {
  "#1B3A4B": "bg",
  "#000000": "black",
  "#526069": "slateIcon",
  "#4B5563": "gray600",
  "#003178": "navy",
  "#737783": "muted",
  "#9CA3AF": "gray400",
  "#D1D5DB": "borderInput",
  "#0663EA": "accent",
  "#BA1A1A": "danger",
};

const Icon = ({ name, color, width }: IconProps) => {
  const { colors } = useTheme();
  const glyph: Glyph = glyphs[name];
  const paint = (design: string) => {
    if (glyph.multiColor) return design;
    if (color) return color;
    const token = themedFills[design.toUpperCase()];
    return token ? colors[token] : design;
  };
  const scale = width ? width / glyph.width : 1;

  return (
    <Svg width={glyph.width * scale} height={glyph.height * scale} viewBox={glyph.viewBox}>
      {glyph.paths.map((path, index) => (
        <Path
          key={index}
          d={path.d}
          fill={path.fill ? paint(path.fill) : "none"}
          fillOpacity={path.fillOpacity}
          fillRule={path.fillRule}
          clipRule={path.clipRule}
          stroke={path.stroke ? paint(path.stroke) : undefined}
          strokeWidth={path.strokeWidth}
          strokeLinecap={path.strokeLinecap}
          strokeLinejoin={path.strokeLinejoin}
        />
      ))}
    </Svg>
  );
};

export default Icon;
