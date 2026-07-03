import jwt from "jsonwebtoken";

const generateAccessToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: "15m" });
};

export default generateAccessToken;
