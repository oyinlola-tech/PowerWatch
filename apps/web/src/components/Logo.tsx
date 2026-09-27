interface LogoProps {
  height?: number;
}

// Figma "logo_main-horiz": shown at 142x31 in the app
// In dark mode the wordmark text is recolored to #FCFEFF so it stays readable
const Logo = ({ height = 31 }: LogoProps) => (
  <>
    <img
      src="/brand/logo-horizontal.png"
      alt="PowerWatch"
      width={1526}
      height={334}
      style={{ height, width: "auto" }}
      className="dark:hidden"
    />
    <img
      src="/brand/logo-horizontal-dark.png"
      alt="PowerWatch"
      width={1526}
      height={334}
      style={{ height, width: "auto" }}
      className="hidden dark:block"
    />
  </>
);

export default Logo;
