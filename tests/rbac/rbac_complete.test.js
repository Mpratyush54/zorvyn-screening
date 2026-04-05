const { checkRole } = require('../../middleware/role.middleware');
const ROLES = require('../../constants/roles');

describe('RBAC Complete Test Suite', () => {
  let mockReq;
  let mockRes;
  let nextFunction;

  beforeEach(() => {
    mockReq = {
      user: null
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    nextFunction = jest.fn();
  });

  // ================= VIEWER =================
  describe('VIEWER Role Permissions', () => {
    const allowedRoles = [ROLES.ADMIN, ROLES.ANALYST, ROLES.VIEWER];

    test('should ALLOW Viewer to access dashboard summary', () => {
      mockReq.user = { role: ROLES.VIEWER };

      checkRole(allowedRoles)(mockReq, mockRes, nextFunction);

      expect(nextFunction).toHaveBeenCalled();
    });

    test('should DENY Viewer from managing records', () => {
      mockReq.user = { role: ROLES.VIEWER };

      checkRole([ROLES.ADMIN])(mockReq, mockRes, nextFunction);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: expect.any(String) })
      );
      expect(nextFunction).not.toHaveBeenCalled();
    });

  });

  // ================= ANALYST =================
  describe('ANALYST Role Permissions', () => {
    test('should ALLOW Analyst to view records', () => {
      mockReq.user = { role: ROLES.ANALYST };

      checkRole([ROLES.ADMIN, ROLES.ANALYST])(mockReq, mockRes, nextFunction);

      expect(nextFunction).toHaveBeenCalled();
    });

    test('should DENY Analyst from admin actions', () => {
      mockReq.user = { role: ROLES.ANALYST };

      checkRole([ROLES.ADMIN])(mockReq, mockRes, nextFunction);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(nextFunction).not.toHaveBeenCalled();
    });
  });

  // ================= ADMIN =================
  describe('ADMIN Role Permissions', () => {

    test('should ALLOW Admin to perform admin-only action', () => {
      mockReq.user = { role: ROLES.ADMIN };

      checkRole([ROLES.ADMIN])(mockReq, mockRes, nextFunction);

      expect(nextFunction).toHaveBeenCalled();
    });

    test('should ALLOW Admin to access all roles endpoints', () => {
      mockReq.user = { role: ROLES.ADMIN };

      checkRole([ROLES.ADMIN, ROLES.ANALYST, ROLES.VIEWER])(mockReq, mockRes, nextFunction);

      expect(nextFunction).toHaveBeenCalled();
    });
  });

  // ================= EDGE CASES =================
  describe('Edge Cases and Security', () => {

    test('should DENY access if user is not present', () => {
      mockReq.user = null;

      checkRole([ROLES.ADMIN])(mockReq, mockRes, nextFunction);

      expect(mockRes.status).toHaveBeenCalled();
      expect(nextFunction).not.toHaveBeenCalled();
    });

    test('should DENY access if role is undefined or null', () => {
      mockReq.user = { role: null };

      checkRole([ROLES.ADMIN])(mockReq, mockRes, nextFunction);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(nextFunction).not.toHaveBeenCalled();
    });

    test('should DENY access if role is invalid type', () => {
      mockReq.user = { role: 123 };

      checkRole([ROLES.ADMIN])(mockReq, mockRes, nextFunction);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(nextFunction).not.toHaveBeenCalled();
    });

    test('should DENY access if role is malicious (__proto__)', () => {
      mockReq.user = { role: '__proto__' };

      checkRole([ROLES.ADMIN])(mockReq, mockRes, nextFunction);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(nextFunction).not.toHaveBeenCalled();
    });

    test('should DENY access if role case does not match', () => {
      mockReq.user = { role: 'admin' }; // lowercase

      checkRole([ROLES.ADMIN])(mockReq, mockRes, nextFunction);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(nextFunction).not.toHaveBeenCalled();
    });

    test('should DENY access if allowed roles array is empty', () => {
      mockReq.user = { role: ROLES.ADMIN };

      checkRole([])(mockReq, mockRes, nextFunction);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(nextFunction).not.toHaveBeenCalled();
    });
    test('should deny access if role is null', () => {
      mockReq.user = { role: null };

      const middleware = checkRole(['ADMIN']);
      middleware(mockReq, mockRes, nextFunction);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(nextFunction).not.toHaveBeenCalled();
    });
    test('should deny access if role is not a string', () => {
      mockReq.user = { role: 123 };

      const middleware = checkRole(['ADMIN']);
      middleware(mockReq, mockRes, nextFunction);

      expect(mockRes.status).toHaveBeenCalledWith(403);
    });
    test('should deny access if role case does not match', () => {
      mockReq.user = { role: 'admin' }; // lowercase

      const middleware = checkRole(['ADMIN']);
      middleware(mockReq, mockRes, nextFunction);

      expect(mockRes.status).toHaveBeenCalledWith(403);
    });
    test('should allow access if role is in allowed roles list', () => {
      mockReq.user = { role: 'ANALYST' };

      const middleware = checkRole(['ADMIN', 'ANALYST']);
      middleware(mockReq, mockRes, nextFunction);

      expect(nextFunction).toHaveBeenCalled();
    });
    test('should deny access if allowed roles array is empty', () => {
      mockReq.user = { role: 'ADMIN' };

      const middleware = checkRole([]);
      middleware(mockReq, mockRes, nextFunction);

      expect(mockRes.status).toHaveBeenCalledWith(403);
    });
    test('should deny access for malicious role (__proto__)', () => {
      mockReq.user = { role: '__proto__' };

      const middleware = checkRole(['ADMIN']);
      middleware(mockReq, mockRes, nextFunction);

      expect(mockRes.status).toHaveBeenCalledWith(403);
    });
  });

});


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

  // ================= BASIC =================
  test('should return 403 if req.user is missing', () => {
    const middleware = checkRole(['ADMIN']);
    middleware(mockReq, mockRes, nextFunction);

    expect(mockRes.status).toHaveBeenCalledWith(403);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'error',
        message: expect.any(String)
      })
    );
    expect(nextFunction).not.toHaveBeenCalled();
  });

  test('should return 403 if user role is not allowed', () => {
    mockReq.user = { role: 'VIEWER' };

    const middleware = checkRole(['ADMIN']);
    middleware(mockReq, mockRes, nextFunction);

    expect(mockRes.status).toHaveBeenCalledWith(403);
    expect(mockRes.json).toHaveBeenCalled();
    expect(nextFunction).not.toHaveBeenCalled();
  });

  test('should call next if user role is allowed', () => {
    mockReq.user = { role: 'ADMIN' };

    const middleware = checkRole(['ADMIN']);
    middleware(mockReq, mockRes, nextFunction);

    expect(nextFunction).toHaveBeenCalled();
    expect(mockRes.status).not.toHaveBeenCalled();
  });

  // ================= MULTIPLE ROLES =================
  test('should allow access if role is in allowed roles list', () => {
    mockReq.user = { role: 'ANALYST' };

    const middleware = checkRole(['ADMIN', 'ANALYST']);
    middleware(mockReq, mockRes, nextFunction);

    expect(nextFunction).toHaveBeenCalled();
  });

  // ================= EDGE CASES =================
  test('should deny access if role is null', () => {
    mockReq.user = { role: null };

    const middleware = checkRole(['ADMIN']);
    middleware(mockReq, mockRes, nextFunction);

    expect(mockRes.status).toHaveBeenCalledWith(403);
    expect(nextFunction).not.toHaveBeenCalled();
  });

  test('should deny access if role is undefined', () => {
    mockReq.user = { role: undefined };

    const middleware = checkRole(['ADMIN']);
    middleware(mockReq, mockRes, nextFunction);

    expect(mockRes.status).toHaveBeenCalledWith(403);
    expect(nextFunction).not.toHaveBeenCalled();
  });

  test('should deny access if role is not a string', () => {
    mockReq.user = { role: 123 };

    const middleware = checkRole(['ADMIN']);
    middleware(mockReq, mockRes, nextFunction);

    expect(mockRes.status).toHaveBeenCalledWith(403);
    expect(nextFunction).not.toHaveBeenCalled();
  });

  test('should deny access if role case does not match', () => {
    mockReq.user = { role: 'admin' }; // lowercase

    const middleware = checkRole(['ADMIN']);
    middleware(mockReq, mockRes, nextFunction);

    expect(mockRes.status).toHaveBeenCalledWith(403);
    expect(nextFunction).not.toHaveBeenCalled();
  });

  test('should deny access for malicious role (__proto__)', () => {
    mockReq.user = { role: '__proto__' };

    const middleware = checkRole(['ADMIN']);
    middleware(mockReq, mockRes, nextFunction);

    expect(mockRes.status).toHaveBeenCalledWith(403);
    expect(nextFunction).not.toHaveBeenCalled();
  });

  test('should deny access if allowed roles array is empty', () => {
    mockReq.user = { role: 'ADMIN' };

    const middleware = checkRole([]);
    middleware(mockReq, mockRes, nextFunction);

    expect(mockRes.status).toHaveBeenCalledWith(403);
    expect(nextFunction).not.toHaveBeenCalled();
  });

  // ================= RESPONSE CONSISTENCY =================
  test('should always return consistent error response', () => {
    mockReq.user = { role: 'VIEWER' };

    const middleware = checkRole(['ADMIN']);
    middleware(mockReq, mockRes, nextFunction);

    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'error',
        message: expect.any(String)
      })
    );
  });
});


