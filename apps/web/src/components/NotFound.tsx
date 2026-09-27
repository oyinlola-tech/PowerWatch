import ErrorScreen, { errorButton, errorButtonSecondary } from "./ErrorScreen";

const NotFound = () => (
  <ErrorScreen
    backdrop="404"
    note="We couldn't find that page. Check the address for typos, or head back home."
    title="Power is out on this page"
    description="The page you are looking for does not exist or has been moved. Head back home to keep tracking power in your neighborhood."
    actions={
      <>
        <a href="/" className={errorButton}>
          Back to Home
        </a>
        <a href="/#download" className={errorButtonSecondary}>
          Get the App
        </a>
      </>
    }
  />
);

export default NotFound;
