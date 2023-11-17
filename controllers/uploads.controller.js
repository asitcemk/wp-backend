var cloudinary = require('cloudinary').v2;
const md5 = require('md5');
var fs = require('fs');

cloudinary.config({ 
  cloud_name: 'dfl0zwogx', 
  api_key: '885714668157448', 
  api_secret: 'corRojqPOLEdXwoc4RuWg9i7i8U' 
});

module.exports = {
  image_upload(req, res) {
    if (!req.files) {
        return res.status(500).send({ msg: "file is not found" })
    }
    const myFile = req.files.file;
    myFile.mv(`${__dirname}/../upload/${myFile.name}`, function (err) {
    if (err) {
      return res.status(500).send({ msg: "Error occured" });
    }
      let d = new Date();
      let n = d.getTime();
      let public_id=md5(n);
      cloudinary.uploader.upload(
        `${__dirname}/../upload/${myFile.name}`,
        { 
          folder: "wowbridge/profile_image/", 
          public_id: public_id
        },
        function(error, result) {
          fs.unlink(`${__dirname}/../upload/${myFile.name}`, (err) => {
            if (err) {
                console.log("failed to delete local image:"+err);
            } else {
                console.log('successfully deleted local image');                                
            }
          });
          if(error){
            return res.status(500).send({errors:error});
          }else{
            return res.status(200).send(result);
          }
      });
    });
  },
}  