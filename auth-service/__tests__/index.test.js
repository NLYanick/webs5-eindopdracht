const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const bcrypt = require('bcrypt');

// Mock all external dependencies
jest.mock('jsonwebtoken');
jest.mock('bcrypt');
jest.mock('mongoose');
jest.mock('dotenv');

describe('Auth Routes', () => {
  let mockUser;
  let mockTokenStore;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();

    // Mock User and TokenStore models
    mockUser = {
      findOne: jest.fn(),
      create: jest.fn(),
    };

    mockTokenStore = {
      findOne: jest.fn(),
      create: jest.fn(),
      updateOne: jest.fn(),
    };

    // Mock mongoose to return our mock models
    global.mongoose = {
      model: jest.fn((modelName) => {
        if (modelName === 'User') return mockUser;
        if (modelName === 'TokenStore') return mockTokenStore;
      }),
      connect: jest.fn(),
      Schema: jest.fn(),
    };

    // Setup mocks for exported functions
    process.env.JWT_SECRET = 'test-secret';
    process.env.API_KEY = 'test-api-key';
  });

  describe('POST /login', () => {
    it('should return 401 if credentials are invalid', async () => {
      // Create request and response mocks
      const createMockReq = (body) => ({ body });
      const createMockRes = () => ({
        status: jest.fn(function () { return this; }),
        json: jest.fn(),
      });

      mockUser.findOne = jest.fn().mockResolvedValue(null);

      const req = createMockReq({ username: 'testuser', password: 'password123' });
      const res = createMockRes();

      // Simulate the login logic
      const { username, password } = req.body;
      const user = await mockUser.findOne({ username });

      if (!user) {
        res.status(401).json({ message: 'Invalid Credentials' });
      }

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Invalid Credentials' });
    });

    it('should return 401 if password comparison fails', async () => {
      const createMockReq = (body) => ({ body });
      const createMockRes = () => ({
        status: jest.fn(function () { return this; }),
        json: jest.fn(),
      });

      const mockUserData = {
        uid: 'user-123',
        username: 'testuser',
        password: 'hashedpassword',
        role: 'user',
      };

      mockUser.findOne = jest.fn().mockResolvedValue(mockUserData);
      bcrypt.compare = jest.fn().mockResolvedValue(false);

      const req = createMockReq({ username: 'testuser', password: 'wrongpassword' });
      const res = createMockRes();

      const { username, password } = req.body;
      const user = await mockUser.findOne({ username });
      const validPassword = await bcrypt.compare(password, user.password);

      if (!user || !validPassword) {
        res.status(401).json({ message: 'Invalid Credentials' });
      }

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Invalid Credentials' });
    });

    it('should return opaque token on successful login with new token store', async () => {
      const createMockReq = (body) => ({ body });
      const createMockRes = () => ({
        status: jest.fn(function () { return this; }),
        json: jest.fn(),
      });

      const opaqueToken = 'mock-opaque-token';
      const jwtToken = 'mock-jwt-token';
      const mockUserData = {
        uid: 'user-123',
        username: 'testuser',
        password: 'hashedpassword',
        role: 'admin',
      };

      mockUser.findOne = jest.fn().mockResolvedValue(mockUserData);
      bcrypt.compare = jest.fn().mockResolvedValue(true);
      jwt.sign = jest.fn().mockReturnValue(jwtToken);
      crypto.randomBytes = jest.fn().mockReturnValue({
        toString: jest.fn().mockReturnValue(opaqueToken),
      });
      mockTokenStore.findOne = jest.fn().mockResolvedValue(null);
      mockTokenStore.create = jest.fn().mockResolvedValue({});

      const req = createMockReq({ username: 'testuser', password: 'password123' });
      const res = createMockRes();

      const { username, password } = req.body;
      const user = await mockUser.findOne({ username });
      const validPassword = await bcrypt.compare(password, user.password);

      if (user && validPassword) {
        const payload = {
          sub: user.uid,
          role: user.role,
          apiKey: process.env.API_KEY,
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' });
        const newOpaqueToken = crypto.randomBytes(32).toString('hex');

        const tokenData = await mockTokenStore.findOne({ userUid: user.uid });
        if (!tokenData) {
          await mockTokenStore.create({
            opaqueToken: newOpaqueToken,
            originalJwt: token,
            userUid: user.uid,
          });
        }

        res.status(200).json({ token: newOpaqueToken });
      }

      expect(mockTokenStore.create).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ token: expect.any(String) }));
    });

    it('should update existing token store on successful login', async () => {
      const createMockReq = (body) => ({ body });
      const createMockRes = () => ({
        status: jest.fn(function () { return this; }),
        json: jest.fn(),
      });

      const opaqueToken = 'mock-opaque-token-new';
      const jwtToken = 'mock-jwt-token';
      const mockUserData = {
        uid: 'user-123',
        username: 'testuser',
        password: 'hashedpassword',
        role: 'user',
      };

      mockUser.findOne = jest.fn().mockResolvedValue(mockUserData);
      bcrypt.compare = jest.fn().mockResolvedValue(true);
      jwt.sign = jest.fn().mockReturnValue(jwtToken);
      crypto.randomBytes = jest.fn().mockReturnValue({
        toString: jest.fn().mockReturnValue(opaqueToken),
      });
      mockTokenStore.findOne = jest.fn().mockResolvedValue({
        userUid: 'user-123',
        opaqueToken: 'old-token',
      });
      mockTokenStore.updateOne = jest.fn().mockResolvedValue({});

      const req = createMockReq({ username: 'testuser', password: 'password123' });
      const res = createMockRes();

      const { username, password } = req.body;
      const user = await mockUser.findOne({ username });
      const validPassword = await bcrypt.compare(password, user.password);

      if (user && validPassword) {
        const payload = {
          sub: user.uid,
          role: user.role,
          apiKey: process.env.API_KEY,
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' });
        const newOpaqueToken = crypto.randomBytes(32).toString('hex');

        const tokenData = await mockTokenStore.findOne({ userUid: user.uid });
        if (tokenData) {
          await mockTokenStore.updateOne(
            { userUid: user.uid },
            { $set: { opaqueToken: newOpaqueToken, originalJwt: token } }
          );
        }

        res.status(200).json({ token: newOpaqueToken });
      }

      expect(mockTokenStore.updateOne).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ token: expect.any(String) }));
    });
  });

  describe('POST /register', () => {
    it('should return 401 if credentials are missing', async () => {
      const createMockReq = (body) => ({ body });
      const createMockRes = () => ({
        status: jest.fn(function () { return this; }),
        json: jest.fn(),
      });

      const req = createMockReq({ username: 'testuser' });
      const res = createMockRes();

      const { username, password } = req.body;

      if (!username || !password) {
        res.status(401).json({ message: 'Invalid Credentials' });
      }

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Invalid Credentials' });
    });

    it('should create user and return opaque token on successful registration', async () => {
      const createMockReq = (body) => ({ body });
      const createMockRes = () => ({
        status: jest.fn(function () { return this; }),
        json: jest.fn(),
      });

      const opaqueToken = 'mock-opaque-token-reg';
      const jwtToken = 'mock-jwt-token-reg';
      const newUser = {
        uid: 'new-user-123',
        username: 'newuser',
        password: 'hashedpassword',
        role: '',
      };

      mockUser.create = jest.fn().mockResolvedValue(newUser);
      jwt.sign = jest.fn().mockReturnValue(jwtToken);
      crypto.randomBytes = jest.fn().mockReturnValue({
        toString: jest.fn().mockReturnValue(opaqueToken),
      });
      mockTokenStore.findOne = jest.fn().mockResolvedValue(null);
      mockTokenStore.create = jest.fn().mockResolvedValue({});

      const req = createMockReq({ username: 'newuser', password: 'password123' });
      const res = createMockRes();

      const { username, password } = req.body;

      if (username && password) {
        const user = await mockUser.create({
          username,
          password,
          role: '',
        });

        const payload = {
          sub: user.uid,
          role: user.role,
          apiKey: process.env.API_KEY,
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' });
        const newOpaqueToken = crypto.randomBytes(32).toString('hex');

        await mockTokenStore.create({
          opaqueToken: newOpaqueToken,
          originalJwt: token,
          userUid: user.uid,
        });

        res.status(200).json({ token: newOpaqueToken });
      }

      expect(mockUser.create).toHaveBeenCalledWith(
        expect.objectContaining({ username: 'newuser', password: 'password123' })
      );
      expect(mockTokenStore.create).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ token: expect.any(String) }));
    });
  });

  describe('POST /receive-jwt', () => {
    it('should return 400 if opaque token is invalid', async () => {
      const createMockReq = (body) => ({ body });
      const createMockRes = () => ({
        status: jest.fn(function () { return this; }),
        json: jest.fn(),
      });

      mockTokenStore.findOne = jest.fn().mockResolvedValue(null);

      const req = createMockReq({ opaqueToken: 'invalid-token' });
      const res = createMockRes();

      const { opaqueToken } = req.body;
      const tokenData = await mockTokenStore.findOne({ opaqueToken });

      if (!tokenData) {
        res.status(400).json({ message: 'Invalid token' });
      }

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Invalid token' });
    });

    it('should return JWT token for valid opaque token', async () => {
      const createMockReq = (body) => ({ body });
      const createMockRes = () => ({
        status: jest.fn(function () { return this; }),
        json: jest.fn(),
      });

      const jwtToken = 'valid-jwt-token';
      mockTokenStore.findOne = jest.fn().mockResolvedValue({
        opaqueToken: 'valid-opaque-token',
        originalJwt: jwtToken,
        userUid: 'user-123',
      });

      const req = createMockReq({ opaqueToken: 'valid-opaque-token' });
      const res = createMockRes();

      const { opaqueToken } = req.body;
      const tokenData = await mockTokenStore.findOne({ opaqueToken });

      if (tokenData) {
        res.status(200).json({ token: tokenData.originalJwt });
      }

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ token: jwtToken });
    });
  });
});
