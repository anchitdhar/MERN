const router = require("express").Router();
const User = require('../models/userModel')
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken');

router.post('/register', async (req, res) => {
    try {
        let { email, password, passwordCheck, displayName } = req.body;
        
        if (!email || !password || !passwordCheck)
            return res.status(400).json({ msg: "Fill all fields" });
        if (password.length < 5)
            return res.status(400).json({ msg: "Atleast 6 characters long" });
        if (password != passwordCheck)
            return res.status(400).json({ msg: "Enter same password" });
        const existingUser = await User.findOne({ email: email })
        if (existingUser)
            return res.status(400).json({ msg: "An account still exist" });
        if (!displayName)
            displayName = email;
        
        const salt = await bcrypt.genSalt();
        const passwordHash = await bcrypt.hash(password, salt);

        const newUser = new User({
            email,
            password: passwordHash,
            displayName
        });

        const savedUser = await newUser.save();
        res.json(savedUser);
        }
        catch (err) {
        res.status(500).json({ error: err.message });
        }
});

router.get("/",auth,async(req,res) => {
	const user =await User.findbyId(req.user);
	res.json(user);
});

module.exports= router;


router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password)
            return res.status(400).json({ msg: "Enter all fields" });
        const user = await User.findOne({ email: email });
        if (!user)
            return res.status(400).json({ msg: "No account with this email" });
    
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch)
            return res.status(400).json({ msg: "invalid credentials" });
        
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
        res.json({
            token,
            user: {
                id: user._id,
                displayName: user.displayName,
                email:user.email,
                
            }
        })


    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
