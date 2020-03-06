const fetch = require('node-fetch');

const NUMBER_OF_USERS=12000;

function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;
  
  while (0 !== currentIndex) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }
  
  return array;
}

function getNumberOfUsersFromPercentage(percentage) {
  return Math.floor((percentage / 100) * NUMBER_OF_USERS);
}

async function setUserType(type, numberOfUsers, startIndex) {
  for (var i = startIndex; i < numberOfUsers; i++) {
    const key = `46663dea-c4b3-442a-ab9c-af402f3b9c15-${indexes[i]}`;

    await fetch(`http://localhost:9001/velvet-rope/add-user-type/${key}/${type}`);
  }

  return i;
} 

const indexes = [];

// Get NUMBER_OF_USERS indexes and shuffle them around to a randomised list of the top NUMBER_OF_USERS ints
for (var i = 1; i <= NUMBER_OF_USERS; i++) {
  indexes.push(i);
}

shuffle(indexes);

let startIndex = 0;

startIndex = setUserType(1, getNumberOfUsersFromPercentage(50), startIndex);
startIndex = setUserType(2, getNumberOfUsersFromPercentage(25), startIndex);
startIndex = setUserType(3, getNumberOfUsersFromPercentage(1), startIndex);
startIndex = setUserType(4, getNumberOfUsersFromPercentage(24), startIndex);

