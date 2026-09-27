import { Image } from "expo-image";
import { useTheme } from "../../theme/ThemeContext";

// Figma layer "logo_main-horiz-15-15", always shown at 142x31
// In dark mode the wordmark text is recoloured to #FCFEFF (logo-horizontal-dark.png)
const Logo = () => {
  const { isDark } = useTheme();
  return (
    <Image
      source={
        isDark
          ? require("../../../assets/images/logo-horizontal-dark.png")
          : require("../../../assets/images/logo-horizontal.png")
      }
      style={{ width: 142, height: 31 }}
      contentFit="contain"
      accessibilityLabel="PowerWatch"
    />
  );
};

export default Logo;
