import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getMyProfile, updateProfile } from "@/lib/social";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({
    meta: [
      { title: "Edit your profile — Snapgram" },
      {
        name: "description",
        content: "Update your Snapgram username, display name and bio.",
      },
      { property: "og:title", content: "Edit your profile — Snapgram" },
      { property: "og:description", content: "Update your username, display name and bio." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { data: profile } = useQuery({ queryKey: ["my-profile"], queryFn: getMyProfile });
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");

  useEffect(() => {
    if (profile) {
      setUsername(profile.username);
      setFullName(profile.full_name ?? "");
      setBio(profile.bio ?? "");
    }
  }, [profile]);

  const save = useMutation({
    mutationFn: () =>
      updateProfile({
        username: username.trim().toLowerCase(),
        full_name: fullName.trim() || null,
        bio: bio.trim() || null,
      }),
    onSuccess: () => {
      toast.success("Profile updated");
      queryClient.invalidateQueries();
      navigate({ to: "/u/$username", params: { username: username.trim().toLowerCase() } });
    },
    onError: (e: Error) =>
      toast.error(
        e.message.includes("duplicate") ? "That username is already taken" : e.message,
      ),
  });

  return (
    <AppShell>
      <div className="mx-auto max-w-xl p-4 md:p-8">
        <h1 className="text-xl font-semibold">Edit profile</h1>
        <form
          className="mt-6 space-y-5"
          onSubmit={(e) => {
            e.preventDefault();
            save.mutate();
          }}
        >
          <div>
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-2"
              required
            />
          </div>
          <div>
            <Label htmlFor="fullName">Display name</Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              className="mt-2"
            />
          </div>
          <Button type="submit" disabled={save.isPending || !username.trim()}>
            {save.isPending ? "Saving..." : "Save changes"}
          </Button>
        </form>
      </div>
    </AppShell>
  );
}
