import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
 try{
     const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized:No token provided" });
  }
    const token = authHeader.split(" ")[1];
    let decoded;
     try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Custom jwt verified")
  }catch(custonJwtError){
    try{
        decoded = jwt.verify(token, process.env.SUPABASE_JWT_SECRET);
    console.log("Supabase jwt verified")

    req.user={
        id:decoded.sub,
        email:decoded.email,
    };
    return next();
    }catch(supabaseJwtError){
        console.error("Both Jwt failed",{supabase:supabaseJwtError.message})
        return res.status(401).json({error:"Invalid token"})
    }
  }
  req.user=decoded;
  next();
 }catch(err){
    console.error('authmiddleware error:', err)
    return res.status(401).json({error:"Token verificatation failed"})
 }
};
