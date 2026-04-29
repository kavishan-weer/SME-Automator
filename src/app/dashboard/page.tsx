'use client'

import { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, message, Layout, Space } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { createClient } from '../../lib/supabase';
const { Content, Header } = Layout;

export default function Dashboard() {
    // 1. States
    const [rules, setRules] = useState<any[]>([]); // Rules
    const [isModalOpen, setIsModalOpen] = useState(false); // Modal
    const [loading, setLoading] = useState(false); // Loading

    const supabase = createClient();

    // 2. Fetch Rules
    const fetchRules = async () => {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser(); // Checking user login status

        if (user) {
            const { data, error } = await supabase
                .from('automation_rules') // 'automation_rules' table
                .select('*')
                .eq('user_id', user.id); // Taking only this user's data

            if (error) message.error("Error fetching rules");
            else setRules(data || []);
        }
        setLoading(false);
    };

    // 3. Start fetching Rules Page loading
    useEffect(() => {
        fetchRules();
    }, []);

    // 4. Add Rule
    const onAddRule = async (values: any) => {
        const { data: { user } } = await supabase.auth.getUser();

        const { error } = await supabase.from('automation_rules').insert([
            {
                keyword: values.keyword.toLowerCase().trim(),
                reply_text: values.reply_text,
                user_id: user?.id
            }
        ]);

        if (error) {
            message.error("Failed to add Rule");
        } else {
            message.success("Rule added successfully!");
            setIsModalOpen(false);
            fetchRules(); // Refresh table
        }
    };

    // Table Columns
    const columns = [
        { title: 'Keyword', dataIndex: 'keyword', key: 'keyword' },
        { title: 'Reply Message', dataIndex: 'reply_text', key: 'reply_text' },
        {
            title: 'Action',
            key: 'action',
            render: (_: any, record: any) => (
                <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={async () => {
                        await supabase.from('automation_rules').delete().eq('id', record.id);
                        fetchRules();
                    }}
                >
                    Delete
                </Button>
            ),
        },
    ];

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Header style={{ background: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 24px' }}>
                <h2 style={{ margin: 0 }}>SME Automator Dashboard</h2>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)}>
                    Add Rule
                </Button>
            </Header>

            <Content style={{ padding: '24px' }}>
                <Table
                    columns={columns}
                    dataSource={rules}
                    rowKey="id"
                    loading={loading}
                    locale={{ emptyText: 'No Rules Found' }}
                />

                {/* Add Rule Popup */}
                <Modal
                    title="Add Rule"
                    open={isModalOpen}
                    onCancel={() => setIsModalOpen(false)}
                    footer={null}
                >
                    <Form layout="vertical" onFinish={onAddRule}>
                        <Form.Item label="Keyword" name="keyword" rules={[{ required: true, message: 'Please enter a keyword' }]}>
                            <Input placeholder="Ex: price" />
                        </Form.Item>
                        <Form.Item label="Reply Message" name="reply_text" rules={[{ required: true, message: 'Please enter a reply message' }]}>
                            <Input.TextArea rows={4} placeholder="Reply message..." />
                        </Form.Item>
                        <Button type="primary" htmlType="submit" block>
                            Save Rule
                        </Button>
                    </Form>
                </Modal>
            </Content>
        </Layout>
    );
}