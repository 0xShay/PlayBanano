const randomNumber = require("random-number-csprng");
randomNumber(0, 100000, (err, res) => console.log(res));
