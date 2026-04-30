'use client'

import { useState, useEffect } from 'react';
import { Layout, Menu, Typography, ConfigProvider, Card, Tabs, Upload, Button, Table, Tag, Input, Avatar, Badge, message } from 'antd';
import { 
    AppstoreOutlined, 
    SettingOutlined, 
    LogoutOutlined, 
    RobotOutlined, 
    MessageOutlined, 
    TeamOutlined, 
    ReadOutlined,
    CloudUploadOutlined,
    DeleteOutlined,
    FilePdfOutlined,
    GlobalOutlined,
    SyncOutlined,
    CheckCircleOutlined,
    SendOutlined
} from '@ant-design/icons';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '../../lib/supabase';

const { Content, Sider } = Layout;
const { Title, Text } = Typography;
const { Dragger } = Upload;

export default function KnowledgeBasePage() {
    const router = useRouter();
    const pathname = usePathname();
    const [testInput, setTestInput] = useState('');
    const [documents, setDocuments] = useState<any[]>([]);
    const [uploading, setUploading] = useState(false);
    const [messageApi, contextHolder] = message.useMessage();
    const supabase = createClient();

    useEffect(() => {
        fetchDocuments();
    }, []);

    const fetchDocuments = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const { data } = await supabase.from('documents').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
            if (data) setDocuments(data);
        }
    };

    const handleLogout = async () => {
        router.push('/login');
    };

    const menuItems = [
        { key: '/dashboard', icon: <AppstoreOutlined />, label: <Link href="/dashboard">Dashboard</Link> },
        { key: '/inbox', icon: <MessageOutlined />, label: <Link href="/inbox">Team Inbox</Link> },
        { key: '/customers', icon: <TeamOutlined />, label: <Link href="/customers">Customers</Link> },
        { key: '/knowledge', icon: <ReadOutlined />, label: <Link href="/knowledge">Knowledge Base</Link> },
        { key: '/settings', icon: <SettingOutlined />, label: <Link href="/settings">Settings</Link> },
        { type: 'divider' as const },
        { key: 'logout', icon: <LogoutOutlined />, label: 'Logout', onClick: handleLogout }
    ];

    const activeKnowledgeData = [
        { key: '1', sourceName: 'menu_items_2023.pdf', type: 'PDF', status: 'Active' },
        { key: '2', sourceName: 'store_policies.pdf', type: 'PDF', status: 'Active' },
        { key: '3', sourceName: 'www.mybakery.com/faq', type: 'Website', status: 'Processing' },
    ];

    const columns = [
        {
            title: 'Source Name',
            dataIndex: 'name',
            key: 'name',
            render: (text: string, record: any) => (
                <div className="flex items-center gap-3 font-medium text-[#111b21] text-[15px]">
                    {record.type === 'PDF' ? <FilePdfOutlined className="text-[#ff4d4f] text-xl" /> : <GlobalOutlined className="text-[#1677ff] text-xl" />}
                    {text}
                </div>
            )
        },
        {
            title: 'Type',
            dataIndex: 'type',
            key: 'type',
            render: (type: string) => <Tag className="rounded-md border-none font-medium px-3 py-1 text-sm" color={type === 'PDF' ? 'volcano-inverse' : 'geekblue-inverse'}>{type}</Tag>
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => (
                status === 'Active' ? (
                    <Tag icon={<CheckCircleOutlined />} color="success" className="rounded-full px-4 py-1.5 text-sm border-none bg-[#f6ffed] text-[#389e0d] font-medium">Active</Tag>
                ) : (
                    <Tag icon={<SyncOutlined spin />} color="processing" className="rounded-full px-4 py-1.5 text-sm border-none bg-[#e6f4ff] text-[#1677ff] font-medium">Processing</Tag>
                )
            )
        },
        {
            title: 'Action',
            key: 'action',
            render: () => (
                <Button type="text" danger icon={<DeleteOutlined className="text-lg" />} className="text-[#ff4d4f] hover:bg-[#fff2f0] rounded-lg h-10 w-10 flex items-center justify-center" />
            )
        }
    ];

    const tabItems = [
        {
            key: '1',
            label: (
                <span className="flex items-center gap-2 font-semibold text-base px-2 py-1">
                    <FilePdfOutlined /> Upload PDF
                </span>
            ),
            children: (
                <div className="py-2">
                    <Dragger 
                        name="file" 
                        multiple={false}
                        accept=".pdf"
                        showUploadList={false}
                        disabled={uploading}
                        customRequest={async (options: any) => {
                            const { file, onSuccess, onError } = options;
                            setUploading(true);
                            messageApi.loading({ content: 'Uploading and processing PDF...', key: 'upload' });
                    
                            try {
                                const { data: { user } } = await supabase.auth.getUser();
                                if (!user) throw new Error("User not authenticated");
                    
                                const formData = new FormData();
                                formData.append('file', file as File);
                                formData.append('userId', user.id);
                    
                                const response = await fetch('/api/upload-pdf', {
                                    method: 'POST',
                                    body: formData,
                                });
                    
                                const result = await response.json();
                    
                                if (!response.ok) {
                                    throw new Error(result.error || 'Upload failed');
                                }
                    
                                messageApi.success({ content: 'Document processed successfully!', key: 'upload' });
                                onSuccess(result, file);
                                fetchDocuments();
                            } catch (err: any) {
                                messageApi.error({ content: err.message || 'Upload failed', key: 'upload' });
                                onError(err);
                            } finally {
                                setUploading(false);
                            }
                        }}
                        className="bg-[#fafafa] border-2 border-dashed border-[#d9d9d9] hover:border-[#25D366] hover:bg-[#f6ffed] transition-all duration-300 rounded-3xl overflow-hidden group"
                    >
                        <div className="py-14 px-6 flex flex-col items-center justify-center">
                            <div className="w-24 h-24 bg-[#e9fbee] rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-sm border border-[#25D366]/20">
                                <CloudUploadOutlined className="text-5xl text-[#25D366]" />
                            </div>
                            <Title level={3} className="!m-0 !mb-3 !text-[#111b21] font-bold">Drag & drop your PDF here</Title>
                            <Text className="text-[#54656f] text-[17px] mb-8 text-center max-w-lg leading-relaxed">
                                Upload your menus, pricing lists, or policy documents. We'll instantly read them and teach your AI how to answer questions.
                            </Text>
                            <Button type="primary" size="large" className="bg-[#25D366] hover:bg-[#1ebe5a] border-none font-bold px-10 h-14 rounded-xl shadow-md hover:shadow-lg transition-all text-[17px]">
                                Browse Files
                            </Button>
                        </div>
                    </Dragger>
                </div>
            )
        },
        {
            key: '2',
            label: (
                <span className="flex items-center gap-2 font-semibold text-base px-2 py-1">
                    <GlobalOutlined /> Add Website
                </span>
            ),
            children: (
                <div className="py-6 flex flex-col gap-6">
                    <div className="bg-[#fafafa] p-8 rounded-3xl border border-[#d1d7db]/40">
                        <Title level={4} className="!m-0 !mb-3 text-[#111b21] font-bold">Enter Website URL</Title>
                        <Text className="text-[#54656f] block mb-6 text-[17px] leading-relaxed">
                            Paste the link to your website, FAQ page, or online menu. Our system will extract the text to train your AI in seconds.
                        </Text>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Input size="large" placeholder="https://www.yourbusiness.com" className="h-14 border-[#d1d7db] rounded-xl text-lg px-5 focus:ring-2 focus:ring-[#25D366]/20 shadow-sm" />
                            <Button type="primary" size="large" className="bg-[#25D366] hover:bg-[#1ebe5a] border-none font-bold px-10 h-14 rounded-xl shadow-md hover:shadow-lg transition-all sm:w-auto w-full flex-shrink-0 text-[17px]">
                                Scrape & Learn
                            </Button>
                        </div>
                    </div>
                </div>
            )
        }
    ];

    return (
        <ConfigProvider
            theme={{
                token: {
                    colorPrimary: '#25D366',
                    borderRadius: 12,
                    fontFamily: 'var(--font-inter), sans-serif',
                    colorText: '#111b21',
                },
                components: {
                    Layout: { siderBg: '#ffffff', bodyBg: '#f0f2f5' },
                    Menu: { itemSelectedBg: '#e9fbee', itemSelectedColor: '#128C7E', itemColor: '#54656f', itemHoverColor: '#128C7E' },
                    Tabs: { itemSelectedColor: '#128C7E', itemHoverColor: '#25D366', inkBarColor: '#25D366' },
                    Table: { headerBg: '#f8f9fa', headerColor: '#54656f', rowHoverBg: '#f6ffed' }
                }
            }}
        >
            <Layout style={{ height: '100vh', overflow: 'hidden' }} hasSider>
                {contextHolder}
                <Sider width={260} theme="light" breakpoint="lg" collapsedWidth="0" className="border-r border-[#d1d7db] shadow-sm z-50 flex-shrink-0">
                    <div className="p-6 flex items-center gap-3 border-b border-[#d1d7db]">
                        <div className="w-8 h-8 bg-[#25D366] rounded-lg flex items-center justify-center shadow-md">
                            <RobotOutlined className="text-white text-lg" />
                        </div>
                        <Title level={4} className="!m-0 !text-[#111b21] tracking-tight font-bold">SME Automator</Title>
                    </div>
                    <Menu mode="inline" selectedKeys={['/knowledge']} items={menuItems} className="mt-4 border-none px-3 font-medium text-[15px]" />
                </Sider>

                <Layout style={{ minWidth: 0, height: '100vh' }}>
                    <Content className="flex w-full h-full p-0 flex-col md:flex-row">
                        
                        {/* Main Content Area (70%) */}
                        <div className="w-full md:w-[70%] h-full overflow-y-auto bg-[#f0f2f5]">
                            <div className="p-6 lg:p-10 max-w-5xl mx-auto flex flex-col gap-8">
                                <div className="mb-2">
                                    <Title level={2} className="!m-0 !text-[#111b21] tracking-tight font-extrabold">Train Your AI Assistant</Title>
                                    <Text className="text-[#54656f] text-lg mt-3 block max-w-3xl leading-relaxed">
                                        Upload your business documents or link your website. The AI will read everything and learn how to answer your customer questions accurately, just like your best employee.
                                    </Text>
                                </div>

                                <Card className="shadow-sm border border-[#d1d7db]/40 rounded-[2rem]" styles={{ body: { padding: '32px' } }}>
                                    <div className="mb-6">
                                        <Title level={4} className="!m-0 !text-[#111b21] font-bold flex items-center gap-3">
                                            <CloudUploadOutlined className="text-[#25D366] text-3xl" /> Data Sources
                                        </Title>
                                    </div>
                                    <Tabs defaultActiveKey="1" items={tabItems} size="large" className="font-sans" />
                                </Card>

                                <Card className="shadow-sm border border-[#d1d7db]/40 rounded-[2rem] overflow-hidden" styles={{ body: { padding: 0 } }}>
                                    <div className="p-8 border-b border-[#d1d7db]/40 bg-white flex justify-between items-center">
                                        <div>
                                            <Title level={4} className="!m-0 !text-[#111b21] font-bold">Active Knowledge</Title>
                                            <Text className="text-[#54656f] text-base mt-1 block">Manage the files and links your AI is currently using to generate answers.</Text>
                                        </div>
                                        <Badge count={3} color="#25D366" className="shadow-sm transform scale-125 mr-2" />
                                    </div>
                                    <Table 
                                        columns={columns} 
                                        dataSource={documents} 
                                        rowKey="id"
                                        pagination={{ pageSize: 5 }}
                                        className="w-full text-base font-medium"
                                        locale={{ emptyText: 'No documents uploaded yet.' }}
                                    />
                                </Card>
                            </div>
                        </div>

                        {/* Test Your AI Sidebar (30%) */}
                        <div className="w-full md:w-[30%] h-full bg-[#efeae2] border-l border-[#d1d7db]/50 flex flex-col flex-shrink-0 relative shadow-inner" style={{ backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")', backgroundSize: 'contain', backgroundRepeat: 'repeat' }}>
                            {/* Header */}
                            <div className="h-[72px] px-6 flex items-center gap-4 bg-[#075e54] shadow-md z-10 flex-shrink-0 text-white">
                                <Avatar size={44} className="bg-white/20 border border-white/40 flex items-center justify-center">
                                    <RobotOutlined className="text-white text-2xl" />
                                </Avatar>
                                <div className="flex-1">
                                    <Title level={5} className="!m-0 !text-white font-bold text-lg tracking-wide">Test Your AI</Title>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <div className="w-2 h-2 rounded-full bg-[#25D366] shadow-[0_0_5px_#25D366]"></div>
                                        <Text className="text-white/90 text-[13px] font-medium">Online & Ready</Text>
                                    </div>
                                </div>
                            </div>

                            {/* Chat Area */}
                            <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4 z-10">
                                <div className="flex justify-center mb-3">
                                    <Text className="bg-[#e1f3fb] text-[#54656f] text-xs px-4 py-1.5 rounded-xl shadow-sm font-semibold tracking-wide uppercase">Today</Text>
                                </div>

                                {/* Bot message */}
                                <div className="self-start max-w-[85%]">
                                    <div className="bg-white text-[#111b21] px-4 py-3 rounded-2xl shadow-sm text-[16px] leading-relaxed rounded-tl-sm border border-[#d1d7db]/20">
                                        Hi! I'm your AI assistant. I've successfully processed your menu and policies. Try asking me a question! 😊
                                    </div>
                                    <Text className="text-[11px] font-medium text-[#8696a0] mt-1 ml-1 block">
                                        10:42 AM
                                    </Text>
                                </div>
                                
                                {/* User message */}
                                <div className="self-end max-w-[85%] flex flex-col items-end mt-2">
                                    <div className="bg-[#d9fdd3] text-[#111b21] px-4 py-3 rounded-2xl shadow-sm text-[16px] leading-relaxed rounded-tr-sm border border-[#d1d7db]/20">
                                        Do you have any vegan options available?
                                    </div>
                                    <div className="flex items-center gap-1 mt-1 mr-1">
                                        <Text className="text-[11px] font-medium text-[#8696a0]">
                                            10:43 AM
                                        </Text>
                                        <CheckCircleOutlined className="text-[#53bdeb] text-[12px]" />
                                    </div>
                                </div>

                                {/* Bot response */}
                                <div className="self-start max-w-[85%] mt-2">
                                    <div className="bg-white text-[#111b21] px-4 py-3 rounded-2xl shadow-sm text-[16px] leading-relaxed rounded-tl-sm border border-[#d1d7db]/20">
                                        Yes, absolutely! Based on your <strong>menu_items_2023.pdf</strong>, we offer several delicious vegan options including the Avocado Toast, Vegan Blueberry Muffins, and our Plant-Based Wrap. 🌱
                                    </div>
                                    <Text className="text-[11px] font-medium text-[#8696a0] mt-1 ml-1 block">
                                        10:43 AM
                                    </Text>
                                </div>
                            </div>

                            {/* Input Area */}
                            <div className="p-4 bg-[#f0f2f5] z-10 flex-shrink-0 flex items-center gap-3 border-t border-[#d1d7db]/30 shadow-[0_-2px_10px_rgba(0,0,0,0.03)]">
                                <div className="flex-1 bg-white rounded-full flex items-center px-5 py-1.5 shadow-sm border border-[#d1d7db]/40">
                                    <Input 
                                        value={testInput}
                                        onChange={(e) => setTestInput(e.target.value)}
                                        placeholder="Type a message..." 
                                        className="h-10 border-none shadow-none text-[16px] px-2 focus:ring-0"
                                    />
                                </div>
                                <Button 
                                    type="primary" 
                                    shape="circle" 
                                    icon={<SendOutlined className="ml-1" />} 
                                    size="large" 
                                    className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-[#00a884] hover:bg-[#008f6f] border-none shadow-md hover:shadow-lg transition-all"
                                />
                            </div>
                        </div>

                    </Content>
                </Layout>
            </Layout>
        </ConfigProvider>
    );
}
