function sanitizeUser(user) {
  const obj = { ...user._doc };
  delete obj.password;
  delete obj.googleId;
  delete obj.__v;
  delete obj.createdAt;
  delete obj.updatedAt;
  return obj;
}

module.exports = { sanitizeUser}