import { Machine, send, interpret, actions, assign, spawn } from 'xstate'
const { log } = actions
import { __, curry, tap, compose, path, contains } from 'ramda'
import { printBoard } from './utils'

import {
	OwnerType,
} from './marker'

export interface BoardContext {
	whoseTurn: OwnerType
	winner?: OwnerType
	winningCombo: WinningCombo
	board: GameBoard 
}

export type GameBoard = OwnerType[]
export enum BoardState {
	PENDING = 'pending',
	PLAYING = 'playing',
	FINISHED = 'finished',
	WINNER = 'winner',
	SWITCH_PLAYERS = 'switch',
	CHECK_WINNER = 'check',
	INITIALIZING = 'initializing',
	INITIALIZED = 'initialized',
	IDLE = 'idle',
	PLAYERS = 'players',
}

export enum PlayerState {
	PLAYER_1 = OwnerType.PLAYER_1,
	PLAYER_2 = OwnerType.PLAYER_2 
}

export enum Actions {
	START = 'START',
	MARK = 'MARK',
	RESET = 'RESET',
	INITIALIZED = 'INITIALIZED',
	SWITCH_PLAYERS = 'SWITCH_PLAYERS',
}

export type StartEvent = {
	type: Actions.START
}

export type MarkEvent = {
	type: Actions
	markerIndex: number
}
export type ResetEvent = {
	type: Actions.RESET
}
export type SwitchPlayersEvent = {
	type: Actions.SWITCH_PLAYERS
}

export type BoardEvent = MarkEvent | StartEvent | ResetEvent | SwitchPlayersEvent

export interface BoardSchema {
	states: {
		board: {
			states: {
				[BoardState.PENDING]: {}
				[BoardState.INITIALIZING]: {
					states: {
						'withinitial': {}
						'initialize': {}
						'initialized': {}
					}
				}
				[BoardState.INITIALIZED]: {},
				[BoardState.PLAYING]: {
					states: {
						[BoardState.IDLE]: {}
						[BoardState.CHECK_WINNER]: {}
					}
				}
				[BoardState.FINISHED]: {}
				[BoardState.WINNER]: {}
			}
		},
		players: {
			states: {
				player1: {},
				player2: {},
			}
		}
	}
}
export interface GameSchema {
	states: {
		players: {
			player_1: {},
			player_2: {},
		},
	},
}
export type WinningCombo = [number, number, number]

const comboIsWinnerFn = curry(contains(__, [
	new Array(3).fill(OwnerType.PLAYER_1).join(''),
	new Array(3).fill(OwnerType.PLAYER_2).join('')
]))

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

const boardToCombos = (board: GameBoard) => 
	WINNING_COMBOS.map(([x,y,z]) => [ board[x], board[y], board[z] ])

const _actions = {
	switchPlayer: assign<any>({
		whoseTurn: ({ whoseTurn }: BoardContext) => {
			const nextTurn =
				whoseTurn === OwnerType.PLAYER_1
					? OwnerType.PLAYER_2
					: OwnerType.PLAYER_1
			return nextTurn
		},
	}),
	createBoard: assign<any>({
		winningCombo: () => [-1, -1, -1],
		board: () => new Array(9).fill(undefined).map(() => OwnerType.PLAYER_0),
	}),
	logWhoseTurn: ({ whoseTurn }: BoardContext) => {
		console.log(`it is now ${whoseTurn}'s turn`)
	},
	setWinner: assign<any>(ctx => ({
		winner: ctx.whoseTurn,
	})),
	getWinningCombo: assign<any>({
		winningCombo: (ctx: BoardContext) => {
			let combos = boardToCombos(ctx.board).map(a => a.join(''))
			let winner = combos.findIndex(comboIsWinnerFn)
			return WINNING_COMBOS[winner]
		},
	}),
	makeMark: assign<any>({
		board: ({ board, whoseTurn }: BoardContext, { markerIndex }: MarkEvent) => {
			const newBoard = [...board]
			newBoard[markerIndex] = whoseTurn
			return newBoard
		},
	}),
}

