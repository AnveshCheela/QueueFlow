import jwt from 'jsonwebtoken';

const auth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.managerId = decoded.managerId;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
};

export default auth;
