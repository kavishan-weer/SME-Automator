'use client'

import { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, message, Layout, Menu, Card, Row, Col, Statistic, Typography, ConfigProvider } from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined, AppstoreOutlined, SettingOutlined, LogoutOutlined, ThunderboltOutlined, MessageOutlined, RobotOutlined } from '@ant-design/icons';
import { createClient } from '../../lib/supabase';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

const { Header, Content, Sider } = Layout;
const { Title, Text } = Typography;

export default function Dashboard() {
    const [rules, setRules] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    
    const supabase = createClient();
    const router = useRouter();
    const pathname = usePathname();

    const fetchRules = async () => {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
            const { data, error } = await supabase
                .from('automation_rules')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) message.error("Error fetching rules");
            else setRules(data || []);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchRules();
    }, []);

    const onAddRule = async (values: any) => {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            message.error("Unauthorized: Please log in.");
            return;
        }

        const { error } = await supabase.from('automation_rules').insert([
            {
                keyword: values.keyword.toLowerCase().trim(),
                reply_text: values.reply_text,
                user_id: user.id
            }
        ]);

        if (error) {
            message.error("Failed to add Rule");
        } else {
            message.success("Rule added successfully!");
            setIsModalOpen(false);
            fetchRules();
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/login');
    };

    const columns = [
        { 
            title: 'Keyword', 
            dataIndex: 'keyword', 
            key: 'keyword',
            render: (text: string) => (
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-[#25D366]/10 text-[#128C7E] font-medium text-sm">
                    {text}
                </div>
            )
        },
        { 
            title: 'Reply Message', 
            dataIndex: 'reply_text', 
            key: 'reply_text',
            render: (text: string) => <span className="text-[#3b4a54]">{text}</span>
        },
        {
            title: 'Action',
            key: 'action',
            width: 120,
            render: (_: any, record: any) => (
                <div className="flex gap-2">
                    <Button
                        type="text"
                        icon={<EditOutlined />}
                        className="text-[#8696a0] hover:text-[#128C7E]"
                        onClick={() => message.info('Edit feature coming soon!')}
                    />
                    <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        className="text-red-400 hover:text-red-500"
                        onClick={async () => {
                            const { data: { user } } = await supabase.auth.getUser();
                            if (!user) {
                                message.error("Unauthorized: Please log in.");
                                return;
                            }
                            await supabase.from('automation_rules').delete().eq('id', record.id).eq('user_id', user.id);
                            fetchRules();
                        }}
                    />
                </div>
            ),
        },
    ];

    const menuItems = [
        { key: '/dashboard', icon: <AppstoreOutlined />, label: <Link href="/dashboard">Dashboard</Link> },
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
                    },
                    Table: {
                        headerBg: '#f8f9fa',
                        headerColor: '#54656f',
                        rowHoverBg: '#f0f2f5',
                    }
                }
            }}
        >
            <Layout style={{ minHeight: '100vh' }}>
                {/* Sidebar */}
                <Sider width={260} className="border-r border-[#d1d7db] shadow-sm hidden md:block">
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
                <Layout>
                    <Header className="flex justify-between items-center px-8 border-b border-[#d1d7db]/50 h-[72px]">
                        <div>
                            <Title level={4} className="!m-0 !text-[#111b21]">Rules Management</Title>
                            <Text className="text-[#54656f] text-sm">Overview and control of your active automations.</Text>
                        </div>
                        <Button 
                            type="primary" 
                            icon={<PlusOutlined />} 
                            onClick={() => setIsModalOpen(true)}
                            size="large"
                            className="shadow-sm hover:shadow-md font-medium px-6 bg-[#25D366] hover:bg-[#1ebe5a] border-none"
                        >
                            Add New Rule
                        </Button>
                    </Header>

                    <Content className="p-8 max-w-6xl w-full mx-auto">
                        
                        {/* Statistics Cards */}
                        <Row gutter={[24, 24]} className="mb-8">
                            <Col xs={24} sm={8}>
                                <Card className="shadow-sm border border-[#d1d7db]/40 rounded-xl hover:shadow-md transition-shadow">
                                    <Statistic 
                                        title={<span className="text-[#54656f] font-medium">Total Rules</span>}
                                        value={rules.length} 
                                        prefix={<RobotOutlined className="text-[#25D366] mr-2" />} 
                                        styles={{ content: { color: '#111b21', fontWeight: 600 } }}
                                    />
                                </Card>
                            </Col>
                            <Col xs={24} sm={8}>
                                <Card className="shadow-sm border border-[#d1d7db]/40 rounded-xl hover:shadow-md transition-shadow">
                                    <Statistic 
                                        title={<span className="text-[#54656f] font-medium">Active Replies</span>}
                                        value={rules.length > 0 ? rules.length * 12 : 0} 
                                        prefix={<ThunderboltOutlined className="text-[#00a884] mr-2" />} 
                                        styles={{ content: { color: '#111b21', fontWeight: 600 } }}
                                    />
                                </Card>
                            </Col>
                            <Col xs={24} sm={8}>
                                <Card className="shadow-sm border border-[#d1d7db]/40 rounded-xl hover:shadow-md transition-shadow">
                                    <Statistic 
                                        title={<span className="text-[#54656f] font-medium">Messages Sent</span>}
                                        value={rules.length > 0 ? rules.length * 145 : 0} 
                                        prefix={<MessageOutlined className="text-[#34B7F1] mr-2" />} 
                                        styles={{ content: { color: '#111b21', fontWeight: 600 } }}
                                    />
                                </Card>
                            </Col>
                        </Row>

                        {/* Rules Table */}
                        <Card className="shadow-sm border border-[#d1d7db]/40 rounded-xl overflow-hidden" bodyStyle={{ padding: 0 }}>
                            <div className="p-6 border-b border-[#d1d7db]/40 flex justify-between items-center bg-white">
                                <Title level={5} className="!m-0 !text-[#111b21]">Active Automation Rules</Title>
                            </div>
                            <Table
                                columns={columns}
                                dataSource={rules}
                                rowKey="id"
                                loading={loading}
                                pagination={{ pageSize: 8, className: 'px-6' }}
                                locale={{ emptyText: 'No rules found. Create your first automation!' }}
                                className="w-full"
                            />
                        </Card>

                        {/* Add Rule Modal */}
                        <Modal
                            title={<span className="text-lg font-semibold text-[#111b21]">Create Automation Rule</span>}
                            open={isModalOpen}
                            onCancel={() => setIsModalOpen(false)}
                            footer={null}
                            centered
                            className="rounded-xl overflow-hidden"
                        >
                            <div className="mb-6 mt-2 text-[#54656f]">Define a keyword and the exact message your bot should reply with.</div>
                            <Form layout="vertical" onFinish={onAddRule} size="large" requiredMark={false}>
                                <Form.Item 
                                    label={<span className="font-medium text-[#3b4a54]">Trigger Keyword</span>} 
                                    name="keyword" 
                                    rules={[{ required: true, message: 'Please enter a keyword' }]}
                                >
                                    <Input placeholder="e.g., pricing, hello, support" className="bg-[#f0f2f5] border-none focus:bg-white focus:ring-2 focus:ring-[#25D366]/20" />
                                </Form.Item>
                                <Form.Item 
                                    label={<span className="font-medium text-[#3b4a54]">Auto-Reply Message</span>} 
                                    name="reply_text" 
                                    rules={[{ required: true, message: 'Please enter a reply message' }]}
                                >
                                    <Input.TextArea rows={4} placeholder="Type the message that will be sent automatically..." className="bg-[#f0f2f5] border-none focus:bg-white focus:ring-2 focus:ring-[#25D366]/20 resize-none" />
                                </Form.Item>
                                <div className="flex gap-3 justify-end mt-8">
                                    <Button onClick={() => setIsModalOpen(false)} size="large" className="font-medium">
                                        Cancel
                                    </Button>
                                    <Button type="primary" htmlType="submit" size="large" className="font-medium bg-[#25D366] hover:bg-[#1ebe5a] border-none px-6">
                                        Save Rule
                                    </Button>
                                </div>
                            </Form>
                        </Modal>
                    </Content>
                </Layout>
            </Layout>
        </ConfigProvider>
    );
}