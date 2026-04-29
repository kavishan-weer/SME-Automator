'use client'

import { Form, Input, Button, Card, Typography, message } from 'antd';
import { createClient } from '../../lib/supabase';
import { useRouter } from 'next/navigation';

const { Title } = Typography;

export default function LoginPage() {
    const supabase = createClient();
    const router = useRouter();

    // Login Button logic
    const onFinish = async (values: any) => {
        const { email, password } = values;

        //Telling supabase to login the user
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            message.error("Login Failled: " + error.message);
        } else {
            message.success("Successfully Logged In");
            router.push('/dashboard')
        }
    };

    return (
        <div className="flex justify-center items-center h-screen bg-gray-50">
            <Card className="w-full max-w-md shadow-md rounded-lg">
                <div className="text-center mb-8">
                    <Title level={2}>SME Automator</Title>
                    <p className="text-gray-500">Login</p>
                </div>

                <Form layout="vertical" onFinish={onFinish}>
                    <Form.Item
                        label="Email Address"
                        name="email"
                        rules={[{ required: true, type: 'email', message: 'Please Enter Email' }]}
                    >
                        <Input size="large" placeholder="example@email.com" />
                    </Form.Item>

                    <Form.Item
                        label="Password"
                        name="password"
                        rules={[{ required: true, message: 'Please Enter Password' }]}
                    >
                        <Input.Password size="large" />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" size="large" block>
                            Login
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
}