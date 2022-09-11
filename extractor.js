const fs = require("fs");
const { parse } = require("csv-parse");

function getData(file, begin, end, rows = -1) {
    let data = [];
    return new Promise((resolve, reject) => {
        fs.createReadStream(file)
            .on('error', error => {
                reject(error);
            })
            .pipe(parse({headers: false, separator: ';', from_line: begin, to_line: end}))
            .on('data', (row) => {
            	let temp = [];
            	if(rows == -1) {
	            	for(let i=0;i<row.length;i++) {
	                	data.push(row[i]);
    	        	}            		
            	} else {
    	        	for(let i=0;i<rows;i++) {
	                	temp.push(row[i]);
    	        	}
    	        	data.push(temp);
            	}
            })
            .on('end', () => {
                resolve(data);
            });
    });
}

async function readTestingData() {
	let spamData = [];
	let hamData = [];
	
	let data = await getData("./Data/spam_or_not_spam.csv", 2, 3011, 2);

	for(let i=0;i<data.length;i++) {
		//console.log(data[i][0]);
		if(data[i][1]=='1')
			spamData.push(data[i][0].replace(/NUMBER/g, '').toLowerCase().replace(/[\W_]/g, ' ').replace(/\s\s+/g, ' '));
		else
			hamData.push(data[i][0].replace(/NUMBER/g, '').toLowerCase().replace(/[\W_]/g, ' ').replace(/\s\s+/g, ' '));
	}

	return {"spam": spamData.filter(e =>  e), "ham": hamData.filter(e =>  e)};
}

async function readTrainingData() {
	let labels = await getData("./Data/emails.csv", 1, 1);
	// Remove email no.
	labels.shift();
	// Remove spam identifier
	labels.pop();

	let spam = {}, ham = {}, words = {};
	let totalSpam = 0, totalHam = 0, totalWords = 0;

	// from_line: 2 to exclude the labels
	// delimiter: "," because a csv file is comma separated
	return new Promise((resolve, reject) => {
		fs.createReadStream("./Data/emails.csv")
		  .pipe(parse({ delimiter: ",", from_line: 2}))
		  .on("data", function (row) {
		  	// If Spam
			if(row[row.length-1] == '1') {
		  		totalSpam += 1;
			  	for(let i = 1; i < row.length-1; i++) {
			  		// If not empty
			  		if(row[i]!='0') {
				  		let count = parseInt(row[i]);
						totalWords+=count;
			  			if(spam[labels[i-1]])
			  				spam[labels[i-1]] += count;
			  			else
			  				spam[labels[i-1]] = count;

			  			if(words[labels[i-1]])
			  				words[labels[i-1]] += count;
			  			else
			  				words[labels[i-1]] = count;
			  		}
			  	}

		  	// If Ham
	  		} else if(row[row.length-1] == '0') {
	  			totalHam += 1;
				for(let i = 1; i < row.length-1; i++) {
					// If not empty
					if(row[i]!='0') {
				  		let count = parseInt(row[i]);
						totalWords += count;
			  			if(ham[labels[i-1]])
			  				ham[labels[i-1]] += count;
			  			else
			  				ham[labels[i-1]] = count;

			  			if(words[labels[i-1]])
			  				words[labels[i-1]] += count;
			  			else
			  				words[labels[i-1]] = count;
		  			}
	  			}
	  		}
		  }).on('end', () => {
				  	// spam = cleanObj(spam);
				  	// ham = cleanObj(ham);
	                resolve([spam, ham, words, totalSpam, totalHam, totalWords]);
	            });
    });
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
	// console.log(cleanedObj);
	return cleanedObj;
}

