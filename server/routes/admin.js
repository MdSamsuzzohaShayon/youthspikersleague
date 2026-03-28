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
router.post('/register',
    ensureAuth,
    check('username', "Must input a name").notEmpty(),
    // username must be an email
    check('email', "Email must not empty and a valid email").notEmpty().isEmail(),
    // password must be at least 5 chars long
    check('password', "Password should be more than 5 character long").isLength({ min: 5 }),
    // check('role', "You must select a role").notEmpty(),
    async (req, res, next) => {
        const allErr = new Array();

        if (req?.userRole !== SUPER) {
            allErr.push({ msg: "You are not a super user" });
            return res.status(400).json({ errors: allErr });
        }


        const { email, username, password } = req.body;
        const valErrs = validationResult(req);
        if (!valErrs.isEmpty()) {
            const errArr = allErr.concat(valErrs.errors);
            return res.status(400).json({ errors: errArr });
        }
        // 1️⃣ Check if email already exists
        const staffExist = await Admin.findOne({ email });
        if (staffExist) {
            allErr.push({ msg: "Email already exists" });
            return res.status(400).json({ errors: allErr });
        }

        // 2️⃣ Generate salt and hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 3️⃣ Save admin to DB
        const newAdmin = await Admin.create({
            name: username,
            email,
            role: req?.userRole || GENERAL,
            password: hashedPassword,
        });

        return res.status(201).json({ admin: newAdmin });
    });

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
    } catch (err) {
        console.log(err);
        return res.status(500).json({ msg: 'Something went wrong', err });
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
        console.log(error);
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
                res.status(200).json({ deleteAdmin });
            } catch (error) {
                console.log(error);
            }
        }
    } else {
        errors.push("You are not a super user")
        res.status(400).json({ errors });
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
