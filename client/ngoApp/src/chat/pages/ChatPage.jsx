import React, { useEffect, useState, useRef } from "react";
import { supabase } from "../../lib/supabaseClient";
import {
  getOrCreate1on1Conversation,
  getOrCreateGroupConversation,
} from "../services/conversationService";
import "./Chat.css";

/* ── helpers ─────────────────────────────────────── */
const getAvatarClass = (type) =>
  type === "volunteer"
    ? "avatar-volunteer"
    : type === "ngo"
    ? "avatar-ngo"
    : type === "admin"
    ? "avatar-admin"
    : "avatar-default";

const getRoleBadgeClass = (type) =>
  type === "volunteer"
    ? "role-badge-volunteer"
    : type === "ngo"
    ? "role-badge-ngo"
    : "role-badge-admin";

const formatTime = (ts) =>
  new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

/* ─────────────────────────────────────────────────── */
const ChatPage = () => {
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [isGroupChat, setIsGroupChat] = useState(false);
  const [chatPartnerName, setChatPartnerName] = useState("");
  const [activePartnerId, setActivePartnerId] = useState(null);
  const messagesEndRef = useRef(null);

  /* Load all chat_users and auto-identify current user from localStorage */
  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from("chat_users").select("*");
      const rawUsers = data || [];

      // Deduplicate by user_ref_id
      const seen = new Map();
      for (const u of rawUsers) {
        if (!seen.has(u.user_ref_id)) {
          seen.set(u.user_ref_id, u);
        } else {
          if (u.id === u.user_ref_id) seen.set(u.user_ref_id, u);
        }
      }
      const unique = [...seen.values()].filter((u) => u.name !== "Test Volunteer");
      setUsers(unique);

      // Auto-detect logged-in user from localStorage
      try {
        const stored = JSON.parse(localStorage.getItem("user") || "{}");
        if (stored?.id) {
          // Match by user_ref_id (the volunteer/ngo table ID stored at login)
          let matched = unique.find((u) => u.user_ref_id === stored.id);

          // Fallback: match by name
          if (!matched) {
            matched = unique.find(
              (u) => u.name?.toLowerCase() === stored.name?.toLowerCase()
            );
          }

          if (matched) {
            setCurrentUser(matched);
          } else {
            // User is logged in but has no chat_users row — create one now
            const { data: newUser, error } = await supabase
              .from("chat_users")
              .insert({
                name: stored.name,
                user_type: stored.role, // 'volunteer' or 'ngo'
                user_ref_id: stored.id,
              })
              .select()
              .single();

            if (!error && newUser) {
              setUsers((prev) => [...prev, newUser]);
              setCurrentUser(newUser);
            }
          }
        }
      } catch (_) {
        /* no stored user – guest mode */
      }
    };
    fetch();
  }, []);

  /* Scroll to latest message */
  const scrollToBottom = () =>
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

  /* Load messages for a conversation */
  const loadMessages = async (cid) => {
    const { data } = await supabase
      .from("messages")
      .select("*, chat_users!sender_id(name, user_type)")
      .eq("conversation_id", cid)
      .order("created_at");
    setMessages(data || []);
    setTimeout(scrollToBottom, 80);
  };

  /* 1-on-1 */
  const start1on1Chat = async (partner) => {
    if (!currentUser) return;
    const cid = await getOrCreate1on1Conversation(currentUser.id, partner.id);
    if (cid) {
      setConversation(cid);
      setIsGroupChat(false);
      setChatPartnerName(partner.name);
      setActivePartnerId(partner.id);
      loadMessages(cid);
    }
  };

  /* Group */
  const startGroupChat = async () => {
    if (!currentUser) return;
    const cid = await getOrCreateGroupConversation();
    if (cid) {
      setConversation(cid);
      setIsGroupChat(true);
      setChatPartnerName("Volunteer & Admin Group");
      setActivePartnerId("group");
      loadMessages(cid);
    }
  };

  /* Send message */
  const send = async (e) => {
    e.preventDefault();
    if (!text.trim() || !conversation) return;
    await supabase.from("messages").insert({
      conversation_id: conversation,
      sender_id: currentUser.id,
      content: text.trim(),
    });
    setText("");
  };

  /* Real-time subscription */
  useEffect(() => {
    if (!conversation) return;
    const channel = supabase
      .channel(`chat-${conversation}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversation}`,
        },
        async (payload) => {
          const { data: sender } = await supabase
            .from("chat_users")
            .select("name, user_type")
            .eq("id", payload.new.sender_id)
            .single();
          setMessages((m) => [
            ...m,
            { ...payload.new, chat_users: sender || { name: "Unknown" } },
          ]);
          setTimeout(scrollToBottom, 80);
        }
      )
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [conversation]);

  /* All other users are DM-able — no role filter */
  const getTalkableUsers = () => {
    if (!currentUser) return [];
    return users.filter((u) => u.id !== currentUser.id);
  };

  const canSeeGroup =
    currentUser?.user_type === "volunteer" ||
    currentUser?.user_type === "admin";

  /* ── render ───────────────────────────────────── */
  return (
    <div className="chat-root">
      {/* ════ SIDEBAR ════ */}
      <aside className="chat-sidebar">
        {/* Brand header */}
        <div className="sidebar-header">
          <div className="logo-icon">N</div>
          <div>
            <h2>NGO Chat</h2>
            <p>Connect · Volunteer · Grow</p>
          </div>
        </div>

        {/* Active user pill */}
        {currentUser ? (
          <div className="current-user-badge">
            <div
              className={`user-avatar-sm ${getAvatarClass(currentUser.user_type)}`}
            >
              {currentUser.name.charAt(0).toUpperCase()}
            </div>
            <div className="info">
              <div className="name">{currentUser.name}</div>
              <span
                className={`role-badge ${getRoleBadgeClass(currentUser.user_type)}`}
              >
                {currentUser.user_type}
              </span>
            </div>
          </div>
        ) : (
          <div className="current-user-badge" style={{ opacity: 0.6 }}>
            <div className="user-avatar-sm avatar-default">?</div>
            <div className="info">
              <div className="name">Not logged in</div>
              <span className="role-badge">Please log in first</span>
            </div>
          </div>
        )}

        {/* Chat list */}
        {currentUser && (
          <div className="chat-list">
            {/* Groups */}
            {canSeeGroup && (
              <>
                <div className="chat-section-label">Groups</div>
                <div
                  className={`chat-item ${activePartnerId === "group" ? "active" : ""}`}
                  onClick={startGroupChat}
                >
                  <div className="item-avatar avatar-group">#</div>
                  <div className="item-info">
                    <div className="item-name">Volunteer & Admin</div>
                    <div className="item-sub">Group · All members</div>
                  </div>
                  {activePartnerId === "group" && (
                    <span className="online-dot" />
                  )}
                </div>
              </>
            )}

            {/* Direct Messages */}
            <div className="chat-section-label" style={{ marginTop: 10 }}>
              Direct Messages
            </div>
            {getTalkableUsers().length === 0 ? (
              <p className="no-users-msg">No contacts available.</p>
            ) : (
              getTalkableUsers().map((u) => (
                <div
                  key={u.id}
                  className={`chat-item ${activePartnerId === u.id ? "active" : ""}`}
                  onClick={() => start1on1Chat(u)}
                >
                  <div className={`item-avatar ${getAvatarClass(u.user_type)}`}>
                    {u.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="item-info">
                    <div className="item-name">{u.name}</div>
                    <div className="item-sub">{u.user_type}</div>
                  </div>
                  <span className="online-dot" />
                </div>
              ))
            )}
          </div>
        )}
      </aside>

      {/* ════ MAIN AREA ════ */}
      <main className="chat-main">
        {!conversation ? (
          /* Empty state */
          <div className="chat-empty">
            <div className="chat-empty-icon">
              <svg
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>
            <h3>
              {currentUser
                ? "Select a conversation"
                : "Please log in to use chat"}
            </h3>
            <p>
              {currentUser
                ? "Pick a group or a direct message from the sidebar to start chatting."
                : "You need to be logged in to access the chat."}
            </p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="chat-header">
              <div
                className={`header-avatar ${
                  isGroupChat ? "avatar-group" : getAvatarClass(
                    users.find((u) => u.id === activePartnerId)?.user_type
                  )
                }`}
              >
                {isGroupChat ? "#" : chatPartnerName.charAt(0).toUpperCase()}
              </div>
              <div className="header-info">
                <div className="header-name">{chatPartnerName}</div>
                <div className="header-status">
                  <span className="header-status-dot" />
                  {isGroupChat ? "Group chat — all members" : "Online"}
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="chat-messages">
              {messages.length === 0 ? (
                <div className="no-messages">
                  No messages yet — say hello! 👋
                </div>
              ) : (
                messages.map((m) => {
                  const isMe = m.sender_id === currentUser.id;
                  const senderName =
                    m.chat_users?.name ||
                    (isMe ? currentUser.name : "Unknown");
                  const senderType = m.chat_users?.user_type || currentUser.user_type;

                  return (
                    <div
                      key={m.id}
                      className={`message-row ${isMe ? "me" : "them"}`}
                    >
                      {!isMe && (
                        <div
                          className={`msg-avatar ${getAvatarClass(senderType)}`}
                        >
                          {senderName.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="message-col">
                        {!isMe && isGroupChat && (
                          <span className="msg-sender-name">{senderName}</span>
                        )}
                        <div className="msg-bubble">{m.content}</div>
                        <span className="msg-time">{formatTime(m.created_at)}</span>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="chat-input-area">
              <form className="chat-input-form" onSubmit={send}>
                <input
                  type="text"
                  placeholder={`Message ${chatPartnerName}…`}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  autoFocus
                />
                <button type="submit" className="send-btn" disabled={!text.trim()}>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                </button>
              </form>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default ChatPage;