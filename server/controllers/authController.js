import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import userModel from '../models/userModel.js';
import transporter from '../config/nodemailer.js';

  // <** register function **> 
export const register = async (req, res)=> {
    const {name, email, password} = req.body;

    if(!name || !email || !password) {
        return res.status(400).json({success:false, message:'Missing details'});
    }

    try {
        // ** check if user already exists **
        const existingUser = await userModel.findOne({email});
        if(existingUser) {
            return res.status(400).json({success:false, message:'User already exists'});
        }
        // ** making password hashed **
        const hashedPassword = await bcrypt.hash(password, 10);
        // ** save user details **
        const user = new userModel({name,email,password: hashedPassword});
        await user.save();

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        // sending welocme email 
        const mailOptions = {
          from: process.env.SENDER_EMAIL,
          to: email,
          subject: 'Welcome to MERN Auth',
          text: `Welcome to MERN Auth. Your account has been created with email id: ${email}`
        };

        await transporter.sendMail(mailOptions);
        return res.status(200).json({success:true,token:token, message:'User registered successfully'});
        
    } catch (error) {
        return res.status(500).json({success:false, message:error.message});
    }
}

  // <** Login function **> 
export const login = async (req, res) => {
    const {email, password} = req.body;

    if(!email || !password) {
        return res.status(400).json({success:false, message:'Email and Password required'});
    }

    try {
        // ** check if user exists **
        const user = await userModel.findOne({email});
        if(!user) {
            return res.status(400).json({success:false, message:'Invalid Email'});
        }
        // ** check if password is correct **
        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch) {
            return res.status(400).json({success:false, message:'Invalid Password'});
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        return res.status(200).json({success:true,token:token, message:'User logged in successfully'});

    } catch (error) {
        return res.status(500).json({success:false, message:error.message});
    }
}

 // <** Logout function **> 
export const logout = async (req, res) => { 
    try {
        res.clearCookie("token", {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        });

        return res.status(200).json({success: true, message:'Logged Out'});
    } catch (error) {
        return res.status(500).json({success:false, message:error.message});
    }
};

 // <** send verification otp to the user email **> 
export const sendVerifyOtp = async (req, res) => {
    try {
      const { userId } = req.body;

      const user = await userModel.findById(userId);

      // check if account already verified
      if (user.isAccountVerified) {
        return res
          .status(400)
          .send({ success: false, message: "Account Already Verified" });
      }
      // generate otp code and save it in user account
      const otp = String(Math.floor(100000 + Math.random() * 900000));
      user.verifyOtp = otp;
      user.verifyOtpExpireAt = Date.now() + 24 * 60 * 60 * 1000;
      await user.save();

      // sending otp code to user email
      const mailOptions = {
        from: process.env.SENDER_EMAIL,
        to: user.email,
        subject: "Account Verification OTP",
        text: `Your OTP is ${otp}. Verify your account using this OTP`,
      };

      await transporter.sendMail(mailOptions);
      return res.status(200).json({success: true, message:'Verification OTP Sent on Email'});

    } catch (error) {
        return res.status(500).json({success: false,message: error.message});
    }
};

 // <** verify user email using otp **> 
export const verifyEmail = async (req, res)=> {
    const {userId, otp} = req.body;
    
    if(!userId || !otp) {
        return res.status(400).json({success: false, message: 'Missing Details'})
    }

    try {
        const user = await userModel.findById(userId);

        if(!user){
            return res.status(404).json({success: false, message: 'User not found'});
        }
        // checking otp 
        if(user.verifyOtp === '' || user.verifyOtp !== otp) {
            return res.status(404).json({success: false, message: 'Invalid OTP'});
        }
        // checking otp expiry 
        if(user.verifyOtpExpireAt < Date.now()){
            return res.status(400).json({success: false, message: 'OTP expired'});
        }
        // account verifing in database 
        user.isAccountVerified = true;
        user.verifyOtp = '';
        user.verifyOtpExpireAt = 0;
        await user.save();

        return res.status(200).json({success: true, message: 'Email verified Successfully'});

    } catch (error) {
        return res.status(400).json({success: false, message:error.message});
    }
}

 // <** Check if user is authenticated **> 
export const isAuthenticated = async (req, res) => {
    try {
        return res.status(200).json({success: true, message:'User is authenticated'});
    } catch (error) {
        return res.status(500).json({success:false, message:error.message});
    }
};

 // <** Send password reset otp **> 
export const sendResetOtp = async (req, res) => {
    const {email} = req.body;

    if(!email) {
        return res.status(400).json({success: false, message:'Email is required'});
    }

    try {
      const user = await userModel.findOne({ email });
      if (!user) {
        return res
          .status(400)
          .json({ success: false, message: "User not found" });
      }

      // generate otp code for reset password
      const otp = String(Math.floor(100000 + Math.random() * 900000));
      user.resetOtp = otp;
      user.resetOtpExpireAt = Date.now() + 15 * 60 * 1000;
      await user.save();

      // sending otp code to user email
      const mailOptions = {
        from: process.env.SENDER_EMAIL,
        to: user.email,
        subject: "Password Reset OTP",
        text: `Your OTP for resetting your password is ${otp}. Use this OTP to proceed with resetting your password.`,
      };

      await transporter.sendMail(mailOptions);
      return res.status(200).json({ success: true, message: "OTP Sent to Email" });
    } catch (error) {
       return res.status(500).json({success: false, message: error.message});
    }
};

 // <** Reset User Password **> 
export const resetPassword = async (req, res) => {
    const {email, otp, newPassword} = req.body;

    if(!email || !otp || !newPassword) {
        return res.status(401).send({success: false, message:'Email, OTP and new password are required'});
    }

    try {

        const user = await userModel.findOne({email});
        if(!user) {
            return res.status(404).send({success: false, message:'User not found'});
        }

        if(user.resetOtp === "" || user.resetOtp !== otp){
            return res.status(400).send({success: false, message:'Invalid OTP'});
        }

        if(user.resetOtpExpireAt < Date.now()) {
            return res.status(400).json({success: false, message:'Otp Expired'});
        }

        const hashedPassword = await bcrypt.hash(newPassword,10);

        user.password = hashedPassword;
        user.resetOtp = '';
        user.resetOtpExpireAt = 0;
        await user.save();

        return res.status(200).json({success:true, message:'Password reset successfully'});
        
    } catch (error) {
        return res.status(500).send({success: false, message: error.message});
    }
};
