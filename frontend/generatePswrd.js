import bcrypt from "bcryptjs";

const plainPassword = "123456"; // choose new password
const salt = await bcrypt.genSalt(10);
const hashed = await bcrypt.hash(plainPassword, salt);

console.log(hashed); // copy this hash


// {"_id":{"$oid":"68b59dff50f4c680951abcdf"},"name":"master4","email":"master4@gmail.com","password":"$2b$10$n/bV7PaBxf9m5qijCHuZmu1DMBpAToApD.EPpA17Ku/V0E4.XGzWy","role":"admin","isApproved":false,"createdAt":{"$date":{"$numberLong":"1756732927612"}},"updatedAt":{"$date":{"$numberLong":"1756732927612"}},"__v":{"$numberInt":"0"}}