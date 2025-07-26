const { check, validationResult } = require("express-validator");
const User = require("../models/user");
const bcrypt = require("bcryptjs");

// Render login page
exports.getLogin = (req, res) => {
    res.render("auth/login", {
        pageTitle: "Login",
        currentPage: "login",
        isLoggedIn: false,
        errors: [],
        oldInput: { email: "" },
        user:{}
    });
};

// Render signup page
exports.getSignUp = (req, res) => {
    res.render("auth/signup", {
        pageTitle: "Signup",
        currentPage: "signup",
        isLoggedIn: false,
        errors: [],
        oldInput: {
            firstName: "",
            lastName: "",
            email: "",
            password: "",
            userType: "",
        },
        user:{}
    });
};

// Signup validation and handler
exports.postSignUp = [
    check("firstName")
        .trim()
        .isLength({ min: 2 })
        .withMessage("First Name should be at least 2 characters long")
        .matches(/^[A-Za-z\s]+$/)
        .withMessage("First Name should contain only alphabets"),

    check("lastName")
        .matches(/^[A-Za-z\s]+$/)
        .withMessage("Last Name should contain only alphabets"),

    check("email")
        .isEmail()
        .withMessage("Please enter a valid email")
        .normalizeEmail(),

    check("password")
        .isLength({ min: 8 })
        .withMessage("Password must be 8 characters long")
        .matches(/[a-z]/)
        .withMessage("Password must contain at least one lower case")
        .matches(/[A-Z]/)
        .withMessage("Password must contain at least one upper case")
        .matches(/[!@#$%^&*(),.?":<>]/)
        .withMessage("Password must contain at least one special character")
        .matches(/[0-9]/)
        .withMessage("Password must contain at least one number")
        .trim(),

    check("confirmPassword")
        .trim()
        .custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error("Passwords do not match");
            }
            return true;
        }),

    check("userType")
        .notEmpty()
        .withMessage("Please select a user type")
        .isIn(["guest", "host"])
        .withMessage("Invalid user type"),

    check("terms")
        .notEmpty()
        .withMessage("Please accept the terms and condition")
        .custom((value) => {
            if (value !== "on") {
                throw new Error("Please accept the terms and condition");
            }
            return true;
        }),

    async (req, res) => {
        const { firstName, lastName, email, password, userType } = req.body;
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(422).render("auth/signup", {
                pageTitle: "Signup",
                currentPage: "signup",
                isLoggedIn: false,
                errors: errors.array().map((error) => error.msg),
                oldInput: { firstName, lastName, email, password, userType },
                user:{}
            });
        }

        try {
            const hashedPassword = await bcrypt.hash(password, 12);
            const user = new User({
                firstName,
                lastName,
                email,
                password: hashedPassword,
                userType,
            });
            await user.save();
            res.redirect("/login");
        } catch (err) {
            res.status(422).render("auth/signup", {
                pageTitle: "Signup",
                currentPage: "signup",
                isLoggedIn: false,
                oldInput: { firstName, lastName, email, userType },
                errors: [err.message],
                user:{}
            });
        }
    },
];

// Login handler
exports.postLogin = async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
        return res.status(422).render("auth/login", {
            pageTitle: "Login",
            currentPage: "login",
            isLoggedIn: false,
            oldInput: { email },
            errors: ["User does not exist"],
            user:{}
        });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(422).render("auth/login", {
            pageTitle: "Login",
            currentPage: "login",
            isLoggedIn: false,
            oldInput: { email },
            errors: ["Invalid Password"],
            user:{}
        });
    }

    req.session.isLoggedIn = true;
    req.session.user = user;
    res.redirect("/");
};

// Logout handler
exports.postLogout = (req, res) => {
    req.session.destroy(() => {
        res.redirect("/login");
    });
};