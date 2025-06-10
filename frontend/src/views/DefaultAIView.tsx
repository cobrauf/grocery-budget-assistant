import React, { useState, useRef, useEffect } from "react";
import "../styles/DefaultAIView.css";
import { ChatMessage } from "../types/chatMessage";
import { Product } from "../types/product";
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
  onViewProducts: (products: Product[], query: string | undefined) => void;
}

const generateUniqueId = () => {
  return `msg_${new Date().getTime()}_${Math.random()}`;
};

const DefaultAIView: React.FC<DefaultAIViewProps> = ({
  clearChatHistory,
  onChatHistoryCleared,
  onViewProducts,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    return loadFromLocalStorage<ChatMessage[]>(LS_AI_CHAT_HISTORY, []);
  });
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const timeoutIdRef = useRef<NodeJS.Timeout | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const isInitialMount = useRef(true);
  const abortControllerRef = useRef<AbortController | null>(null);

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

  const scrollToBottomInstant = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "instant" });
  };

  useEffect(() => {
    // Don't scroll on initial render
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    scrollToBottom();
  }, [messages]);

  // Scroll to bottom on mount if there are messages (when returning to this view)
  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottomInstant();
    }
  }, []); // Empty dependency array means this runs only on mount

  const handleSendOrStop = () => {
    if (isProcessing) {
      // Stop functionality
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
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

      const controller = new AbortController();
      abortControllerRef.current = controller;

      // Call the new AI service
      processUserQueryWithSemanticSearch(
        currentInputValue,
        controller.signal
      ).then((result) => {
        abortControllerRef.current = null; // Clear the controller
        setIsProcessing(false);
        if (result) {
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
        }
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
        {messages.length === 0 && !isProcessing ? (
          <div>
            <p
              style={{
                textAlign: "center",
                fontSize: "1.2em",
                // lineHeight: "1.5",
                // padding: "20px",
              }}
            >
              <br />
              <br />✨ Ask me about weekly sales.
            </p>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className={`message-bubble ${msg.sender}`}>
              {msg.sender === "ai" ? (
                <span>✨ {msg.text}</span>
              ) : (
                <span>{msg.text}</span>
              )}

              {msg.sender === "ai" && msg.isProductFocused && (
                <button
                  className="view-products-button"
                  onClick={() =>
                    onViewProducts(
                      msg.associatedProductList || [],
                      msg.searchQueryPerformed
                    )
                  }
                >
                  View Sale Items
                </button>
              )}
            </div>
          ))
        )}
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
