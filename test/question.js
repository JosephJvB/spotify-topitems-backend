const numbers = [10, 11, 12, 9, 13, 8, 14]

function getSuitableNumber(numUsers) {
  const m = numbers.find(n => n % numUsers == 0)
  if (!m) {
    console.log('no suitable number of questionsPerPerson found for', numUsers, 'people')
  }
  return m || 10
}

// console.log('3', getSuitableNumber(3))
// console.log('4', getSuitableNumber(4))
// console.log('5', getSuitableNumber(5))
// console.log('6', getSuitableNumber(6))
// console.log('7', getSuitableNumber(7))
// console.log('8', getSuitableNumber(8))
// console.log('9', getSuitableNumber(9))
// 3 12
// 4 12
// 5 10
// 6 12
// 7 14
// 8 8
// 9 9

// works but is harder to customize
function round2(numUsers) {
  let offset = 1
  let questionNum = 10
  // exit if correct found or offset is too large
  while (questionNum % numUsers != 0) {
    if (Math.abs(offset) > 10) {
      console.log('offset too large', questionNum, offset)
      questionNum = 10
      break
    }
    console.log(questionNum, '%', numUsers, '=', questionNum % numUsers)
    questionNum += offset
    offset += offset < 0 ? -1 : 1
    offset *= -1
  }
  return questionNum
}
// console.log('3', round2(3))
// console.log('4', round2(4))
// console.log('5', round2(5))
// console.log('6', round2(6))
console.log('7', round2(7))
// console.log('8', round2(8))
// console.log('9', round2(9))