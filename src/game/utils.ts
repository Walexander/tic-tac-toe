import { GameBoard } from './Board'
export const printBoard = (board: GameBoard) =>
	console.log(
		'board %s',
		board
			.map(m => (m ? m : ' '))
			.map((m, i) => (i % 3 === 0 ? '\n' + m : '| ' + m))
			.join(' ')
	)
