let words = require('./words.js');

var matchWord, matchSymbols, checkedWords;

// matchWord contains information about known letters in their exact position. if we don't know what symbol at the position, we'll set _
// matchSymbols contains all symbols must be presented in the word
// checkedWords contains an array of already checked words

matchWord = "_____";
matchSymbols = "tre";

checkedWords = ["stare"];

let strategies = {};
let strategyWord, strategyResult;

let checkedCounter = 0;

// we check every word from the target list for its result from each strategy 
for(let i=0; i < words.targetList.length; i++) {
	let guessWord = words.targetList[i];

	// if a word doesn't match criterias for already known data, we skip it
	if(!checkWord(guessWord)) {
		continue;
	}
	checkedCounter++;
	
	strategies.guessWord = guessWord;

	strategies = words.targetList.reduce(checkStrategies, strategies);
	strategies = words.guessList.reduce(checkStrategies, strategies);
	
}

delete strategies.guessWord;

let keys = Object.keys(strategies);

console.log("Matching words", checkedCounter);

let minCollisionRate = 1, bestStrategy;

// we find the maximum effective strategy 
for(let i=0; i < keys.length; i++) {
	let resultKeys = Object.keys(strategies[keys[i]].results);
	let collisionRate = strategies[keys[i]].collisions / resultKeys.length;
	let colWords = 0;
	
	// count how many words for the strategy can't be guessed on the next attempt
	for(let j=0; j < resultKeys.length; j++) {
		if(strategies[keys[i]].results[resultKeys[j]].length > 1) {
			colWords += strategies[keys[i]].results[resultKeys[j]].length;
		}
	}
	
	collisionRate = colWords / checkedCounter;
	
	// find strategy with maximum words can be guessed on the next attempt
	if( collisionRate < minCollisionRate && (strategies[keys[i]].maxCollisionLength < 30 || !bestStrategy) ) {
		bestStrategy = keys[i];
		minCollisionRate = collisionRate;
	}
}

if(!bestStrategy) {
	console.log("no strategy found");
	return;
}

console.log(bestStrategy, minCollisionRate, 'C: ' + strategies[bestStrategy].collisions, "Max: "+strategies[bestStrategy].maxCollisionLength);

console.log(strategies[bestStrategy]);

// function to check whether the word matches already known data about the word
function checkWord(word) {
	// if we don't know anything about the word, return true
	if(!matchWord)
		return true;
	
	// if we know exact symbol position check whether the word has that symbol in that position
	for(let i=0; i < matchWord.length; i++) {
		if(matchWord[i]!="_" && word[i] != matchWord[i])
			return false;
	}
	
	// check whether the word contains all symbols it must contain
	for(let i=0; i < matchSymbols.length; i++) {
		if(word.indexOf(matchSymbols[i]) === -1)
			return false;
	}

	for(let i=0; i < checkedWords.length; i++) {
		// check whether the word doesn't contain any symbols of already checked words, if it isn't confirmed that they should appear
		for(let j=0; j < checkedWords[i].length; j++) {
			if(matchSymbols.indexOf(checkedWords[i][j]) === -1 && word.indexOf(checkedWords[i][j])>=0)
				return false;
		}

		// check if the same symbol is presented in the same position of checked word and checking word, but not defined in matched result
		for(let j=0; j < matchWord.length; j++) {
			if(matchWord[j]=="_" && matchSymbols.indexOf(checkedWords[i][j]) !== -1 && checkedWords[i][j] == word[j])
				return false;
		}	
		
	}
	
	return true;
}

// function to gather results of each strategy for each word from the target list
// for each strategy we count how much results correspond to multiple words from the target list and what is the max. amount of words for the same result
function checkStrategies(strategiesList, strategyWord) {
		strategyResult = getWordResult(strategyWord, strategiesList.guessWord);
		
		if(!strategiesList[strategyWord]) {
			strategiesList[strategyWord] = {
				maxCollisionLength: 0,
				collisions: 0,
				results: {}
			}
		}
		
		if(!strategiesList[strategyWord].results[strategyResult]) {
			strategiesList[strategyWord].results[strategyResult] = [ strategiesList.guessWord ]
		} else {
			strategiesList[strategyWord].results[strategyResult].push(strategiesList.guessWord);
			if(strategiesList[strategyWord].results[strategyResult].length == 2)
				strategiesList[strategyWord].collisions++;
			if(strategiesList[strategyWord].results[strategyResult].length > strategiesList[strategyWord].maxCollisionLength)
				strategiesList[strategyWord].maxCollisionLength = strategiesList[strategyWord].results[strategyResult].length;
		}
		
		return strategiesList;
}


// function to check how the word matches the answer. 
// if a symbol from the result is lower case, it is presented in the answer but in another position
// if a symbol from the result is Upper case, it is presented in the answer on the same position
function getWordResult(word, answer) {
	
	let result = "";
		
	for(let i=0; i < word.length; i++) {
		if(word[i] == answer[i])
			result += word[i].toUpperCase();
		else if(answer.indexOf(word[i]) !== -1)
			result += word[i].toLowerCase();
		else
			result +="_";
	}
		
	return result;
}