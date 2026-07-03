import jwt from "jsonwebtoken";

const generateRefreshToken = (id, role) => {
    return jwt.sign(
        { id, role },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: "7d" }
    );
};

export default generateRefreshToken;