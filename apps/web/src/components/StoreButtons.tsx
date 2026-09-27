import type { ReactNode } from "react";
import Icon from "./Icon";
import { APP_STORE_URL, PLAY_STORE_URL } from "../config/links";
import { track } from "../services/mixpanel";

const GooglePlayIcon = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 512 512" aria-hidden="true">
    <path
      fill="#00A0FF"
      d="M47 0C34 6.8 25.3 19.2 25.3 35.3v441.3c0 16.1 8.7 28.5 21.7 35.3l256.6-256L47 0z"
    />
    <path fill="#32DE84" d="M325.3 234.3L104.6 13l280.8 161.2-60.1 60.1z" />
    <path
      fill="#FFD400"
      d="M472.2 225.6l-58.9-34.1-65.7 64.5 65.7 64.5 60.1-34.1c18-14.3 18-46.5-1.2-60.8z"
    />
    <path fill="#FF3A44" d="M104.6 499l280.8-161.2-60.1-60.1L104.6 499z" />
  </svg>
);

interface StoreButtonProps {
  platform: "ios" | "android";
  url?: string;
  icon: ReactNode;
  caption: string;
  store: string;
}

const StoreButton = ({ platform, url, icon, caption, store }: StoreButtonProps) => {
  const className =
    "inline-flex h-14 min-w-[160px] items-center gap-3 rounded-3xl bg-[#1B1C1C] px-5 sm:min-w-[180px] sm:px-6 text-left text-white shadow-[0_1px_2px_rgba(0,0,0,0.05)] ring-1 ring-white/10 transition";

  const content = (
    <>
      {icon}
      <span>
        <span className="block text-[10px] font-medium uppercase leading-[15px] tracking-[0.6px] text-white/70">
          {url ? caption : "Coming soon on"}
        </span>
        <span className="block text-base font-semibold leading-[19px]">{store}</span>
      </span>
    </>
  );

  if (!url) {
    return (
      <span className={`${className} cursor-default`} aria-label={`Coming soon on ${store}`}>
        {content}
      </span>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => track("download_clicked", { platform })}
      className={`${className} hover:opacity-85`}
      aria-label={`${caption} ${store}`}
    >
      {content}
    </a>
  );
};

interface StoreButtonsProps {
  className?: string;
}

const StoreButtons = ({ className = "" }: StoreButtonsProps) => (
  <div className={`flex flex-wrap gap-3 ${className}`}>
    <StoreButton
      platform="ios"
      url={APP_STORE_URL}
      icon={<Icon name="apple" color="#FFFFFF" width={22} />}
      caption="Download on the"
      store="App Store"
    />
    <StoreButton
      platform="android"
      url={PLAY_STORE_URL}
      icon={<GooglePlayIcon size={24} />}
      caption="Get it on"
      store="Google Play"
    />
  </div>
);

export default StoreButtons;
