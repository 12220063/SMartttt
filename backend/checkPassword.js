const bcrypt = require('bcryptjs');

const hash = "$2b$10$gEoOXtF3MCQEUBQhyrc4Xerk7JtLCBRwtViyCLQV139a0J6d8lI6q"; // Example hashed password

bcrypt.compare('securePassword123', hash).then((isMatch) => {
  console.log(isMatch); // true or false based on password match
}).catch((err) => {
  console.error(err);
});
