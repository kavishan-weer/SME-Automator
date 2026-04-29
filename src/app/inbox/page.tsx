'use client'

import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { Layout, Menu, Typography, ConfigProvider, Input, Avatar, Badge, Switch, Button, Spin, message, Empty } from 'antd';
import { SettingOutlined, AppstoreOutlined, LogoutOutlined, RobotOutlined, SearchOutlined, PaperClipOutlined, SendOutlined, MessageOutlined, TeamOutlined, LoadingOutlined } from '@ant-design/icons';
import { createClient } from '../../lib/supabase';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

const { Header, Content, Sider } = Layout;
const { Title, Text } = Typography;

interface Contact {
    id: string;
    phone_number: string;
    name: string | null;
    user_id: string;
    created_at: string;
    last_message_at: string | null;
    last_message_snippet: string | null;
    unread_count: number;
    bot_active: boolean;
}

interface Message {
    id: string;
    contact_id: string;
    user_id: string;
    direction: 'incoming' | 'outgoing';
    body: string;
    created_at: string;
}

export default function InboxPage() {
    const supabase = useMemo(() => createClient(), []);
    const router = useRouter();
    const pathname = usePathname();
    const chatEndRef = useRef<HTMLDivElement>(null);
    const [messageApi, contextHolder] = message.useMessage();

    const [contacts, setContacts] = useState<Contact[]>([]);
    const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
    const [chatHistory, setChatHistory] = useState<Message[]>([]);
    const [inputText, setInputText] = useState('');
    const [loadingContacts, setLoadingContacts] = useState(true);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [sendingMessage, setSendingMessage] = useState(false);
    const [searchText, setSearchText] = useState('');

    // Scroll to bottom of chat
    const scrollToBottom = useCallback(() => {
        setTimeout(() => {
            chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    }, []);

    // Fetch contacts list
    const fetchContacts = useCallback(async () => {
        setLoadingContacts(true);
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            setLoadingContacts(false);
            return;
        }

        const { data, error } = await supabase
            .from('contacts')
            .select('*')
            .eq('user_id', user.id)
            .order('last_message_at', { ascending: false, nullsFirst: false });

        if (error) {
            console.error('Error fetching contacts:', error);
            messageApi.error('Failed to load contacts: ' + error.message);
        } else {
            setContacts(data || []);
        }
        setLoadingContacts(false);
    }, [supabase, messageApi]);

    // Fetch chat history for a contact
    const fetchChatHistory = useCallback(async (contactId: string) => {
        setLoadingMessages(true);
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            setLoadingMessages(false);
            return;
        }

        const { data, error } = await supabase
            .from('messages')
            .select('*')
            .eq('contact_id', contactId)
            .eq('user_id', user.id)
            .order('created_at', { ascending: true });

        if (error) {
            console.error('Error fetching messages:', error);
            messageApi.error('Failed to load messages: ' + error.message);
        } else {
            setChatHistory(data || []);
            scrollToBottom();
        }
        setLoadingMessages(false);
    }, [supabase, messageApi, scrollToBottom]);

    // Load contacts on mount
    useEffect(() => {
        fetchContacts();
    }, [fetchContacts]);

    // Fetch messages when a contact is selected
    useEffect(() => {
        if (selectedContact) {
            fetchChatHistory(selectedContact.id);
        }
    }, [selectedContact, fetchChatHistory]);

    // Handle sending a message
    const handleSendMessage = useCallback(async () => {
        if (!inputText.trim() || !selectedContact || sendingMessage) return;

        setSendingMessage(true);
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            messageApi.error('Unauthorized: Please log in.');
            setSendingMessage(false);
            return;
        }

        const newMessage = {
            contact_id: selectedContact.id,
            user_id: user.id,
            direction: 'outgoing' as const,
            body: inputText.trim(),
        };

        const { data, error } = await supabase
            .from('messages')
            .insert([newMessage])
            .select()
            .single();

        if (error) {
            messageApi.error('Failed to send message: ' + error.message);
        } else {
            // Add the new message to chat history optimistically
            setChatHistory(prev => [...prev, data]);
            setInputText('');
            scrollToBottom();

            // Update contact's last message info
            await supabase
                .from('contacts')
                .update({
                    last_message_at: data.created_at,
                    last_message_snippet: data.body.substring(0, 100),
                })
                .eq('id', selectedContact.id);

            // Refresh contacts list to reflect updated ordering
            fetchContacts();
        }

        setSendingMessage(false);
    }, [inputText, selectedContact, sendingMessage, supabase, messageApi, scrollToBottom, fetchContacts]);

    // Handle selecting a contact
    const handleSelectContact = useCallback((contact: Contact) => {
        setSelectedContact(contact);
        setChatHistory([]); // Clear previous chat while loading
    }, []);

    // Format timestamp for display
    const formatTime = (timestamp: string) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else if (diffDays === 1) {
            return 'Yesterday';
        } else if (diffDays < 7) {
            return date.toLocaleDateString([], { weekday: 'long' });
        }
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    };

    // Filter contacts by search
    const filteredContacts = contacts.filter(c =>
        (c.name || c.phone_number).toLowerCase().includes(searchText.toLowerCase()) ||
        c.phone_number.includes(searchText)
    );

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/login');
    };

    const menuItems = [
        { key: '/dashboard', icon: <AppstoreOutlined />, label: <Link href="/dashboard">Dashboard</Link> },
        { key: '/inbox', icon: <MessageOutlined />, label: <Link href="/inbox">Team Inbox</Link> },
        { key: '/customers', icon: <TeamOutlined />, label: <Link href="/customers">Customers</Link> },
        { key: '/settings', icon: <SettingOutlined />, label: <Link href="/settings">Settings</Link> },
        { type: 'divider' as const },
        { key: 'logout', icon: <LogoutOutlined />, label: 'Logout', onClick: handleLogout }
    ];

    return (
        <ConfigProvider
            theme={{
                token: {
                    colorPrimary: '#25D366',
                    borderRadius: 8,
                    fontFamily: 'var(--font-inter), sans-serif',
                    colorText: '#111b21',
                },
                components: {
                    Layout: {
                        siderBg: '#ffffff',
                        headerBg: '#f0f2f5',
                        bodyBg: '#f0f2f5',
                    },
                    Menu: {
                        itemSelectedBg: '#e9fbee',
                        itemSelectedColor: '#128C7E',
                        itemColor: '#54656f',
                        itemHoverColor: '#128C7E',
                    }
                }
            }}
        >
            <Layout style={{ height: '100vh', overflow: 'hidden' }} hasSider>
                {contextHolder}
                {/* Main App Sidebar */}
                <Sider 
                    width={260} 
                    theme="light"
                    breakpoint="lg"
                    collapsedWidth="0"
                    className="border-r border-[#d1d7db] shadow-sm z-50 flex-shrink-0"
                >
                    <div className="p-6 flex items-center gap-3 border-b border-[#d1d7db]">
                        <div className="w-8 h-8 bg-[#25D366] rounded-lg flex items-center justify-center shadow-md">
                            <RobotOutlined className="text-white text-lg" />
                        </div>
                        <Title level={4} className="!m-0 !text-[#111b21] tracking-tight">SME Automator</Title>
                    </div>
                    <Menu
                        mode="inline"
                        selectedKeys={[pathname]}
                        items={menuItems}
                        className="mt-4 border-none px-3"
                    />
                </Sider>

                {/* Inbox Layout Area */}
                <Layout style={{ minWidth: 0, height: '100vh' }}>
                    <Content className="flex w-full h-full p-0">
                        
                        {/* Inbox Sidebar (30%) */}
                        <div className="w-[320px] lg:w-[35%] h-full bg-white border-r border-[#d1d7db]/50 flex flex-col flex-shrink-0">
                            {/* Header */}
                            <div className="p-4 border-b border-[#d1d7db]/50 bg-[#f0f2f5]">
                                <Title level={5} className="!m-0 !mb-3 !text-[#111b21]">Unified Inbox</Title>
                                <Input 
                                    prefix={<SearchOutlined className="text-[#8696a0]" />} 
                                    placeholder="Search chats or contacts" 
                                    className="bg-white border-none rounded-lg py-2 shadow-sm focus:ring-2 focus:ring-[#25D366]/20 text-[15px]"
                                    value={searchText}
                                    onChange={(e) => setSearchText(e.target.value)}
                                    allowClear
                                />
                            </div>
                            
                            {/* Chat List */}
                            <div className="flex-1 overflow-y-auto">
                                {loadingContacts ? (
                                    <div className="flex items-center justify-center h-40">
                                        <Spin indicator={<LoadingOutlined className="text-[#25D366] text-2xl" />} />
                                    </div>
                                ) : filteredContacts.length === 0 ? (
                                    <div className="flex items-center justify-center h-40 p-6">
                                        <Empty description={<Text className="text-[#8696a0]">{searchText ? 'No matching contacts' : 'No conversations yet'}</Text>} image={Empty.PRESENTED_IMAGE_SIMPLE} />
                                    </div>
                                ) : (
                                    filteredContacts.map((contact) => (
                                        <div 
                                            key={contact.id} 
                                            onClick={() => handleSelectContact(contact)}
                                            className={`flex items-start gap-3 p-4 cursor-pointer border-b border-[#f0f2f5] transition-colors ${selectedContact?.id === contact.id ? 'bg-[#f0f2f5]' : 'hover:bg-[#f8f9fa]'}`}
                                        >
                                            <Badge dot={contact.unread_count > 0} color="#1677ff" offset={[-4, 4]}>
                                                <Avatar size={48} className="bg-[#128C7E] flex-shrink-0 text-lg">
                                                    {(contact.name || contact.phone_number).charAt(0).toUpperCase()}
                                                </Avatar>
                                            </Badge>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-baseline mb-1">
                                                    <Text className="font-semibold text-[#111b21] truncate">{contact.name || contact.phone_number}</Text>
                                                    <Text className="text-xs text-[#8696a0] flex-shrink-0 ml-2">
                                                        {contact.last_message_at ? formatTime(contact.last_message_at) : ''}
                                                    </Text>
                                                </div>
                                                <Text className="text-[#54656f] text-sm truncate block w-full">
                                                    {contact.last_message_snippet || 'No messages yet'}
                                                </Text>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Active Chat Area (70%) */}
                        <div className="flex-1 h-full flex flex-col bg-[#efeae2] relative" style={{ backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")', backgroundSize: 'contain', backgroundRepeat: 'repeat' }}>
                            
                            {!selectedContact ? (
                                /* Empty State — No contact selected */
                                <div className="flex-1 flex flex-col items-center justify-center z-10">
                                    <div className="w-20 h-20 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center mb-6 shadow-lg">
                                        <MessageOutlined className="text-4xl text-[#25D366]" />
                                    </div>
                                    <Title level={4} className="!text-[#41525d] !m-0">SME Automator Inbox</Title>
                                    <Text className="text-[#8696a0] mt-2 text-center max-w-sm">Select a conversation from the sidebar to view and reply to messages.</Text>
                                </div>
                            ) : (
                                <>
                                    {/* Chat Header */}
                                    <div className="h-[72px] px-6 flex items-center justify-between bg-[#f0f2f5] border-b border-[#d1d7db]/50 z-10 flex-shrink-0 shadow-sm">
                                        <div className="flex items-center gap-4">
                                            <Avatar size={42} className="bg-[#128C7E]">
                                                {(selectedContact.name || selectedContact.phone_number).charAt(0).toUpperCase()}
                                            </Avatar>
                                            <div>
                                                <Title level={5} className="!m-0 !text-[#111b21]">{selectedContact.name || selectedContact.phone_number}</Title>
                                                <Text className="text-xs text-[#54656f]">{selectedContact.phone_number}</Text>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Text className="text-sm font-medium text-[#54656f]">Bot Status</Text>
                                            <Switch 
                                                checked={selectedContact.bot_active} 
                                                className="bg-[#d1d7db] [&.ant-switch-checked]:bg-[#25D366]"
                                                onChange={async (checked) => {
                                                    const { error } = await supabase
                                                        .from('contacts')
                                                        .update({ bot_active: checked })
                                                        .eq('id', selectedContact.id);
                                                    if (!error) {
                                                        setSelectedContact({ ...selectedContact, bot_active: checked });
                                                        messageApi.success(`Bot is now ${checked ? 'ON' : 'OFF'} for this contact.`);
                                                    }
                                                }}
                                            />
                                        </div>
                                    </div>

                                    {/* Chat History */}
                                    <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4 z-10">
                                        {loadingMessages ? (
                                            <div className="flex-1 flex items-center justify-center">
                                                <Spin indicator={<LoadingOutlined className="text-[#25D366] text-3xl" />} tip="Loading messages..." />
                                            </div>
                                        ) : chatHistory.length === 0 ? (
                                            <div className="flex-1 flex items-center justify-center">
                                                <Text className="text-[#8696a0] bg-white/70 backdrop-blur-sm px-4 py-2 rounded-lg shadow-sm">No messages yet. Send the first message!</Text>
                                            </div>
                                        ) : (
                                            chatHistory.map((msg) => (
                                                <div key={msg.id} className={`flex flex-col max-w-[75%] ${msg.direction === 'outgoing' ? 'self-end items-end' : 'self-start items-start'}`}>
                                                    <div 
                                                        className={`px-4 py-2 rounded-lg shadow-sm text-[15px] leading-relaxed ${
                                                            msg.direction === 'outgoing' 
                                                                ? 'bg-[#1677ff] text-white rounded-tr-none' 
                                                                : 'bg-white text-[#111b21] rounded-tl-none'
                                                        }`}
                                                    >
                                                        {msg.body}
                                                    </div>
                                                    <Text className="text-[11px] font-medium text-[#54656f] mt-1 px-1.5 py-0.5 bg-white/60 backdrop-blur-sm rounded">
                                                        {formatTime(msg.created_at)}
                                                    </Text>
                                                </div>
                                            ))
                                        )}
                                        <div ref={chatEndRef} />
                                    </div>

                                    {/* Message Input Area */}
                                    <div className="p-4 bg-[#f0f2f5] z-10 flex-shrink-0 flex items-center gap-3 shadow-[0_-2px_10px_rgba(0,0,0,0.02)]">
                                        <Button type="text" icon={<PaperClipOutlined className="text-2xl text-[#8696a0] hover:text-[#54656f] transition-colors" />} className="flex-shrink-0 w-12 h-12 flex items-center justify-center" />
                                        <Input 
                                            value={inputText}
                                            onChange={(e) => setInputText(e.target.value)}
                                            onPressEnter={handleSendMessage}
                                            placeholder="Type a message to take over..." 
                                            className="h-12 rounded-xl border-none shadow-sm text-[15px] px-4"
                                            disabled={sendingMessage}
                                        />
                                        <Button 
                                            type="primary" 
                                            shape="circle" 
                                            icon={sendingMessage ? <LoadingOutlined /> : <SendOutlined className="ml-1" />} 
                                            size="large" 
                                            onClick={handleSendMessage}
                                            disabled={sendingMessage || !inputText.trim()}
                                            className={`flex-shrink-0 w-12 h-12 flex items-center justify-center transition-colors ${inputText.trim() && !sendingMessage ? 'bg-[#1677ff] hover:bg-[#0f5fcb]' : 'bg-[#d1d7db]'} border-none`}
                                        />
                                    </div>
                                </>
                            )}
                        </div>
                    </Content>
                </Layout>
            </Layout>
        </ConfigProvider>
    );
}
