import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || (
  isLocal ? 'http://localhost:5001' : 'https://dating-backend-islg.onrender.com'
);

export const SocketProvider = ({ children }) => {
  const { currentUser, updateBalance } = useAuth();
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [incomingCall, setIncomingCall] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!currentUser) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    const newSocket = io(SOCKET_URL, {
      query: { userId: currentUser.id },
      transports: ['websocket', 'polling']
    });

    newSocket.on('connect', () => {
      console.log('⚡ Socket connected to server:', newSocket.id);
      if (currentUser?.id) {
        newSocket.emit('register_user', { userId: currentUser.id });
      }
    });

    newSocket.on('incoming_call', (data) => {
      console.log('📞 Incoming call from:', data.caller.full_name);
      setIncomingCall(data);
    });

    newSocket.on('call_ended', () => {
      setIncomingCall(null);
    });

    newSocket.on('balance_updated', (data) => {
      updateBalance(data.coins, data.diamonds);
    });

    newSocket.on('user_presence_change', ({ userId, is_online }) => {
      setOnlineUsers(prev => {
        const next = new Set(prev);
        if (is_online) next.add(userId);
        else next.delete(userId);
        return next;
      });
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [currentUser?.id]);

  const clearIncomingCall = () => {
    setIncomingCall(null);
  };

  return (
    <SocketContext.Provider value={{
      socket,
      onlineUsers,
      incomingCall,
      clearIncomingCall,
      unreadCount,
      setUnreadCount
    }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
