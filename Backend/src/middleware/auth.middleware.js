import jwt from 'jsonwebtoken';
import User from '../models/Users.model.js';

/**
 * @desc    Verify JWT and Attach User Context to Request
 * Logic: Checks 'Authorization' header for a valid Bearer token.
 */
export const protect = async (req, res, next) => {
  try {
    // Extract token from header: "Bearer <token>"
    const authHeader = req.header('Authorization');
    let token = authHeader?.startsWith('Bearer ') ? authHeader.replace('Bearer ', '') : null;

    // 🛡️ SECURITY GUARD: Filter out zombie stringified values passed by uninitialized frontends
    if (!token || token === 'null' || token === 'undefined' || token.trim() === '') {
      return res.status(401).json({ 
        success: false, 
        msg: 'No token found or authorization signatures are uninitialized. Access denied.' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 🛡️ SUPER ADMIN SHORT-CIRCUIT SAFETY
    // If the token belongs to the environment fallback super admin, bypass DB lookup entirely
    if (decoded.id === 'admin_default') {
      req.user = {
        id: 'admin_default',
        _id: 'admin_default',
        role: 'admin'
      };
      return next();
    }

    // 🔍 OPERATIONAL USER STATE INTEGRITY CHECK
    // Verify that the user still exists and hasn't been deactivated since token issuance
    const activeUser = await User.findById(decoded.id).select('-password');
    if (!activeUser) {
      return res.status(401).json({ 
        success: false, 
        msg: 'User session no longer exists or the active account was removed.' 
      });
    }

    if (!activeUser.isActive) {
      return res.status(403).json({ 
        success: false, 
        msg: 'Access denied. This workspace account has been deactivated.' 
      });
    }

    // 🛡️ PROFILE PARSING ALIGNMENT FIX:
    // Append both 'id' string context and raw Mongo '_id' fields onto the request object.
    // This blocks downstream controller execution stacks (like getMe) from throwing 500 errors.
    req.user = {
      id: String(activeUser._id),
      _id: activeUser._id,
      role: activeUser.role
    };
    
    next();
  } catch (err) {
    // Gracefully transform invalid signatures or expirations into explicit 401s
    return res.status(401).json({ 
      success: false, 
      msg: 'Token is not valid or has expired.', 
      error: err.message 
    });
  }
};

/**
 * @desc    Restrict route access based on specific roles
 * @param   {Array} roles - Allowed roles e.g., ['admin', 'manager']
 */
export const authorize = (roles = []) => {
  return (req, res, next) => {
    // If no roles are specified, any authenticated user can pass
    if (roles.length === 0) return next();

    // Verify if the user attached by 'protect' has an allowed role
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false,
        msg: `Access denied: Role '${req.user?.role || 'unknown'}' is not authorized for this route`
      });
    }

    next();
  };
};