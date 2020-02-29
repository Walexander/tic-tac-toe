import { OwnerType } from './marker'
import { WinningCombo, GameBoard, boardMachine } from './Board'
import * as R from 'ramda'

export const minimax = (board: GameBoard, player: OwnerType, depth = 0): [number, number] => {
	let multiplier = player === OwnerType.PLAYER_1 ? 1 : -1

	if(isOver(board))
		return [ 0 , -1 ]

	let moveList = getNextMoves(board)

	let nextPlayer = player == OwnerType.PLAYER_1  ? OwnerType.PLAYER_2 : OwnerType.PLAYER_1
	let bestScore = -Infinity * multiplier
	let bestIndex = -1

	for(let move of moveList) {
		let nextBoard = [ ...board ]
		nextBoard[move] = player

		let score = evaluate(nextBoard) * multiplier 

		if(score === 0)
			[ score ] = minimax(nextBoard, nextPlayer, depth + 1)
		else if(score !== 0) {
			printBoard(nextBoard)
			console.log('score  = %s', score)
		}

		bestScore = multiplier > 0 ?
			Math.max(bestScore,	score) :
			Math.min(bestScore, score)
		if(score == bestScore)
			bestIndex = move

	}
	return [ bestScore, bestIndex ]
}

export const findBestMove = (board: GameBoard, player: OwnerType) => {

	let moves = getNextMoves(board)
	let multiplier = player === OwnerType.PLAYER_1 ? 1 : -1
	let bestScore = -Infinity
	let bestIndex = -1

	for(let move of moves) {
	}

	return bestIndex
}

const evaluate = (board: GameBoard): number => hasWinner(board) ? 1 : 0;

const isWinnerFn = R.curry(R.contains(R.__, [
	new Array(3).fill(OwnerType.PLAYER_1).join(''),
	new Array(3).fill(OwnerType.PLAYER_2).join('')
]))

const getNextMoves = (board: GameBoard) =>
	board.reduce((accum: any, mark, index) => {
		if (mark === OwnerType.PLAYER_0) accum.push(index)
		return accum
	}, [])
				 
const hasWinner = (board: GameBoard): boolean => {
	let combos = boardToCombos(board).map( a => a.join('') )
	let filtered = combos.filter(isWinnerFn)
	return filtered.length > 0
}
const WINNING_COMBOS: WinningCombo[] = [
	[0,1,2],
	[3,4,5],
	[6,7,8],
	[0,3,6],
	[1,4,7],
	[2,5,8],
	[0,4,8],
	[2,4,6],
]
const boardToCombos = (board: any[]) => 
	WINNING_COMBOS.map(([x,y,z]) => [ board[x], board[y], board[z] ])

const isOver = (board: GameBoard) =>
	board.filter(m => m === OwnerType.PLAYER_0).length <= 0


const printBoard = (board: GameBoard) =>
	console.log(
		'board %s',
		board
			.map(m => (m ? m : ' '))
			.map((m, i) => (i % 3 === 0 ? '\n' + m : '| ' + m))
			.join(' ')
	)
