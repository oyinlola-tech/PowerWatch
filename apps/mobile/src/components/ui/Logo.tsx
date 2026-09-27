import { Image } from "expo-image";

// Figma layer "logo_main-horiz-15-15", always shown at 142x31
const Logo = () => (
  <Image
    source={require("../../../assets/images/logo-horizontal.png")}
    style={{ width: 142, height: 31 }}
    contentFit="contain"
    accessibilityLabel="PowerWatch"
  />
);

export default Logo;
