
// Setup mocks BEFORE any requires
jest.mock('../../passport-config.js');
jest.mock('../services/roles.js');
jest.mock('../services/circuit-breaker.js');
jest.mock('dotenv');

const mockPassport = require('../../passport-config.js');
const mockRoles = require('../services/roles.js');
const mockCircuitBreaker = require('../services/circuit-breaker.js');

describe('Score Service Routes', () => {
  let router;

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup passport mock to return middleware
    mockPassport.authenticate = jest.fn().mockReturnValue((req, res, next) => {
      req.user = {
        sub: 'user-123',
        role: 'target-participant',
        iat: Math.floor(Date.now() / 1000)
      };
      next();
    });

    // Setup roles mock to return middleware
    mockRoles.can = jest.fn().mockReturnValue((req, res, next) => next());

    // Setup circuit breaker mock
    mockCircuitBreaker.fire = jest.fn();

    process.env.SUBMISSION_SERVICE = 'http://localhost:3005';

    // Now load the router
    delete require.cache[require.resolve('../routes/index.js')];
    router = require('../routes/index.js');
  });

  describe('GET /:targetId', () => {
    it('should return scores for a target', async () => {
      const mockSubmissions = {
        images: [
          { photoUrl: 'image1.jpg', score: 85, userUid: 'user-1' },
          { photoUrl: 'image2.jpg', score: 92, userUid: 'user-2' }
        ]
      };

      mockCircuitBreaker.fire.mockResolvedValue({
        json: mockSubmissions,
        status: 200
      });

      const req = {
        params: { targetId: 'target-123' },
        user: { sub: 'user-123' },
        headers: { authorization: 'Bearer token' }
      };
      const res = {
        json: jest.fn().mockReturnThis(),
        status: jest.fn().mockReturnThis()
      };

      const route = router.stack.find(
        (layer) => layer.route && layer.route.path === '/:targetId'
      );

      if (route && route.route.stack && route.route.stack[2]) {
        const handler = route.route.stack[2].handle;
        await handler(req, res);

        expect(mockCircuitBreaker.fire).toHaveBeenCalled();
        expect(res.json).toHaveBeenCalledWith(
          expect.objectContaining({
            message: 'Successfully retrieved scores'
          })
        );
      }
    });

    it('should return 404 when no scores found', async () => {
      mockCircuitBreaker.fire.mockResolvedValue({
        json: null,
        status: 404
      });

      const req = {
        params: { targetId: 'target-123' },
        user: { sub: 'user-123' },
        headers: { authorization: 'Bearer token' }
      };
      const res = {
        json: jest.fn().mockReturnThis(),
        status: jest.fn().mockReturnThis()
      };

      const route = router.stack.find(
        (layer) => layer.route && layer.route.path === '/:targetId'
      );

      if (route && route.route.stack && route.route.stack[2]) {
        const handler = route.route.stack[2].handle;
        await handler(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith(
          expect.objectContaining({
            message: 'No scores found for this target'
          })
        );
      }
    });
  });

  describe('GET /:targetId/my-submissions', () => {
    it('should return user submissions', async () => {
      const mockUserSubmissions = {
        images: [
          { photoUrl: 'user-image1.jpg', score: 88 },
          { photoUrl: 'user-image2.jpg', score: 91 }
        ]
      };

      mockCircuitBreaker.fire.mockResolvedValue({
        json: mockUserSubmissions,
        status: 200
      });

      const req = {
        params: { targetId: 'target-123' },
        user: { sub: 'user-123' },
        headers: { authorization: 'Bearer token' }
      };
      const res = {
        json: jest.fn().mockReturnThis(),
        status: jest.fn().mockReturnThis()
      };

      const route = router.stack.find(
        (layer) => layer.route && layer.route.path === '/:targetId/my-submissions'
      );

      if (route && route.route.stack && route.route.stack[2]) {
        const handler = route.route.stack[2].handle;
        await handler(req, res);

        expect(res.json).toHaveBeenCalledWith(
          expect.objectContaining({
            message: 'Successfully retrieved scores'
          })
        );
      }
    });

    it('should return 401 when user is not authenticated', async () => {
      const req = {
        params: { targetId: 'target-123' },
        user: { sub: undefined },
        headers: { authorization: 'Bearer token' }
      };
      const res = {
        json: jest.fn().mockReturnThis(),
        status: jest.fn().mockReturnThis()
      };

      const route = router.stack.find(
        (layer) => layer.route && layer.route.path === '/:targetId/my-submissions'
      );

      if (route && route.route.stack && route.route.stack[2]) {
        const handler = route.route.stack[2].handle;
        await handler(req, res);

        expect(res.status).toHaveBeenCalledWith(401);
      }
    });

    it('should return 404 when no submissions found', async () => {
      mockCircuitBreaker.fire.mockResolvedValue({
        json: null,
        status: 404
      });

      const req = {
        params: { targetId: 'target-123' },
        user: { sub: 'user-123' },
        headers: { authorization: 'Bearer token' }
      };
      const res = {
        json: jest.fn().mockReturnThis(),
        status: jest.fn().mockReturnThis()
      };

      const route = router.stack.find(
        (layer) => layer.route && layer.route.path === '/:targetId/my-submissions'
      );

      if (route && route.route.stack && route.route.stack[2]) {
        const handler = route.route.stack[2].handle;
        await handler(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
      }
    });
  });
});
