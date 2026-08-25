import React from 'react';
import { useSocket } from '../context/SocketContext';
import { useWebRTC } from '../context/WebRTCContext';
import { Phone, PhoneOff, Video } from 'lucide-react';

export const IncomingCallNotification = () => {
  const { incomingCall, clearIncomingCall } = useSocket();
  const { answerIncomingCall } = useWebRTC();

  if (!incomingCall) return null;

  const handleAccept = () => {
    answerIncomingCall(incomingCall);
    clearIncomingCall();
  };

  const handleReject = () => {
    if (incomingCall.callerSocketId) {
      // emit reject
    }
    clearIncomingCall();
  };

  const caller = incomingCall.caller;

  return (
    <div className="fixed top-5 inset-x-4 sm:inset-x-auto sm:right-6 z-50 max-w-sm w-full bg-[#1e1c2e] border-2 border-rose-500 rounded-3xl p-4 shadow-2xl shadow-rose-500/30 animate-bounce-subtle">
      <div className="flex items-center gap-3.5">
        <div className="relative">
          <img
            src={caller.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'}
            alt={caller.full_name}
            className="w-14 h-14 rounded-full object-cover ring-2 ring-rose-500"
          />
          <span className="absolute -bottom-1 -right-1 p-1 bg-purple-600 rounded-full text-white text-xs shadow">
            <Video className="w-3.5 h-3.5 text-cyan-300" />
          </span>
        </div>

        <div className="flex-1">
          <h4 className="font-bold text-white text-base leading-tight">
            {caller.full_name}
          </h4>
          <p className="text-xs text-rose-300 font-semibold flex items-center gap-1 mt-0.5">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            Đang gọi Video 1v1 cho bạn...
          </p>
        </div>
      </div>

      {/* Accept & Reject Buttons */}
      <div className="flex items-center gap-2 mt-4 pt-3 border-t border-white/10">
        <button
          onClick={handleReject}
          className="flex-1 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-400 font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
        >
          <PhoneOff className="w-4 h-4" />
          <span>Từ Chối</span>
        </button>

        <button
          onClick={handleAccept}
          className="flex-1 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:opacity-95 text-white font-bold text-xs shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-1.5 transition-all"
        >
          <Phone className="w-4 h-4" />
          <span>Nghe Máy</span>
        </button>
      </div>
    </div>
  );
};
