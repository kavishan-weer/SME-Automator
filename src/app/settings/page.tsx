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

    };

    return (
        <div className="p-8 max-w-3xl mx-auto">
            <Spin spinning={loading} description="Loading settings...">
                <Card
                    title={<span><SettingOutlined /> WhatsApp API Configuration</span>}
                    className="shadow-sm"
                >
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
                        >
                            <Input placeholder="e.g. 104825969312345" />
                        </Form.Item>

                        <Form.Item
                            label="Permanent Access Token"
                            name="whatsapp_access_token"
                            rules={[{ required: true, message: 'Access Token is required' }]}
                        >
                            <Input.Password placeholder="Enter your token" />
                        </Form.Item>

                        <Form.Item>
                            <Button type="primary" htmlType="submit" icon={<SaveOutlined />} block>
                                Save Configuration
                            </Button>
                        </Form.Item>
                    </Form>
                </Card>
            </Spin>
        </div>
    );
}