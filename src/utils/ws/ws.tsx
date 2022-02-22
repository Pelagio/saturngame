import { useEffect, createContext, useContext, useRef } from "react";
const SOCKET_URL = "wss://139.162.154.132:3006";

const webSocket = new WebSocket(SOCKET_URL);

export const SocketContext = createContext<WebSocket | undefined >(webSocket);

interface ISocketProvider {
  children: React.ReactChild;
}

export const SocketProvider = (props: ISocketProvider) => {
  const ws = useRef<WebSocket>();

  useEffect(() => {
      ws.current = new WebSocket(SOCKET_URL);
      ws.current.onopen = () => console.log("ws opened");
      ws.current.onclose = () => console.log("ws closed");

      const wsCurrent = ws.current;

      return () => {
          wsCurrent.close();
      };
  }, []);

  return (
    <SocketContext.Provider value={ws.current}>{props.children}</SocketContext.Provider>
  );
};

export const useSocket = () => {
  const socket = useContext(SocketContext);

  return socket;
};
