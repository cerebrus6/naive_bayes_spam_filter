const fs = require("fs");
const bayes = require("./bayes.js");

(async function() {
	// Get training data
	let spam = JSON.parse(fs.readFileSync('./Data/Training/spam.json'));
	let ham = JSON.parse(fs.readFileSync('./Data/Training/ham.json'));
	let words = JSON.parse(fs.readFileSync('./Data/Training/words.json'));
	let data = JSON.parse(fs.readFileSync('./Data/Training/data.json'));

	// Convert data objects to array
	let spamArr = objToArray(spam).sort(sortWords);
	let hamArr = objToArray(ham).sort(sortWords);
	let wordsArr = objToArray(words).sort(sortWords);

	// console.log("Hello");
	// console.log(spamArr.slice(1, 20));

	// // Count number of words in data
	// let totalWordsInSpam = totalWords(spam);
	// let totalWordsInHam = totalWords(ham);
	// let totalWordsInWords = totalWords(words);

	// // Get testing data
	let spamTesting = JSON.parse(fs.readFileSync('./Data/Testing/spamTesting.json'));
	let hamTesting = JSON.parse(fs.readFileSync('./Data/Testing/hamTesting.json'));

	console.log(spamTesting.length)
	console.log(hamTesting.length)	

	// // Get spam and ham in increasing amount to test later incrementaly
	// let spamTesting10 = spamTesting.slice(490);
	// let hamTesting10 = hamTesting.slice(2500);

	// let spamTesting50 = spamTesting.slice(450);
	// let hamTesting50 = hamTesting.slice(2460);

	// let spamTesting100 = spamTesting.slice(400);
	// let hamTesting100 = hamTesting.slice(2410);

	// let spamTesting200 = spamTesting.slice(300);
	// let hamTesting200 = hamTesting.slice(2310);

	let spamTesting500 = spamTesting;
	let hamTesting500 = hamTesting;

	// console.log(spamTesting);
	// console.log(hamTesting100.length);

	// console.log(spamTesting10);
	// console.log(bayes.isMessageSpam("Hello world 1", spamTesting10, hamTesting10, 2500));
	// console.log(bayes.getAccuracy(spam, ham, spamTesting500, hamTesting500, (totalWords(spam) + totalWords(ham))));
	// console.log(getAccuracy(spam, ham, spamTesting50, hamTesting50, (totalWords(spam) + totalWords(ham))));
	// console.log(getAccuracy(spam, ham, spamTesting100, hamTesting100, (totalWords(spam) + totalWords(ham))));
	// console.log(getAccuracy(spam, ham, spamTesting200, hamTesting200, (totalWords(spam) + totalWords(ham))));
	console.log(bayes.getAccuracy(spam, ham, spamTesting500, hamTesting500, (totalWords(spam) + totalWords(ham))));

	// First train the model using the file emails.csv
})()