async function cleanString(message) {
	// list of prepositions
	let prepositions = ['a', 'aboard', 'about', 'above', 'across', 'after', 'against', 'along', 'amid', 'among', 'anti', 'around', 'as', 'at', 'before', 'behind', 'below', 'beneath', 'beside', 'besides', 'between', 'beyond', 'but', 'by', 'concerning', 'considering', 'despite', 'down', 'during', 'except', 'excepting', 'excluding', 'following', 'for', 'from', 'in', 'inside', 'into', 'like', 'minus', 'near', 'of', 'off', 'on', 'onto', 'opposite', 'outside', 'over', 'past', 'per', 'plus', 'regarding', 'round', 'save', 'since', 'than', 'through', 'to', 'toward', 'towards', 'under', 'underneath', 'unlike', 'until', 'up', 'upon', 'versus', 'via', 'with', 'within', 'without']
	// list of conjunctions
	let conjunctions = ['and', 'but', 'for', 'nor', 'or', 'so', 'yet']
	// list of pronouns
	let pronouns = ['i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them', 'myself', 'yourself', 'himself', 'herself', 'itself', 'ourselves', 'yourselves', 'themselves', 'my', 'your', 'his', 'her', 'its', 'our', 'their', 'mine', 'yours', 'hers', 'theirs', 'this', 'that', 'these', 'those', 'who', 'whom', 'whose', 'which', 'what', 'which', 'where', 'when', 'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 'a', 'an', 'the', 'and', 'if', 'or', 'because', 'as', 'until', 'while', 'of', 'at', 'by', 'for', 'with', 'about', 'against', 'between', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'to', 'from', 'up', 'down', 'in', 'out', 'on', 'off', 'over', 'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 's', 't', 'can', 'will', 'just', 'don', 'should', 'now']
	// list of english articles
	let articles = ['a', 'an', 'the', 'not', 'are']

	let wordList = JSON.parse(fs.readFileSync("./Data/wordList.json"));
	let cleanedString = message.toLowerCase().replace(/\W/g, ' ').replace(/number/g, '').split(" ");	

	let outputString = [];
	// Words with less than a length of 2 is ignored
	for(let i=0;i<cleanedString.length;i++) {
		if(!(prepositions.includes(cleanedString[i]) || conjunctions.includes(cleanedString[i]) || pronouns.includes(cleanedString[i]) || articles.includes(cleanedString[i]) || cleanedString[i].toString().length <= 2) || wordList[cleanedString[i]] != true) {
			outputString.push(cleanedString[i]);
		}
	}
	// console.log(cleanedObj);
	return outputString.join(" ");
}

function isAllowed(str) {
	// list of prepositions
	let prepositions = ['a', 'aboard', 'about', 'above', 'across', 'after', 'against', 'along', 'amid', 'among', 'anti', 'around', 'as', 'at', 'before', 'behind', 'below', 'beneath', 'beside', 'besides', 'between', 'beyond', 'but', 'by', 'concerning', 'considering', 'despite', 'down', 'during', 'except', 'excepting', 'excluding', 'following', 'for', 'from', 'in', 'inside', 'into', 'like', 'minus', 'near', 'of', 'off', 'on', 'onto', 'opposite', 'outside', 'over', 'past', 'per', 'plus', 'regarding', 'round', 'save', 'since', 'than', 'through', 'to', 'toward', 'towards', 'under', 'underneath', 'unlike', 'until', 'up', 'upon', 'versus', 'via', 'with', 'within', 'without']
	// list of conjunctions
	let conjunctions = ['and', 'but', 'for', 'nor', 'or', 'so', 'yet']
	// list of pronouns
	let pronouns = ['I', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them', 'myself', 'yourself', 'himself', 'herself', 'itself', 'ourselves', 'yourselves', 'themselves', 'my', 'your', 'his', 'her', 'its', 'our', 'their', 'mine', 'yours', 'hers', 'theirs', 'this', 'that', 'these', 'those', 'who', 'whom', 'whose', 'which', 'what', 'which', 'where', 'when', 'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 'a', 'an', 'the', 'and', 'if', 'or', 'because', 'as', 'until', 'while', 'of', 'at', 'by', 'for', 'with', 'about', 'against', 'between', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'to', 'from', 'up', 'down', 'in', 'out', 'on', 'off', 'over', 'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 's', 't', 'can', 'will', 'just', 'don', 'should', 'now']
	// list of english articles
	let articles = ['a', 'an', 'the', 'not', 'are']

	// Words with less than a length of 2 is disallowed
	if(!(prepositions.includes(str) || conjunctions.includes(str) || pronouns.includes(str) || articles.includes(str) || str.toString().length <= 2)) {
		return true;
	}
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
	return outputString.join(" ");
}

(async function() {
	let data = await readTrainingData();
	let testingData = await readTestingData();

	// console.log(data)

	// Empty or create the file
	fs.writeFileSync('./Data/spam.json', '');
	fs.writeFileSync('./Data/ham.json', '');
	fs.writeFileSync('./Data/words.json', '');
	fs.writeFileSync('./Data/data.json', '');

	fs.writeFileSync('./Data/spamTesting.json', '');
	fs.writeFileSync('./Data/hamTesting.json', '');

	fs.writeFileSync('./Data/spamTesting.json', JSON.stringify(testingData["spam"]));
	fs.writeFileSync('./Data/hamTesting.json', JSON.stringify(testingData["ham"]));

	// // Write data to file
	// // console.log(data[0])
	// console.log(data[3],data[4],data[5]);
	fs.writeFileSync('./Data/spam.json', JSON.stringify(data[0]));
	fs.writeFileSync('./Data/ham.json', JSON.stringify(data[1]));
	fs.writeFileSync('./Data/words.json', JSON.stringify(data[2]));

	let obj = {
		"totalSpam": data[3],
		"totalHam": data[4],
		"totalWords": data[5],
	}

	fs.writeFileSync('./Data/data.json', JSON.stringify(obj));

})();