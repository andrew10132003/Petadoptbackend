const cloudinary = require("../config/cloudinary");
const { Readable } = require("node:stream");

const uploadToCloudinary = (file, folder = "pet-adoption") => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "auto",
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }

        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          resourceType: result.resource_type,
          fileName: file.originalname,
        });
      }
    );

    Readable.from(file.buffer).pipe(uploadStream);
  });
};

module.exports = { uploadToCloudinary };