'use client'

import { useEffect, useState, useCallback, useMemo } from 'react';
import { Layout, Menu, Typography, ConfigProvider, Input, Button, Table, Avatar, Tag, Card, Spin, Statistic, Row, Col, message } from 'antd';
import { SettingOutlined, AppstoreOutlined, LogoutOutlined, RobotOutlined, MessageOutlined, SearchOutlined, DownloadOutlined, TeamOutlined, UserOutlined, ClockCircleOutlined, ReadOutlined } from '@ant-design/icons';
import { createClient } from '../../lib/supabase';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

const { Header, Content, Sider } = Layout;
const { Title, Text } = Typography;

// Deterministic avatar color from a string
const AVATAR_COLORS = ['#128C7E', '#34B7F1', '#f59e0b', '#10b981', '#6366f1', '#ec4899', '#8b5cf6', '#14b8a6'];
const getAvatarColor = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
};

interface Contact {
    id: string;
    phone_number: string;
    name: string | null;
    user_id: string;
    created_at: string;
    last_message_at: string | null;
    bot_active: boolean;
}

export default function CustomersPage() {
    const supabase = useMemo(() => createClient(), []);
    const router = useRouter();
    const pathname = usePathname();
    const [messageApi, contextHolder] = message.useMessage();

    const [contacts, setContacts] = useState<Contact[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchText, setSearchText] = useState('');

    const fetchContacts = useCallback(async () => {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            setLoading(false);
            return;
        }

        const { data, error } = await supabase
            .from('contacts')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching contacts:', error);
            messageApi.error('Failed to load contacts: ' + error.message);
        } else {
            setContacts(data || []);
        }
        setLoading(false);
    }, [supabase, messageApi]);

    useEffect(() => {
        fetchContacts();
    }, [fetchContacts]);

    // Format timestamp into readable date
    const formatDate = (timestamp: string | null) => {
        if (!timestamp) return '—';
        const date = new Date(timestamp);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        }) + ' - ' + date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
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

    const columns = [
        {
            title: 'Name / Phone Number',
            key: 'name',
            render: (_: any, record: Contact) => {
                const displayName = record.name || record.phone_number;
                return (
                    <div className="flex items-center gap-4 py-2">
                        <Avatar size={42} style={{ backgroundColor: getAvatarColor(displayName) }} className="flex-shrink-0 text-[16px] font-medium shadow-sm">
                            {displayName.charAt(0).toUpperCase()}
                        </Avatar>
                        <div className="flex flex-col">
                            <Text className="font-medium text-[#111b21]">{record.name || 'Unknown'}</Text>
                            <Text className="text-[13px] text-[#54656f] mt-0.5">{record.phone_number}</Text>
                        </div>
                    </div>
                );
            }
        },
        {
            title: 'Status',
            key: 'status',
            width: 160,
            render: (_: any, record: Contact) => {
                const hasRecentActivity = record.last_message_at &&
                    (Date.now() - new Date(record.last_message_at).getTime()) < 7 * 24 * 60 * 60 * 1000; // 7 days

                return (
                    <div className="flex gap-2 flex-wrap">
                        {hasRecentActivity ? (
                            <Tag color="green" className="rounded-md border-none px-2.5 py-0.5">Active</Tag>
                        ) : (
                            <Tag color="default" className="rounded-md border-none px-2.5 py-0.5">Inactive</Tag>
                        )}
                        {record.bot_active ? (
                            <Tag color="blue" className="rounded-md border-none px-2.5 py-0.5">Bot ON</Tag>
                        ) : (
                            <Tag color="warning" className="rounded-md border-none px-2.5 py-0.5">Bot OFF</Tag>
                        )}
                    </div>
                );
            }
        },
        {
            title: 'First Seen',
            key: 'created_at',
            width: 200,
            render: (_: any, record: Contact) => (
                <Text className="text-[#54656f] whitespace-nowrap">{formatDate(record.created_at)}</Text>
            )
        },
        {
            title: 'Last Active',
            key: 'last_message_at',
            width: 200,
            render: (_: any, record: Contact) => (
                <Text className="text-[#54656f] whitespace-nowrap">{formatDate(record.last_message_at)}</Text>
            )
        },
        {
            title: 'Action',
            key: 'action',
            width: 140,
            render: (_: any, record: Contact) => (
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

    // Local search filter — matches against name or phone number
    const filteredData = contacts.filter(c =>
        (c.name || '').toLowerCase().includes(searchText.toLowerCase()) ||
        c.phone_number.includes(searchText)
    );

    // Stats
    const activeCount = contacts.filter(c => {
        return c.last_message_at &&
            (Date.now() - new Date(c.last_message_at).getTime()) < 7 * 24 * 60 * 60 * 1000;
    }).length;

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
                {contextHolder}
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

                        {/* Stats Row */}
                        <Row gutter={[24, 24]} className="mb-8">
                            <Col xs={24} sm={8}>
                                <Card className="shadow-sm border border-[#d1d7db]/40 rounded-xl hover:shadow-md transition-shadow">
                                    <Statistic
                                        title={<span className="text-[#54656f] font-medium">Total Contacts</span>}
                                        value={contacts.length}
                                        prefix={<TeamOutlined className="text-[#25D366] mr-2" />}
                                        styles={{ content: { color: '#111b21', fontWeight: 600 } }}
                                    />
                                </Card>
                            </Col>
                            <Col xs={24} sm={8}>
                                <Card className="shadow-sm border border-[#d1d7db]/40 rounded-xl hover:shadow-md transition-shadow">
                                    <Statistic
                                        title={<span className="text-[#54656f] font-medium">Active (Last 7 Days)</span>}
                                        value={activeCount}
                                        prefix={<UserOutlined className="text-[#00a884] mr-2" />}
                                        styles={{ content: { color: '#111b21', fontWeight: 600 } }}
                                    />
                                </Card>
                            </Col>
                            <Col xs={24} sm={8}>
                                <Card className="shadow-sm border border-[#d1d7db]/40 rounded-xl hover:shadow-md transition-shadow">
                                    <Statistic
                                        title={<span className="text-[#54656f] font-medium">Bot Enabled</span>}
                                        value={contacts.filter(c => c.bot_active).length}
                                        prefix={<RobotOutlined className="text-[#34B7F1] mr-2" />}
                                        styles={{ content: { color: '#111b21', fontWeight: 600 } }}
                                    />
                                </Card>
                            </Col>
                        </Row>
                        
                        <Card className="shadow-sm border border-[#d1d7db]/40 rounded-2xl overflow-hidden" styles={{ body: { padding: 0 } }}>
                            {/* Table Toolbar */}
                            <div className="p-5 border-b border-[#d1d7db]/40 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white">
                                <Input 
                                    prefix={<SearchOutlined className="text-[#8696a0]" />} 
                                    placeholder="Search by name or phone number..." 
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
                                loading={loading}
                                pagination={{ pageSize: 10, className: 'px-6 py-4 !m-0 border-t border-[#d1d7db]/30 bg-white' }}
                                locale={{ emptyText: searchText ? 'No contacts match your search.' : 'No contacts found. They appear automatically when someone messages you.' }}
                                className="w-full whitespace-nowrap"
                            />
                        </Card>
                    </Content>
                </Layout>
            </Layout>
        </ConfigProvider>
    );
}
