'use client';
import { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import { Header } from '../../components/header';

// Interfaces para tipagem
interface Message {
  id: string;
  chatId: string;
  senderId: string;
  content: string;
  read: boolean;
  createdAt: string;
  updatedAt: string;
}

interface User {
  id: string;
  name: string;
  email?: string;
  role?: string;
  profile?: {
    avatar?: string;
    [key: string]: any;
  };
}

interface Conversation {
  id: string;
  userId: string;
  name: string;
  image: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  online: boolean;
  lastSeen: string;
}

interface UnreadData {
  chatId: string;
  unreadMessagesCount: number;
}

interface ChatData {
  id: string;
  otherUser: User[];
  messages: Message[];
}

export default function Chats() {
  const [selectedUser, setSelectedUser] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [showMobileDrawer, setShowMobileDrawer] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<ReturnType<typeof io> | null>(null);
  const [token, setToken] = useState('');
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Inicializar token e dados do usuário
  useEffect(() => {
    const storedToken =
      localStorage.getItem('token') || sessionStorage.getItem('token') || '';
    const storedUserString =
      localStorage.getItem('user') || sessionStorage.getItem('user') || '{}';
    const storedUser = JSON.parse(storedUserString);

    setToken(storedToken);
    setCurrentUser(storedUser);
  }, []);

  // Inicializar Socket.io
  useEffect(() => {
    if (token) {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      socketRef.current = io(apiUrl, {
        auth: { token },
      });

      socketRef.current.on('connect', () => {
        console.log('Socket conectado!');
      });

      socketRef.current.on('new_message', (message: Message) => {
        if (selectedUser && message.chatId === selectedUser.id) {
          setMessages((prev) => [...prev, message]);
        }
        loadConversations();
      });

      socketRef.current.on(
        'typing',
        ({ chatId, isTyping }: { chatId: string; isTyping: boolean }) => {
          if (selectedUser && chatId === selectedUser.id) {
            setIsTyping(isTyping);
          }
        }
      );

      return () => {
        if (socketRef.current) {
          socketRef.current.disconnect();
        }
      };
    }
  }, [token, selectedUser]);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const loadConversations = async () => {
    if (!token) return;

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      const response = await fetch(`${apiUrl}/chats`, {
        headers: {
          Authorization: token,
        },
      });

      if (!response.ok) {
        throw new Error('Falha ao carregar conversas');
      }

      const chats: ChatData[] = await response.json();

      const unreadResponse = await fetch(`${apiUrl}/messages/unread`, {
        headers: {
          Authorization: token,
        },
      });

      const unreadData: UnreadData[] = await unreadResponse.json();
      const unreadCounts: Record<string, number> = {};

      unreadData.forEach((item) => {
        unreadCounts[item.chatId] = item.unreadMessagesCount;
      });

      const formattedConversations = chats.map((chat) => {
        const otherUser = chat.otherUser[0];
        const lastMessage = chat.messages[0] || null;

        return {
          id: chat.id,
          userId: otherUser.id,
          name: otherUser.name,
          image: otherUser.profile?.avatar || 'https://i.pravatar.cc/150?img=1',
          lastMessage: lastMessage
            ? lastMessage.content
            : 'Nenhuma mensagem ainda',
          lastMessageTime: lastMessage
            ? formatMessageTime(lastMessage.createdAt)
            : '',
          unreadCount: unreadCounts[chat.id] || 0,
          online: false,
          lastSeen: 'Offline',
        };
      });

      setConversations(formattedConversations);
    } catch (err) {
      console.error('Erro ao carregar conversas:', err);
    } finally {
      setLoadingConversations(false);
    }
  };

  useEffect(() => {
    if (token) {
      loadConversations();
      const interval = setInterval(loadConversations, 30000);
      return () => clearInterval(interval);
    }
  }, [token]);

  const loadMessages = async (chatId: string) => {
    if (!token || !chatId) return;

    setLoading(true);
    setError(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      const response = await fetch(`${apiUrl}/chats/${chatId}/messages`, {
        headers: {
          Authorization: token,
        },
      });

      if (!response.ok) {
        throw new Error('Falha ao carregar mensagens');
      }

      const data: Message[] = await response.json();

      if (currentUser) {
        const unreadMessages = data.filter(
          (msg) => !msg.read && msg.senderId !== currentUser.id
        );

        if (unreadMessages.length > 0) {
          await Promise.all(
            unreadMessages.map(async (msg) => {
              await fetch(`${apiUrl}/messages/${msg.id}`, {
                method: 'PATCH',
                headers: {
                  Authorization: token,
                  'Content-Type': 'application/json',
                },
              });
            })
          );
        }
      }

      setMessages(data);

      if (socketRef.current) {
        socketRef.current.emit('join_chat', chatId);
      }
    } catch (err) {
      setError('Erro ao carregar mensagens');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedUser || !token || !currentUser) return;

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      const response = await fetch(`${apiUrl}/messages/${selectedUser.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token,
        },
        body: JSON.stringify({
          content: newMessage.trim(),
        }),
      });

      if (!response.ok) throw new Error('Falha ao enviar mensagem');

      const data = await response.json();

      const newMsg: Message = {
        id: data.messageId,
        chatId: selectedUser.id,
        senderId: currentUser.id,
        content: newMessage.trim(),
        read: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, newMsg]);
      setNewMessage('');

      loadConversations();
    } catch (err) {
      setError('Erro ao enviar mensagem');
      console.error(err);
    }
  };

  const handleUserSelect = (conversation: Conversation) => {
    if (selectedUser && socketRef.current) {
      socketRef.current.emit('leave_chat', selectedUser.id);
    }

    setSelectedUser(conversation);
    loadMessages(conversation.id);
    setShowMobileDrawer(false);
  };

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const formatMessageTime = (timestamp: string): string => {
    if (!timestamp) return '';

    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return '';

    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
    } else if (days === 1) {
      return 'Ontem';
    } else if (days < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className='flex flex-col min-h-screen overflow-x-hidden bg-white'>
      <Header />
      <div className='flex flex-col flex-grow mt-16'>
        <div className='flex h-[calc(100vh-4rem)]'>
          <div
            className={`${
              showMobileDrawer
                ? 'fixed inset-0 bg-black bg-opacity-50 z-40'
                : 'hidden'
            } md:hidden`}
            onClick={() => setShowMobileDrawer(false)}
          />

          <div
            className={`${
              showMobileDrawer ? 'translate-x-0' : '-translate-x-full'
            } fixed md:relative md:translate-x-0 w-3/4 md:w-1/4 min-w-[300px] h-full bg-white border-r transition-transform duration-300 z-50`}
          >
            <div className='flex items-center justify-between p-4 bg-white border-b shadow-sm'>
              <div className='flex items-center'>
                <img
                  src={
                    currentUser?.profile?.avatar || '/images/default-avatar.jpg'
                  }
                  alt='Seu perfil'
                  className='object-cover w-10 h-10 border-2 border-gray-200 rounded-full'
                />
                <h2 className='ml-3 text-lg font-semibold'>
                  {currentUser?.name || 'Usuário'}
                </h2>
              </div>
              <button className='text-gray-600 transition-colors hover:text-gray-800'>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  viewBox='0 0 24 24'
                  fill='currentColor'
                  className='w-6 h-6'
                >
                  <path
                    fillRule='evenodd'
                    d='M10.5 6a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zm0 6a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zm0 6a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0z'
                    clipRule='evenodd'
                  />
                </svg>
              </button>
            </div>

            <div className='p-4 bg-white border-b'>
              <div className='relative'>
                <input
                  type='text'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder='Buscar conversas...'
                  className='w-full py-2 pl-10 pr-4 transition-all border rounded-full bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500'
                />
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className='absolute w-5 h-5 text-gray-400 left-3 top-2.5'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
                  />
                </svg>
              </div>
            </div>

            <div className='overflow-y-auto h-[calc(100%-8rem)]'>
              {loadingConversations ? (
                Array.from({ length: 5 })
                  .fill(0)
                  .map((_, i) => (
                    <div key={i} className='p-4 border-b animate-pulse'>
                      <div className='flex items-center'>
                        <div className='w-12 h-12 bg-gray-200 rounded-full' />
                        <div className='flex-1 ml-3'>
                          <div className='w-3/4 h-4 mb-2 bg-gray-200 rounded' />
                          <div className='w-1/2 h-3 bg-gray-200 rounded' />
                        </div>
                      </div>
                    </div>
                  ))
              ) : conversations.filter((conv) =>
                  conv.name.toLowerCase().includes(searchTerm.toLowerCase())
                ).length === 0 ? (
                <div className='py-8 text-center text-gray-500'>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    className='w-8 h-8 mx-auto mb-2 text-gray-400'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M8 16l2.879-2.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242zM21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                    />
                  </svg>
                  <p>Nenhuma conversa encontrada</p>
                </div>
              ) : (
                conversations
                  .filter((conv) =>
                    conv.name.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((conv) => (
                    <div
                      key={conv.id}
                      onClick={() => handleUserSelect(conv)}
                      className={`flex items-center p-4 hover:bg-gray-50 cursor-pointer border-b transition-colors ${
                        selectedUser?.id === conv.id ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className='relative'>
                        <img
                          src={conv.image}
                          alt={conv.name}
                          className='object-cover w-12 h-12 border-2 border-gray-200 rounded-full'
                        />
                        {conv.online && (
                          <div className='absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full' />
                        )}
                      </div>
                      <div className='flex-1 min-w-0 ml-3'>
                        <div className='flex items-baseline justify-between'>
                          <h3 className='font-medium truncate'>{conv.name}</h3>
                          <span className='ml-2 text-xs text-gray-500'>
                            {conv.lastMessageTime}
                          </span>
                        </div>
                        <p className='text-sm text-gray-500 truncate'>
                          {conv.lastMessage}
                        </p>
                      </div>
                      {conv.unreadCount > 0 && (
                        <span className='px-2 py-1 ml-2 text-xs text-white bg-blue-500 rounded-full'>
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                  ))
              )}
            </div>
          </div>

          <div className='flex flex-col flex-1 bg-gray-50'>
            {selectedUser ? (
              <>
                <div className='flex items-center justify-between p-4 bg-white border-b shadow-sm'>
                  <div className='flex items-center'>
                    <button
                      className='mr-4 text-gray-600 md:hidden'
                      onClick={() => setShowMobileDrawer(true)}
                    >
                      <svg
                        xmlns='http://www.w3.org/2000/svg'
                        className='w-6 h-6'
                        fill='none'
                        viewBox='0 0 24 24'
                        stroke='currentColor'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M4 6h16M4 12h16M4 18h16'
                        />
                      </svg>
                    </button>
                    <div className='relative'>
                      <img
                        src={selectedUser.image}
                        alt={selectedUser.name}
                        className='object-cover w-10 h-10 border-2 border-gray-200 rounded-full'
                      />
                      {selectedUser.online && (
                        <div className='absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white' />
                      )}
                    </div>
                    <div className='ml-3'>
                      <h3 className='font-medium'>{selectedUser.name}</h3>
                      <p className='text-xs text-gray-500'>
                        {selectedUser.online ? 'Online' : selectedUser.lastSeen}
                      </p>
                    </div>
                  </div>
                  <div className='flex items-center space-x-4'>
                    <button className='text-gray-600 transition-colors hover:text-gray-800'>
                      <svg
                        xmlns='http://www.w3.org/2000/svg'
                        className='w-5 h-5'
                        viewBox='0 0 20 20'
                        fill='currentColor'
                      >
                        <path d='M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z' />
                      </svg>
                    </button>
                    <button className='text-gray-600 transition-colors hover:text-gray-800'>
                      <svg
                        xmlns='http://www.w3.org/2000/svg'
                        className='w-5 h-5'
                        viewBox='0 0 20 20'
                        fill='currentColor'
                      >
                        <path d='M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z' />
                      </svg>
                    </button>
                    <button className='text-gray-600 transition-colors hover:text-gray-800'>
                      <svg
                        xmlns='http://www.w3.org/2000/svg'
                        className='w-5 h-5'
                        viewBox='0 0 20 20'
                        fill='currentColor'
                      >
                        <path d='M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z' />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className='flex-1 p-4 space-y-4 overflow-y-auto'>
                  {loading ? (
                    <div className='flex items-center justify-center h-full'>
                      <div className='w-8 h-8 border-b-2 border-blue-500 rounded-full animate-spin' />
                    </div>
                  ) : error ? (
                    <div className='py-4 text-center text-red-500'>
                      <svg
                        xmlns='http://www.w3.org/2000/svg'
                        className='w-6 h-6 mx-auto mb-2'
                        fill='none'
                        viewBox='0 0 24 24'
                        stroke='currentColor'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                        />
                      </svg>
                      {error}
                      <button
                        onClick={() => loadMessages(selectedUser.id)}
                        className='block mt-2 text-blue-500 hover:underline'
                      >
                        Tentar novamente
                      </button>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className='py-8 text-center text-gray-500'>
                      <svg
                        xmlns='http://www.w3.org/2000/svg'
                        className='w-12 h-12 mx-auto mb-2 text-gray-400'
                        fill='none'
                        viewBox='0 0 24 24'
                        stroke='currentColor'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z'
                        />
                      </svg>
                      <p>Nenhuma mensagem ainda</p>
                      <p className='text-sm'>Comece uma conversa!</p>
                    </div>
                  ) : (
                    messages.map((msg, index) => (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${
                          msg.senderId === currentUser?.id
                            ? 'items-end'
                            : 'items-start'
                        }`}
                      >
                        {index === 0 ||
                        new Date(msg.createdAt).toDateString() !==
                          new Date(
                            messages[index - 1].createdAt
                          ).toDateString() ? (
                          <div className='flex justify-center w-full my-4'>
                            <span className='px-4 py-1 text-sm text-gray-500 bg-gray-100 rounded-full'>
                              {new Date(msg.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        ) : null}

                        <div
                          className={`max-w-[70%] rounded-lg px-4 py-2 shadow-sm ${
                            msg.senderId === currentUser?.id
                              ? 'bg-blue-500 text-white rounded-br-none'
                              : 'bg-white rounded-bl-none'
                          }`}
                        >
                          {msg.content}
                        </div>
                        <div className='flex items-center mt-1 space-x-2'>
                          <span className='text-xs text-gray-500'>
                            {formatMessageTime(msg.createdAt)}
                          </span>
                          {msg.senderId === currentUser?.id && (
                            <span className='text-xs text-blue-500'>
                              <svg
                                xmlns='http://www.w3.org/2000/svg'
                                className='w-4 h-4'
                                viewBox='0 0 20 20'
                                fill='currentColor'
                              >
                                <path
                                  fillRule='evenodd'
                                  d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                                  clipRule='evenodd'
                                />
                              </svg>
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <div className='p-4 bg-white border-t'>
                  {isTyping && (
                    <div className='mb-2 text-xs text-gray-500'>
                      {selectedUser.name} está digitando...
                    </div>
                  )}
                  <div className='flex items-center gap-2'>
                    <button className='text-gray-600 transition-colors hover:text-gray-800'>
                      <svg
                        xmlns='http://www.w3.org/2000/svg'
                        className='w-6 h-6'
                        fill='none'
                        viewBox='0 0 24 24'
                        stroke='currentColor'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                        />
                      </svg>
                    </button>
                    <button className='text-gray-600 transition-colors hover:text-gray-800'>
                      <svg
                        xmlns='http://www.w3.org/2000/svg'
                        className='w-6 h-6'
                        fill='none'
                        viewBox='0 0 24 24'
                        stroke='currentColor'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13'
                        />
                      </svg>
                    </button>
                    <input
                      type='text'
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      placeholder='Digite sua mensagem...'
                      className='flex-1 px-4 py-2 transition border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500'
                    />
                    <button
                      onClick={sendMessage}
                      className='p-2 text-white bg-blue-500 rounded-full hover:bg-blue-600'
                    >
                      <svg
                        xmlns='http://www.w3.org/2000/svg'
                        className='w-5 h-5'
                        viewBox='0 0 20 20'
                        fill='currentColor'
                      >
                        <path d='M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z' />
                      </svg>
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className='flex items-center justify-center h-full text-center'>
                <div className='max-w-md p-6'>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    className='w-16 h-16 mx-auto mb-4 text-gray-400'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z'
                    />
                  </svg>
                  <h3 className='mb-2 text-xl font-medium text-gray-900'>
                    Seus chats
                  </h3>
                  <p className='text-gray-600'>
                    Selecione uma conversa ou inicie uma nova para começar a
                    trocar mensagens
                  </p>
                  <button
                    className='px-4 py-2 mt-4 text-white bg-blue-500 rounded-md hover:bg-blue-600'
                    onClick={() => setShowMobileDrawer(true)}
                  >
                    Ver conversas
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
