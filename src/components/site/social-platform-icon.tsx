type SocialPlatformIconProps = {
  platform: string;
  className?: string;
};

function normalizePlatform(platform: string) {
  return platform.toLowerCase().trim();
}

export function SocialPlatformIcon({ platform, className = "h-5 w-5" }: SocialPlatformIconProps) {
  const key = normalizePlatform(platform);

  if (key.includes("facebook")) {
    return (
      <svg className={className} viewBox="0 0 24 24" aria-hidden fill="currentColor">
        <path d="M14.5 8.5H17V5.5h-2.5c-2.4 0-3.5 1.5-3.5 3.6V12H9v3h2v8h3v-8h2.6l.4-3H14v-2.4c0-.8.2-1.1 1.3-1.1z" />
      </svg>
    );
  }

  if (key.includes("instagram")) {
    return (
      <svg className={className} viewBox="0 0 24 24" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" />
        <circle cx="12" cy="12" r="4.2" />
        <circle cx="17.4" cy="6.6" r="1" fill="currentColor" stroke="none" />
      </svg>
    );
  }

  if (key.includes("youtube")) {
    return (
      <svg className={className} viewBox="0 0 24 24" aria-hidden fill="none">
        <rect x="2.5" y="5.5" width="19" height="13" rx="3.2" stroke="currentColor" strokeWidth="1.8" />
        <path fill="currentColor" d="M10 9.8v4.4l4.8-2.2L10 9.8z" />
      </svg>
    );
  }

  if (key.includes("linkedin")) {
    return (
      <svg className={className} viewBox="0 0 24 24" aria-hidden fill="currentColor">
        <path d="M6.5 8.5h3v11h-3v-11zm1.5-4.5a1.75 1.75 0 110 3.5 1.75 1.75 0 010-3.5zM10 8.5h2.9v1.5h.1c.4-.8 1.5-1.7 3.1-1.7 3.3 0 3.9 2.2 3.9 5v5.2H17v-4.6c0-1.1 0-2.5-1.5-2.5s-1.8 1.2-1.8 2.4v4.7H10V8.5z" />
      </svg>
    );
  }

  if (key.includes("twitter") || key.includes("x.com")) {
    return (
      <svg className={className} viewBox="0 0 24 24" aria-hidden fill="currentColor">
        <path d="M17.3 4h3.2l-7 8.1 8.2 10.9h-6.4l-5-6.6-5.7 6.6H2.3l7.5-8.6L2 4h6.5l4.5 6 5.3-6z" />
      </svg>
    );
  }

  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <path d="M8.6 13.5l6.8 3.9M8.6 10.5l6.8-3.9" />
    </svg>
  );
}
