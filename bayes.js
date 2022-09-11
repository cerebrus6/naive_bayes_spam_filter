const fs = require("fs");
let spam = JSON.parse(fs.readFileSync('./Data/Training/spam.json'));
let ham = JSON.parse(fs.readFileSync('./Data/Training/ham.json'));
let spamWordCount = totalWords(spam);
let hamWordCount = totalWords(ham);
let totalWordCount = spamWordCount + hamWordCount;

exports.getAccuracy = function (spam, ham, spamTesting, hamTesting, totalWords = 0) {
	let score = 0;
	let scoreForSpam = 0;
	let scoreForHam = 0;

	for(let i=0;i<spamTesting.length;i++)
		if(isMessageSpam(spamTesting[i], spam, ham, totalWords)) {
			score++;
			scoreForSpam++;
		}
	for(let i=0;i<hamTesting.length;i++)
		if(!(isMessageSpam(hamTesting[i], spam, ham, totalWords))) {
			score++;
			scoreForHam++;
		}

	return [score/(spamTesting.length+hamTesting.length), scoreForSpam/spamTesting.length, scoreForHam/hamTesting.length];
}

function score(message, obj, priorProb = 0.5, totalWords = 0) {
	// For speed make sure message is already cleaned
	let arr = message.split(" ");
	let prob = [];
	let cache = {};
	for(let i=0;i<arr.length;i++) {
		if(!(cache[arr[i]])) {
			cache[arr[i]] = getWordProbability(arr[i], obj, totalWords);
		}
		prob.push(cache[arr[i]]);
	}
	let result = priorProb;
	for(let i=0;i<prob.length;i++)
		result *= prob[i];
	return result;
}

function isMessageSpam(message, spam, ham, totalWords = 0) {
	return (score(message, spam, totalWords) > score(message, ham, totalWords));
}

exports.isMessageSpam = function(message, spam, ham, totalWords = 0) {
	return (score(message, spam, totalWords) > score(message, ham, totalWords));
}

function getScore(message, obj, priorProb = 0.5) {
	// For speed make sure the message is already cleaned
	let arr = message.split(" ");
	let prob = [], cache = {};

	// Get the probability for each word in the message
	for(let i=0;i<arr.length;i++) {
		if(!(cache[arr[i]])) {
			cache[arr[i]] = getWordProbability(arr[i], obj);
		}
		prob.push(cache[arr[i]]);
	}

	let result = priorProb;
	for(let i=0;i<prob.length;i++) {
		result *= prob[i];
	}
	return result;
}

function getWordProbability(word, obj) {
	if(!(obj[word])) {
		if(totalWordCount == 0)
			return 1/totalWords(obj);
		else
			return 1/totalWordCount;			
	} else {
		if(totalWordCount == 0)
			return obj[word]/totalWords(obj);
		else
			return obj[word]/totalWordCount;
	}
}

function totalWords(obj) {
	let total = 0;
	for(let key in obj)
		total += obj[key];
	return total;
}