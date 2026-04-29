'use client'

import { useEffect, useState } from 'react';
import { Form, Input, Button, Card, Typography, message, Spin } from 'antd';
import { SaveOutlined, SettingOutlined } from '@ant-design/icons';
import { createClient } from '../../lib/supabase';

const { Text } = Typography;

export default function SettingsPage() {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const supabase = createClient();

    // AntD Message Hook
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

        // Upsert logic to prevent duplicate user profiles
        const { error } = await supabase.from('profiles').upsert({
            user_id: user.id, // Linked to auth.users uuid
            whatsapp_phone_number_id: values.whatsapp_phone_number_id,
            whatsapp_access_token: values.whatsapp_access_token,
        }, { onConflict: 'user_id' }); // Unique constraint check

        if (error) {
            // Error Feedback
            messageApi.error("Failed to update settings: " + error.message);
        } else {
            // Success Feedback
            messageApi.success("WhatsApp credentials saved successfully!");
        }
        setIsSaving(false);
    };

    return (
        <div className="p-8 max-w-3xl mx-auto">

            {contextHolder}

            <Spin spinning={loading} description="Loading settings...">
                <Card title={<span><SettingOutlined /> WhatsApp API Configuration</span>}>
                    <Form form={form} layout="vertical" onFinish={onSaveSettings}>
                        <Form.Item
                            label="WhatsApp Phone Number ID"
                            name="whatsapp_phone_number_id"
                            rules={[{ required: true }]}
                        >
                            <Input placeholder="e.g. 104825969312345" />
                        </Form.Item>

                        <Form.Item
                            label="Permanent Access Token"
                            name="whatsapp_access_token"
                            rules={[{ required: true }]}
                        >
                            <Input.Password placeholder="Enter your token" />
                        </Form.Item>

                        <Form.Item>
                            <Button
                                type="primary"
                                htmlType="submit"
                                icon={<SaveOutlined />}
                                loading={isSaving}
                                block
                            >
                                Save Configuration
                            </Button>
                        </Form.Item>
                    </Form>
                </Card>
            </Spin>
        </div>
    );
}