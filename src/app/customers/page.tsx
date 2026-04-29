'use client'

import { useState } from 'react';
import { Layout, Menu, Typography, ConfigProvider, Input, Button, Table, Avatar, Tag, Card } from 'antd';
import { SettingOutlined, AppstoreOutlined, LogoutOutlined, RobotOutlined, MessageOutlined, SearchOutlined, DownloadOutlined, TeamOutlined } from '@ant-design/icons';
import { createClient } from '../../lib/supabase';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

const { Header, Content, Sider } = Layout;
const { Title, Text } = Typography;

// Mock Data
const MOCK_CUSTOMERS = [
    { id: '1', name: 'Alice Smith', phone: '+1 (555) 019-2834', tags: ['VIP', 'Active'], lastActive: 'Oct 24, 2026 - 10:42 AM', avatarBg: '#128C7E' },
    { id: '2', name: 'John Doe', phone: '+1 (555) 982-1102', tags: ['New Lead'], lastActive: 'Oct 23, 2026 - 04:15 PM', avatarBg: '#34B7F1' },
    { id: '3', name: 'Acme Corp', phone: '+44 20 7946 0958', tags: ['Enterprise', 'Needs Follow-up'], lastActive: 'Oct 20, 2026 - 09:00 AM', avatarBg: '#f59e0b' },
    { id: '4', name: 'Sarah Connor', phone: '+1 (555) 443-9999', tags: ['Active'], lastActive: 'Oct 19, 2026 - 02:30 PM', avatarBg: '#10b981' },
    { id: '5', name: 'Michael Scott', phone: '+1 (555) 123-4567', tags: ['Churned'], lastActive: 'Sep 15, 2026 - 11:20 AM', avatarBg: '#ef4444' },
];

export default function CustomersPage() {
    const supabase = createClient();
    const router = useRouter();
    const pathname = usePathname();
    const [searchText, setSearchText] = useState('');

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

    const columns = [
        {
            title: 'Name / Phone Number',
            key: 'name',
            render: (_: any, record: any) => (
                <div className="flex items-center gap-4 py-2">
                    <Avatar size={42} style={{ backgroundColor: record.avatarBg }} className="flex-shrink-0 text-[16px] font-medium shadow-sm">
                        {record.name.charAt(0)}
                    </Avatar>
                    <div className="flex flex-col">
                        <Text className="font-medium text-[#111b21]">{record.name}</Text>
                        <Text className="text-[13px] text-[#54656f] mt-0.5">{record.phone}</Text>
                    </div>
                </div>
            )
        },
        {
            title: 'Tags / Labels',
            key: 'tags',
            dataIndex: 'tags',
            render: (tags: string[]) => (
                <div className="flex gap-2 flex-wrap">
                    {tags.map(tag => {
                        let color = 'default';
                        if (tag === 'VIP') color = 'gold';
                        if (tag === 'New Lead') color = 'blue';
                        if (tag === 'Active') color = 'green';
                        if (tag === 'Enterprise') color = 'purple';
                        if (tag === 'Needs Follow-up') color = 'warning';
                        if (tag === 'Churned') color = 'error';
                        return <Tag color={color} key={tag} className="rounded-md border-none px-2.5 py-0.5">{tag}</Tag>;
                    })}
                </div>
            )
        },
        {
            title: 'Last Active',
            dataIndex: 'lastActive',
            key: 'lastActive',
            render: (text: string) => <Text className="text-[#54656f] whitespace-nowrap">{text}</Text>
        },
        {
            title: 'Action',
            key: 'action',
            render: (_: any, record: any) => (
                <Button 
                    type="default" 
                    icon={<MessageOutlined />} 
                    className="text-[#128C7E] border-[#128C7E]/30 hover:border-[#128C7E] hover:text-[#128C7E] bg-[#e9fbee] hover:bg-[#dcf8c6] shadow-none transition-colors rounded-lg font-medium"
                    onClick={() => router.push('/inbox')}
                >
                    View Chat
                </Button>
            )
        }
    ];

    const filteredData = MOCK_CUSTOMERS.filter(c => 
        c.name.toLowerCase().includes(searchText.toLowerCase()) || 
        c.phone.includes(searchText) ||
        c.tags.some(t => t.toLowerCase().includes(searchText.toLowerCase()))
    );

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
                    },
                    Table: {
                        headerBg: '#ffffff',
                        headerColor: '#54656f',
                        rowHoverBg: '#f8f9fa',
                        paddingContentVertical: 16,
                    }
                }
            }}
        >
            <Layout style={{ minHeight: '100vh' }} hasSider>
                {/* Sidebar */}
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

                {/* Main Layout */}
                <Layout style={{ minWidth: 0 }}>
                    <Header 
                        className="flex justify-between items-center border-b border-[#d1d7db]/50" 
                        style={{ height: '72px', padding: '0 24px', background: '#f0f2f5', lineHeight: 'normal' }}
                    >
                        <div>
                            <Title level={4} className="!m-0 !text-[#111b21] hidden sm:block">Customers</Title>
                            <Text className="text-[#54656f] text-sm hidden sm:block">Manage and view your CRM contacts.</Text>
                        </div>
                    </Header>

                    <Content className="p-4 sm:p-8 max-w-7xl w-full mx-auto" style={{ overflowX: 'auto' }}>
                        
                        <Card className="shadow-sm border border-[#d1d7db]/40 rounded-2xl overflow-hidden" styles={{ body: { padding: 0 } }}>
                            {/* Table Toolbar */}
                            <div className="p-5 border-b border-[#d1d7db]/40 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white">
                                <Input 
                                    prefix={<SearchOutlined className="text-[#8696a0]" />} 
                                    placeholder="Search by name, phone, or tags..." 
                                    className="max-w-md h-[40px] bg-[#f0f2f5] border-none focus:bg-white focus:ring-2 focus:ring-[#25D366]/20 transition-all rounded-lg"
                                    value={searchText}
                                    onChange={e => setSearchText(e.target.value)}
                                    allowClear
                                />
                                <Button 
                                    icon={<DownloadOutlined />} 
                                    className="h-[40px] font-medium text-[#54656f] border-[#d1d7db] hover:border-[#111b21] hover:text-[#111b21] shadow-sm rounded-lg flex items-center"
                                >
                                    Export to CSV
                                </Button>
                            </div>

                            {/* Data Table */}
                            <Table
                                columns={columns}
                                dataSource={filteredData}
                                rowKey="id"
                                pagination={{ pageSize: 10, className: 'px-6 py-4 !m-0 border-t border-[#d1d7db]/30 bg-white' }}
                                locale={{ emptyText: 'No customers found.' }}
                                className="w-full whitespace-nowrap"
                            />
                        </Card>
                    </Content>
                </Layout>
            </Layout>
        </ConfigProvider>
    );
}
