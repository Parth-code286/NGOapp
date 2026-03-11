import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { createChatUser } from "../services/chatUserService";
import { createConversation } from "../services/conversationService";
import { getConversations } from "../services/getConversations";

const ChatPage = () => {

  const [conversations, setConversations] = useState([]);

  useEffect(() => {
    runTests();
  }, []);

 const runTests = async () => {

  const user = await createChatUser(
    "volunteer",
    "11111111-1111-1111-1111-111111111111",
    "Test Volunteer"
  );

  console.log("Chat user created:", user);

  const convo = await createConversation(
    "b27caae2-f1dd-424b-af6e-a9cf3ddc16d5",
    "b27caae2-f1dd-424b-af6e-a9cf3ddc16d5"
  );

  console.log("Conversation:", convo);

  const convos = await getConversations(
    "b27caae2-f1dd-424b-af6e-a9cf3ddc16d5"
  );

  console.log("Fetched conversations:", convos);

  const uniqueConvos = [
    ...new Map(convos.map(c => [c.conversation_id, c])).values()
  ];

  setConversations(uniqueConvos);
};

  return (
    <div style={{ display: "flex", height: "100vh" }}>

      <div style={{ width: "30%", borderRight: "1px solid #ccc", padding: "10px" }}>
        <h2>Conversations</h2>

        {conversations.map((c) => (
          <div
            key={c.conversation_id}
            style={{
              padding: "10px",
              borderBottom: "1px solid #ddd",
              cursor: "pointer"
            }}
          >
            Conversation {c.conversation_id.slice(0,6)}
          </div>
        ))}

      </div>

      <div style={{ width: "70%", padding: "10px" }}>
        <h2>Select a conversation</h2>
      </div>

    </div>
  );
};

export default ChatPage;