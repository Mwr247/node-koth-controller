var input = process.argv[2].split(';').map(function(val) {
  return val.split(',');
}); // Split input from args

var response = 'L'; // Default action is to load ammo
if (+input[0][0] === 1) { // If starting round
  response = 'L'; // Load
} else if (+input[1][2] === 0) { // If we haven't blocked yet
  response = 'B'; // Block
} else if (+input[1][1] > 0) { // If we have ammo
  response = 'S' + input[2][Math.random() * input[2].length | 0].split(':')[0]; // Shoot a random survivor
}

console.log(response); // Return response
