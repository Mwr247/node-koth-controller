var input = process.argv[2].split(';').map(function(val) {
  return val.split(',');
}); // Split input from args

var response = 'L'; // Default action is to load ammo
if (+input[0][0] === 1) { // If starting round
  response = 'L'; // Load
} else if (+input[1][1] > 0) { // If we have ammo
  response = 'S' + input[2].sort(function(a, b) {
    return a.split(':')[1] - b.split(':')[1];
  })[0].split(':')[0]; // Shoot survivor with lowest health
}

console.log(response); // Return response
