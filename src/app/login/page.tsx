'use client'

import { Form, Input, Button, Typography, message, ConfigProvider } from 'antd';
import { createClient } from '../../lib/supabase';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import { LockOutlined, UserOutlined, WhatsAppOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

export default function LoginPage() {
    const supabase = createClient();
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const onFinish = async (values: any) => {
        setLoading(true);
        const { email, password } = values;

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            message.error("Login Failed: " + error.message);
            setLoading(false);
        } else {
            message.success("Successfully Logged In");
            router.push('/dashboard')
        }
    };

    return (
        <ConfigProvider
            theme={{
                token: {
                    colorPrimary: '#25D366', // WhatsApp Green
                    colorBgContainer: '#ffffff',
                    colorText: '#111b21',
                    colorTextPlaceholder: '#8696a0',
                    colorBorder: '#d1d7db',
                    colorIcon: '#8696a0',
                    colorIconHover: '#111b21',
                    controlOutlineWidth: 0,
                    borderRadius: 8,
                    fontFamily: 'var(--font-inter), sans-serif',
                },
                components: {
                    Input: {
                        activeBorderColor: '#25D366',
                        hoverBorderColor: '#25D366',
                        activeShadow: '0 0 0 2px rgba(37, 211, 102, 0.2)',
                        paddingBlock: 10,
                    },
                    Button: {
                        colorPrimaryHover: '#1ebe5a',
                        colorPrimaryActive: '#128C7E', // WhatsApp Dark Green
                        colorTextLightSolid: '#ffffff',
                        fontWeight: 600,
                        paddingBlock: 12,
                    },
                }
            }}
        >
            <div className="flex justify-center items-center min-h-screen bg-[#f0f2f5] px-4 font-sans text-[#111b21] relative overflow-hidden">
                {/* Subtle top green accent bar similar to WhatsApp Web */}
                <div className="absolute top-0 left-0 w-full h-[222px] bg-[#00a884] z-0" />

                <div className="w-full max-w-[420px] p-8 sm:p-10 bg-white shadow-xl rounded-2xl relative z-10">
                    
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-[#25D366]/10 rounded-full mb-4">
                            <WhatsAppOutlined className="text-4xl text-[#25D366]" />
                        </div>
                        <Title level={2} className="!text-[#111b21] !font-semibold !mb-2 tracking-tight !text-2xl">SME Automator</Title>
                        <Text className="text-[#3b4a54] text-[15px]">Sign in to manage your automations.</Text>
                    </div>

                    <Form layout="vertical" onFinish={onFinish} requiredMark={false} size="large">
                        <Form.Item
                            label={<span className="font-medium text-[#3b4a54]">Email Address</span>}
                            name="email"
                            rules={[{ required: true, type: 'email', message: 'Please enter your email' }]}
                        >
                            <Input 
                                prefix={<UserOutlined className="text-[#8696a0] mr-2" />} 
                                placeholder="name@company.com" 
                                className="!bg-[#f0f2f5] hover:!bg-white focus:!bg-white transition-colors"
                            />
                        </Form.Item>

                        <Form.Item
                            label={<span className="font-medium text-[#3b4a54]">Password</span>}
                            name="password"
                            rules={[{ required: true, message: 'Please enter your password' }]}
                            className="!mb-4"
                        >
                            <Input.Password 
                                prefix={<LockOutlined className="text-[#8696a0] mr-2" />} 
                                placeholder="••••••••" 
                                className="!bg-[#f0f2f5] hover:!bg-white focus:!bg-white transition-colors"
                            />
                        </Form.Item>

                        <div className="flex justify-end mb-8">
                            <Link href="/forgot-password" className="text-[14px] text-[#00a884] hover:text-[#128C7E] transition-colors font-medium">
                                Forgot Password?
                            </Link>
                        </div>

                        <Form.Item className="!mb-2">
                            <Button 
                                type="primary" 
                                htmlType="submit" 
                                block 
                                loading={loading}
                                className="!h-[48px] !text-[16px] shadow-sm hover:shadow-md transition-all duration-300"
                            >
                                Sign In
                            </Button>
                        </Form.Item>
                    </Form>
                </div>
            </div>
        </ConfigProvider>
    );
}