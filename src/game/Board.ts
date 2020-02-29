import { Machine, send, interpret, actions, assign, spawn } from 'xstate'
const { log } = actions
import { __, curry, tap, compose, path, contains } from 'ramda'

import {
	OwnerType,
	State as MarkerState,
	Events as MarkerEvents,
	MarkerActor,
	markerMachine,
} from './marker'

export interface BoardContext {
	markers: MarkerActor[]
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
	SET_MARK = 'marking',
	WINNER = 'winner',
	SWITCH_PLAYERS = 'switch',
	INITIALIZING = 'initializing',
	INITIALIZED = 'initialized',
	IDLE = 'idle',
}

export enum Actions {
	START = 'START',
	MARK = 'MARK',
	RESET = 'RESET',
	INITIALIZED = 'INITIALIZED'
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

export type BoardEvent = MarkEvent | StartEvent | ResetEvent

export interface BoardSchema {
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
				[BoardState.SWITCH_PLAYERS]: {}
				[BoardState.IDLE]: {}
				[BoardState.SET_MARK]: {}
			}
		}
		[BoardState.FINISHED]: {}
		[BoardState.WINNER]: {}
	}
}
export type WinningCombo = [number, number, number]

const hasWinner = curry(contains(__, [
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

const markersToBoard = (markers: MarkerActor[]) =>
	markers.map(({ state: { context, value } }) =>
		value === MarkerState.CLOSED ? context.owner : ''
	)

const boardToCombos = (board: any[]) => 
	WINNING_COMBOS.map(([x,y,z]) => [ board[x], board[y], board[z] ])

const _actions = {
	switchPlayer: assign<any>({
		whoseTurn: ({ whoseTurn }: BoardContext) => {
			const nextTurn =
				whoseTurn === OwnerType.PLAYER_1
					? OwnerType.PLAYER_2
					: OwnerType.PLAYER_1
					//console.log(`setting whoseTurn from ${whoseTurn} to ${nextTurn}`)
			return nextTurn
		},
	}),
	initializeMarkers: assign<any>({
		markers: (ctx: BoardContext) => {
			return ctx.board.map((owner => {
				let ref = spawn(markerMachine)
				if(owner === OwnerType.PLAYER_1 || owner === OwnerType.PLAYER_2)
					ref.send(MarkerEvents.MARK, {owner})
				return ref
			}))
		},
	}),
	createMarkers: assign<any>({
		winningCombo: () => [-1, -1, -1],
		markers: (_: BoardContext) =>
			new Array(9)
				.fill(undefined)
				.map(() => spawn(markerMachine, { sync: true })),
	}),
	logTap: compose(tap(console.log), path(['markers', 6, 'state', 'context'])),
	logWhoseTurn: ({ whoseTurn }: BoardContext) => {
		console.log(`it is now ${whoseTurn}'s turn`)
	},
	setWinner: assign<any>(ctx => ({
		winner: ctx.whoseTurn,
	})),
	getWinningCombo: assign<any>({
		winningCombo: (ctx: BoardContext) => {
			let board = markersToBoard(ctx.markers)
			let combos = boardToCombos(board).map(a => a.join(''))
			let winner = combos.findIndex(hasWinner)
			return WINNING_COMBOS[winner]
		},
	}),
	makeMark: send<any, any>((context: BoardContext, event: MarkEvent) => ({
		type: MarkerEvents.MARK,
		to: context.markers[event.markerIndex],
		payload: {
			owner: context.whoseTurn,
		},
	})),
}

const guards = {
	isValidMove: (ctx: BoardContext, event: BoardEvent) =>  {
		const markerIndex = (event as MarkEvent).markerIndex 
		const markers = ctx.markers
		const mark = markers [ markerIndex ]
		return mark.state.value.match(MarkerState.OPEN)
	},
	hasBoard: (ctx: BoardContext) => {
		return ctx.board.length > 0
	},
	hasWinner: (ctx: BoardContext) => {
		let board = markersToBoard(ctx.markers)
		let combos = boardToCombos(board).map( a => a.join('') )
		let filtered = combos.filter(hasWinner)
		return filtered.length > 0
	},
	isDraw: (ctx: BoardContext) => {
		let open = ctx.markers.filter(m => m.state.value == MarkerState.OPEN)
		return open.length <= 0
	},
}

export const boardMachine = Machine<BoardContext, BoardSchema, BoardEvent>({
	id: 'board',
	initial: BoardState.PENDING,
	context: {
		markers: [],
		board: [],
		whoseTurn: OwnerType.PLAYER_1,
		winningCombo: [-1, -1, -1],
	},
	states: {
		[BoardState.PENDING]: {
			on: {
				[Actions.START]: {
					target: BoardState.INITIALIZING,
				},
			},
		},
		[BoardState.INITIALIZING]: {
			entry: log('I am now INITIALIZING'),
			on: {
				'': [
					{
						target: BoardState.INITIALIZED, 
						cond: 'hasBoard',
						actions: [
							'initializeMarkers',
							send(Actions.INITIALIZED)
						],
					},
					{
						target: BoardState.INITIALIZED, 
						actions: [
							'createMarkers',
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
							target: BoardState.SET_MARK,
							cond: 'isValidMove',
							actions: [
								(ctx: BoardContext, event: MarkEvent) => {
									let marker = ctx.markers[event.markerIndex]
									marker.send({
										type: MarkerEvents.MARK,
										owner: ctx.whoseTurn,
									})
								},
							],
						},
						[Actions.RESET]: `#board.${BoardState.PENDING}`,
					},

				},
				[BoardState.SWITCH_PLAYERS]: {
					entry: [
						'switchPlayer',
					],
					on: {
						'': { target: BoardState.IDLE },
					}
				},
				[BoardState.SET_MARK]: {
					entry: [
						() => console.log('in the SET_MARK state'),
					],
					on: {
						[Actions.MARK]: [
							{
								target: `#board.${BoardState.WINNER}`,
								cond: 'hasWinner'
							},
							{
								target: `#board.${BoardState.FINISHED}`,
								cond: 'isDraw',
							},
							BoardState.SWITCH_PLAYERS
					    ]
				    }
				},
		    }
		},
		[BoardState.WINNER]: {
			entry: ['setWinner', 'getWinningCombo'],
			on: {
				[Actions.RESET]: {
					target: [BoardState.PENDING],
					actions: [
						send(Actions.START),
						log('i am acting in the finished state')
					]
				}
			}
		},
		[BoardState.FINISHED]: {
			on: {
				[Actions.RESET]: {
					target: [BoardState.PENDING],
					actions: [
						send(Actions.START),
						log('i am acting in the finished state')
					]
				}
		    }
		},
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
