module.exports = (req, res, next) => {
  const dateFields = ['startDate', 'deadline', 'endDate'];
  for (const field of dateFields) {
    if (req.body && req.body[field] !== undefined) {
      const val = req.body[field];
      if (val === 'Invalid date' || val === '' || val === null || val === 'null') {
        req.body[field] = null;
      } else if (typeof val === 'string') {
        const parsed = Date.parse(val);
        if (isNaN(parsed)) {
          req.body[field] = null;
        }
      }
    }
  }
  next();
};
