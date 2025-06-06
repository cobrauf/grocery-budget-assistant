import React, { useState, useRef, useEffect } from "react";
import "../styles/DefaultAIView.css";
import { ChatMessage } from "../types/chatMessage";
import ConfirmActionModal from "../components/modals/ConfirmActionModal";
import {
  saveToLocalStorage,
  loadFromLocalStorage,
  removeFromLocalStorage,
  LS_AI_CHAT_HISTORY,
} from "../utils/localStorageUtils";
import { processUserQueryWithSemanticSearch } from "../services/aiChatService";

interface DefaultAIViewProps {
  clearChatHistory?: boolean;
  onChatHistoryCleared?: () => void;
}

const generateUniqueId = () => {
  return `msg_${new Date().getTime()}_${Math.random()}`;
};

const DefaultAIView: React.FC<DefaultAIViewProps> = ({
  clearChatHistory,
  onChatHistoryCleared,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    return loadFromLocalStorage<ChatMessage[]>(LS_AI_CHAT_HISTORY, []);
  });
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const timeoutIdRef = useRef<NodeJS.Timeout | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Effect to clear messages when signal is received
  useEffect(() => {
    if (clearChatHistory) {
      setMessages([]);
      onChatHistoryCleared?.(); // Notify parent that state has been cleared
    }
  }, [clearChatHistory, onChatHistoryCleared]);

  // Effect to save messages to local storage whenever they change
  useEffect(() => {
    // Do not save an empty array if it's the initial state, unless it was intentional
    if (
      messages.length === 0 &&
      !loadFromLocalStorage(LS_AI_CHAT_HISTORY, []).length
    ) {
      return;
    }
    // Enforce a 20-message limit
    if (messages.length > 20) {
      saveToLocalStorage(LS_AI_CHAT_HISTORY, messages.slice(-20));
    } else {
      saveToLocalStorage(LS_AI_CHAT_HISTORY, messages);
    }
  }, [messages]);

  const handleClearChat = () => {
    setMessages([]);
    removeFromLocalStorage(LS_AI_CHAT_HISTORY);
    setIsClearModalOpen(false);
  };

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

      const currentInputValue = inputValue;
      setInputValue(""); // Clear input immediately for responsiveness
      setIsProcessing(true);

      // Call the new AI service
      processUserQueryWithSemanticSearch(currentInputValue).then((result) => {
        const aiMessage: ChatMessage = {
          id: generateUniqueId(),
          text: result.summary,
          sender: "ai",
          timestamp: new Date().getTime(),
          isProductFocused: result.products.length > 0,
          searchQueryPerformed: currentInputValue,
          associatedProductList: result.products,
        };
        setMessages((prevMessages) => [...prevMessages, aiMessage]);
        setIsProcessing(false);
      });
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
      <ConfirmActionModal
        isOpen={isClearModalOpen}
        onClose={() => setIsClearModalOpen(false)}
        onConfirm={handleClearChat}
        title="Start new chat"
      >
        <p>Clear chat history?</p>
      </ConfirmActionModal>
      <div className="chat-messages">
        {messages.map((msg) => (
          <div key={msg.id} className={`message-bubble ${msg.sender}`}>
            {msg.sender === "ai" ? (
              <span>✨ AI: {msg.text}</span>
            ) : (
              <span>{msg.text}</span>
            )}

            {/* Product focosed = {msg.isProductFocused}
            {msg.isProductFocused && (
              <button className="view-products-button">View Products</button>
              )} */}
            {msg.sender === "ai" && (
              <button className="view-products-button">
                View Products (WIP)
              </button>
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
      <div className="chat-input-container">
        {messages.length > 0 && (
          <button
            className="clear-chat-button"
            onClick={() => setIsClearModalOpen(true)}
          >
            🖋 New Chat
          </button>
        )}
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
    </div>
  );
};

export default DefaultAIView;
