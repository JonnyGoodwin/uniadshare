export const testAdminEnv = {
    ADMIN_EMAIL: 'admin@example.com',
    ADMIN_PASSWORD: 'test-password-123',
    AUTH_SESSION_SECRET: 'test-session-secret-12345'
};
export async function loginAsAdmin(app) {
    const response = await app.inject({
        method: 'POST',
        url: '/api/auth/login',
        payload: {
            email: testAdminEnv.ADMIN_EMAIL,
            password: testAdminEnv.ADMIN_PASSWORD
        }
    });
    if (response.statusCode !== 200) {
        throw new Error(`Admin login failed in test setup (${response.statusCode}): ${response.body}`);
    }
    const token = response.json().token;
    return { authorization: `Bearer ${token}` };
}
