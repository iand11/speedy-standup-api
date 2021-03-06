const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/user-model");
const { handleValidationErrors, checkValidations } = require('../util/validation')

exports.create = async (req, res) => {
  const errors = checkValidations(req);
  if (!errors.isEmpty()) handleValidationErrors(res, errors);

  const { name, email, password } = req.body;
  try {
    let user = await User.findOne({ email });

    if (user) {
      return res.status(400).json({ msg: "User Already Exists" });
    }

    user = new User({ name, email, password });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    const payload = {
      user: {
        id: user.id
      }
    };

    jwt.sign(payload, "randomString", { expiresIn: 10000 },
      (err, token) => {
        const { name, email, id } = user;
        if (err) throw err;
        res.status(200).json({ token, name, email, id });
      }
    );
  } catch (err) {
    console.log(err.message);
    res.status(500).send("Error in Saving");
  }
}

exports.login = async (req, res) => {
  const errors = checkValidations(req);
  if (!errors.isEmpty()) handleValidationErrors(res, errors);

  const { email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User Does Not Exist" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Incorrect Combination of Email and Password" });

    const payload = {
      user: {
        id: user.id
      }
    };

    jwt.sign(payload, "randomString", { expiresIn: 3600 },
      (err, token) => {
        const { name, email, id } = user;
        if (err) throw err;
        res.status(200).json({ token, id, name, email });
      }
    );
  } catch (e) {
    console.error(e);
    res.status(500).json({
      message: "Server Error"
    });
  }
}

exports.me = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json(user);
  } catch (e) {
    res.status(401).send({ message: "Error in Fetching user" });
  }
}