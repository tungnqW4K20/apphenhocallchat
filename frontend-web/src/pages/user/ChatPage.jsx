import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../services/api';
import { uploadImageFree } from '../../services/freeImageUploader';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { useWebRTC } from '../../context/WebRTCContext';
import { 
  MessageCircle, 
  Send, 
  Image as ImageIcon, 
  Video, 
  Gift, 
  CheckCheck, 
  Search, 
  Flame,
  ArrowLeft,
  Loader2,
  Trash2,
  RotateCcw,
  MoreVertical,
  AlertTriangle
} from 'lucide-react';

export const ChatPage = ({ initialPartner, onOpenProfile, onOpenGift }) => {
  const { currentUser } = useAuth();
  const { socket } = useSocket();
  const { startDirectCall } = useWebRTC();

  const [matches, setMatches] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [search, setSearch] = useState('');
  const [activeMenuMsgId, setActiveMenuMsgId] = useState(null);
  const [showDeleteConvModal, setShowDeleteConvModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    loadMatchesAndConversations();
  }, []);

  useEffect(() => {
    if (initialPartner) {
      openChatWithPartner(initialPartner);
    }
  }, [initialPartner]);

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (msg) => {
      if (activeConv && (msg.conversation_id === activeConv.id || msg.sender_id === activeConv.partner_id || msg.receiver_id === activeConv.partner_id)) {
        setMessages((prev) => {
          if (prev.some(m => m.id === msg.id && msg.id !== undefined)) return prev;
          return [...prev, msg];
        });
        scrollToBottom();
      }
      loadMatchesAndConversations(false);
    };

    const handleMessageRecalled = (data) => {
      setMessages((prev) => prev.map(m => m.id === data.messageId ? { ...m, is_recalled: true, content: 'Tin nhắn đã được thu hồi' } : m));
      loadMatchesAndConversations(false);
    };

    const handleMessageDeleted = (data) => {
      setMessages((prev) => prev.filter(m => m.id !== data.messageId));
      loadMatchesAndConversations(false);
    };

    const handleConversationDeleted = (data) => {
      setConversations((prev) => prev.filter(c => c.id !== data.conversationId));
      if (activeConv && activeConv.id === data.conversationId) {
        setActiveConv(null);
        setMessages([]);
      }
    };

    socket.on('new_message', handleNewMessage);
    socket.on('message_recalled', handleMessageRecalled);
    socket.on('message_deleted', handleMessageDeleted);
    socket.on('conversation_deleted', handleConversationDeleted);

    return () => {
      socket.off('new_message', handleNewMessage);
      socket.off('message_recalled', handleMessageRecalled);
      socket.off('message_deleted', handleMessageDeleted);
      socket.off('conversation_deleted', handleConversationDeleted);
    };
  }, [socket, activeConv]);

  const loadMatchesAndConversations = async (autoSelectFirst = true) => {
    try {
      const [matchesRes, convsRes] = await Promise.all([
        api.getMatches(),
        api.getConversations()
      ]);
      if (matchesRes.success) setMatches(matchesRes.matches || []);
      if (convsRes.success) {
        const convList = convsRes.conversations || [];
        setConversations(convList);
        if (autoSelectFirst && !activeConv && convList.length > 0 && !initialPartner) {
          selectConversation(convList[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load chat data:', err);
    }
  };

  const openChatWithPartner = async (partner) => {
    try {
      const convsRes = await api.getConversations();
      const convList = convsRes.conversations || [];
      let conv = convList.find(c => c.partner_id === partner.id || c.partner?.id === partner.id);
      
      if (!conv) {
        // Send initial greeting
        const msgRes = await api.sendMessage({
          conversation_id: 0,
          receiver_id: partner.id,
          message_type: 'text',
          content: 'Chào bạn! Rất vui được làm quen ✨'
        });
        
        const refreshed = await api.getConversations();
        const updatedList = refreshed.conversations || [];
        setConversations(updatedList);
        conv = updatedList.find(c => c.partner_id === partner.id || c.partner?.id === partner.id);
        
        if (conv) {
          selectConversation(conv);
        } else {
          const directConv = {
            id: msgRes.message?.conversation_id || Date.now(),
            partner_id: partner.id,
            partner: partner,
            last_message: 'Chào bạn! Rất vui được làm quen ✨',
            last_message_at: new Date().toISOString()
          };
          setActiveConv(directConv);
          setMessages([msgRes.message]);
        }
      } else {
        selectConversation(conv);
      }
    } catch (err) {
      console.error('Error opening chat with partner:', err);
      const directConv = {
        id: 'direct_' + partner.id,
        partner_id: partner.id,
        partner: partner,
        last_message: '',
        last_message_at: new Date().toISOString()
      };
      setActiveConv(directConv);
      setMessages([]);
    }
  };

  const selectConversation = async (conv) => {
    setActiveConv(conv);
    setLoadingMessages(true);
    try {
      const res = await api.getMessages(conv.id);
      if (res.success) {
        setMessages(res.messages || []);
        scrollToBottom();
      }
    } catch (err) {
      console.error('Failed to load messages:', err);
    } finally {
      setLoadingMessages(false);
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!inputText.trim() || !activeConv) return;

    const textToSend = inputText.trim();
    setInputText('');

    if (socket) {
      socket.emit('send_message', {
        conversationId: activeConv.id,
        receiverId: activeConv.partner_id,
        messageType: 'text',
        content: textToSend
      });
    } else {
      try {
        const res = await api.sendMessage({
          conversation_id: activeConv.id,
          receiver_id: activeConv.partner_id,
          message_type: 'text',
          content: textToSend
        });
        if (res.success) {
          setMessages(prev => [...prev, res.message]);
          scrollToBottom();
        }
      } catch (err) {
        console.error('Send message error:', err);
      }
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !activeConv) return;

    setUploadingImage(true);
    try {
      const isVideo = file.type.startsWith('video');
      let mediaUrl = null;

      if (!isVideo) {
        const uploadRes = await uploadImageFree(file);
        if (uploadRes.success && uploadRes.url) {
          mediaUrl = uploadRes.url;
        }
      }

      if (!mediaUrl) {
        const formData = new FormData();
        formData.append('file', file);
        const res = await api.uploadChatMedia(formData);
        if (res.success && (res.url || res.mediaUrl)) {
          mediaUrl = res.url || res.mediaUrl;
        }
      }

      if (mediaUrl) {
        const messageType = isVideo ? 'video' : 'image';
        if (socket) {
          socket.emit('send_message', {
            conversationId: activeConv.id,
            receiverId: activeConv.partner_id,
            messageType,
            content: mediaUrl
          });
        } else {
          const res = await api.sendMessage({
            conversation_id: activeConv.id,
            receiver_id: activeConv.partner_id,
            message_type: messageType,
            content: mediaUrl
          });
          if (res.success) {
            setMessages(prev => [...prev, res.message]);
            scrollToBottom();
          }
        }
      } else {
        alert('Không thể tải tệp lên. Vui lòng thử lại!');
      }
    } catch (err) {
      console.error('Upload chat media error:', err);
      alert('Lỗi tải tệp: ' + err.message);
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const getImageSrc = (content) => {
    if (!content) return '';
    if (content.startsWith('data:') || content.startsWith('http://') || content.startsWith('https://')) {
      return content;
    }
    const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
    const baseUrl = isLocal ? 'http://localhost:5001' : 'https://dating-backend-islg.onrender.com';
    return `${baseUrl}${content.startsWith('/') ? '' : '/'}${content}`;
  };

  const renderLastMessagePreview = (c) => {
    if (c.display_last_message) return c.display_last_message;
    const msg = c.last_message || '';
    if (!msg) return 'Bắt đầu cuộc trò chuyện';

    const partnerName = c.partner?.full_name || 'Đối phương';
    const isImage = c.last_message_type === 'image' || msg.startsWith('http') || msg.startsWith('data:') || msg.startsWith('/uploads') || msg.includes('[Hình ảnh');

    if (isImage) {
      if (c.last_sender_id === currentUser?.id) {
        return 'Bạn đã gửi một hình ảnh 📷';
      }
      return `${partnerName} đã gửi một hình ảnh 📷`;
    }

    if (c.last_message_type === 'gift' || msg.includes('tặng')) {
      return `🎁 ${msg}`;
    }

    if (c.last_sender_id === currentUser?.id && !msg.startsWith('Bạn:')) {
      return `Bạn: ${msg}`;
    }

    return msg;
  };

  const handleRecallMessage = async (msgId) => {
    try {
      setActionLoading(true);
      const res = await api.recallMessage(msgId);
      if (res.success) {
        setMessages(prev => prev.map(m => m.id === msgId ? { ...m, is_recalled: true, content: 'Tin nhắn đã được thu hồi' } : m));
        loadMatchesAndConversations(false);
      }
    } catch (err) {
      alert(err.message || 'Lỗi khi thu hồi tin nhắn');
    } finally {
      setActionLoading(false);
      setActiveMenuMsgId(null);
    }
  };

  const handleDeleteMessage = async (msgId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa vĩnh viễn tin nhắn này khỏi hệ thống?')) return;
    try {
      setActionLoading(true);
      const res = await api.deleteMessage(msgId);
      if (res.success) {
        setMessages(prev => prev.filter(m => m.id !== msgId));
        loadMatchesAndConversations(false);
      }
    } catch (err) {
      alert(err.message || 'Lỗi khi xóa tin nhắn');
    } finally {
      setActionLoading(false);
      setActiveMenuMsgId(null);
    }
  };

  const handleDeleteConversation = async () => {
    if (!activeConv) return;
    try {
      setActionLoading(true);
      const res = await api.deleteConversation(activeConv.id);
      if (res.success) {
        setConversations(prev => prev.filter(c => c.id !== activeConv.id));
        setActiveConv(null);
        setMessages([]);
        setShowDeleteConvModal(false);
      }
    } catch (err) {
      alert(err.message || 'Lỗi khi xóa cuộc hội thoại');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredConvs = conversations.filter(c => {
    if (!search) return true;
    return c.partner?.full_name?.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 py-4 h-[calc(100vh-80px)] flex flex-col">
      <div className="flex-1 bg-[#14131f] border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row">
        
        {/* LEFT SIDEBAR: MATCHES & CONVERSATIONS */}
        <div className={`w-full md:w-80 lg:w-96 border-r border-white/10 flex flex-col bg-[#111019] ${activeConv ? 'hidden md:flex' : 'flex'}`}>
          
          {/* Matches Header Bar */}
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center gap-2 mb-3">
              <Flame className="w-5 h-5 text-rose-500 fill-rose-500" />
              <h3 className="font-extrabold text-white text-sm">Cặp Đôi Mới Ghép ({matches.length})</h3>
            </div>

            {/* Horizontal Matches Row */}
            <div className="flex items-center gap-3 overflow-x-auto pb-1 custom-scrollbar">
              {matches.map((m) => (
                <div
                  key={m.id}
                  onClick={() => openChatWithPartner(m)}
                  className="flex flex-col items-center gap-1 shrink-0 cursor-pointer group"
                >
                  <div className="relative">
                    <img
                      src={m.avatar}
                      alt={m.full_name}
                      className="w-14 h-14 rounded-full object-cover ring-2 ring-rose-500 group-hover:scale-105 transition-transform"
                    />
                    {m.is_online && (
                      <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-2 ring-[#111019]" />
                    )}
                  </div>
                  <span className="text-[11px] font-semibold text-gray-300 max-w-[60px] truncate text-center">
                    {m.full_name.split(' ')[0]}
                  </span>
                </div>
              ))}
              {matches.length === 0 && (
                <p className="text-xs text-gray-500 py-2">Chưa có match nào mới. Hãy quẹt thêm thẻ!</p>
              )}
            </div>
          </div>

          {/* Search Box */}
          <div className="p-3 border-b border-white/5">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Tìm đoạn hội thoại..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
            {filteredConvs.map((c) => {
              const isActive = activeConv?.id === c.id;
              return (
                <div
                  key={c.id}
                  onClick={() => selectConversation(c)}
                  className={`flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all ${
                    isActive ? 'bg-rose-500/20 border border-rose-500/30' : 'hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <div className="relative shrink-0">
                    <img
                      src={c.partner?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                      alt={c.partner?.full_name}
                      className="w-12 h-12 rounded-full object-cover ring-1 ring-white/10"
                    />
                    {c.partner?.is_online && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-[#111019]" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-white text-sm truncate">{c.partner?.full_name}</h4>
                      <span className="text-[10px] text-gray-500">
                        {c.last_message_at ? new Date(c.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 truncate mt-0.5">{renderLastMessagePreview(c)}</p>
                  </div>

                  {c.unread_count > 0 && (
                    <span className="w-5 h-5 rounded-full bg-rose-500 text-white font-bold text-[10px] flex items-center justify-center shrink-0 shadow">
                      {c.unread_count}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

        </div>

        {/* RIGHT AREA: ACTIVE CHAT VIEW */}
        <div className={`flex-1 flex flex-col bg-[#161522] ${!activeConv ? 'hidden md:flex' : 'flex'}`}>
          {activeConv ? (
            <>
              {/* Chat Header */}
              <div className="p-3.5 sm:p-4 bg-[#111019] border-b border-white/10 flex items-center justify-between">
                
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setActiveConv(null)}
                    className="md:hidden p-2 rounded-xl bg-white/5 text-gray-300 hover:bg-white/10"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>

                  <div 
                    onClick={() => onOpenProfile(activeConv.partner)}
                    className="flex items-center gap-3 cursor-pointer group"
                  >
                    <div className="relative">
                      <img
                        src={activeConv.partner?.avatar}
                        alt={activeConv.partner?.full_name}
                        className="w-10 h-10 rounded-full object-cover ring-2 ring-rose-500"
                      />
                      {activeConv.partner?.is_online && (
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-[#111019]" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-white group-hover:text-pink-400 transition-colors">
                        {activeConv.partner?.full_name}
                      </h4>
                      <p className="text-[11px] text-gray-400">
                        {activeConv.partner?.is_online ? '🟢 Đang hoạt động' : 'Ngoại tuyến'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Call, Gift & Delete Conversation Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onOpenGift(activeConv.partner)}
                    className="p-2.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 transition-all"
                    title="Tặng quà 3D"
                  >
                    <Gift className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => startDirectCall(activeConv.partner, 'video')}
                    className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-95 text-white font-bold text-xs shadow-lg shadow-pink-500/25 flex items-center gap-1.5 transition-all"
                  >
                    <Video className="w-4 h-4 text-cyan-200" />
                    <span className="hidden sm:inline">Gọi 1v1</span>
                  </button>

                  {/* Delete Conversation Button */}
                  <button
                    onClick={() => setShowDeleteConvModal(true)}
                    className="p-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 hover:text-rose-300 transition-all"
                    title="Xóa toàn bộ cuộc trò chuyện"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

              </div>

              {/* Messages Body */}
              <div 
                className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar"
                onClick={() => setActiveMenuMsgId(null)}
              >
                {loadingMessages ? (
                  <div className="flex items-center justify-center h-full text-xs text-gray-500">
                    Đang tải tin nhắn...
                  </div>
                ) : (
                  messages.map((m, idx) => {
                    const isMine = m.sender_id === currentUser?.id;
                    const isRecalled = m.is_recalled || m.content === 'Tin nhắn đã được thu hồi';

                    return (
                      <div
                        key={m.id || idx}
                        className={`flex items-end gap-2 group relative ${isMine ? 'justify-end' : 'justify-start'}`}
                      >
                        {!isMine && (
                          <img
                            src={activeConv.partner?.avatar}
                            alt=""
                            className="w-7 h-7 rounded-full object-cover shrink-0 ring-1 ring-white/10"
                          />
                        )}

                        {/* Action Menu Popover for All Messages */}
                        <div className="relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveMenuMsgId(activeMenuMsgId === m.id ? null : m.id);
                            }}
                            className="opacity-70 sm:opacity-0 group-hover:opacity-100 p-1.5 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-all cursor-pointer"
                            title="Tùy chọn tin nhắn"
                          >
                            <MoreVertical className="w-3.5 h-3.5" />
                          </button>

                          {activeMenuMsgId === m.id && (
                            <div className={`absolute bottom-full ${isMine ? 'right-0' : 'left-0'} mb-1 z-30 bg-[#1e1d2d] border border-white/15 rounded-xl shadow-2xl p-1.5 min-w-[140px] flex flex-col gap-1 animate-fade-in text-xs`}>
                              {isMine && !isRecalled && (
                                <button
                                  onClick={() => handleRecallMessage(m.id)}
                                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/10 text-amber-300 font-semibold transition-colors text-left"
                                >
                                  <RotateCcw className="w-3.5 h-3.5" />
                                  <span>Thu hồi</span>
                                </button>
                              )}
                              <button
                                onClick={() => handleDeleteMessage(m.id)}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-rose-500/20 text-rose-400 font-semibold transition-colors text-left"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Xóa vĩnh viễn</span>
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Message Bubble Content */}
                        <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 shadow-md ${
                          isRecalled
                            ? 'bg-white/5 border border-dashed border-white/20 text-gray-400 italic rounded-2xl'
                            : isMine
                            ? 'bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-br-none'
                            : 'bg-white/10 text-gray-100 rounded-bl-none border border-white/5'
                        }`}>
                          {isRecalled ? (
                            <div className="flex items-center gap-1.5 text-xs text-gray-400">
                              <RotateCcw className="w-3.5 h-3.5 opacity-60" />
                              <span>Tin nhắn đã được thu hồi</span>
                            </div>
                          ) : m.message_type === 'image' ? (
                            <div className="rounded-xl overflow-hidden my-1 bg-black/40">
                              <img
                                src={getImageSrc(m.content)}
                                alt="Attachment"
                                className="max-h-72 max-w-full rounded-xl object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
                                onClick={() => window.open(getImageSrc(m.content), '_blank')}
                              />
                            </div>
                          ) : m.message_type === 'video' ? (
                            <div className="rounded-xl overflow-hidden my-1 bg-black/60 max-w-xs sm:max-w-sm">
                              <video
                                src={getImageSrc(m.content)}
                                controls
                                playsInline
                                className="max-h-72 w-full rounded-xl object-contain"
                              />
                            </div>
                          ) : m.message_type === 'audio' ? (
                            <div className="my-1 max-w-xs">
                              <audio
                                src={getImageSrc(m.content)}
                                controls
                                className="w-full h-8"
                              />
                            </div>
                          ) : m.message_type === 'gift' ? (
                            <div className="flex items-center gap-2">
                              <span className="text-2xl">🎁</span>
                              <span className="text-xs font-bold">{m.content}</span>
                            </div>
                          ) : (
                            <p className="text-xs sm:text-sm leading-relaxed break-words">{m.content}</p>
                          )}

                          <div className={`flex items-center gap-1 text-[9px] mt-1 ${isRecalled ? 'text-gray-500' : isMine ? 'text-rose-200 justify-end' : 'text-gray-400 justify-start'}`}>
                            <span>{new Date(m.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            {isMine && !isRecalled && <CheckCheck className="w-3 h-3" />}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input Bar */}
              <form onSubmit={handleSendMessage} className="p-3 sm:p-4 bg-[#111019] border-t border-white/10 flex items-center gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*,video/*"
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingImage}
                  className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all disabled:opacity-50 flex items-center justify-center"
                  title="Gửi ảnh miễn phí"
                >
                  {uploadingImage ? <Loader2 className="w-4 h-4 animate-spin text-rose-500" /> : <ImageIcon className="w-4 h-4" />}
                </button>

                <input
                  type="text"
                  placeholder={uploadingImage ? "Đang tải ảnh lên đám mây..." : "Nhập tin nhắn..."}
                  value={inputText}
                  disabled={uploadingImage}
                  onChange={(e) => setInputText(e.target.value)}
                  className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 rounded-2xl text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-rose-500"
                />

                <button
                  type="submit"
                  disabled={!inputText.trim() || uploadingImage}
                  className="p-2.5 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-lg shadow-rose-500/25 hover:opacity-95 active:scale-95 disabled:opacity-40 transition-all"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-gray-500">
              <div className="w-16 h-16 rounded-3xl bg-white/5 flex items-center justify-center text-3xl mb-3">
                💬
              </div>
              <h3 className="font-bold text-white text-base">Chưa chọn cuộc hội thoại nào</h3>
              <p className="text-xs max-w-xs mt-1">
                Hãy chọn một người trong danh sách bên trái hoặc ghép đôi thêm để bắt đầu nhắn tin & gọi video!
              </p>
            </div>
          )}
        </div>

      </div>

      {/* Delete Entire Conversation Confirmation Modal */}
      {showDeleteConvModal && activeConv && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-[#161522] border border-rose-500/30 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-500 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h3 className="text-lg font-black text-white">Xóa Vĩnh Viễn Cuộc Trò Chuyện?</h3>
              <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                Hành động này sẽ xóa toàn bộ nội dung trò chuyện giữa bạn và <span className="text-white font-bold">{activeConv.partner?.full_name}</span> khỏi cơ sở dữ liệu và không thể khôi phục lại!
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteConvModal(false)}
                disabled={actionLoading}
                className="flex-1 py-2.5 rounded-xl font-bold text-xs bg-white/10 hover:bg-white/15 text-gray-300 transition-all"
              >
                Hủy Bỏ
              </button>
              <button
                type="button"
                onClick={handleDeleteConversation}
                disabled={actionLoading}
                className="flex-1 py-2.5 rounded-xl font-bold text-xs bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-600/30 flex items-center justify-center gap-1.5 transition-all"
              >
                <Trash2 className="w-4 h-4" />
                <span>{actionLoading ? 'Đang xóa...' : 'Xác Nhận Xóa'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