const guards = {
	isValidMove: (ctx: BoardContext, event: BoardEvent) => {
		const markerIndex = (event as MarkEvent).markerIndex
		const board = ctx.board

		let isOkay = (
			markerIndex >= 0 &&
			markerIndex < ctx.board.length &&
			board[markerIndex] == OwnerType.PLAYER_0
		)
		console.log('move %s is %sokay',
					markerIndex,
					isOkay ? '' : 'NOT ')
		return isOkay
	},
	hasBoard: (ctx: BoardContext) => {
		return ctx.board.length > 0
	},
	hasWinner: ({ board }: BoardContext) => {
		let combos = boardToCombos(board).map(a => a.join(''))
		let filtered = combos.filter(comboIsWinnerFn)
		return filtered.length > 0
	},
	isDraw: (ctx: BoardContext) => {
		return ctx.board.filter(m => m == OwnerType.PLAYER_0).length <= 0
	}
}

export const boardMachine = Machine<BoardContext, BoardSchema, BoardEvent>({
	id: 'board',
	parallel: true,
	context: {
		board: [],
		whoseTurn: OwnerType.PLAYER_1,
		winningCombo: [-1, -1, -1],
	},
	states: {
		players: {
			initial: 'player1',
			states: {
				player1: {
					entry: assign<any>({
						whoseTurn: OwnerType.PLAYER_1,
					}),
					on: {
						[Actions.SWITCH_PLAYERS]: {
							target: 'player2',
						}
					}
				},
				player2: {
					entry: assign<any>({
						whoseTurn: OwnerType.PLAYER_2,
					}),
					on: {
						[Actions.SWITCH_PLAYERS]: 'player1',
					}
				},
			}
		},
		board: {
			initial: BoardState.PENDING,
			on: {
				[Actions.RESET]: {
					target: [
						'.pending',
						'players.player1',
					],
					actions: [
						assign<any>({
							board: [],
							whoseTurn: OwnerType.PLAYER_1,
						}),
						send(Actions.START),
					]
				},
			},
			states: {
				[BoardState.PENDING]: {
					on: {
						[Actions.SWITCH_PLAYERS]: {
						},
						[Actions.START]: {
							target: BoardState.INITIALIZING,
						},
					},
				},
				[BoardState.INITIALIZING]: {
					on: {
						'': [
							{
								target: BoardState.INITIALIZED, 
								cond: 'hasBoard',
								actions: [
									send(Actions.INITIALIZED)
								],
							},
							{
								target: BoardState.INITIALIZED, 
								actions: [
									'createBoard',
									send(Actions.INITIALIZED)
								]
							}
						]
					},
				},
				[BoardState.INITIALIZED]: {
					on: {
						[Actions.INITIALIZED]: {
							target: BoardState.PLAYING,
							actions: [
								log('i am initializing and got INITIZLIED')
							],
						},
					},
				},
				[BoardState.PLAYING]: {
					initial: BoardState.IDLE,
					entry: [
						'logWhoseTurn'
					],
					states: {
						[BoardState.IDLE]: {
							on: {
								[Actions.MARK]: {
									target: BoardState.CHECK_WINNER,
									cond: 'isValidMove',
									actions: [
										'makeMark',
									],
								},
							},

						},
						[BoardState.CHECK_WINNER]: {
							on: {
								'': [
									{
										target: `#board.board.${BoardState.WINNER}`,
										cond: 'hasWinner'
									},
									{
										target: `#board.board.${BoardState.FINISHED}`,
										cond: 'isDraw',
									},
									{
										target: BoardState.IDLE,
										actions: send(Actions.SWITCH_PLAYERS),
									},
								],
							}
						},
		    		}
				},
				[BoardState.WINNER]: {
					entry: ['setWinner', 'getWinningCombo'],
				},
				[BoardState.FINISHED]: {},
			}
		}
	},
}, {actions: _actions, guards})

export const createMachine = (ctx?: BoardContext) => {
	let machine
	if(ctx)
		machine = boardMachine.withContext(ctx)
	else
		machine = boardMachine

	return interpret(machine).start()
}
