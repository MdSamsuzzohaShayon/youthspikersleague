const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


const { sendUser, replaceKeys } = require('../utils/helpers');
const { ensureAuth, ensureGuast } = require('../config/auth');

const { GENERAL, SUPER } = require("../utils/Role");

const Admin = require('../models/Admin');
const Event = require('../models/Event');


// curl --location -X POST 'http://localhost:4000/api/admin/register' -H 'Content-Type: application/json' -H 'Cookie: connect.sid=s%3AzL3n82ulv33g6ZGI9JI866DTawUrP9sX.u13Y%2Fn7Sf0XJLRNB7%2Bxw7RTwpVqeRIQkeiPG%2BkIY2iE' --data-raw '{ "email": "ronaldo@mutd.com", "username": "Ronaldo",  "password": "Ronaldo1234" }'
/* ⛏️⛏️ ALL ROUTES WILL BE PROTECTED EXCEPT LOGIN ROUTE  */
router.post(
    "/register",
    ensureAuth,
    check("username", "Must input a name").notEmpty(),
    check("email", "Email must not empty and a valid email")
        .notEmpty()
        .isEmail(),
    check("password", "Password should be more than 5 character long")
        .isLength({ min: 5 }),
    async (req, res, next) => {
        try {
            const allErr = [];

            // Check authorization
            if (req.userRole !== SUPER) {
                allErr.push({ msg: "You are not a super user" });
                return res.status(403).json({ errors: allErr });
            }

            // Validate request
            const validationErrors = validationResult(req);

            if (!validationErrors.isEmpty()) {
                return res.status(400).json({
                    errors: [...allErr, ...validationErrors.array()],
                });
            }

            const { email, username, password } = req.body;

            // Check if email already exists
            const existingAdmin = await Admin.findOne({ email });

            if (existingAdmin) {
                allErr.push({ msg: "Email already exist" });
                return res.status(400).json({ errors: allErr });
            }

            // Hash password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            // Create admin
            const admin = await Admin.create({
                name: username,
                email,
                role: GENERAL,
                password: hashedPassword,
            });

            return res.status(201).json({ admin });
        } catch (error) {
            console.error(error);
        return res.status(500).json({ msg: error?.message || "Internal Server Error" });

        }
    }
);

/* ⛏️⛏️ LOGIN USERS ➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖  */
router.post('/login', check('email').notEmpty(), check('password').notEmpty(), async (req, res) => {
    const errors = validationResult(req);
    // https://github.com/MdSamsuzzohaShayon/mern-spikeball-tournament/blob/master/server/routes/admin.js
    if (!errors.isEmpty()) {
        return res.status(406).json({ error: JSON.stringify(errors.array()) });
    }

    const { email, password } = req.body;

    try {
        const userExist = await Admin.findOne({ email });
        if (!userExist) return res.status(404).json({ msg: "Admin doesn't exist" });

        const isPasswordCorrect = await bcrypt.compare(password, userExist.password);
        if (!isPasswordCorrect) {
            return res.status(406).json({ msg: 'Invalid credentials' });
        }

        const userDetailResponse = {
            _id: userExist._id,
            email: userExist.email,
            role: userExist.role,
            name: userExist.name,
        };
        const accessToken = jwt.sign(userDetailResponse, process.env.JWT_SECRET, {
            expiresIn: '1h',
        });

        return res.status(200).json({ msg: 'Logged in successfully', accessToken, user: userDetailResponse });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ msg: error?.message || "Internal Server Error" });
    }
});


router.get('/list', ensureAuth, async (req, res, next) => {
    try {
        const admin = await Admin.find();
        const newAdmins = admin.map((a, i) => {
            return {
                name: a.name,
                role: a.role,
                _id: a._id,
                email: a.email
            }
        });
        res.status(200).json({ admin: newAdmins });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ msg: error?.message || "Internal Server Error" });
    }
});

router.delete("/delete/:adminID", ensureAuth, async (req, res, next) => {
    const errors = [];
    if (req.userRole === SUPER) {
        if (req.params.adminID === req.userId) {
            errors.push("Can't delete a super user");
            res.status(400).json({ errors });
        } else {
            try {
                const deleteAdmin = await Admin.deleteOne({ _id: req.params.adminID });
                return res.status(200).json({ deleteAdmin });
            } catch (error) {
                console.error(error);
        return res.status(500).json({ msg: error?.message || "Internal Server Error" });
            }
        }
    } else {
        errors.push("You are not a super user")
        return res.status(400).json({ errors });
    }
});


/* ⛏️⛏️ LOGOUT USERS ➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖  */
router.get('/logout', ensureAuth, (req, res) => {
    req.session.destroy(null);
    req.logout(function (err) { });
    // console.log(req.user);
    res.status(200).json({ user: null });
});






/* ⛏️⛏️ LIST ALL ADMINS, EVENTS, PARTICIPANTS ➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖  */
router.get('/dashboard', ensureAuth, (req, res, next) => {
    res.status(200).json({ user: sendUser(req.user) });
});









module.exports = router;
