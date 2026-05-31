'use client';

import { useAuthStore } from "@/store/auth.store";

export default function AdminHomepage() {
  const { user } = useAuthStore();
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-4xl font-bold mb-4">Admin Dashboard</h1>
      <p className="text-lg">Welcome, {user?.email}! You have admin access.</p>
    </div>
  )
}