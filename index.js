#!/usr/bin/env node
const Numbers = [1, 2, 3, 4]
class NumberPlace {
  constructor () {
    this.blankIndexs = this.getBlankIndex(8)
    this.answer = this.generate()
  }

  generate () {
    let rows = this.createUniqueNumbers()
    while (this.isUniq(rows[2][0], rows[0][0], rows[1][0]) || this.isUniq(rows[3][0], rows[0][0], rows[1][0], rows[2][0])) {
      rows = this.createUniqueNumbers()
    }
    return rows
  }

  shuffle ([...array]) {
    for (let i = array.length - 1; i >= 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]]
    }
    return array
  }

  shuffleNumbersRow (confirmedNumbers) {
    const addNums = Numbers.filter(i => confirmedNumbers.indexOf(i) === -1)
    return this.shuffle(addNums).concat(confirmedNumbers)
  }

  shuffleNumbersCol (confirmedNumbers) {
    const addNums = Numbers.filter(i => confirmedNumbers.indexOf(i) === -1)
    return confirmedNumbers.concat(this.shuffle(addNums))
  }

  isUniq (...rowNumbers) {
    return rowNumbers.slice(1).some(x => x === rowNumbers[0])
  }

  createUniqueNumbers () {
    const quadrant1 = this.shuffle(Numbers)

    const row1 = this.shuffleNumbersRow([quadrant1[0], quadrant1[1]])
    const row2 = this.shuffleNumbersRow([quadrant1[2], quadrant1[3]])

    const col4 = this.shuffleNumbersCol([quadrant1[1], quadrant1[3]])
    const col3 = this.shuffleNumbersCol([quadrant1[0], quadrant1[2]])

    const row3 = this.shuffleNumbersRow([col3[2], col4[2]])
    const row4 = this.shuffleNumbersRow([col3[3], col4[3]])
    return [row1, row2, row3, row4]
  }

  getBlankIndex (number) {
    const indexs = []
    while (indexs.length < number) {
      const x = Math.floor(Math.random() * 4)
      const y = Math.floor(Math.random() * 4)
      if (indexs.every(index => index[0] !== x || index[1] !== y)) {
        indexs.push([x, y])
      }
    }
    return indexs.sort()
  }

  formatBlankRows (rows, blankIndexs) {
    const newRows = rows.map(row => [...row])
    const alphabets = [...Array(8)].map((v, i) => String.fromCodePoint(i + 65))
    blankIndexs.forEach((index, i) => {
      newRows[index[0]][index[1]] = alphabets[i]
    })
    return newRows
  }
}

const printNumberPlace = rows => {
  rows.forEach((data, i) => {
    console.log('    ' + data.join(' | '))
    if (i !== 3) {
      console.log('   ---|---|---|---')
    }
  })
  console.log('\n')
}

const checkCorrectAnswer = (answer, blankIndexs, yourAnswers) => {
  const transpose = ary => ary[0].map((_, c) => ary.map(r => r[c]))
  const checkUniqRow = ary => ary.every(row => { return [1, 2, 3, 4].every(n => row.includes(n)) })
  const copyAnswer = answer.map(row => [...row])
  blankIndexs.forEach((index, i) => {
    copyAnswer[index[0]][index[1]] = yourAnswers[i]
  })
  const results = []
  results.push(checkUniqRow(copyAnswer))
  results.push(checkUniqRow(transpose(copyAnswer)))
  const blockNumbers = []
  for (let i = 0; i < 2; i++) {
    blockNumbers.push([copyAnswer[i * 2][0], copyAnswer[i * 2][1], copyAnswer[(i * 2) + 1][0], copyAnswer[(i * 2) + 1][1]])
    blockNumbers.push([copyAnswer[i * 2][2], copyAnswer[i * 2][3], copyAnswer[(i * 2) + 1][2], copyAnswer[(i * 2) + 1][3]])
  }
  results.push(checkUniqRow(blockNumbers))
  return results.every(b => b)
}

const formateYourAnswer = (yourAnswers) => {
  const alphabets = [...Array(8)].map((v, i) => String.fromCodePoint(i + 65))
  const obj = {}
  yourAnswers.forEach((answer, i) => {
    if (isNaN(answer)) {
      obj[alphabets[i]] = '不正な解答'
    } else {
      obj[alphabets[i]] = answer
    }
  })
  return obj
}

async function main () {
  const { Form } = require('enquirer')
  console.log('<問題>\n')
  printNumberPlace(problem)
  const listArray = [
    { name: 'A', message: 'A' },
    { name: 'B', message: 'B' },
    { name: 'C', message: 'C' },
    { name: 'D', message: 'D' },
    { name: 'E', message: 'E' },
    { name: 'F', message: 'F' },
    { name: 'G', message: 'G' },
    { name: 'H', message: 'H' }
  ]

  const prompt = new Form({
    name: 'answer',
    message: 'A~Hのそれぞれに当てはまる数を入力してください。',
    choices: listArray
  })
  await prompt
    .run()
    .then(() => {
      const yourAnswers = listArray.map(obj => parseFloat(obj.value))
      if (yourAnswers.some(num => isNaN(num) || num <= 0 || num >= 5 || !Number.isInteger(num))) {
        console.log('---------------------------------------------------')
        console.log('入力値が正しくありません。')
        console.log('もう一度頑張りましょう')
        main()
        return
      }
      const results = checkCorrectAnswer(answer, blankIndexs, yourAnswers)
      if (results) {
        console.log('---------------------------------------------------')
        console.log('大正解!!')
        console.log('あなたの答え', formateYourAnswer(yourAnswers))
        console.log('<解答例>\n')
        printNumberPlace(answer)
      } else {
        console.log('---------------------------------------------------')
        console.log('残念!!間違っています!')
        console.log('あなたの答え', formateYourAnswer(yourAnswers))
        console.log('もう一度頑張りましょう！')
        main()
      }
    }).catch(console.error)
}

const numberPlace = new NumberPlace()
const answer = numberPlace.answer
const blankIndexs = numberPlace.blankIndexs
const problem = numberPlace.formatBlankRows(answer, blankIndexs)
main()
