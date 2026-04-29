'use client'

import { useEffect, useState } from 'react';
import { Layout, Menu, Typography, ConfigProvider, Input, Avatar, Badge, Switch, Button } from 'antd';
import { SettingOutlined, AppstoreOutlined, LogoutOutlined, RobotOutlined, SearchOutlined, PaperClipOutlined, SendOutlined, MessageOutlined, TeamOutlined } from '@ant-design/icons';
import { createClient } from '../../lib/supabase';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

const { Header, Content, Sider } = Layout;
const { Title, Text } = Typography;

// Mock Data for the prototype
const MOCK_CHATS = [
    { id: 1, name: 'Alice Smith', snippet: 'Can you help me with pricing?', time: '10:42 AM', unread: true, botActive: true },
    { id: 2, name: 'John Doe', snippet: 'Thanks! That solved my issue.', time: 'Yesterday', unread: false, botActive: true },
    { id: 3, name: 'Acme Corp', snippet: 'We need to upgrade our plan.', time: 'Tuesday', unread: true, botActive: false },
    { id: 4, name: 'Sarah Connor', snippet: 'Where is my order?', time: 'Monday', unread: false, botActive: true },
];

const MOCK_MESSAGES = [
    { id: 1, text: 'Hello, I need some information about your enterprise plans.', sender: 'them', time: '10:40 AM' },
    { id: 2, text: 'Hi Alice! I am the automated assistant. You can find our pricing at example.com/pricing.', sender: 'us', time: '10:41 AM' },
    { id: 3, text: 'Can you help me with pricing specifically for 50 users?', sender: 'them', time: '10:42 AM' },
];

export default function InboxPage() {
    const supabase = createClient();
    const router = useRouter();
    const pathname = usePathname();
    
    const [selectedChat, setSelectedChat] = useState(MOCK_CHATS[0]);
    const [messages, setMessages] = useState(MOCK_MESSAGES);
    const [inputText, setInputText] = useState('');

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/login');
    };

    const handleSendMessage = () => {
        if (!inputText.trim()) return;
        setMessages([...messages, { id: Date.now(), text: inputText, sender: 'us', time: 'Now' }]);
        setInputText('');
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
                                />
                            </div>
                            
                            {/* Chat List */}
                            <div className="flex-1 overflow-y-auto">
                                {MOCK_CHATS.map((chat) => (
                                    <div 
                                        key={chat.id} 
                                        onClick={() => setSelectedChat(chat)}
                                        className={`flex items-start gap-3 p-4 cursor-pointer border-b border-[#f0f2f5] transition-colors ${selectedChat.id === chat.id ? 'bg-[#f0f2f5]' : 'hover:bg-[#f8f9fa]'}`}
                                    >
                                        <Badge dot={chat.unread} color="#1677ff" offset={[-4, 4]}>
                                            <Avatar size={48} className="bg-[#128C7E] flex-shrink-0 text-lg">
                                                {chat.name.charAt(0)}
                                            </Avatar>
                                        </Badge>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-baseline mb-1">
                                                <Text className="font-semibold text-[#111b21] truncate">{chat.name}</Text>
                                                <Text className="text-xs text-[#8696a0] flex-shrink-0 ml-2">{chat.time}</Text>
                                            </div>
                                            <Text className="text-[#54656f] text-sm truncate block w-full">{chat.snippet}</Text>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Active Chat Area (70%) */}
                        <div className="flex-1 h-full flex flex-col bg-[#efeae2] relative" style={{ backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")', backgroundSize: 'contain', backgroundRepeat: 'repeat' }}>
                            
                            {/* Chat Header */}
                            <div className="h-[72px] px-6 flex items-center justify-between bg-[#f0f2f5] border-b border-[#d1d7db]/50 z-10 flex-shrink-0 shadow-sm">
                                <div className="flex items-center gap-4">
                                    <Avatar size={42} className="bg-[#128C7E]">
                                        {selectedChat.name.charAt(0)}
                                    </Avatar>
                                    <div>
                                        <Title level={5} className="!m-0 !text-[#111b21]">{selectedChat.name}</Title>
                                        <Text className="text-xs text-[#54656f]">{selectedChat.botActive ? 'Bot handling conversation' : 'Manual mode active'}</Text>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Text className="text-sm font-medium text-[#54656f]">Bot Status</Text>
                                    <Switch 
                                        checked={selectedChat.botActive} 
                                        className="bg-[#d1d7db] [&.ant-switch-checked]:bg-[#25D366]"
                                        onChange={(checked) => setSelectedChat({...selectedChat, botActive: checked})}
                                    />
                                </div>
                            </div>

                            {/* Chat History */}
                            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4 z-10">
                                {messages.map((msg) => (
                                    <div key={msg.id} className={`flex flex-col max-w-[75%] ${msg.sender === 'us' ? 'self-end items-end' : 'self-start items-start'}`}>
                                        <div 
                                            className={`px-4 py-2 rounded-lg shadow-sm text-[15px] leading-relaxed ${
                                                msg.sender === 'us' 
                                                    ? 'bg-[#1677ff] text-white rounded-tr-none' 
                                                    : 'bg-white text-[#111b21] rounded-tl-none'
                                            }`}
                                        >
                                            {msg.text}
                                        </div>
                                        <Text className="text-[11px] font-medium text-[#54656f] mt-1 px-1.5 py-0.5 bg-white/60 backdrop-blur-sm rounded">{msg.time}</Text>
                                    </div>
                                ))}
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
                                />
                                <Button 
                                    type="primary" 
                                    shape="circle" 
                                    icon={<SendOutlined className="ml-1" />} 
                                    size="large" 
                                    onClick={handleSendMessage}
                                    className={`flex-shrink-0 w-12 h-12 flex items-center justify-center transition-colors ${inputText.trim() ? 'bg-[#1677ff] hover:bg-[#0f5fcb]' : 'bg-[#d1d7db]'} border-none`}
                                />
                            </div>
                        </div>
                    </Content>
                </Layout>
            </Layout>
        </ConfigProvider>
    );
}
