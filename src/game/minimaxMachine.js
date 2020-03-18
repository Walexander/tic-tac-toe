OwnerType = {
	PLAYER_1: 1,
	PLAYER_2: -1,
	PLAYER_0: 0,
}

const WINNING_COMBOS = [
	[0, 1, 2],
	[3, 4, 5],
	[6, 7, 8],
	[0, 3, 6],
	[1, 4, 7],
	[2, 5, 8],
	[0, 4, 8],
	[2, 4, 6],
]

const boardToCombos = board =>
	WINNING_COMBOS.map(([x, y, z]) => [board[x], board[y], board[z]])

guards = {
	isWin: ctx => ctx.boardScore != 0,
	isDraw: ctx => ctx.board.filter(m => m == OwnerType.PLAYER_0).length <= 0,
}
actions = {
	getMoves: assign({
		availableMoves: ({ board }) =>
			board.reduce((accum, mark, index) => {
				if (mark === OwnerType.PLAYER_0) accum.push(index)
				return accum
			}, []),
	}),

	popLastMove: assign({
		availableMoves: ({availableMoves}) => {
			let next = [ ...availableMoves ]
			next.shift()
			return next
		},
		moveStack: ({moveStack, nextMove}) => {
			let next = [...moveStack]
			next.push(nextMove)
		},
	}),

	maxBestScore: assign({
		bestScore: ({bestScore, boardScore}) => Math.max(bestScore, boardScore)
	}),
	minBestScore: assign({
		bestScore: ({bestScore, boardScore}) => Math.min(bestScore, boardScore)
	}),
	minBestScore: assign({
		bestScore: (ctx) => {
			let { bestScore, boardScore } = ctx
			return (boardScore > bestScore) ? boardScore : bestScore
		},
	}),

	makeMove: assign({
		board: ctx => {
			let { nextMove, board, whoseTurn } = ctx
			let nextBoard = [...board]
			nextBoard[nextMove] = whoseTurn
			return nextBoard
		},
	}),

	setNextMove: assign({
		nextMove: ctx => ctx.availableMoves[0],
	}),

	scoreBoard: assign({
		boardScore: ({ board }) => {
			let combos = boardToCombos(board)
			let sums = combos.map(c => c.reduce((a, c) => a + c, 0))
			console.log('got back these sums: ', combos)
			return sums.filter(s => Math.abs(s) === 3).length > 0 ? 10 : 0
		},
	}),
}
boardMachine = Machine(
	{
		id: 'board',
		parallel: true,
		context: {
			board: [1, 0, 0, 1],
			boardScore: 0,
			bestScore: -Infinity,
			moveStack: [],
			whoseTurn: 1,
			winningCombo: [-1, -1, -1],
			availableMoves: [],
		},
		states: {
			evaluate: {
				initial: 'idle',
				states: {
					idle: {
						on: {
							START: 'getMoves',
						},
					},
					getMoves: {
						entry: 'getMoves',
						exit: 'setNextMove',
						on: {
							MOVE: 'makeMove',
						},
					},
					makeMove: {
						entry: ['makeMove'],
						on: {
							EVAL: 'evaluateBoard',
						},
					},
					evaluateBoard: {
						entry: 'scoreBoard',
						on: {
							SCORE_BOARD: [
								{ target: 'score.win', cond: 'isWin' },
								{ target: 'score.draw', cond: 'isDraw' },
								{ target: 'switching' },
							],
						},
					},
					score: {
						on: {
							SET_SCORE: [
								{
									in: '#board.player.player1',
									actions: [ 'maxBestScore' ],
								},
								{
									in: '#board.player.player2',
									actions: [ 'minBestScore' ],
								}
							],
						},
						states: {
							win: {},
							draw: {},
						},
					},
					switching: {
						entry: 'popLastMove',
						on: {
							SWITCH_PLAYERS: 'idle',
						},
					},
					over: {},
				},
			},
			player: {
				initial: 'player1',
				states: {
					player1: {
						entry: assign({
							whoseTurn: OwnerType.PLAYER_1,
						}),
						on: {
							SWITCH_PLAYERS: {
								target: 'player2',
							}
						}
					},
					player2: {
						entry: assign({
							whoseTurn: OwnerType.PLAYER_2,
						}),
						on: { SWITCH_PLAYERS: 'player1', }
					},
				},
			},
		},
	},
	{ actions, guards }
)
