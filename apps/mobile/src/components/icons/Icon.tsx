import Svg, { Path } from "react-native-svg";
import { glyphs } from "./glyphs";
import type { Glyph, GlyphName } from "./glyphs";

interface IconProps {
  name: GlyphName;
  /** Overrides the design colour. Ignored by multi-colour artwork. */
  color?: string;
  /** Scales the icon to this width, keeping the design's proportions */
  width?: number;
}

const Icon = ({ name, color, width }: IconProps) => {
  const glyph: Glyph = glyphs[name];
  const scale = width ? width / glyph.width : 1;

  return (
    <Svg width={glyph.width * scale} height={glyph.height * scale} viewBox={glyph.viewBox}>
      {glyph.paths.map((path, index) => (
        <Path
          key={index}
          d={path.d}
          fill={path.fill ? (glyph.multiColor ? path.fill : (color ?? path.fill)) : "none"}
          fillOpacity={path.fillOpacity}
          fillRule={path.fillRule}
          clipRule={path.clipRule}
          stroke={path.stroke ? (glyph.multiColor ? path.stroke : (color ?? path.stroke)) : undefined}
          strokeWidth={path.strokeWidth}
          strokeLinecap={path.strokeLinecap}
          strokeLinejoin={path.strokeLinejoin}
        />
      ))}
    </Svg>
  );
};

export default Icon;
