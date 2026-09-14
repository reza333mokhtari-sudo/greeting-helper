import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { getMyProfile, updateProfile } from "@/lib/social";
import { useInstagramMode } from "@/hooks/use-instagram-mode";

export const Route = createFileRoute("/_authenticated/account/settings")({
  head: () => ({
    meta: [
      { title: "Account settings — Snapgram" },
      {
        name: "description",
        content:
          "Update your Snapgram profile and switch the Instagram-style layout with stories and chat on or off.",
      },
      { property: "og:title", content: "Account settings — Snapgram" },
      {
        property: "og:description",
        content: "Edit your profile and enable the Instagram-style layout.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AccountSettingsPage,
});

function AccountSettingsPage() {
  const { data: profile } = useQuery({ queryKey: ["my-profile"], queryFn: getMyProfile });
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { enabled: igMode, setEnabled: setIgMode } = useInstagramMode();

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
      toast.error(e.message.includes("duplicate") ? "That username is already taken" : e.message),
  });

  return (
    <AppShell>
      <div className="mx-auto max-w-xl p-4 md:p-8">
        <h1 className="text-xl font-semibold">Account settings</h1>

        <section className="mt-6 rounded-xl border border-border p-5">
          <div className="flex items-start justify-between gap-6">
            <div>
              <h2 className="text-sm font-semibold">Instagram layout</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Switch Snapgram to an Instagram-style experience: gradient branding, a stories
                strip on the feed, a tighter photo grid and direct messages.
              </p>
            </div>
            <Switch
              checked={igMode}
              onCheckedChange={(v: boolean) => {
                setIgMode(v);
                toast.success(v ? "Instagram layout enabled" : "Instagram layout disabled");
              }}
              aria-label="Enable Instagram layout"
            />
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            This changes how Snapgram looks and works inside your account. It does not read or
            publish anything on Instagram itself — connecting a real Instagram account requires
            approved credentials from Meta.
          </p>
        </section>

        <section className="mt-6">
          <h2 className="text-sm font-semibold">Profile</h2>
          <form
            className="mt-4 space-y-5"
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
        </section>
      </div>
    </AppShell>
  );
}
