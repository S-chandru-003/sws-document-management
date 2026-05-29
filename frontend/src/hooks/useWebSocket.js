import { useEffect, useRef, useCallback } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

const WS_URL =
  (process.env.REACT_APP_API_URL || "http://localhost:8080") + "/ws";

/**
 * useWebSocket
 *
 * Connects to the Spring WebSocket broker and calls handlers when messages
 * arrive on the specified topics.
 *
 * @param {Object} handlers
 *   - onUploadProgress(event)   — fired for every /topic/upload-progress message
 *   - onNotification(notif)     — fired for every /topic/notifications message
 */
export function useWebSocket({ onUploadProgress, onNotification } = {}) {
  const clientRef = useRef(null);
  const handlersRef = useRef({ onUploadProgress, onNotification });

  // Keep handlers fresh without reconnecting
  useEffect(() => {
    handlersRef.current = { onUploadProgress, onNotification };
  }, [onUploadProgress, onNotification]);

  useEffect(() => {
    const client = new Client({
      webSocketFactory: () => new SockJS(WS_URL),
      reconnectDelay: 5000,
      onConnect: () => {
        client.subscribe("/topic/upload-progress", (msg) => {
          const payload = JSON.parse(msg.body);
          handlersRef.current.onUploadProgress?.(payload);
        });

        client.subscribe("/topic/notifications", (msg) => {
          const payload = JSON.parse(msg.body);
          handlersRef.current.onNotification?.(payload);
        });
      },
      onStompError: (frame) => {
        console.error("STOMP error", frame);
      },
    });

    client.activate();
    clientRef.current = client;

    return () => {
      client.deactivate();
    };
  }, []); // connect once

  const sendMessage = useCallback((destination, body) => {
    if (clientRef.current?.connected) {
      clientRef.current.publish({
        destination,
        body: JSON.stringify(body),
      });
    }
  }, []);

  return { sendMessage };
}
