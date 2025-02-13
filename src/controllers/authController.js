exports.authTest = (req, res) => {
    res.json({ message: 'Authenticated!', user: req.user });
  };