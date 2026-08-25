import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { MessageCircle, Video, X, Sparkles, Heart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const MatchCelebrationModal = ({ matchData, onClose, onOpenChat, onStartCall }) => {
  const { currentUser } = useAuth();

  useEffect(() => {
    if (matchData) {
      // Fire double confetti explosion
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      setTimeout(() => {
        confetti({
          particleCount: 80,
          angle: 60,
          spread: 55,
          origin: { x: 0 }
        });
        confetti({
          particleCount: 80,
          angle: 120,
          spread: 55,
          origin: { x: 1 }
        });
      }, 250);
    }
  }, [matchData]);

  if (!matchData) return null;

  const partner = matchData.partner;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-fade-in">
      <div className="relative w-full max-w-md bg-gradient-to-b from-[#1c122c] to-[#0f0e17] border border-pink-500/30 rounded-3xl p-6 sm:p-8 text-center shadow-2xl overflow-hidden">
        
        {/* Glow circles */}
        <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-rose-500/20 to-transparent blur-2xl pointer-events-none" />

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Tinder It's a Match Title */}
        <div className="mb-6 relative">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-bold border border-rose-500/30 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            Tâm đầu ý hợp
          </div>
          <h2 className="text-4xl sm:text-5xl font-black italic tracking-tighter bg-gradient-to-r from-rose-400 via-pink-400 to-amber-300 bg-clip-text text-transparent drop-shadow-lg animate-bounce-subtle">
            IT'S A MATCH!
          </h2>
          <p className="text-xs text-gray-300 mt-1 font-medium">
            Bạn và <span className="text-pink-400 font-bold">{partner.full_name}</span> đều đã thích nhau ❤️
          </p>
        </div>

        {/* Dual Avatars Display */}
        <div className="flex items-center justify-center -space-x-6 my-8">
          <div className="relative z-10 w-28 h-28 sm:w-32 sm:h-32 rounded-full ring-4 ring-rose-500 shadow-2xl overflow-hidden transform -rotate-6 hover:rotate-0 transition-transform duration-300">
            <img
              src={currentUser?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300'}
              alt={currentUser?.full_name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="relative z-20 w-10 h-10 rounded-full tinder-gradient text-white flex items-center justify-center shadow-lg ring-4 ring-[#16161e]">
            <Heart className="w-5 h-5 fill-white" />
          </div>
          <div className="relative z-10 w-28 h-28 sm:w-32 sm:h-32 rounded-full ring-4 ring-pink-500 shadow-2xl overflow-hidden transform rotate-6 hover:rotate-0 transition-transform duration-300">
            <img
              src={partner.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300'}
              alt={partner.full_name}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 mt-6">
          <button
            onClick={() => onStartCall(partner)}
            className="w-full py-3.5 rounded-2xl font-bold text-sm bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-xl shadow-pink-500/25 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Video className="w-5 h-5 text-cyan-300" />
            <span>Gọi Video 1v1 Ngay Lập Tức</span>
          </button>

          <button
            onClick={() => onOpenChat(partner)}
            className="w-full py-3.5 rounded-2xl font-bold text-sm bg-white/10 hover:bg-white/15 text-white border border-white/15 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <MessageCircle className="w-5 h-5 text-rose-400" />
            <span>Gửi Tin Nhắn Làm Quen</span>
          </button>

          <button
            onClick={onClose}
            className="text-xs font-semibold text-gray-400 hover:text-white py-2 block w-full transition-colors"
          >
            Tiếp tục tìm kiếm người khác
          </button>
        </div>

      </div>
    </div>
  );
};
