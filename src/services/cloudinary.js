// services/cloudinary.js
const cloudinary = require('cloudinary').v2;
const fs = require('fs');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const subirPdfACloudinary = async (filePath) => {
  const result = await cloudinary.uploader.upload(filePath, {
    resource_type: "raw", // necesario para PDF
    folder: "documentos",
    use_filename: true,
    unique_filename: false
  });
  fs.unlinkSync(filePath); // Borra el archivo temporal
  return result;
};

module.exports = { subirPdfACloudinary };
