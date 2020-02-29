import { OwnerType, State as MarkerState } from '../src/game/marker'
import { createMachine, boardMachine, Actions, BoardState } from '../src/game/Board'

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
		})
	})

	describe(`in ${BoardState.PLAYING} on [](${Actions.MARK})`, () => {
		let board = createMachine()
		const markEvent = {
			type: Actions.MARK,
			markerIndex: 6,
		}


		beforeEach(() => {
			board = createMachine()
			board.send(Actions.START)
		})

		it('it should mark the correct marker as marked ', () => {
			const state = board.send(markEvent)
			const marked = state.context.markers[6]

			expect(marked.state.value).toEqual(MarkerState.CLOSED)
			expect(state.context.whoseTurn).toEqual(OwnerType.PLAYER_2)
			expect(marked.state.context.owner).toEqual(OwnerType.PLAYER_1)
		})

		it('should initialize from the board context', () => {
			let myBoard = createMachine({
				board: [
					OwnerType.PLAYER_1, OwnerType.PLAYER_2,
					OwnerType.PLAYER_0,
					OwnerType.PLAYER_0,
					OwnerType.PLAYER_0,
					OwnerType.PLAYER_0,
					OwnerType.PLAYER_0,
					OwnerType.PLAYER_0,
					OwnerType.PLAYER_0,
				],
				markers: [],
				winningCombo: [-1, -1, -1],
				whoseTurn: OwnerType.PLAYER_1,
			})
			const state = myBoard.send(Actions.START)
			const { board, markers } = state.context
			console.log(`board length = ${board.join(' ___ ')}`)
			console.log(markers.map(m => 
				m.state.value == MarkerState.CLOSED ? 'closed' : 'open'
			).join(', '))
			expect(
				state.context.markers.filter(m => m.state.value == MarkerState.CLOSED)
			).toHaveLength(2)


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

			expect(board.state.value).toEqual(BoardState.WINNER)
			expect(board.state.context.markers[2].state.value).toEqual(MarkerState.CLOSED)
			expect(board.state.context.winner).toEqual(OwnerType.PLAYER_1)
		})

		it('should finish games that are won', () => {
			let winningEvents = [
				{type: Actions.MARK, markerIndex: 4},
				{type: Actions.MARK, markerIndex: 0},
				{type: Actions.MARK, markerIndex: 5},
				{type: Actions.MARK, markerIndex: 1},
				{type: Actions.MARK, markerIndex: 8},
				{type: Actions.MARK, markerIndex: 2},
			]
			winningEvents.forEach(e => board.send(e))

			expect(board.state.value).toEqual(BoardState.WINNER)
			expect(board.state.context.markers[2].state.value).toEqual(MarkerState.CLOSED)
			expect(board.state.context.winner).toEqual(OwnerType.PLAYER_2)
		})

		it('should find the winning combo', () => {
			let winningEvents = [
				{type: Actions.MARK, markerIndex: 4},
				{type: Actions.MARK, markerIndex: 0},
				{type: Actions.MARK, markerIndex: 5},
				{type: Actions.MARK, markerIndex: 1},
				{type: Actions.MARK, markerIndex: 8},
				{type: Actions.MARK, markerIndex: 2},
			]
			winningEvents.forEach(e => board.send(e))

			expect(board.state.context.winningCombo).toEqual([0,1,2])
		})

		describe(`in ${BoardState.PLAYING} on [](${Actions.RESET})`, () => {
			beforeEach(() => board.send(markEvent))

			it('should reset the board state', () => {
				const state = board.send(Actions.RESET)
				const marked = state.context.markers[6]
				expect(marked.state.value).toEqual(MarkerState.CLOSED)
			})
		})
	})
})
