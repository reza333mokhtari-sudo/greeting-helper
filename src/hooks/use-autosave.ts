import { useEffect, useState, useCallback } from "react";
import { get, set, del } from "idb-keyval";
import { toast } from "sonner";

const AUTOSAVE_KEY = "dungeon_draft_autosave";

export function useAutosave<T>(data: T, onRecover: (data: T) => void) {
  const [hasDraft, setHasDraft] = useState(false);

  // Check for existing draft on mount
  useEffect(() => {
    get(AUTOSAVE_KEY).then((draft) => {
      if (draft) {
        setHasDraft(true);
      }
    });
  }, []);

  // Save data whenever it changes
  useEffect(() => {
    if (data) {
      set(AUTOSAVE_KEY, data).catch((err) => {
        console.error("Autosave failed:", err);
      });
    }
  }, [data]);

  const recoverDraft = useCallback(async () => {
    const draft = await get(AUTOSAVE_KEY);
    if (draft) {
      onRecover(draft);
      setHasDraft(false);
      toast.success("Draft recovered successfully");
    }
  }, [onRecover]);

  const discardDraft = useCallback(async () => {
    await del(AUTOSAVE_KEY);
    setHasDraft(false);
  }, []);

  return { hasDraft, recoverDraft, discardDraft };
}
