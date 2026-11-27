export function PlatformIcon({ name }: { name: string }) {
  const video = name === "youtube";
  return (
    <svg className="listen-icon" viewBox="0 0 24 24" width="18" height="18" aria-hidden>
      {video ? (
        <>
          <rect x="2.5" y="5" width="19" height="14" rx="3" fill="none" stroke="currentColor" strokeWidth="1.6" />
          <path d="M10 9.2v5.6l4.8-2.8z" fill="currentColor" />
        </>
      ) : (
        <>
          <circle cx="12" cy="12" r="9.2" fill="none" stroke="currentColor" strokeWidth="1.6" />
          <path d="M10 8.6v6.8l5.6-3.4z" fill="currentColor" />
        </>
      )}
    </svg>
  );
}

export function Arrow() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden>
      <path d="M7 17 17 7M9 7h8v8" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
