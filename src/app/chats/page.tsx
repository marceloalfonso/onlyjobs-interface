'use client';

import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Header } from '../../components/header';
import { socket } from '../../lib/socketio';
import { isUserSignedIn } from '../../utils/auth';
import { formatTimestamp } from '../../utils/date-formatters';

interface User {
  id: string;
  name: string;
  profile?: {
    avatar?: string;
    [key: string]: any;
  };
}

interface Message {
  id: string;
  chatId: string;
  senderId: string;
  content: string;
  read: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Chat {
  id: string;
  otherUser: User;
  messages: Message[];
}

interface ChatPreview {
  id: string;
  userId: string;
  name: string;
  image: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

interface UnreadData {
  chatId: string;
  unreadMessagesCount: number;
}

async function getUserChats(token: string) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chats`, {
      headers: {
        Authorization: token,
      },
    });

    if (!response.ok) {
      throw new Error('Falha ao carregar conversas');
    }

    const userChats = await response.json();

    return userChats;
  } catch (err) {
    return [];
  }
}

async function getUnreadMessagesCountPerChat(token: string) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/messages/unread`,
      {
        headers: {
          Authorization: token,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message);
    }

    return data;
  } catch (err) {
    return [];
  }
}

async function updateMessage(token: string, messageId: string) {
  try {
    let cleanMessageId = messageId;

    if (cleanMessageId.includes('-')) {
      cleanMessageId = cleanMessageId.split('-')[0];
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/messages/${cleanMessageId}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token,
        },
        body: JSON.stringify({}),
      }
    );

    const { message } = await response.json();

    if (!response.ok) {
      throw new Error(message);
    }

    return true;
  } catch (err) {
    return false;
  }
}

