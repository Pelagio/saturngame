import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { env } from "../../lib/env";

type SocketStatus = "connecting" | "open" | "closed";

interface SocketContextValue {
  socket: WebSocket | null;
  status: SocketStatus;
}

const SocketContext = createContext<SocketContextValue>({
  socket: null,
  status: "closed",
});

export function SocketProvider({ children }: { children: ReactNode }) {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout>>();
  const reconnectAttempt = useRef(0);
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    function connect() {
      const ws = new WebSocket(env.wsUrl);

      ws.onopen = () => {
        reconnectAttempt.current = 0;
        wsRef.current = ws;
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
  }, []);

  const status: SocketStatus =
    wsRef.current?.readyState === WebSocket.OPEN ? "open" : "closed";

  return (
    <SocketContext.Provider value={{ socket: wsRef.current, status }}>
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
