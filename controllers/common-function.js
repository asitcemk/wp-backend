module.exports = {
  generateOtp: function () {
    return Math.floor(100000 + Math.random() * 900000)
  },	
}