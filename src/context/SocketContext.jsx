import React, { createContext, useContext, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";

const SocketContext = createContext();

const rawApiUrl = process.env.REACT_APP_API_URL || "http://localhost:5001/api";
const SOCKET_SERVER_URL = rawApiUrl.replace(/\/api\/?$/, "");

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
  const { token, user } = useAuth();
  const socketRef = useRef(null);
  const listenersRef = useRef(new Map());

  // Initialize socket connection
  useEffect(() => {
    if (!token || !user?._id) return;

    // Create socket connection with auth token
    socketRef.current = io(SOCKET_SERVER_URL, {
      auth: { token },
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    // Set up event listeners that were registered before connection
    const setupListeners = () => {
      listenersRef.current.forEach((handler, event) => {
        socketRef.current.on(event, handler);
      });
    };

    // Handle connection events
    socketRef.current.on("connect", () => {
      console.log("Connected to WebSocket server");
      setupListeners();
    });

    socketRef.current.on("disconnect", (reason) => {
      console.log("Disconnected from WebSocket server:", reason);
    });

    socketRef.current.on("connect_error", (error) => {
      console.error("WebSocket connection error:", error.message);
    });

    // Cleanup function
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [token, user?._id]);

  // Function to join a group room
  const joinGroup = (groupId) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit("join-group", groupId);
    }
  };

  // Function to leave a group room
  const leaveGroup = (groupId) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit("leave-group", groupId);
    }
  };

  // Function to send a message
  const sendMessage = (groupId, message, user) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit("send-message", { groupId, message, user });
    }
  };

  // Function to handle typing indicator
  const sendTypingStatus = (groupId, userId, isTyping) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit("typing", { groupId, userId, isTyping });
    }
  };

  // Function to add event listener
  const on = (event, handler) => {
    if (socketRef.current) {
      socketRef.current.on(event, handler);
      // Store the handler to re-apply on reconnection
      listenersRef.current.set(event, handler);
    }

    // Return cleanup function
    return () => {
      if (socketRef.current) {
        socketRef.current.off(event, handler);
      }
      listenersRef.current.delete(event);
    };
  };

  // Function to remove event listener
  const off = (event, handler) => {
    if (socketRef.current) {
      socketRef.current.off(event, handler);
      listenersRef.current.delete(event);
    }
  };

  const value = {
    socket: socketRef.current,
    connected: socketRef.current?.connected || false,
    joinGroup,
    leaveGroup,
    sendMessage,
    sendTypingStatus,
    on,
    off,
    // Add emit function directly to context for easier access
    emit: (...args) => {
      if (socketRef.current?.connected) {
        socketRef.current.emit(...args);
      }
    },
  };

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
};

export default SocketContext;
