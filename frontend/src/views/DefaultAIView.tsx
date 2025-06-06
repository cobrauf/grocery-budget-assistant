import React, { useState, useRef, useEffect } from "react";
import "../styles/DefaultAIView.css";
import { ChatMessage } from "../types/chatMessage";
import {
  saveToLocalStorage,
  loadFromLocalStorage,
  LS_AI_CHAT_HISTORY,
} from "../utils/localStorageUtils";

const generateUniqueId = () => {
  return `msg_${new Date().getTime()}_${Math.random()}`;
};

const DefaultAIView: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    return loadFromLocalStorage<ChatMessage[]>(LS_AI_CHAT_HISTORY, []);
  });
  // {
  //   id: generateUniqueId(),
  //   text: "Ask about deals this week.",
  //   sender: "ai",
  //   timestamp: new Date(),
  // },
  const [inputValue, setInputValue] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const timeoutIdRef = useRef<NodeJS.Timeout | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Effect to save messages to local storage whenever they change
  useEffect(() => {
    // Enforce a 20-message limit
    if (messages.length > 20) {
      saveToLocalStorage(LS_AI_CHAT_HISTORY, messages.slice(-20));
    } else {
      saveToLocalStorage(LS_AI_CHAT_HISTORY, messages);
    }
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isProcessing]);

  const handleSendOrStop = () => {
    if (isProcessing) {
      // Stop functionality
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
        timeoutIdRef.current = null;
      }
      setIsProcessing(false);
      const stopMessage: ChatMessage = {
        id: generateUniqueId(),
        text: "You stopped the previous message. How can I help next?",
        sender: "ai",
        timestamp: new Date().getTime(),
      };
      setMessages((prevMessages) => [...prevMessages, stopMessage]);
    } else {
      // Send functionality
      if (inputValue.trim() === "") return;

      const userMessage: ChatMessage = {
        id: generateUniqueId(),
        text: inputValue,
        sender: "user",
        timestamp: new Date().getTime(),
      };

      setMessages((prevMessages) => [...prevMessages, userMessage]);
      setIsProcessing(true);

      const currentInputValue = inputValue;
      setInputValue(""); // Clear input immediately after sending

      timeoutIdRef.current = setTimeout(() => {
        const aiEchoMessage: ChatMessage = {
          id: generateUniqueId(),
          text: `Simulated AI response for: ${currentInputValue}`,
          sender: "ai",
          timestamp: new Date().getTime(),
        };
        setMessages((prevMessages) => [...prevMessages, aiEchoMessage]);
        setIsProcessing(false);
        timeoutIdRef.current = null;
      }, 1000);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault(); // Prevents adding a new line
      handleSendOrStop();
    }
  };

  return (
    <div className="default-ai-view">
      <div className="chat-messages">
        {messages.map((msg) => (
          <div key={msg.id} className={`message-bubble ${msg.sender}`}>
            {msg.sender === "ai" ? (
              <span>AI: {msg.text}</span>
            ) : (
              <span>{msg.text}</span>
            )}
          </div>
        ))}
        {isProcessing && (
          <div className="message-bubble ai">
            <div className="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="chat-input-area">
        <textarea
          className="chat-input"
          placeholder="Work in progress, not actual AI yet..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyPress}
        />
        <button
          className="send-button"
          onClick={handleSendOrStop}
          disabled={!inputValue && !isProcessing}
        >
          {isProcessing ? "▢" : ">"}
        </button>
      </div>
    </div>
  );
};

export default DefaultAIView;
