const bcrypt = require('bcryptjs');
const hash = bcrypt.hashSync('password', 12);
console.log(hash);
