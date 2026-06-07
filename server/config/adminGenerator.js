const bcrypt = require('bcryptjs');
const { GENERAL, SUPER } = require("../utils/Role");
const Admin = require('../models/Admin');

async function adminGenerator() {

    const email = process.env.ADMIN_EMAIL;
    const username = process.env.ADMIN_USERNAME;
    const password = process.env.ADMIN_PASSWORD;

    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const userObj = { name: username, email, role: SUPER, password: hashedPassword };
        const adminExist = await Admin.findOne({ email });
        if (adminExist) {
            const updateAdmin = await Admin.updateOne({ email }, userObj);
            console.log("updateAdmin -> ", updateAdmin);
        } else {
            const createAdmin = await Admin.create(userObj);
            console.log("createAdmin -> ", createAdmin);
        }
    } catch (error) {
        console.error(error);
    }
}

module.exports = adminGenerator;