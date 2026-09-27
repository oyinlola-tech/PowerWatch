import type { ReactNode } from "react";

interface ErrorScreenProps {
  /** Large figure: the 404 mark, or nothing for unexpected errors */
  figure?: ReactNode;
  title: string;
  description: string;
  action: ReactNode;
}

// Shared by the 404 page and the error fallback. Styled after the app's splash screen.
const ErrorScreen = ({ figure, title, description, action }: ErrorScreenProps) => (
  <main
    className="flex min-h-screen flex-col items-center justify-center bg-primary px-6 py-16 text-center"
    style={{
      backgroundImage:
        "radial-gradient(120% 90% at 50% 0%, #0663EA 0%, #0450C4 48%, #003178 100%)",
    }}
  >
    {figure}

    <h1 className="mt-10 text-2xl font-bold text-white sm:text-[32px]">{title}</h1>
    <p className="mt-3 max-w-md text-sm font-medium leading-6 text-[#FCFEFF]/85">{description}</p>

    <div className="mt-8">{action}</div>

    <p className="mt-16 text-sm font-medium text-[#FCFEFF]/70">
      Monitoring your energy in real-time
    </p>
  </main>
);

export const errorButton =
  "inline-flex h-14 items-center justify-center rounded-3xl border border-[#E3E8EE] bg-soft px-8 text-base font-semibold text-primary transition hover:opacity-85";

export default ErrorScreen;
