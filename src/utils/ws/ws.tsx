import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { env } from "../../lib/env";

type SocketStatus = "connecting" | "open" | "closed";
type MessageHandler = (ev: MessageEvent) => void;

interface SocketContextValue {
  socket: WebSocket | null;
  status: SocketStatus;
  sendWhenReady: (msg: string) => void;
  setOnMessage: (handler: MessageHandler) => void;
}

const SocketContext = createContext<SocketContextValue>({
  socket: null,
  status: "closed",
  sendWhenReady: () => {},
  setOnMessage: () => {},
});

export function SocketProvider({ children }: { children: ReactNode }) {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout>>();
  const reconnectAttempt = useRef(0);
  const onMessageRef = useRef<MessageHandler | null>(null);
  const sendBuffer = useRef<string[]>([]);
  const [, forceUpdate] = useState(0);

  const flushBuffer = useCallback((ws: WebSocket) => {
    const queued = sendBuffer.current.splice(0);
    for (const msg of queued) {
      ws.send(msg);
    }
  }, []);

  useEffect(() => {
    function connect() {
      const ws = new WebSocket(env.wsUrl);

      ws.onmessage = (ev) => {
        onMessageRef.current?.(ev);
      };

      ws.onopen = () => {
        reconnectAttempt.current = 0;
        wsRef.current = ws;
        flushBuffer(ws);
        forceUpdate((n) => n + 1);
      };

      ws.onclose = () => {
        wsRef.current = null;
        forceUpdate((n) => n + 1);
        const delay = Math.min(
          1000 * Math.pow(2, reconnectAttempt.current),
          30000,
        );
        reconnectAttempt.current++;
        reconnectTimer.current = setTimeout(connect, delay);
      };

      ws.onerror = () => {
        ws.close();
      };
    }

    connect();

    return () => {
      clearTimeout(reconnectTimer.current);
      wsRef.current?.close();
      wsRef.current = null;
    };
  }, [flushBuffer]);

  const sendWhenReady = useCallback((msg: string) => {
    const ws = wsRef.current;
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(msg);
    } else {
      sendBuffer.current.push(msg);
    }
  }, []);

  const setOnMessage = useCallback((handler: MessageHandler) => {
    onMessageRef.current = handler;
  }, []);

  const status: SocketStatus =
    wsRef.current?.readyState === WebSocket.OPEN ? "open" : "closed";

  return (
    <SocketContext.Provider
      value={{ socket: wsRef.current, status, sendWhenReady, setOnMessage }}
    >
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket(): WebSocket | null {
  const { socket } = useContext(SocketContext);
  return socket;
}

export function useSocketStatus(): SocketStatus {
  const { status } = useContext(SocketContext);
  return status;
}

export function useSocketSend(): (msg: string) => void {
  const { sendWhenReady } = useContext(SocketContext);
  return sendWhenReady;
}

export function useSetOnMessage(): (handler: MessageHandler) => void {
  const { setOnMessage } = useContext(SocketContext);
  return setOnMessage;
}
