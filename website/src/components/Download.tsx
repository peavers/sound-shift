import { useState, useEffect } from "react";

interface ReleaseInfo {
  version: string;
  downloadUrl: string;
}

export default function Download() {
  const [release, setRelease] = useState<ReleaseInfo | null>(null);
  const fallbackUrl = "https://github.com/peavers/sound-shift/releases";

  useEffect(() => {
    fetch("https://api.github.com/repos/peavers/sound-shift/releases/latest")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch release");
        return res.json();
      })
      .then((data) => {
        const msiAsset = data.assets?.find((a: { name: string }) =>
          a.name.endsWith(".msi")
        );
        if (msiAsset) {
          setRelease({
            version: data.tag_name?.replace(/^v/, "") || data.name,
            downloadUrl: msiAsset.browser_download_url,
          });
        }
      })
      .catch(() => {
        // Silently fail - will use fallback URL
      });
  }, []);

  return (
    <section id="download" className="py-20 md:py-32 bg-surface-850">
      <div className="max-w-4xl mx-auto px-6 text-center">
        {/* Glow effect */}
        <div className="absolute left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-primary-500/5 rounded-full blur-[100px] pointer-events-none" />

        {/* Content */}
        <div className="relative">
          <h2 className="text-3xl md:text-4xl font-bold text-surface-100 tracking-tight mb-4">
            Ready to switch faster?
          </h2>
          <p className="text-lg text-surface-400 mb-8 max-w-xl mx-auto">
            Download SoundShift for free and start switching audio devices with
            keyboard shortcuts in seconds.
          </p>

          {/* Download Button */}
          <a
            href={release?.downloadUrl || fallbackUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-primary-500 hover:bg-primary-400 text-surface-900 font-semibold text-lg rounded-xl transition-all shadow-glow hover:shadow-glow-lg"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download for Windows
          </a>

          {/* Version & Requirements */}
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4 text-sm text-surface-500">
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.9-1.801" />
              </svg>
              Windows 10+
            </span>
            <span className="hidden sm:inline text-surface-600">•</span>
            <span>v{release?.version || "0.1.0"}</span>
            <span className="hidden sm:inline text-surface-600">•</span>
            <span>Free & Open Source</span>
          </div>

          {/* Alternative - Build from source */}
          <p className="mt-8 text-sm text-surface-500">
            Prefer to build from source?{" "}
            <a
              href="https://github.com/peavers/sound-shift"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-400 hover:text-primary-300 underline underline-offset-2"
            >
              Check out the repo
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
