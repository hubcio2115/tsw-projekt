/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export function checkAuthenticated(req, res, next) {
  const authed = req.isAuthenticated();

  if (!authed) {
    res.status(403);
    return res.send({ message: "Unauthorized." });
  }
  return next();
}

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export function checkNotAuthenticated(req, res, next) {
  const authed = req.isAuthenticated();

  if (!authed) return next();
  return res.redirect("/");
}
