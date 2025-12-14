const screenshots = [
  {
    src: "/screenshots/groups-page.png",
    alt: "Device Groups",
    caption: "Create and manage device groups with keyboard shortcuts",
  },
  {
    src: "/screenshots/devices-page.png",
    alt: "Audio Devices",
    caption: "View all audio devices and switch with one click",
  },
  {
    src: "/screenshots/settings-page.png",
    alt: "Settings",
    caption: "Configure startup behavior and preferences",
  },
];

export default function Screenshots() {
  return (
    <section id="screenshots" className="py-20 md:py-32 bg-surface-900">
      <div className="max-w-6xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-surface-100 tracking-tight mb-4">
            See it in action
          </h2>
          <p className="text-lg text-surface-400 max-w-2xl mx-auto">
            A clean, minimal interface that gets out of your way.
          </p>
        </div>

        {/* Screenshots Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {screenshots.map((screenshot, index) => (
            <div key={index} className="group">
              <div className="relative rounded-2xl overflow-hidden border border-surface-750 bg-surface-850 shadow-soft group-hover:border-surface-700 transition-all">
                <img
                  src={screenshot.src}
                  alt={screenshot.alt}
                  className="w-full h-auto"
                />
              </div>
              <p className="mt-4 text-center text-sm text-surface-400">
                {screenshot.caption}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
