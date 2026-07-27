"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { DataTable, DataTableHeader, DataTableBody, DataTableRow, DataTableCell } from "@/components/admin/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type AdminUserRow = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
};

type DialogMode = "password" | "email" | null;

export function AdminUsersTable({
  users: initialUsers,
  canEditUsers,
}: {
  users: AdminUserRow[];
  canEditUsers: boolean;
}) {
  const router = useRouter();
  const [users, setUsers] = useState(initialUsers);
  const [dialogMode, setDialogMode] = useState<DialogMode>(null);
  const [selectedUser, setSelectedUser] = useState<AdminUserRow | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);

  const disablePasswordSubmit = useMemo(() => {
    return saving || password.length < 8 || password !== confirmPassword;
  }, [confirmPassword, password, saving]);

  const disableEmailSubmit = useMemo(() => {
    const trimmed = email.trim().toLowerCase();
    return saving || !trimmed || trimmed === selectedUser?.email;
  }, [email, saving, selectedUser?.email]);

  function openPasswordDialog(user: AdminUserRow) {
    setSelectedUser(user);
    setPassword("");
    setConfirmPassword("");
    setDialogMode("password");
  }

  function openEmailDialog(user: AdminUserRow) {
    setSelectedUser(user);
    setEmail(user.email);
    setDialogMode("email");
  }

  function closeDialog() {
    setDialogMode(null);
    setSelectedUser(null);
    setPassword("");
    setConfirmPassword("");
    setEmail("");
    setSaving(false);
  }

  async function submitPasswordUpdate() {
    if (!selectedUser) return;
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setSaving(true);
    const res = await fetch(`/api/v1/admin/users/${selectedUser.id}/password`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    setSaving(false);

    const json = (await res.json()) as { error?: { message?: string } };
    if (!res.ok) {
      toast.error(json.error?.message ?? "Failed to update password");
      return;
    }

    toast.success(`Password updated for ${selectedUser.email}`);
    closeDialog();
  }

  async function submitEmailUpdate() {
    if (!selectedUser) return;
    const nextEmail = email.trim().toLowerCase();
    if (!nextEmail) {
      toast.error("Email is required");
      return;
    }

    setSaving(true);
    const res = await fetch(`/api/v1/admin/users/${selectedUser.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: nextEmail }),
    });
    setSaving(false);

    const json = (await res.json()) as {
      data?: { email?: string };
      error?: { message?: string };
    };
    if (!res.ok) {
      toast.error(json.error?.message ?? "Failed to update user ID");
      return;
    }

    const updatedEmail = json.data?.email ?? nextEmail;
    setUsers((prev) =>
      prev.map((u) => (u.id === selectedUser.id ? { ...u, email: updatedEmail } : u)),
    );
    toast.success(`User ID updated to ${updatedEmail}`);
    closeDialog();
    router.refresh();
  }

  return (
    <>
      <DataTable>
        <table className="w-full">
          <DataTableHeader>
            <th className="px-4 py-3">Name</th>
            <th className="px-4 py-3">Email / User ID</th>
            <th className="px-4 py-3">Role</th>
            <th className="px-4 py-3">Status</th>
            {canEditUsers ? <th className="px-4 py-3 text-right">Actions</th> : null}
          </DataTableHeader>
          <DataTableBody>
            {users.map((u) => (
              <DataTableRow key={u.id}>
                <DataTableCell>{u.name}</DataTableCell>
                <DataTableCell>{u.email}</DataTableCell>
                <DataTableCell>
                  <Badge variant="secondary">{u.role}</Badge>
                </DataTableCell>
                <DataTableCell>{u.status}</DataTableCell>
                {canEditUsers ? (
                  <DataTableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="outline" onClick={() => openEmailDialog(u)}>
                        Edit user ID
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => openPasswordDialog(u)}>
                        Set password
                      </Button>
                    </div>
                  </DataTableCell>
                ) : null}
              </DataTableRow>
            ))}
          </DataTableBody>
        </table>
      </DataTable>

      <Dialog open={dialogMode === "password"} onOpenChange={(open) => (!open ? closeDialog() : null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Set admin password</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="rounded-md border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-700">
              {selectedUser?.email}
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin-password">New password</Label>
              <Input
                id="admin-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 8 characters"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin-password-confirm">Confirm password</Label>
              <Input
                id="admin-password-confirm"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={submitPasswordUpdate} disabled={disablePasswordSubmit}>
              {saving ? "Updating..." : "Update password"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dialogMode === "email"} onOpenChange={(open) => (!open ? closeDialog() : null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit user ID</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-stone-500">
              This is the email used to log in to the admin panel.
            </p>
            <div className="space-y-2">
              <Label htmlFor="admin-user-id">Email / User ID</Label>
              <Input
                id="admin-user-id"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={submitEmailUpdate} disabled={disableEmailSubmit}>
              {saving ? "Updating..." : "Update user ID"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
