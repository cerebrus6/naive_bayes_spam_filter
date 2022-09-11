const fs = require('fs');
var wordList = require('word-list-json');
//console.log(wordList[0]);
let words = {}
for(let i = 0; i<wordList.length; i++) {
	if(!(words[wordList[i]]))
		words[wordList[i]]=true;
}

fs.writeFileSync("./Data/wordList.json", JSON.stringify(words));