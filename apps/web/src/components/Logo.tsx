interface LogoProps {
  height?: number;
}

// Figma "logo_main-horiz": shown at 142x31 in the app
const Logo = ({ height = 31 }: LogoProps) => (
  <img
    src="/brand/logo-horizontal.png"
    alt="PowerWatch"
    width={1526}
    height={334}
    style={{ height, width: "auto" }}
  />
);

export default Logo;
