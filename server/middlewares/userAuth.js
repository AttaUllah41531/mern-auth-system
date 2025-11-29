import jwt from 'jsonwebtoken';

const userAuth = async (req, res, next) => {
    const {token} = req.cookies;

    if(!token) {
        return res.status(405).json({success: false, message:'Not Authorized please login again'});
    }

    try {
      // decode the token to get the user id
      const tokenDecode =  jwt.verify(token,process.env.JWT_SECRET);

      if(tokenDecode.id){
        // send userId to controller 
        req.body.userId = tokenDecode.id;
      }else{
        return res.status(404).json({success: false, message: 'Not Authorized. Login again'});
      }

      next();

    } catch (error) {
        return res.status(500).json({success: false, message:error.message});
    }
};

export default userAuth;