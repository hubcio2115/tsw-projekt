/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export function checkAuthenticated(req, res, next) {
  if (req.method == "OPTIONS") return next();
  else if (!req.user) {
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
  if (!req.user) return next();
  return res.redirect("/");
}
