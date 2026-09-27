import ErrorScreen, { errorButton } from "./ErrorScreen";

const digit = "text-[120px] font-bold leading-none text-white sm:text-[200px]";

// A "404" whose zero is the PowerWatch emblem
const NotFound = () => (
  <ErrorScreen
    figure={
      <div className="flex items-center justify-center gap-2 sm:gap-4" aria-label="404">
        <span className={digit} aria-hidden="true">
          4
        </span>
        <img
          src="/brand/emblem.png"
          alt=""
          width={773}
          height={512}
          className="h-auto w-[150px] sm:w-[250px]"
        />
        <span className={digit} aria-hidden="true">
          4
        </span>
      </div>
    }
    title="Power is Out on this page"
    description="The page you are looking for does not exist or has been moved. Head back home to keep tracking power in your neighborhood."
    action={
      <a href="/" className={errorButton}>
        Back to Home
      </a>
    }
  />
);

export default NotFound;
