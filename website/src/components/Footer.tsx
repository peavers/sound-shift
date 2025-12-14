export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="py-12 bg-surface-900 border-t border-surface-800">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo & Copyright */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-surface-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              </svg>
            </div>
            <span className="text-surface-400 text-sm">
              © {currentYear} SoundShift. MIT License.
            </span>
          </div>

          {/* Links */}
          <div className="flex items-center gap-6">
            <a
              href="https://github.com/peavers/soundshift"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-surface-400 hover:text-surface-100 transition-colors"
            >
              GitHub
            </a>
            <a
              href="https://github.com/peavers/soundshift/releases"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-surface-400 hover:text-surface-100 transition-colors"
            >
              Releases
            </a>
            <a
              href="https://github.com/peavers/soundshift/blob/main/LICENSE"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-surface-400 hover:text-surface-100 transition-colors"
            >
              License
            </a>
          </div>

          {/* Built with */}
          <div className="flex items-center gap-2 text-sm text-surface-500">
            <span>Built with</span>
            <a
              href="https://tauri.app"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-400 hover:text-primary-300 transition-colors"
            >
              Tauri
            </a>
            <span>&</span>
            <a
              href="https://react.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-400 hover:text-primary-300 transition-colors"
            >
              React
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
