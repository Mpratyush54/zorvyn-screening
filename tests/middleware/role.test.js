const { checkRole } = require('../../middleware/role.middleware');

describe('Role Middleware', () => {
    let mockReq;
    let mockRes;
    let nextFunction;

    beforeEach(() => {
        mockReq = {};
        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
        };
        nextFunction = jest.fn();
    });

    test('should return 403 if req.user is missing', () => {
        const middleware = checkRole(['ADMIN']);
        middleware(mockReq, mockRes, nextFunction);

        expect(mockRes.status).toHaveBeenCalledWith(403);
        expect(mockRes.json).toHaveBeenCalledWith(
            expect.objectContaining({ status: 'error', message: 'Access denied. Insufficient permissions.' })
        );
        expect(nextFunction).not.toHaveBeenCalled();
    });

    test('should return 403 if user role is not allowed', () => {
        mockReq.user = { role: 'VIEWER' };
        const middleware = checkRole(['ADMIN']);
        middleware(mockReq, mockRes, nextFunction);

        expect(mockRes.status).toHaveBeenCalledWith(403);
        expect(nextFunction).not.toHaveBeenCalled();
    });

    test('should call next if user role is allowed', () => {
        mockReq.user = { role: 'ADMIN' };
        const middleware = checkRole(['ADMIN']);
        middleware(mockReq, mockRes, nextFunction);

        expect(nextFunction).toHaveBeenCalled();
        expect(mockRes.status).not.toHaveBeenCalled();
    });
});
