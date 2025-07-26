const Home = require("../models/home");
const fs = require("fs");
exports.postAddHome = (req, res, next) => {
  const { houseName, price, location, rating, description } = req.body;
  console.log(houseName, price, location, rating, description);
  console.log(req.file);
  if (!req.file) {
    console.error("No file uploaded");
    return res.status(422).send("No file uploaded");
  }
  const photo = req.file.path;
  const newHome = new Home({
    houseName,
    price,
    location,
    rating,
    photo,
    description,
  });
  newHome.save().then(() => {
    console.log("Home added successfully");
  });
  res.redirect("/host/host-home-list");
};
exports.getHostHomes = (req, res) => {
  Home.find().then((registeredHomes) => {
    res.render("host/host-home-list", {
      registeredHomes: registeredHomes,
      pageTitle: "Host Homes List",
      currentPage: "host-homes",
      isLoggedIn: req.isLoggedIn,
      user: req.session.user,
    });
  });
};
exports.getAddHome = (req, res) => {
  res.render("host/edit-home", {
    pageTitle: "Add Home",
    currentPage: "addHome",
    editing: false,
    isLoggedIn: req.isLoggedIn,
    user: req.session.user,
  });
};
exports.getEditHome = (req, res) => {
  const homeId = req.params.homeId;
  const editing = req.query.editing === "true";
  Home.findById(homeId).then((home) => {
    if (!home) {
      return res.redirect("/host/host-home-list");
    }
    res.render("host/edit-home", {
      home: home,
      pageTitle: "Edit Your Home",
      currentPage: "host-homes",
      editing: editing,
      isLoggedIn: req.isLoggedIn,
      user: req.session.user,
    });
  });
};
exports.postEditHome = (req, res) => {
  const { houseName, price, location, rating, description, id } = req.body;
  Home.findById(id)
    .then((home) => {
      home.houseName = houseName;
      home.price = price;
      home.location = location;
      home.rating = rating;
      home.description = description;
      if (req.file) {
        fs.unlink(home.photo, (err) => {
          if (err) {
            console.log("Error while deleting file", err);
          }
        });
        home.photo = req.file.path;
      }
      home
        .save()
        .then((result) => {
          console.log("Home updated successfully", result);
        })
        .catch((err) => {
          console.error("Error updating home", err);
        });
      res.redirect("/host/host-home-list");
    })
    .catch((err) => {
      console.error("Error finding home", err);
    });
};
exports.postDeleteHome = (req, res) => {
  const homeId = req.params.homeId;
  Home.findByIdAndDelete(homeId)
    .then(() => {
      res.redirect("/host/host-home-list");
    })
    .catch((err) => {
      console.error("Error deleting home", err);
    });
};
