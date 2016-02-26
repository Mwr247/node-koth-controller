var input = process.argv[2].split(';').map(function(val) {
  return val.split(',');
}); // Split input from args

var options = []; // Possible options

if (+input[1][0] < +input[0][2] && +input[1][4] === 0) { // If we can heal
  options.push('H'); // Add heal option
}

if (+input[1][1] < 6) { // If we can load more ammo
  options.push('L'); // Add load ammo option
}

if (+input[1][2] < 5) { // If we can dodge
  options.push('D'); // Add dodge option
}

if (+input[1][1] > 0) { // If we can shoot
  input[2].forEach(function(val) {
    options.push('S' + val.split(':')[0]); // Add each target as an option
  });
}

input[2].forEach(function(val) { // Add each target as a melee option
  options.push('M' + val.split(':')[0]); // Add each target as an option
});

console.log(options[Math.random() * options.length | 0] || 'N'); // Return random response from options
