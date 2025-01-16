const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
// Configure Cloudinary for unsigned upload
const cld = cloudinary;
cld.config({
  cloud_name: process.env.CLOUDINARY_API_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cld,
  params: {
    folder: "YelpCamp", // Folder name in Cloudinary
    allowed_formats: ["jpeg", "png"], // Allowed file types
  },
});

module.exports = {
  cld,
  storage,
};
