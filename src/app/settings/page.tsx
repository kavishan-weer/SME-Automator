'use client'

import { useEffect, useState } from 'react';
import { Form, Input, Button, Card, Typography, message, Spin } from 'antd';
import { SaveOutlined, SettingOutlined } from '@ant-design/icons';
import { createClient } from '../../lib/supabase';

const { Title, Text } = Typography;

export default function SettingsPage() {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    // Load existing credentials when the page mounts
    useEffect(() => {
        const loadProfile = async () => {
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('whatsapp_phone_number_id, whatsapp_access_token')
                    .eq('user_id', user.id)
                    .single();

                if (data) {
                    form.setFieldsValue(data);
                }
            }
            setLoading(false);
        };

        loadProfile();
    }, [form, supabase]);

    // Handle the form submission using Upsert logic
    const onSaveSettings = async (values: any) => {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            message.error("User session not found");
            return;
        }

        const { error } = await supabase.from('profiles').upsert({
            user_id: user.id,
            whatsapp_phone_number_id: values.whatsapp_phone_number_id,
            whatsapp_access_token: values.whatsapp_access_token,
        }, { onConflict: 'user_id' }); // Important: Prevent duplicate entries for the same user

        if (error) {
            message.error("Failed to update settings: " + error.message);
        } else {
            message.success("WhatsApp credentials saved successfully!");
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Spin size="large" description="Loading settings..." />
            </div>
        );
    }

    return (
        <div className="p-8 max-w-3xl mx-auto">
            <Card
                title={<span><SettingOutlined /> WhatsApp API Configuration</span>}
                className="shadow-sm"
            >
                <div className="mb-6">
                    <Text type="secondary">
                        Enter your Meta Cloud API credentials below to connect your WhatsApp number to the automator.
                    </Text>
                </div>

                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onSaveSettings}
                    requiredMark="optional"
                >
                    <Form.Item
                        label="WhatsApp Phone Number ID"
                        name="whatsapp_phone_number_id"
                        rules={[{ required: true, message: 'Phone Number ID is required' }]}
                        help="Found in your Meta Developer Portal under WhatsApp Setup."
                    >
                        <Input placeholder="e.g. 104825969312345" />
                    </Form.Item>

                    <Form.Item
                        label="Permanent Access Token"
                        name="whatsapp_access_token"
                        rules={[{ required: true, message: 'Access Token is required' }]}
                        help="Generate a Permanent Token to ensure your bot stays active."
                    >
                        <Input.Password placeholder="Enter your system user access token" />
                    </Form.Item>

                    <Form.Item className="mt-8">
                        <Button
                            type="primary"
                            htmlType="submit"
                            icon={<SaveOutlined />}
                            size="large"
                            block
                        >
                            Save Configuration
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
}