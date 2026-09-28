// Same artwork as the landing page; the dark-mode file has a light wordmark.
const Logo = ({ height = 28 }: { height?: number }) => (
  <>
    <img src="/brand/logo-horizontal.png" alt="PowerWatch" width={1526} height={334} style={{ height, width: "auto" }} className="max-w-none dark:hidden" />
    <img src="/brand/logo-horizontal-dark.png" alt="PowerWatch" width={1526} height={334} style={{ height, width: "auto" }} className="hidden max-w-none dark:block" />
  </>
);

export default Logo;
