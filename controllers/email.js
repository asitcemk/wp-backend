const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
  	host: 'smtp.gmail.com',
	port: 587,
	secure: false,
	requireTLS: true,
	auth: {
	    user: 'wowbridge.business@gmail.com', // like : abc@gmail.com
	    pass: 'pozj aebz shed ttya'           // like : pass@123
	}
});
module.exports = {
  	transporter:transporter
}