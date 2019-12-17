const aws = require('aws-sdk')
let multer = require('multer')
let multerS3 = require('multer-s3-with-transforms')

const config = require('../config/config');

const sharp = require('sharp');

aws.config.update({
    secretAccessKey: config.aws_secret,
    accessKeyId: config.aws_key,
    region: config.aws_region
});

const s3 = new aws.S3()

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
      cb(null, true);
  } else {
      cb(new Error("Format du fichier invalide !"), false);
  }
};

const upload = multer({
    fileFilter,
    storage: multerS3({
        s3: s3,
        bucket: 'fr.dorpaxio.sausage',
        acl: 'public-read',
        transforms: () => sharp().resize(200,200),
        metadata: function (req, file, cb) {
            cb(null, {fieldName: 'PROFILE_PICTURE'});
        },
        key: function (req, file, cb) {
            cb(null, req.pseudo);
        },
    }),
});

module.exports = upload;
