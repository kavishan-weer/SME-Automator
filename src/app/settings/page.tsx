'use client'

import { useEffect, useState } from 'react';
import { Form, Input, Button, Card, Typography, message, Spin, Layout, Menu, ConfigProvider, Tooltip, Tag, Divider } from 'antd';
import { SaveOutlined, SettingOutlined, InfoCircleOutlined, CheckCircleOutlined, CloseCircleOutlined, AppstoreOutlined, LogoutOutlined, RobotOutlined, KeyOutlined, PhoneOutlined } from '@ant-design/icons';
import { createClient } from '../../lib/supabase';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

const { Header, Content, Sider } = Layout;
const { Title, Text } = Typography;

export default function SettingsPage() {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    
    const supabase = createClient();
    const router = useRouter();
    const pathname = usePathname();
    const [messageApi, contextHolder] = message.useMessage();

    useEffect(() => {
        const loadProfile = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data } = await supabase
                    .from('profiles')
                    .select('whatsapp_phone_number_id, whatsapp_access_token')
                    .eq('user_id', user.id)
                    .single();

                if (data) {
                    form.setFieldsValue(data);
                    if (data.whatsapp_phone_number_id && data.whatsapp_access_token) {
                        setIsConnected(true);
                    }
                }
            }
            setLoading(false);
        };
        loadProfile();
    }, [form, supabase]);

    const onSaveSettings = async (values: any) => {
        setIsSaving(true);
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            messageApi.error("User session not found!");
            setIsSaving(false);
            return;
        }

        const { error } = await supabase.from('profiles').upsert({
            user_id: user.id,
            whatsapp_phone_number_id: values.whatsapp_phone_number_id,
            whatsapp_access_token: values.whatsapp_access_token,
        }, { onConflict: 'user_id' });

        if (error) {
            messageApi.error("Failed to update settings: " + error.message);
        } else {
            messageApi.success("WhatsApp credentials saved successfully!");
            setIsConnected(true);
        }
        setIsSaving(false);
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/login');
    };

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
                    Card: {
                        headerBg: '#ffffff',
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
                    className="border-r border-[#d1d7db] shadow-sm z-50"
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
                            <Title level={4} className="!m-0 !text-[#111b21] hidden sm:block">Configuration</Title>
                            <Text className="text-[#54656f] text-sm hidden sm:block">Manage your API integrations and preferences.</Text>
                        </div>
                    </Header>

                    <Content className="p-4 sm:p-8 w-full max-w-3xl mx-auto" style={{ overflowX: 'auto' }}>
                        
                        <Spin spinning={loading} description="Loading configurations..." size="large">
                            <Card 
                                className="shadow-sm border border-[#d1d7db]/40 rounded-2xl overflow-hidden mt-4" 
                                styles={{ body: { padding: '32px' } }}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <Title level={4} className="!m-0 !mb-1 text-[#111b21]">WhatsApp Business API Setup</Title>
                                        <Text className="text-[#54656f]">Connect your Meta App to start sending and receiving messages.</Text>
                                    </div>
                                    <div>
                                        {isConnected ? (
                                            <Tag color="success" icon={<CheckCircleOutlined />} className="px-3 py-1 rounded-full text-sm border-none bg-[#e9fbee] text-[#128C7E]">
                                                Connected
                                            </Tag>
                                        ) : (
                                            <Tag color="default" icon={<CloseCircleOutlined />} className="px-3 py-1 rounded-full text-sm border-none bg-gray-100 text-gray-500">
                                                Disconnected
                                            </Tag>
                                        )}
                                    </div>
                                </div>
                                
                                <Divider className="my-6 border-[#d1d7db]/50" />

                                <Form form={form} layout="vertical" onFinish={onSaveSettings} size="large" requiredMark={false}>
                                    <Form.Item
                                        label={
                                            <span className="font-medium text-[#3b4a54] flex items-center gap-2">
                                                Phone Number ID
                                                <Tooltip title="Found in your Meta App Dashboard under WhatsApp > Getting Started. It is usually a 15-digit number.">
                                                    <InfoCircleOutlined className="text-[#8696a0] hover:text-[#128C7E] cursor-help" />
                                                </Tooltip>
                                            </span>
                                        }
                                        name="whatsapp_phone_number_id"
                                        rules={[{ required: true, message: 'Phone Number ID is required' }]}
                                    >
                                        <Input 
                                            prefix={<PhoneOutlined className="text-[#8696a0] mr-2" />} 
                                            placeholder="e.g. 104825969312345" 
                                            className="bg-[#f0f2f5] border-none focus:bg-white focus:ring-2 focus:ring-[#25D366]/20 transition-all"
                                        />
                                    </Form.Item>

                                    <Form.Item
                                        label={
                                            <span className="font-medium text-[#3b4a54] flex items-center gap-2">
                                                Permanent Access Token
                                                <Tooltip title="You need to generate a System User Access Token in Meta Business Settings for production use.">
                                                    <InfoCircleOutlined className="text-[#8696a0] hover:text-[#128C7E] cursor-help" />
                                                </Tooltip>
                                            </span>
                                        }
                                        name="whatsapp_access_token"
                                        rules={[{ required: true, message: 'Access Token is required' }]}
                                        className="mb-8"
                                    >
                                        <Input.Password 
                                            prefix={<KeyOutlined className="text-[#8696a0] mr-2" />} 
                                            placeholder="EAA...xxx" 
                                            className="bg-[#f0f2f5] border-none focus:bg-white focus:ring-2 focus:ring-[#25D366]/20 transition-all"
                                        />
                                    </Form.Item>

                                    <Form.Item className="mb-0">
                                        <Button
                                            type="primary"
                                            htmlType="submit"
                                            icon={<SaveOutlined />}
                                            loading={isSaving}
                                            block
                                            className="h-[48px] text-[16px] font-medium shadow-sm hover:shadow-md bg-[#25D366] hover:bg-[#1ebe5a] border-none"
                                        >
                                            Save Changes
                                        </Button>
                                    </Form.Item>
                                </Form>
                            </Card>
                        </Spin>
                    </Content>
                </Layout>
            </Layout>
        </ConfigProvider>
    );
}