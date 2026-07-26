"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  createdAt: Date;
  _count: { books: number };
}

export function AdminUserRow({ user, currentUserId }: { user: User; currentUserId: string }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [promoting, setPromoting] = useState(false);
  const [error, setError] = useState("");
  const isSelf = user.id === currentUserId;

  async function handleDelete() {
    if (!confirm(`Delete user "${user.name}" and all their books?`)) return;
    setDeleting(true);
    setError("");
    const res = await fetch(`/api/users/${user.id}`, { method: "DELETE" });
    setDeleting(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Failed to delete user.");
      return;
    }

    router.refresh();
  }

  async function handleToggleRole() {
    setPromoting(true);
    setError("");
    const newRole = user.role === "admin" ? "user" : "admin";
    const res = await fetch(`/api/users/${user.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: newRole }),
    });
    setPromoting(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Failed to update role.");
      return;
    }

    router.refresh();
  }

  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50">
      <td className="px-4 py-3 font-medium text-gray-900">{user.name}</td>
      <td className="px-4 py-3 text-gray-700 text-xs">{user.email}</td>
      <td className="px-4 py-3">
        <span className={`badge ${user.role === "admin" ? "bg-purple-100 text-purple-800" : "bg-gray-100 text-gray-700"}`}>
          {user.role}
        </span>
      </td>
      <td className="px-4 py-3 text-gray-700">{user._count.books}</td>
      <td className="px-4 py-3 text-gray-500 text-xs">
        {new Date(user.createdAt).toLocaleDateString()}
      </td>
      <td className="px-4 py-3 text-right">
        {!isSelf && (
          <div className="flex justify-end gap-2">
            <button
              onClick={handleToggleRole}
              disabled={promoting}
              className="btn-secondary text-xs px-2 py-1"
            >
              {promoting ? "…" : user.role === "admin" ? "Demote" : "Promote"}
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="btn-danger text-xs px-2 py-1"
            >
              {deleting ? "…" : "Delete"}
            </button>
          </div>
        )}
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
        {isSelf && <span className="text-xs text-gray-400">You</span>}
      </td>
    </tr>
  );
}