function getTopWords(n, arr) {
	let sortedArr = JSON.parse(JSON.stringify(arr)).sort(function(a, b) {
		return b[1] - a[1];
	});
	if(n>sortedArr.length)
		return sortedArr;
	return sortedArr.slice(0, n);
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

// Word sorting function alphabetical
function sortWords(a,b) {
	return b[1] - a[1];
}

function getWordProbability(word, obj, totalWordCount = 0) {
	if(!(obj[word]))
		if(totalWordCount == 0)
			return 1/totalWords(obj);
		else
			return 1/totalWordCount;			
	else
		if(totalWordCount == 0)
			return obj[word]/totalWords(obj);
		else
			return obj[word]/totalWordCount;
}

function totalWords(obj) {
	let total = 0;
	for(let key in obj)
		total += obj[key];
	return total;
}

function objToArray(obj) {
	let arr = [];
	for(let key in obj) {
	    arr.push([key, obj[key]]);
	}
	return arr;
}

function cleanStringArr(arr) {
	let output = [];
	for(let i=0;i<arr.length;i++) {
		output.push(cleanString(arr[i]));			
	}
	// console.log(output);
	return output;
}

function cleanString(message) {
	// list of prepositions
	let prepositions = ['a', 'aboard', 'about', 'above', 'across', 'after', 'against', 'along', 'amid', 'among', 'anti', 'around', 'as', 'at', 'before', 'behind', 'below', 'beneath', 'beside', 'besides', 'between', 'beyond', 'but', 'by', 'concerning', 'considering', 'despite', 'down', 'during', 'except', 'excepting', 'excluding', 'following', 'for', 'from', 'in', 'inside', 'into', 'like', 'minus', 'near', 'of', 'off', 'on', 'onto', 'opposite', 'outside', 'over', 'past', 'per', 'plus', 'regarding', 'round', 'save', 'since', 'than', 'through', 'to', 'toward', 'towards', 'under', 'underneath', 'unlike', 'until', 'up', 'upon', 'versus', 'via', 'with', 'within', 'without']
	// list of conjunctions
	let conjunctions = ['and', 'but', 'for', 'nor', 'or', 'so', 'yet']
	// list of pronouns
	let pronouns = ['I', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them', 'myself', 'yourself', 'himself', 'herself', 'itself', 'ourselves', 'yourselves', 'themselves', 'my', 'your', 'his', 'her', 'its', 'our', 'their', 'mine', 'yours', 'hers', 'theirs', 'this', 'that', 'these', 'those', 'who', 'whom', 'whose', 'which', 'what', 'which', 'where', 'when', 'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 'a', 'an', 'the', 'and', 'if', 'or', 'because', 'as', 'until', 'while', 'of', 'at', 'by', 'for', 'with', 'about', 'against', 'between', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'to', 'from', 'up', 'down', 'in', 'out', 'on', 'off', 'over', 'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 's', 't', 'can', 'will', 'just', 'don', 'should', 'now']
	// list of english articles
	let articles = ['a', 'an', 'the', 'not', 'are']
	// console.log(message);
	let cleanedString = message.toLowerCase().replace(/\W/g, ' ').split(" ");
	let outputString = [];
	// Words with less than a length of 2 is ignored
	for(let i=0;i<cleanedString.length;i++) {
		if(!(prepositions.includes(cleanedString[i]) || conjunctions.includes(cleanedString[i]) || pronouns.includes(cleanedString[i]) || articles.includes(cleanedString[i]) || cleanedString[i].toString().length <= 2)) {
			outputString.push(cleanedString[i]);
		}
	}
	// console.log(cleanedObj);
	return outputString.join(" ");
}

function cleanObj(obj) {

	// list of prepositions
	let prepositions = ['a', 'aboard', 'about', 'above', 'across', 'after', 'against', 'along', 'amid', 'among', 'anti', 'around', 'as', 'at', 'before', 'behind', 'below', 'beneath', 'beside', 'besides', 'between', 'beyond', 'but', 'by', 'concerning', 'considering', 'despite', 'down', 'during', 'except', 'excepting', 'excluding', 'following', 'for', 'from', 'in', 'inside', 'into', 'like', 'minus', 'near', 'of', 'off', 'on', 'onto', 'opposite', 'outside', 'over', 'past', 'per', 'plus', 'regarding', 'round', 'save', 'since', 'than', 'through', 'to', 'toward', 'towards', 'under', 'underneath', 'unlike', 'until', 'up', 'upon', 'versus', 'via', 'with', 'within', 'without']
	// list of conjunctions
	let conjunctions = ['and', 'but', 'for', 'nor', 'or', 'so', 'yet']
	// list of pronouns
	let pronouns = ['I', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them', 'myself', 'yourself', 'himself', 'herself', 'itself', 'ourselves', 'yourselves', 'themselves', 'my', 'your', 'his', 'her', 'its', 'our', 'their', 'mine', 'yours', 'hers', 'theirs', 'this', 'that', 'these', 'those', 'who', 'whom', 'whose', 'which', 'what', 'which', 'where', 'when', 'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 'a', 'an', 'the', 'and', 'if', 'or', 'because', 'as', 'until', 'while', 'of', 'at', 'by', 'for', 'with', 'about', 'against', 'between', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'to', 'from', 'up', 'down', 'in', 'out', 'on', 'off', 'over', 'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 's', 't', 'can', 'will', 'just', 'don', 'should', 'now']
	// list of english articles
	let articles = ['a', 'an', 'the', 'not', 'are']

	let cleanedObj = {};

	// Words with less than a length of 2 is ignored
	for(let key in obj) {
		if(!(prepositions.includes(key) || conjunctions.includes(key) || pronouns.includes(key) || articles.includes(key) || key.toString().length <= 2)) {
			cleanedObj[key] = obj[key];
		}
	}

	return cleanedObj;
}