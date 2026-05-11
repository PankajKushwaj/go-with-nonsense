const Loading = ({ label = "Loading" }) => (
  <div className="flex min-h-64 items-center justify-center">
    <div className="flex items-center gap-3 rounded-lg border border-ink/10 bg-white px-4 py-3 text-sm font-semibold text-ink/70">
      <span className="h-3 w-3 animate-ping rounded-full bg-gold" />
      {label}
    </div>
  </div>
);

export default Loading;
