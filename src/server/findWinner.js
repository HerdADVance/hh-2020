function findWinnerId(board, hands){

	class Hand{

		constructor(cards, board){
			this.hand = cards;
			this.boardHand = this.hand.concat(board);
			this.value = 1;
			this.winner = false;

			this.ranks= [0,0,0,0,0,0,0,0,0,0,0,0,0]; // A->2

			this.suits = {
				'C':  [],
				'D': [],
				'H': [],
				'S': [],
			};

			this.flushSuit = null;
			this.flushCards = null;
			this.lowestStraightCard = null;
			this.lowestStraightFlushCard = null;
			this.boat = [];
			this.quadKicker = null;
			this.twoPairKicker = null;

			this.quads = [];
			this.trips = [];
			this.pairs = [];
			this.kickers = [];

		}

		sortRanks(){
			
			this.boardHand.forEach(card => {
				let rank = card.charAt(0);
				rank = parseInt(this.convertRankToInteger(rank));
				this.ranks[14 - rank] ++;
			})

		}

		convertRankToInteger(str){
			switch(str){
				case 'A':
					return 14;
					break;
				case 'K':
					return 13;
					break;
				case 'Q':
					return 12;
					break;
				case 'J':
					return 11;
					break;
				case 'T':
					return 10;
					break;
				default :
					return str;
					break;
			}
		}

		sortSuits(){
			
			this.boardHand.forEach(card => {
				let rank = card.charAt(0);
				let suit = card.charAt(1);
				this.suits[suit].push(parseInt(this.convertRankToInteger(rank)));
			})

		}

		sortPairs(){
		
			for(var i=0; i < this.ranks.length; i++){

				switch(this.ranks[i]){
					case 4:
						this.quads.push(14 - i);
						break; 
					case 3:
						this.trips.push(14 - i);
						break;
					case 2:
						this.pairs.push(14 - i);
						break;
					case 1:
						this.kickers.push(14 - i);
						break; 
				}
			};
		}


		isFlush(){

			let flush = false

			Object.keys(this.suits).forEach(key => {
				if(this.suits[key].length >= 5){
					this.flushSuit = key;
					flush = true;
				}
			});

			return flush;
		}

		isStraightFlush(){ // Will only be ran if isFlush is true

			let flushRanks = this.suits[this.flushSuit];
			flushRanks.sort(this.sortNumerically)
			this.flushCards = flushRanks;


			let streak = 1;
			let lastValue = null;

			for(var i=0; i < flushRanks.length; i++){
				
				if(lastValue === null){
					lastValue = flushRanks[i];
					continue;
				}

				if(lastValue === flushRanks[i] + 1){
					streak ++;
				} else{
					lastValue = null;
					streak = 1;
				}

				if(streak === 5){ // found straight flush
					this.lowestStraightFlushCard = [flushRanks[i]];
					return true;
				}

				lastValue = flushRanks[i];
			};

			if(streak === 4 && flushRanks[0] === 14){ // Ace-low straight flush exception
				if(flushRanks[flushRanks.length - 1] === 2){ // last item in array is 2 so is straight flush
					this.lowestStraightFlushCard = [1];
					return true; 
				}
			}

			return false;

		}


		isStraight(){

			let streak = 0;

			for(var i=0; i < this.ranks.length; i++){
				if(this.ranks[i] > 0){
					streak ++;
					if(streak === 5){ // found straight
						this.lowestStraightCard = [14 - i];
						return true;
					}
				} else{
					streak = 0;
				}
			}

			if(streak === 4 && this.ranks[12] > 0){ // Ace-low straight exception
				this.lowestStraightCard = [1];
				return true;
			}

			return false;
		}

		isQuads(){
			if(this.quads.length > 0){
				this.quadKicker = [this.findQuadKicker()];
				return true;
			} else return false;
		}

		findQuadKicker(){
			for(var i=0; i < this.ranks.length; i++){
				if(this.ranks[i] > 0 && this.ranks[i] < 4) return 14 - i;
			};
		}

		isTrips(){
			if(this.trips.length > 0) return true;
				else return false;
		}

		isBoat(){ // will only be ran if isTrips returns true

			if(this.trips[1]){
				this.boat.push(this.trips[0]);
				this.boat.push(this.trips[1]);
				return true;
			}
			
			if(this.pairs[0]){
				this.boat.push(this.trips[0]);
				this.boat.push(this.pairs[0]);
				return true;
			}

			return false;
		}

		isTwoPair(){
			if(this.pairs.length >= 2){
				this.twoPairKicker = [this.findTwoPairKicker()];
				return true;
			} else return false;
		}

		findTwoPairKicker(){
			if(this.pairs[2]){
				let kicker = this.pairs[2];
				if(this.kickers[0] > kicker) kicker = this.kickers[0];
				return kicker;
			} else return this.kickers[0];		
		}

		isPair(){
			if(this.pairs.length == 1) return true;
				return false;
		}

		computeValue(){

			let isFlush = this.isFlush();
			let isTrips = this.isTrips();

			if(isFlush){ 
				if(this.isStraightFlush()) return 9;
			}

			if(this.isQuads()) return 8;
			
			if(isTrips){
				if(this.isBoat()) return 7;
			}

			if(isFlush) return 6;
			if(this.isStraight()) return 5;
			if(isTrips) return 4;
			if(this.isTwoPair()) return 3;
			if(this.isPair()) return 2;

			return 1;

		}

		sortNumerically(a,b){
			return b - a;
		}

	}




	//const board = ['JC', 'JD', 'QS', 'KS', 'AS'];
	//const hands = [['TS', '9S'], ['3S', 'JS']];

	let computedHands = [];

	hands.forEach(hand => {
		let playerHand = new Hand(hand, board);
		playerHand.sortRanks();
		playerHand.sortSuits();
		playerHand.sortPairs();
		playerHand.value = playerHand.computeValue();
		computedHands.push(playerHand);
	})


	let possibleWinners = [];
	let bestHandValue = 0;

	for(var i=0; i < computedHands.length; i++){

		let hand = computedHands[i];
		let handValue = hand.value;
		
		if(handValue > bestHandValue){
			possibleWinners = [hand];
			bestHandValue = handValue;
			continue;
		}

		if(handValue == bestHandValue){
			possibleWinners.push(hand);
		}

	}


	if(possibleWinners.length > 1) possibleWinners = breakTies(possibleWinners);
	if(possibleWinners.length > 1) return "TIE"
		else{
			return possibleWinners[0].hand;
		}


	function breakTies(hands){

		let winners = []

		switch(hands[0].value){

			case 9:
				winners = checkArrays(hands, 'lowestStraightFlushCard', 1);
				break;
			case 8:
				winners = checkArrays(hands, 'quads', 1, 'quadKicker', 1);
				break;
			case 7:
				winners = checkArrays(hands, 'boat', 2);
				break;
			case 6:
				winners = checkArrays(hands, 'flushCards', 5);
				break;
			case 5:
				winners = checkArrays(hands, 'lowestStraightCard', 1);
				break;
			case 4:
				winners = checkArrays(hands, 'trips', 1, 'kickers', 2);
				break;
			case 3:
				winners = checkArrays(hands, 'pairs', 2, 'twoPairKicker', 1);
				break;
			case 2:
				winners = checkArrays(hands, 'pairs', 1, 'kickers', 3);
				break;
			case 1:
				winners = checkKickers(hands, 'kickers', 5);
				break;

		}

		return winners;
	}


	function checkArrays(hands, toCompare, depth = 1, kickers = null, kickerDepth = null){

		for(var i = 0; i < depth; i++){

			let winners = [];
			let best = 0;

			for(var j = 0; j < hands.length; j++){

				let hand = hands[j]

				if(hand[toCompare][i] > best){
					winners = [hand];
					best = hand[toCompare][i];
					continue;
				}

				if(hand[toCompare][i] === best){
					winners.push(hand);
				}

			}

			if(winners.length === 1) return winners;

			if(winners.length > 1 && depth === i + 1){
				if(kickers) return checkKickers(winners, kickers, kickerDepth);
					else return winners
			}

		}
		
	}

	function checkKickers(hands, toCompare, depth = 1){

		for(var i = 0; i < depth; i++){

			let winners = [];
			let best = 0;

			for(var i = 0; i < hands.length; i++){

				let hand = hands[i]

				if(hand[toCompare][i] > best){
					winners = [hand];
					best = hand[toCompare][i];
					continue;
				}

				if(hand[toCompare][i] === best){
					winners.push(hand);
				}

			}

			if(winners.length === 1 || depth === i + 1) return winners;

		}

	}

}

module.exports = findWinnerId;