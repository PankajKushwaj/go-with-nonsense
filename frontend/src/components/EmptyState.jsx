import { Sparkles } from "lucide-react";

const EmptyState = ({ title, message, action }) => (
  <div className="surface mx-auto max-w-2xl p-8 text-center">
    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-lavender/40 text-ink">
      <Sparkles size={22} />
    </div>
    <h2 className="text-2xl font-bold">{title}</h2>
    <p className="mt-3 text-ink/65">{message}</p>
    {action ? <div className="mt-6">{action}</div> : null}
  </div>
);

export default EmptyState;
