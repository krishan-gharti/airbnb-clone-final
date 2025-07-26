exports.get404 = (req, res, next) => {
  res
    .status(404)
    .render("pageNotFound", {
      pageTitle: "404 page not found",
      currentPage: "pageNotFound",
      isLoggedIn: req.isLoggedIn,
      user: req.session.user,
    });
};