export default function Chats() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [isLoadingChatPreviews, setIsLoadingChatPreviews] = useState(true);
  const [chatPreviews, setChatPreviews] = useState<ChatPreview[]>([]);
  const [currentChatPreview, setCurrentChatPreview] =
    useState<ChatPreview | null>(null);
  const [currentChatMessages, setCurrentChatMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  async function loadChatMessages(chatId: string) {
    if (!token) return [];

    setIsLoading(true);
    setError('');

    try {
      const chats = await getUserChats(token);

      const chat = chats.find((chat: Chat) => chat.id === chatId);

      if (!chat) {
        throw new Error(`Chat com ID ${chatId} não encontrado`);
      }

      const chatMessages = chat.messages || [];

      const sortedMessages = [...chatMessages].reverse();

      setCurrentChatMessages(sortedMessages);

      return sortedMessages;
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Erro ao carregar mensagens do chat.'
      );
      return [];
    } finally {
      setIsLoading(false);
    }
  }

  async function markMessagesAsRead(messages: Message[]) {
    if (!token || !user) return;

    const unreadMessages = messages.filter(
      (message) => !message.read && message.senderId !== user.id
    );

    if (unreadMessages.length > 0) {
      try {
        for (const message of unreadMessages) {
          await updateMessage(token, message.id);
        }

        setCurrentChatMessages((prev) =>
          prev.map((message) => {
            if (!message.read && message.senderId !== user.id) {
              return { ...message, read: true };
            }

            return message;
          })
        );
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Erro ao marcar mensagens como lidas.'
        );
      }
    }
  }

  async function loadChatPreviews() {
    if (!token) return;

    setIsLoadingChatPreviews(true);

    try {
      const chats = await getUserChats(token);
      const unreadData = await getUnreadMessagesCountPerChat(token);

      const unreadCounts: Record<string, number> = {};

      unreadData.forEach((item: UnreadData) => {
        unreadCounts[item.chatId] = item.unreadMessagesCount;
      });

      setChatPreviews(
        chats.map((chat: Chat) => {
          const otherUser = chat.otherUser;
          const lastMessage = chat.messages[0] || null;

          return {
            id: chat.id,
            userId: otherUser.id,
            name: otherUser.name,
            image:
              otherUser.profile?.avatar || 'https://i.pravatar.cc/150?img=1',
            lastMessage: lastMessage
              ? lastMessage.content
              : 'Nenhuma mensagem ainda',
            lastMessageTime: lastMessage
              ? formatTimestamp(lastMessage.createdAt, 'dynamic')
              : '',
            unreadCount: unreadCounts[chat.id] || 0,
          };
        })
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar chats.');
    } finally {
      setIsLoadingChatPreviews(false);
    }
  }

  async function sendMessage() {
    if (!newMessage.trim() || !currentChatPreview || !token || !user)
      return false;

    const content = newMessage.trim();

    try {
      setNewMessage('');

      const date = format(Date.now(), 'dd/MM/yy - HH:mm:ss', { locale: ptBR });

      const tempId = `temp-${Date.now()}`;

      const tempMessage: Message = {
        id: tempId,
        chatId: currentChatPreview.id,
        senderId: user.id,
        content,
        read: false,
        createdAt: date,
        updatedAt: date,
      };

      setCurrentChatMessages((prev) => [...prev, tempMessage]);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/messages/${currentChatPreview.id}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: token,
          },
          body: JSON.stringify({
            content,
          }),
        }
      );

      const { message } = await response.json();

      if (!response.ok) {
        throw new Error(message);
      }

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao enviar mensagem.');
      setNewMessage(content);
      return false;
    }
  }

  function handleChatSelect(chatPreview: ChatPreview) {
    if (currentChatPreview) {
      socket.emit('leave_chat', currentChatPreview.id);
    }

    setCurrentChatPreview(chatPreview);

    sessionStorage.setItem('chatId', chatPreview.id);

    loadChatMessages(chatPreview.id)
      .then((messages) => {
        if (user && messages.length > 0) {
          markMessagesAsRead(messages);
          loadChatPreviews();
        }
      })
      .catch((err) => {
        setError(
          err instanceof Error ? err.message : 'Erro ao carregar mensagens.'
        );
      });

    socket.emit('join_chat', chatPreview.id);
  }

  function handleBackToConversations() {
    setCurrentChatPreview(null);
    sessionStorage.removeItem('chatId');
  }

  function handleResize() {
    setIsMobile(window.innerWidth < 768);
  }

  useEffect(() => {
    if (!isUserSignedIn()) {
      router.push('/sign-in');
      return;
    }

    const storedToken =
      localStorage.getItem('token') || sessionStorage.getItem('token') || '';
    const storedUser =
      localStorage.getItem('user') || sessionStorage.getItem('user') || '{}';

    setToken(storedToken);
    setUser(JSON.parse(storedUser));

    if (token && user?.id) {
      if (!socket.connected) {
        socket.connect();
      }

      socket.emit('join_user_room', user.id);
    }

    handleResize();

    window.addEventListener('resize', handleResize);

    setIsLoading(false);

    return () => {
      if (user?.id) {
        socket.emit('leave_user_room', user.id);
      }

      sessionStorage.removeItem('chatId');
      window.removeEventListener('resize', handleResize);
    };
  }, [router]);

  useEffect(() => {
    if (token) {
      loadChatPreviews().then(() => {
        const storedChatId = sessionStorage.getItem('chatId');

        if (storedChatId && chatPreviews.length > 0) {
          const storedChat = chatPreviews.find(
            (chat) => chat.id === storedChatId
          );

          if (storedChat) {
            handleChatSelect(storedChat);
          }
        }
      });

      const interval = setInterval(() => {
        loadChatPreviews();
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [token, chatPreviews.length]);

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollIntoView({ behavior: 'auto' });
    }
  }, [currentChatMessages]);

  useEffect(() => {
    if (token && user) {
      if (currentChatPreview) {
        socket.emit('join_chat', currentChatPreview.id);
      }

      if (!socket.connected) {
        socket.connect();
      }

      socket.on('connect', () => {
        if (user?.id) {
          socket.emit('join_user_room', user.id);
        }

        if (currentChatPreview) {
          socket.emit('join_chat', currentChatPreview.id);
        }
      });

      socket.on('new_message', (message: Message) => {
        loadChatPreviews();

        if (currentChatPreview && message.chatId === currentChatPreview.id) {
          if (!message.read && message.senderId !== user?.id) {
            updateMessage(token, message.id);
          }

          setCurrentChatMessages((prev) => {
            const tempMessageIndex = prev.findIndex(
              (tempMessage) =>
                tempMessage.id.startsWith('temp-') &&
                tempMessage.content === message.content &&
                tempMessage.senderId === message.senderId
            );

            if (tempMessageIndex !== -1) {
              const updatedMessages = [...prev];

              updatedMessages[tempMessageIndex] = {
                ...message,
                id: `${message.id}-${Date.now()}`,
                read: message.senderId !== user?.id ? true : message.read,
              };

              return updatedMessages;
            }

            return [
              ...prev,
              {
                ...message,
                id: `${message.id}-${Date.now()}`,
                read: message.senderId !== user?.id ? true : message.read,
              },
            ];
          });
        }
      });

      socket.on('new_notification', () => {
        loadChatPreviews();
      });

      socket.on('message_read', (data: { messageId: string }) => {
        if (currentChatPreview) {
          setCurrentChatMessages((prev) =>
            prev.map((message) => {
              const messageIdWithoutSuffix = message.id.includes('-')
                ? message.id.split('-')[0]
                : message.id;

              if (
                message.id === data.messageId ||
                messageIdWithoutSuffix === data.messageId
              ) {
                return { ...message, read: true };
              }

              return message;
            })
          );
        }
      });

      return () => {
        if (currentChatPreview) {
          socket.emit('leave_chat', currentChatPreview.id);
        }

        if (user?.id) {
          socket.emit('leave_user_room', user.id);
        }

        socket.off('connect');
        socket.off('new_message');
        socket.off('new_notification');
        socket.off('message_read');
      };
    }
  }, [token, currentChatPreview, user?.id]);

  useEffect(() => {
    if (window.innerWidth < 768) {
      setIsMobile(true);
    }
  }, [currentChatPreview]);

  return (
    <div className='flex flex-col min-h-screen bg-white'>
      <Header />

      <div className='flex flex-col flex-grow mt-16'>
        <div className='flex flex-col md:flex-row h-[calc(100vh-4rem)]'>
          <div
            className={`
            flex flex-col
            w-full md:w-[320px] lg:w-[350px] 
            border-r border-gray-200
            ${isMobile && currentChatPreview ? 'hidden' : 'flex'}
          `}
          >
            <div className='p-4 bg-white border-b h-[65px] flex items-center'>
              <div className='relative w-full'>
                <input
                  type='text'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder='Buscar conversas...'
                  className='w-full py-2 pl-10 pr-4 text-gray-900 placeholder-gray-600 transition-all border border-gray-300 rounded-full bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500'
                />
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className='absolute w-5 h-5 text-gray-600 left-3 top-2.5'
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

            <div className='flex-1 overflow-y-auto'>
              {isLoadingChatPreviews ? (
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
              ) : chatPreviews.filter((chatPreview) =>
                  chatPreview.name
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase())
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
                chatPreviews
                  .filter((chatPreview) =>
                    chatPreview.name
                      .toLowerCase()
                      .includes(searchTerm.toLowerCase())
                  )
                  .map((chatPreview) => (
                    <div
                      key={chatPreview.id}
                      onClick={() => handleChatSelect(chatPreview)}
                      className={`flex items-center p-4 hover:bg-gray-50 cursor-pointer border-b transition-colors ${
                        currentChatPreview?.id === chatPreview.id
                          ? 'bg-blue-50'
                          : ''
                      }`}
                    >
                      <div className='relative'>
                        <img
                          src={chatPreview.image}
                          alt={chatPreview.name}
                          className='object-cover w-12 h-12 border-2 border-gray-200 rounded-full'
                        />
                      </div>
                      <div className='flex-1 min-w-0 ml-3'>
                        <div className='flex items-start justify-between'>
                          <div>
                            <h3 className='font-semibold text-gray-900 truncate'>
                              {chatPreview.name}
                            </h3>
                            <p className='mt-1 text-sm text-gray-500 truncate'>
                              {chatPreview.lastMessage}
                            </p>
                          </div>
                          <div className='flex flex-col items-end ml-2'>
                            <span className='text-xs text-gray-500'>
                              {chatPreview.lastMessageTime}
                            </span>
                            {chatPreview.unreadCount > 0 && (
                              <span className='px-2 py-1 mt-1 text-xs text-white bg-blue-500 rounded-full'>
                                {chatPreview.unreadCount}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>

          <div
            className={`
            flex flex-col flex-1 h-full bg-gray-50
            ${isMobile && !currentChatPreview ? 'hidden' : 'flex'}
            ${!currentChatPreview ? 'items-center justify-center' : ''}
          `}
          >
            {currentChatPreview ? (
              <>
                <div className='flex items-center justify-between p-4 bg-white border-b sticky top-0 z-10 h-[65px]'>
                  <div className='flex items-center'>
                    {isMobile && (
                      <button
                        className='p-2 mr-4 text-gray-600 transition-all duration-200 rounded-full cursor-pointer hover:text-gray-900 hover:bg-gray-100'
                        onClick={handleBackToConversations}
                        aria-label='Voltar para lista de conversas'
                      >
                        <svg
                          xmlns='http://www.w3.org/2000/svg'
                          className='w-5 h-5'
                          fill='none'
                          viewBox='0 0 24 24'
                          stroke='currentColor'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M15 19l-7-7 7-7'
                          />
                        </svg>
                      </button>
                    )}
                    <div className='relative'>
                      <img
                        src={currentChatPreview.image}
                        alt={currentChatPreview.name}
                        className='object-cover w-10 h-10 border-2 border-gray-200 rounded-full'
                      />
                    </div>
                    <div className='ml-3'>
                      <h3 className='font-semibold text-gray-900'>
                        {currentChatPreview.name}
                      </h3>
                    </div>
                  </div>

                  {!isMobile && (
                    <button
                      className='p-2 text-gray-500 transition-all duration-200 rounded-full cursor-pointer hover:text-gray-800 hover:bg-gray-100'
                      onClick={handleBackToConversations}
                      aria-label='Fechar conversa'
                    >
                      <svg
                        xmlns='http://www.w3.org/2000/svg'
                        className='w-5 h-5'
                        fill='none'
                        viewBox='0 0 24 24'
                        stroke='currentColor'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M6 18L18 6M6 6l12 12'
                        />
                      </svg>
                    </button>
                  )}
                </div>

                <div className='flex-1 overflow-y-auto'>
                  <div className='p-4 pb-0 space-y-4'>
                    {isLoading ? (
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
                          onClick={() =>
                            loadChatMessages(currentChatPreview.id)
                          }
                          className='block mt-2 text-blue-500 hover:underline'
                        >
                          Tentar novamente
                        </button>
                      </div>
                    ) : currentChatMessages.length === 0 ? (
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
                      (() => {
                        const messagesByDate: { [date: string]: Message[] } =
                          {};

                        currentChatMessages.forEach((message) => {
                          const datePart =
                            message.createdAt?.split(' - ')[0] ||
                            format(new Date(), 'dd/MM/yy');

                          if (!messagesByDate[datePart]) {
                            messagesByDate[datePart] = [];
                          }

                          messagesByDate[datePart].push(message);
                        });

                        return Object.entries(messagesByDate).map(
                          ([date, messages]) => (
                            <div key={date} className='mb-6'>
                              <div className='flex justify-center w-full mb-4'>
                                <span className='px-4 py-1 text-sm text-gray-500 bg-gray-100 rounded-full'>
                                  {formatTimestamp(
                                    messages[0].createdAt ||
                                      format(new Date(), 'dd/MM/yy - HH:mm:ss'),
                                    'label'
                                  )}
                                </span>
                              </div>

                              {messages.map((message) => (
                                <div
                                  key={message.id}
                                  className={`flex flex-col ${
                                    message.senderId === user?.id
                                      ? 'items-end'
                                      : 'items-start'
                                  } mb-4`}
                                >
                                  <div
                                    className={`max-w-[70%] rounded-lg px-4 py-2 shadow-sm ${
                                      message.senderId === user?.id
                                        ? 'bg-blue-500 text-white rounded-br-none'
                                        : 'bg-white text-gray-800 rounded-bl-none'
                                    }`}
                                  >
                                    {message.content}
                                  </div>
                                  <div className='flex items-center mt-1 space-x-2'>
                                    <span className='text-xs text-gray-500'>
                                      {message.createdAt
                                        ? formatTimestamp(
                                            message.createdAt,
                                            'short'
                                          )
                                        : format(new Date(), 'HH:mm')}
                                    </span>
                                    {message.senderId === user?.id && (
                                      <span
                                        className={`text-xs ${
                                          message.read
                                            ? 'text-blue-500'
                                            : 'text-gray-400'
                                        }`}
                                      >
                                        {message.id?.startsWith('temp-') ? (
                                          <svg
                                            xmlns='http://www.w3.org/2000/svg'
                                            className='w-4 h-4'
                                            viewBox='0 0 20 20'
                                            fill='currentColor'
                                          >
                                            <path
                                              fillRule='evenodd'
                                              d='M10 18a8 8 0 100-16 8 8 0 000 16zm-1-9a1 1 0 011 1v2a1 1 0 11-2 0v-2a1 1 0 011-1zm0-4a1 1 0 100 2 1 1 0 000-2z'
                                              clipRule='evenodd'
                                            />
                                          </svg>
                                        ) : (
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
                                        )}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )
                        );
                      })()
                    )}
                    <div ref={messagesRef} />
                  </div>
                </div>

                <div className='sticky bottom-0 p-4 mt-auto bg-white border-t'>
                  <div className='flex items-center gap-2'>
                    <input
                      type='text'
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          sendMessage().then((success) => {
                            if (success) {
                              loadChatPreviews();
                            }
                          });
                        }
                      }}
                      placeholder='Digite sua mensagem...'
                      className='flex-1 px-4 py-2 text-gray-800 placeholder-gray-600 transition border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500'
                      autoComplete='off'
                    />
                    <button
                      onClick={() => {
                        sendMessage().then((success) => {
                          if (success) {
                            loadChatPreviews();
                          }
                        });
                      }}
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
              <div className='flex items-center justify-center h-full p-4 text-center'>
                <div className='max-w-md'>
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
                  <p className='mb-4 text-gray-600'>
                    Selecione uma conversa para começar a trocar mensagens
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
