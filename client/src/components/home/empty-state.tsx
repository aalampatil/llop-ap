import { Plus, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function EmptyState() {
  const navigate = useNavigate();

  return (
    <div className="neo-panel grid min-h-72 place-items-center bg-white/72 p-8 text-center">
      <div className="max-w-md">
        <Sparkles className="mx-auto mb-4 size-12" />
        <h3 className="text-3xl font-black tracking-tight">No polls yet</h3>
        <p className="mt-2 font-semibold leading-7 text-black/56">
          Create a polished poll with multiple mandatory or optional questions in under a minute.
        </p>
        <button
          className="neo-button mx-auto mt-5 bg-main"
          onClick={() => navigate("/builder")}
          type="button"
        >
          <Plus className="size-4" /> Build first poll
        </button>
      </div>
    </div>
  );
}
