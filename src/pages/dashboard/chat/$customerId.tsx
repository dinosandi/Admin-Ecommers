import React, { useState, useRef, useEffect } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { useQueryClient } from '@tanstack/react-query';
import { GetChat } from '../../../hooks/useQuery/GetChat';
import { usePostChat } from '../../../hooks/useMutation/PostChat';
import { useGetCustomer } from '../../../hooks/useQuery/GetProfileById';
import {
  Box,
  Typography,
  CircularProgress,
  Avatar,
  TextField,
  Button as MuiButton,
  Paper,
  IconButton
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import CallIcon from '@mui/icons-material/Call';
import VideocamIcon from '@mui/icons-material/Videocam';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace';
import DashboardLayout from '@/component/template/DashboardLayout';

import errorImage from '../../../assets/bundleallert.png';

const SENDER_ID_LOCAL_STORAGE_KEY = 'chatSenderId';

type Customer = {
  Id: string;
  UserId: string;
  FullName: string;
  Email: string;
  PhoneNumber: string;
  Address: string;
  ImageUrl: string;
  ImageFile: string | null;
  LicenseNumber: string | null;
  VehicleInfo: string | null;
  Role: number;
  DriverId: string | null;
};

interface Message {
  Id: string;
  SenderId: string;
  ReceiverId: string;
  Message: string;
  Timestamp: string;
}

type ChatPayload = {
  SenderId: string;
  ReceiverId: string;
  Message: string;
};

export const Route = createFileRoute('/dashboard/chat/$customerId')({
  component: ChatDetailComponent,
  validate: ({ customerId }) => ({
    customerId: String(customerId),
  }),
});

function ChatDetailComponent() {
  const { customerId } = Route.useParams();

  const [currentLoggedInUserCustomerId, setCurrentLoggedInUserCustomerId] = useState<string | null>(null);

  useEffect(() => {
    const storedSenderId = localStorage.getItem(SENDER_ID_LOCAL_STORAGE_KEY);
    if (storedSenderId) {
      setCurrentLoggedInUserCustomerId(storedSenderId);
    } else {
      console.warn("Sender ID not found in localStorage. Redirecting or showing error.");
    }
  }, []);

  const [messageInput, setMessageInput] = useState<string>('');
  const chatMessagesRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const { data: contact, isLoading: isLoadingContact, isError: isErrorContact, error: errorContact } = useGetCustomer(customerId);

  const {
    data: chatMessages,
    isLoading: isLoadingChat,
    isError: isErrorChat,
    error: errorChat,
  } = GetChat(customerId);

  const filteredChatMessages = chatMessages?.filter((msg: Message) => {
    if (!currentLoggedInUserCustomerId) return false;

    return (
      (msg.SenderId === currentLoggedInUserCustomerId && msg.ReceiverId === customerId) ||
      (msg.SenderId === customerId && msg.ReceiverId === currentLoggedInUserCustomerId)
    );
  }) || [];

  const { mutate: postChat, isPending: isSendingMessage } = usePostChat();

  useEffect(() => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    }
  }, [filteredChatMessages]);

  const handleSendMessage = () => {
    if (messageInput.trim() === '' || !contact || !currentLoggedInUserCustomerId) {
      alert("Pesan kosong atau pengirim/penerima tidak valid. Mohon pastikan pengirim chat teridentifikasi.");
      return;
    }

    const payload: ChatPayload = {
      SenderId: currentLoggedInUserCustomerId,
      ReceiverId: contact.Id,
      Message: messageInput,
    };

    postChat(payload, {
      onSuccess: () => {
        setMessageInput('');
        queryClient.invalidateQueries({ queryKey: ["chat", contact.Id] });
      },
      onError: (err) => {
        console.error("Gagal mengirim pesan:", err);
        alert("Gagal mengirim pesan.");
      },
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isSendingMessage) {
      handleSendMessage();
    }
  };

  if (isLoadingContact) {
    return (
      <DashboardLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', flexDirection: 'column' }}>
          <CircularProgress />
          <Typography variant="h6" sx={{ mt: 2 }}>Loading chat partner...</Typography>
        </Box>
      </DashboardLayout>
    );
  }

  if (isErrorContact || !contact) {
    return (
      <DashboardLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', flexDirection: 'column', color: 'error.main', p: 3 }}>
          <img
            src={errorImage}
            alt="Error"
            style={{ width: '150px', height: 'auto', marginBottom: '20px' }}
          />
          <Typography variant="h6" align="center" sx={{ mb: 1 }}>Maaf Contact Tidak Mempunyai CustomerId.</Typography>
          <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 2 }}>
            {(errorContact as Error)?.message || "An unexpected error occurred."}
          </Typography>
          <MuiButton variant="contained" sx={{ color: 'white', bgcolor: '#FFD500', mt: 2, '&:hover': { bgcolor: '#E6C200' } }} onClick={() => window.history.back()}>
            Go Back
          </MuiButton>
        </Box>
      </DashboardLayout>
    );
  }

  if (!currentLoggedInUserCustomerId) {
    return (
      <DashboardLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', flexDirection: 'column', p: 3 }}>
          <img
            src={errorImage}
            alt="Sender ID Missing"
            style={{ width: '150px', height: 'auto', marginBottom: '20px' }}
          />
          <Typography variant="h6" color="text.secondary" align="center">
            Sender ID not found. Please go back to the customer list to initiate chat.
          </Typography>
          <MuiButton variant="contained" sx={{ color: 'white', bgcolor: '#FFD500', mt: 2, '&:hover': { bgcolor: '#E6C200' } }} onClick={() => window.history.back()}>
            Go Back to Customer List
          </MuiButton>
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', bgcolor: '#f0f2f5' }}>
        {/* Header Chat */}
        <Paper elevation={1} sx={{ p: 2, borderBottom: '1px solid #e0e0e0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton onClick={() => window.history.back()} sx={{ mr: 1 }}>
              <KeyboardBackspaceIcon />
            </IconButton>
            <Avatar src={contact.ImageUrl || '/default-avatar.png'} alt={contact.FullName} sx={{ width: 48, height: 48, mr: 2 }} />
            <Box>
              <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold' }}>
                {contact.FullName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Chatting as: {currentLoggedInUserCustomerId}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <MuiButton startIcon={<CallIcon />} size="small" variant="text" sx={{ color: 'text.secondary' }}>Call</MuiButton>
            <MuiButton startIcon={<VideocamIcon />} size="small" variant="text" sx={{ color: 'text.secondary' }}>Video</MuiButton>
            <MuiButton startIcon={<MoreVertIcon />} size="small" variant="text" sx={{ color: 'text.secondary'} } />
          </Box>
        </Paper>

        {/* Area Pesan Chat */}
        <Box ref={chatMessagesRef} sx={{ flexGrow: 1, p: 2, overflowY: 'auto', bgcolor: '#e5ddd5' }}>
          {isLoadingChat && <CircularProgress size={24} sx={{ display: 'block', margin: 'auto' }} />}
          {isErrorChat && (
            <Typography variant="body2" color="error" align="center">
              Error loading messages: {(errorChat as Error).message}
            </Typography>
          )}
          {filteredChatMessages.length === 0 && !isLoadingChat && currentLoggedInUserCustomerId && (
            <Typography variant="body2" color="text.secondary" align="center">
              Belum ada pesan dengan {contact.FullName} dari {currentLoggedInUserCustomerId}.
            </Typography>
          )}
          {filteredChatMessages.map((msg: Message, index: number) => (
            <Box
              key={msg.Id || index}
              sx={{
                display: 'flex',
                justifyContent: msg.SenderId === currentLoggedInUserCustomerId ? 'flex-end' : 'flex-start',
                mb: 1,
              }}
            >
              {msg.SenderId !== currentLoggedInUserCustomerId && (
                <Avatar src={contact.ImageUrl || '/default-avatar.png'} alt={contact.FullName} sx={{ width: 32, height: 32, mr: 1, alignSelf: 'flex-end' }} />
              )}
              <Box
                sx={{
                  maxWidth: '70%',
                  p: 1.5,
                  borderRadius: '10px',
                  bgcolor: msg.SenderId === currentLoggedInUserCustomerId ? '#DCF8C6' : '#FFFFFF',
                  boxShadow: '0 1px 0.5px rgba(0, 0, 0, 0.13)',
                  position: 'relative',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    [msg.SenderId === currentLoggedInUserCustomerId ? 'right' : 'left']: '-8px',
                    width: 0,
                    height: 0,
                    borderStyle: 'solid',
                    borderWidth: '8px 8px 8px 0',
                    borderColor: `transparent ${msg.SenderId === currentLoggedInUserCustomerId ? '#DCF8C6' : '#FFFFFF'} transparent transparent`,
                    transform: msg.SenderId === currentLoggedInUserCustomerId ? 'rotateY(180deg)' : 'none',
                  }
                }}
              >
                <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>{msg.Message}</Typography>
                <Typography variant="caption" sx={{ display: 'block', mt: 0.5, color: msg.SenderId === currentLoggedInUserCustomerId ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.4)', textAlign: 'right' }}>
                  {new Date(msg.Timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>

        {/* Input Chat */}
        <Paper elevation={1} sx={{ p: 2, borderTop: '1px solid #e0e0e0', display: 'flex', alignItems: 'center', gap: 1 }}>
          <MuiButton sx={{ minWidth: 'auto', p: 1, color: 'text.secondary' }}>
            <AttachFileIcon />
          </MuiButton>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Type your message here"
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isSendingMessage}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '20px',
                backgroundColor: '#FFFFFF',
                pr: '0 !important',
              },
              '& .MuiOutlinedInput-notchedOutline': { borderColor: 'transparent' },
              '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#4CAF50' },
            }}
            InputProps={{
              endAdornment: (
                <MuiButton
                  variant="contained"
                  sx={{
                    borderRadius: '50%',
                    minWidth: '40px',
                    height: '40px',
                    p: 0,
                    ml: 1,
                    bgcolor: '#4CAF50',
                    '&:hover': { bgcolor: '#45A049' },
                  }}
                  onClick={handleSendMessage}
                  disabled={isSendingMessage || messageInput.trim() === ''}
                >
                  {isSendingMessage ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    <SendIcon sx={{ transform: 'rotate(-45deg)', ml: 1 }} />
                  )}
                </MuiButton>
              ),
            }}
          />
        </Paper>
      </Box>
    </DashboardLayout>
  );
}