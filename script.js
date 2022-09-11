let spam = ["The quick brown fox jumped over the lazy dog."];
let not_spam = ["Road runner is jumping crazily over the highway"];

function uniqueWords(text) {	
	let text_arr = text.toLowerCase().split(" ");
	let unique_words = [];
	let cache = {};
	for(let i=0;i<text_arr.length;i++) {
		let current_word = text_arr[i];
		if(!(cache[current_word])) {
			unique_words.push(current_word);
			cache[current_word] = true;
		}
	}
	return unique_words;
}



class messages() {
	constructor(hamWords = {}, spamWords = {}) {
		this.hamWords = hamWords;
		this.spamWords = spamWords;
		this.totalWords = ham.length() + spam.length();
	}

	wordProb(word) {

	}
}


console.log(uniqueWords(spam + " " + not_spam))


// Count word frequency of each word in training data set
	let word_frequency = 1;
	let total_words = 2;
	let word_probability = word_frequency/total_words;
