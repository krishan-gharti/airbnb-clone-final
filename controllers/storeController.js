const Home = require("../models/home");
const User = require("../models/user");
exports.getHome = (req, res) => {
  Home.find().then(registeredHomes => {
    res.render("store/home-list", {
      registeredHomes: registeredHomes,
      pageTitle: "Homes List",
      currentPage: "homes",
      isLoggedIn: req.isLoggedIn,
      user:req.session.user
    });
  });
};

exports.getBookings = (req, res) => {
  res.render("store/bookings", {
    pageTitle: "My Bookings",
    isLoggedIn: req.isLoggedIn,
    currentPage: "bookings",
    user:req.session.user
  });
};

exports.getFavourites =async (req, res) => {
  const userId= req.session.user._id;
  const user= await User.findById(userId).populate('favourites');
      res.render("store/favourite-list", {
        favouriteHomes: user.favourites,
        pageTitle: "My Favourites",
        currentPage: "favourites",
        isLoggedIn: req.isLoggedIn,
        user:req.session.user
      });
};
exports.postAddToFavourites = async(req, res) => {
  const homeId = req.body.homeId;
  const userId=req.session.user._id;
  const user=await User.findById(userId);
  
  if(!user.favourites.includes(homeId)){
  user.favourites.push(homeId);
  await user.save();
  }
  res.redirect('/favourites');
}
exports.postDeleteFavourite =async (req, res, next) => {
  const homeId = req.params.homeId;
  const userId=req.session.user._id;
  const user=await User.findById(userId);
  if(user.favourites.includes(homeId)){
    user.favourites=user.favourites.filter(fav => fav!=homeId);
    await user.save();
  }
  res.redirect('/favourites');
};
exports.getIndex = (req, res) => {
  Home.find().then(registeredHomes => {
    res.render("store/index", {
      registeredHomes: registeredHomes,
      pageTitle: "airbnb Home",
      currentPage: "index",
      isLoggedIn: req.isLoggedIn,
      user:req.session.user
    });
  });
};
exports.getHomeDetails = (req, res) => {
  const homeId = req.params.homeId;
  console.log(homeId);
  Home.findById(homeId).then(home => {
    if (!home) {
      return res.redirect("/homes");
    } else {
      res.render("store/home-detail", {
        home: home,
        pageTitle: "Homes Details",
        currentPage: "homes",
        isLoggedIn: req.isLoggedIn,
        user:req.session.user
      });
    }
  });
};
