export const getNotifications = async (req, res, next) => {
  try {
    res.json({ data: [] });
  } catch (err) {
    next(err);
  }
};

export default { getNotifications };
