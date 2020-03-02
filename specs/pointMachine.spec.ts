import { OwnerType, State as MarkerState } from '../src/game/marker'
import { createMachine, boardMachine, Actions, BoardState, GameBoard } from '../src/game/Board'
import { printBoard } from '../src/game/utils'

describe.skip('Board', () => {
	let { initialState } = boardMachine

	it('starts in pending', () => {
		expect(initialState.value).toEqual(BoardState.PENDING)
	})

	describe(`on [Actions.START](${Actions.START})`, () => {
		it('transitions to PLAYING state', () => {
			const state = boardMachine.transition(initialState, {
				type: Actions.START
			})
			expect(state.context.whoseTurn).toEqual(OwnerType.PLAYER_1)
			let { board } = state.context
			expect(board).toHaveLength(9)
			expect(board.every(m => m === OwnerType.PLAYER_0)).toBeTruthy()
		})
		it('reuses an existing board', () => {
			const myBoard: GameBoard = [
				OwnerType.PLAYER_1, OwnerType.PLAYER_2, OwnerType.PLAYER_0,
			]
			const machine = createMachine({
				...initialState.context,
				board: myBoard
			})
			const state = machine.send(Actions.START)
			let { board } = state.context
			expect(board).toEqual(myBoard)
		})
	})

	describe.only(`in ${BoardState.PLAYING}`, () => {
		let board = createMachine()
		const markEvent = {
			type: Actions.MARK,
			markerIndex: 6,
		}

		beforeEach(() => {
			board = createMachine()
			board.send(Actions.START)
		})

		describe(`on [](${Actions.MARK})`, () => {
			it('it should mark the correct marker as marked ', () => {
				const state = board.send(markEvent)
				const marked = state.context.board[6]

				console.log("state machine value is ", state.value)
				expect(marked).toEqual(OwnerType.PLAYER_1)
				expect(state.matches({playing: 'idle'})).toBeTruthy()
			})

			it('it should switch players', () => {
				let state = board.state
				expect(state.context.whoseTurn).toEqual(OwnerType.PLAYER_1)
				state = board.send(markEvent)
				expect(state.context.whoseTurn).toEqual(OwnerType.PLAYER_2)
			})

			it('should mark the second marker as marked', () => {
				let state = board.send(markEvent)
				const marked = state.context.board[6]
				expect(marked).toEqual(OwnerType.PLAYER_1)
				state = board.send({
					type: Actions.MARK,
					markerIndex: 0
				})
				expect(state.context.board[0]).toEqual(OwnerType.PLAYER_2)
			})

			it('should finish games that are won', () => {
				let winningEvents = [
					{type: Actions.MARK, markerIndex: 0},
					{type: Actions.MARK, markerIndex: 3},
					{type: Actions.MARK, markerIndex: 1},
					{type: Actions.MARK, markerIndex: 4},
					{type: Actions.MARK, markerIndex: 2},
				]
				winningEvents.forEach(e => board.send(e))
				printBoard(board.state.context.board)

				expect(board.state.value).toEqual(BoardState.WINNER)
				expect(board.state.context.winner).toEqual(OwnerType.PLAYER_1)
			})

			it('should finish games that are a draw', () => {
				const board = [
					OwnerType.PLAYER_1, OwnerType.PLAYER_1, OwnerType.PLAYER_2,
					OwnerType.PLAYER_2, OwnerType.PLAYER_2, OwnerType.PLAYER_1,
					OwnerType.PLAYER_0, OwnerType.PLAYER_2, OwnerType.PLAYER_1,
				]
				const machine = createMachine({
					...initialState.context,
					board
				})
				machine.send(Actions.START)
				printBoard(machine.state.context.board)
				const state = machine.send({
					type: Actions.MARK,
					markerIndex: 6,
				})
				printBoard(state.context.board)

				expect(state.value).toEqual(BoardState.FINISHED)
			})

			it('should find the winning combo', () => {
				const board = [
					OwnerType.PLAYER_1, OwnerType.PLAYER_1, OwnerType.PLAYER_0,
					OwnerType.PLAYER_2, OwnerType.PLAYER_0, OwnerType.PLAYER_2,
					OwnerType.PLAYER_0, OwnerType.PLAYER_0, OwnerType.PLAYER_0,
				]
				const machine = createMachine({
					...initialState.context,
					board
				})
				machine.send(Actions.START)
				const state = machine.send(Actions.MARK, {markerIndex: 2})

				expect(state.context.winningCombo).toEqual([0,1,2])
			})
		})

		describe(`on [](${Actions.RESET})`, () => {
			beforeEach(() => board.send(markEvent))

			it('should reset the board state', () => {
				const state = board.send(Actions.RESET)
				const marked = state.context.board[6]
				expect(marked).toEqual(OwnerType.PLAYER_0)
			})
			it('should set whoseTurn to PLAYER_1', () => {
				expect(board.state.context.whoseTurn).toEqual(OwnerType.PLAYER_2)
				const state = board.send(Actions.RESET)
				expect(state.context.whoseTurn).toEqual(OwnerType.PLAYER_1)
			})
		})
	})
	
})
