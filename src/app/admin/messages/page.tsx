"use client";

import { useState, useEffect } from "react";
import { formatDate } from "@/lib/format";
import LoadingState from "@/components/admin/LoadingState";

interface Message {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [total, setTotal] = useState(0);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchMessages = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/messages?limit=50");
      if (!res.ok) throw new Error("Failed to fetch messages");
      const data = await res.json();
      setMessages(data.messages || []);
      setTotal(data.total || 0);
    } catch (err: any) {
      setError(err.message || "Failed to load messages");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const markAsRead = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/messages/${id}/read`, { method: "PUT" });
      if (!res.ok) throw new Error("Failed to mark as read");
      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, isRead: true } : m))
      );
    } catch (err: any) {
      console.error(err);
    }
  };

  const toggleExpand = (msg: Message) => {
    if (expandedId === msg.id) {
      setExpandedId(null);
    } else {
      setExpandedId(msg.id);
      if (!msg.isRead) {
        markAsRead(msg.id);
      }
    }
  };

  const unreadCount = messages.filter((m) => !m.isRead).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <h1 className="font-headline text-2xl text-on-surface">Messages</h1>
        {unreadCount > 0 && (
          <span className="bg-primary/10 text-primary font-label text-xs px-2.5 py-0.5 rounded-full">
            {unreadCount} unread
          </span>
        )}
        <span className="font-label text-sm text-on-surface-variant ml-auto">{total} total</span>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg font-body text-sm">
          {error}
          <button onClick={fetchMessages} className="ml-3 underline">Retry</button>
        </div>
      )}

      <div className="bg-surface-container-lowest rounded-xl tonal-shadow overflow-hidden">
        {loading ? (
          <LoadingState label="Loading messages..." />
        ) : messages.length === 0 ? (
          <div className="p-12 text-center">
            <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-2 block">chat</span>
            <p className="font-label text-sm text-on-surface-variant">No messages yet</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-outline-variant/30">
                {["", "Name", "Email", "Subject", "Date", "Actions"].map((h) => (
                  <th key={h} className="text-left px-6 py-3 font-label text-xs text-on-surface-variant uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {messages.map((msg) => (
                <>
                  <tr
                    key={msg.id}
                    className={`border-t border-outline-variant/20 hover:bg-surface-container-low/50 transition cursor-pointer ${
                      !msg.isRead ? "bg-primary/[0.03]" : ""
                    }`}
                    onClick={() => toggleExpand(msg)}
                  >
                    <td className="px-6 py-3">
                      {!msg.isRead && (
                        <span className="w-2.5 h-2.5 bg-primary rounded-full inline-block" />
                      )}
                    </td>
                    <td className={`px-6 py-3 font-label text-sm ${!msg.isRead ? "font-medium text-on-surface" : "text-on-surface"}`}>
                      {msg.name}
                    </td>
                    <td className="px-6 py-3 font-body text-sm text-on-surface-variant">{msg.email}</td>
                    <td className={`px-6 py-3 font-body text-sm max-w-[300px] truncate ${!msg.isRead ? "font-medium text-on-surface" : "text-on-surface-variant"}`}>
                      {msg.subject}
                    </td>
                    <td className="px-6 py-3 font-body text-sm text-on-surface-variant">{formatDate(msg.createdAt)}</td>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => toggleExpand(msg)}
                          className="p-1.5 rounded-lg hover:bg-surface-container transition"
                        >
                          <span className="material-symbols-outlined text-on-surface-variant text-[20px]">
                            {expandedId === msg.id ? "expand_less" : "visibility"}
                          </span>
                        </button>
                        {!msg.isRead && (
                          <button
                            onClick={() => markAsRead(msg.id)}
                            className="p-1.5 rounded-lg hover:bg-surface-container transition"
                            title="Mark as read"
                          >
                            <span className="material-symbols-outlined text-on-surface-variant text-[20px]">
                              mark_email_read
                            </span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                  {expandedId === msg.id && (
                    <tr key={`${msg.id}-expanded`} className="border-t border-outline-variant/10">
                      <td colSpan={6} className="px-6 py-4 bg-surface-container-low/30">
                        <div className="space-y-2">
                          {msg.phone && (
                            <p className="font-label text-xs text-on-surface-variant">
                              Phone: {msg.phone}
                            </p>
                          )}
                          <p className="font-body text-sm text-on-surface leading-relaxed whitespace-pre-wrap">
                            {msg.message}
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
