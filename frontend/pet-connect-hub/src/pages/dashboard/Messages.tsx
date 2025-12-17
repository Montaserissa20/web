import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Send, ArrowLeft, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { LoadingPage } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { messagesApi } from '@/services/api';
import { Conversation, ChatMessage } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { formatRelativeTime, getInitials, cn } from '@/lib/utils';

export default function Messages() {
  const { conversationId } = useParams<{ conversationId: string }>();
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load conversations
  useEffect(() => {
    const fetchConversations = async () => {
      setIsLoading(true);
      try {
        const response = await messagesApi.getConversations();
        if (response.success) {
          setConversations(response.data);
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchConversations();
  }, []);

  // Load selected conversation
  useEffect(() => {
    const fetchConversation = async () => {
      if (!conversationId) {
        setSelectedConversation(null);
        return;
      }
      try {
        const response = await messagesApi.getConversation(conversationId);
        if (response.success) {
          setSelectedConversation(response.data);
        }
      } catch {
        console.error('Failed to load conversation');
      }
    };
    fetchConversation();
  }, [conversationId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedConversation?.messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation || isSending) return;

    setIsSending(true);
    try {
      const response = await messagesApi.sendMessage(selectedConversation.id, newMessage.trim());
      if (response.success) {
        // Add message to the conversation
        setSelectedConversation(prev => prev ? {
          ...prev,
          messages: [...prev.messages, response.data],
        } : null);
        setNewMessage('');
      }
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading) return <LoadingPage />;

  return (
    <div className="h-[calc(100vh-200px)] flex gap-6">
      {/* Conversations List */}
      <Card className="w-80 flex-shrink-0">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Messages
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[calc(100vh-320px)]">
            {conversations.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground text-sm">
                No conversations yet
              </div>
            ) : (
              conversations.map((conv) => (
                <Link
                  key={conv.id}
                  to={`/dashboard/messages/${conv.id}`}
                  className={cn(
                    'flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors border-b',
                    conversationId === conv.id && 'bg-muted'
                  )}
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={conv.otherUser?.avatar || undefined} />
                    <AvatarFallback>{getInitials(conv.otherUser?.name || 'U')}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{conv.otherUser?.name || 'User'}</p>
                    {conv.lastMessage && (
                      <p className="text-sm text-muted-foreground truncate">
                        {conv.lastMessage.content}
                      </p>
                    )}
                    {conv.animal && (
                      <p className="text-xs text-primary truncate">
                        Re: {conv.animal.title}
                      </p>
                    )}
                  </div>
                </Link>
              ))
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Chat Area */}
      <Card className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <CardHeader className="pb-3 border-b">
              <div className="flex items-center gap-3">
                <Link to="/dashboard/messages" className="lg:hidden">
                  <ArrowLeft className="h-5 w-5" />
                </Link>
                <Avatar className="h-10 w-10">
                  <AvatarImage src={selectedConversation.otherUser?.avatar || undefined} />
                  <AvatarFallback>
                    {getInitials(selectedConversation.otherUser?.name || 'U')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-lg">
                    {selectedConversation.otherUser?.name || 'User'}
                  </CardTitle>
                  {selectedConversation.animal && (
                    <p className="text-sm text-muted-foreground">
                      Re: {selectedConversation.animal.title}
                    </p>
                  )}
                </div>
              </div>
            </CardHeader>

            {/* Messages */}
            <CardContent className="flex-1 p-4 overflow-hidden">
              <ScrollArea className="h-full pr-4">
                {selectedConversation.messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    No messages yet. Start the conversation!
                  </div>
                ) : (
                  <div className="space-y-4">
                    {selectedConversation.messages.map((msg) => {
                      const isOwn = msg.senderId === user?.id;
                      return (
                        <div
                          key={msg.id}
                          className={cn('flex', isOwn ? 'justify-end' : 'justify-start')}
                        >
                          <div
                            className={cn(
                              'max-w-[70%] rounded-lg px-4 py-2',
                              isOwn
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted'
                            )}
                          >
                            <p className="text-sm">{msg.content}</p>
                            <p className={cn(
                              'text-xs mt-1',
                              isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'
                            )}>
                              {formatRelativeTime(msg.createdAt)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </ScrollArea>
            </CardContent>

            {/* Message Input */}
            <div className="p-4 border-t">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  disabled={isSending}
                  className="flex-1"
                />
                <Button type="submit" disabled={!newMessage.trim() || isSending}>
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </>
        ) : (
          <CardContent className="flex-1 flex items-center justify-center">
            <EmptyState
              title="Select a conversation"
              description="Choose a conversation from the list to start chatting"
            />
          </CardContent>
        )}
      </Card>
    </div>
  );
}

