const User = require('../models/Users');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

const registerUser = async (req, res) => {
    const { username, email, password } = req.body;
    try {
        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ message: 'User already exists' });

        const user = await User.create({ username, email, password });
        res.status(201).json({ id: user._id, username: user.username, token: generateToken(user._id) });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (user && (await bcrypt.compare(password, user.password))) {
            res.json({ id: user._id, username: user.username, token: generateToken(user._id) });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const getProfile = async (req, res) => {
    const user = await User.findById(req.user.id);
    if (user) res.json(user);
    else res.status(404).json({ message: 'User not found' });
};

const updateProfile = async (req, res) => {
    const user = await User.findById(req.user.id);
    if (user) {
        user.username = req.body.username || user.username;
        user.email = req.body.email || user.email;
        user.address = req.body.address || user.address;
        const updatedUser = await user.save();
        res.json(updatedUser);
    } else res.status(404).json({ message: 'User not found' });
};

module.exports = { registerUser, loginUser, getProfile, updateProfile };
