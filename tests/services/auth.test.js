const authService = require('../../services/auth.service');
const userRepository = require('../../repositories/user.repository');
const { hashPassword, comparePassword } = require('../../utils/hash');
const jwt = require('../../utils/jwt');

// Mock dependencies
jest.mock('../../repositories/user.repository');
jest.mock('../../utils/hash');
jest.mock('../../utils/jwt', () => ({
    generateToken: jest.fn(() => 'mockedToken'),
}));

describe('Auth Service', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    // ================= REGISTER =================
    describe('register', () => {

        test('should throw error if email already exists', async () => {
            userRepository.findUserByEmail.mockResolvedValue({ id: 1 });

            await expect(
                authService.register({ email: 'test@example.com' })
            ).rejects.toMatchObject({
                statusCode: 400,
                message: 'Email already registered'
            });
        });

        test('should throw error if username already exists', async () => {
            userRepository.findUserByEmail.mockResolvedValue(null);
            userRepository.findUserByUsername.mockResolvedValue({ id: 1 });

            await expect(
                authService.register({ username: 'test', email: 'test@e.com' })
            ).rejects.toMatchObject({
                statusCode: 400,
                message: 'Username already taken'
            });
        });

        test('should successfully register new user', async () => {
            userRepository.findUserByEmail.mockResolvedValue(null);
            userRepository.findUserByUsername.mockResolvedValue(null);
            hashPassword.mockResolvedValue('hashedPassword');

            userRepository.createUser.mockResolvedValue({
                id: 1,
                username: 'test',
                email: 'test@e.com'
            });

            const result = await authService.register({
                username: 'test',
                email: 'test@e.com',
                password: 'pass'
            });

            expect(hashPassword).toHaveBeenCalledWith('pass');

            expect(userRepository.createUser).toHaveBeenCalled();

            expect(result).toMatchObject({
                id: 1,
                username: 'test'
            });

            // Security check
            expect(result).not.toHaveProperty('password');
        });

        test('should handle repository failure during register', async () => {
            userRepository.findUserByEmail.mockRejectedValue(new Error('DB Error'));

            await expect(
                authService.register({ email: 'test@example.com' })
            ).rejects.toThrow('DB Error');
        });

        test('should normalize email to lowercase', async () => {
            userRepository.findUserByEmail.mockResolvedValue(null);
            userRepository.findUserByUsername.mockResolvedValue(null);
            hashPassword.mockResolvedValue('hashed');

            userRepository.createUser.mockResolvedValue({ id: 1 });

            await authService.register({
                username: 'test',
                email: 'TEST@e.com',
                password: 'pass'
            });

            expect(userRepository.findUserByEmail)
                .toHaveBeenCalledWith('test@e.com');
        });

    });

    // ================= LOGIN =================
    describe('login', () => {

        test('should throw error if user not found', async () => {
            userRepository.findUserByEmail.mockResolvedValue(null);

            await expect(
                authService.login('test@e.com', 'pass')
            ).rejects.toMatchObject({
                statusCode: 401,
                message: 'Invalid credentials'
            });
        });

        test('should throw error if password is wrong', async () => {
            userRepository.findUserByEmail.mockResolvedValue({
                id: 1,
                password: 'hashed',
                status: 'ACTIVE'
            });

            comparePassword.mockResolvedValue(false);

            await expect(
                authService.login('test@e.com', 'pass')
            ).rejects.toMatchObject({
                statusCode: 401
            });
        });

        test('should throw error if user is inactive', async () => {
            userRepository.findUserByEmail.mockResolvedValue({
                id: 1,
                password: 'hashed',
                status: 'INACTIVE'
            });

            await expect(
                authService.login('test@e.com', 'pass')
            ).rejects.toMatchObject({
                statusCode: 403,
                message: 'User account is inactive'
            });
        });

        test('should successfully login and return token', async () => {
            const mockUser = {
                id: 1,
                username: 'user',
                email: 'user@e.com',
                role: 'ADMIN',
                password: 'hashed',
                status: 'ACTIVE'
            };

            userRepository.findUserByEmail.mockResolvedValue(mockUser);
            comparePassword.mockResolvedValue(true);

            const result = await authService.login('user@e.com', 'mypass');

            expect(comparePassword).toHaveBeenCalledWith('mypass', mockUser.password);

            expect(jwt.generateToken).toHaveBeenCalledWith(
                expect.objectContaining({
                    id: mockUser.id,
                    role: mockUser.role
                })
            );

            expect(result).toHaveProperty('token', 'mockedToken');
            expect(result.user.username).toBe('user');

            // Security check
            expect(result.user).not.toHaveProperty('password');
        });

        test('should throw error for missing credentials', async () => {
            await expect(
                authService.login('', '')
            ).rejects.toBeDefined();
        });

        test('should handle repository failure during login', async () => {
            userRepository.findUserByEmail.mockRejectedValue(new Error('DB Error'));

            await expect(
                authService.login('test@e.com', 'pass')
            ).rejects.toThrow('DB Error');
        });
        test('should not call comparePassword if user not found', async () => {
            userRepository.findUserByEmail.mockResolvedValue(null);

            await expect(
                authService.login('test@e.com', 'pass')
            ).rejects.toBeDefined();

            expect(comparePassword).not.toHaveBeenCalled();
        });
        test('should not generate token if login fails', async () => {
            userRepository.findUserByEmail.mockResolvedValue(null);

            await expect(
                authService.login('test@e.com', 'pass')
            ).rejects.toBeDefined();

            expect(jwt.generateToken).not.toHaveBeenCalled();
        });
        test('should store hashed password, not raw password', async () => {
            userRepository.findUserByEmail.mockResolvedValue(null);
            userRepository.findUserByUsername.mockResolvedValue(null);
            hashPassword.mockResolvedValue('hashedPassword');

            userRepository.createUser.mockResolvedValue({ id: 1 });

            await authService.register({
                username: 'test',
                email: 'test@e.com',
                password: 'plainPass'
            });

            expect(userRepository.createUser).toHaveBeenCalledWith(
                expect.objectContaining({
                    password: 'hashedPassword'
                })
            );
        });
        test('should trim email before processing', async () => {
            userRepository.findUserByEmail.mockResolvedValue(null);
            userRepository.findUserByUsername.mockResolvedValue(null);
            hashPassword.mockResolvedValue('hashed');

            userRepository.createUser.mockResolvedValue({ id: 1 });

            await authService.register({
                username: 'test',
                email: '  test@e.com  ',
                password: 'pass'
            });

            expect(userRepository.findUserByEmail)
                .toHaveBeenCalledWith('test@e.com');
        });
        test('should assign default role if not provided', async () => {
            userRepository.findUserByEmail.mockResolvedValue(null);
            userRepository.findUserByUsername.mockResolvedValue(null);
            hashPassword.mockResolvedValue('hashed');

            userRepository.createUser.mockResolvedValue({ id: 1 });

            await authService.register({
                username: 'test',
                email: 'test@e.com',
                password: 'pass'
            });

            expect(userRepository.createUser).toHaveBeenCalledWith(
                expect.objectContaining({
                    role: expect.any(String)
                })
            );
        });
        test('should handle login email case-insensitively', async () => {
            const mockUser = {
                id: 1,
                email: 'user@e.com',
                password: 'hashed',
                role: 'ADMIN',
                status: 'ACTIVE'
            };

            userRepository.findUserByEmail.mockResolvedValue(mockUser);
            comparePassword.mockResolvedValue(true);

            await authService.login('USER@e.com', 'pass');

            expect(userRepository.findUserByEmail)
                .toHaveBeenCalledWith('user@e.com');
        });
    });
});

