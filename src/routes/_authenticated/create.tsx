import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ImagePlus } from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { createPost } from "@/lib/social";

export const Route = createFileRoute("/_authenticated/create")({
  head: () => ({
    meta: [
      { title: "Create a post — Snapgram" },
      {
        name: "description",
        content: "Upload a photo and write a caption to share it with your Snapgram followers.",
      },
      { property: "og:title", content: "Create a post — Snapgram" },
      { property: "og:description", content: "Upload a photo and share it on Snapgram." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CreatePage,
});

function CreatePage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [caption, setCaption] = useState("");
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const onPick = (f: File | null) => {
    setFile(f);
    setPreview(f ? URL.createObjectURL(f) : "");
  };

  const publish = useMutation({
    mutationFn: () => createPost(file!, caption),
    onSuccess: () => {
      toast.success("Post shared");
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      navigate({ to: "/" });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <AppShell>
      <div className="mx-auto max-w-xl p-4 md:p-8">
        <h1 className="text-xl font-semibold">New post</h1>

        <div className="mt-6 space-y-5">
          <div>
            <Label htmlFor="photo">Photo</Label>
            <label
              htmlFor="photo"
              className="mt-2 flex aspect-square w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-dashed border-border bg-muted/40"
            >
              {preview ? (
                <img src={preview} alt="Selected photo preview" className="h-full w-full object-cover" />
              ) : (
                <span className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
                  <ImagePlus className="h-8 w-8" />
                  Choose a photo
                </span>
              )}
            </label>
            <input
              id="photo"
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(e) => onPick(e.target.files?.[0] ?? null)}
            />
          </div>

          <div>
            <Label htmlFor="caption">Caption</Label>
            <Textarea
              id="caption"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Write a caption..."
              rows={3}
              className="mt-2"
            />
          </div>

          <Button
            className="w-full"
            disabled={!file || publish.isPending}
            onClick={() => publish.mutate()}
          >
            {publish.isPending ? "Sharing..." : "Share"}
          </Button>
        </div>
      </div>
    </AppShell>
  );
}
