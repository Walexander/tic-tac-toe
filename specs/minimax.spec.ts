import { OwnerType } from '../src/game/marker'
import { minimax } from '../src/game/minimax'
import { printBoard } from '../src/game/utils'
describe('minimax', () => {
	it('is a function', () => {
		expect(typeof minimax).toEqual('function')
	})
	it('returns 1 when its a winner', () => {
		const board = [
			OwnerType.PLAYER_1,
			OwnerType.PLAYER_1,
			OwnerType.PLAYER_0,
		]

		const [ score, move ] = minimax(board, OwnerType.PLAYER_1)
		expect(score).toEqual(1)
	})
	it('returns 1 when its a winner for PLAYER_1 on a real board', () => {
		const board = [
			OwnerType.PLAYER_0, OwnerType.PLAYER_1, OwnerType.PLAYER_2,
			OwnerType.PLAYER_1, OwnerType.PLAYER_1, OwnerType.PLAYER_2,
			OwnerType.PLAYER_1, OwnerType.PLAYER_2, OwnerType.PLAYER_1,
		]

		const [ score, move ] = minimax(board, OwnerType.PLAYER_1)
		expect(score).toEqual(1)
		expect(move).toEqual(0)
	})
	it('returns 0 when its a draw for eitehr PLAYER_1 on a real board', () => {
		const board = [
			OwnerType.PLAYER_0, OwnerType.PLAYER_2, OwnerType.PLAYER_1,
			OwnerType.PLAYER_1, OwnerType.PLAYER_2, OwnerType.PLAYER_2,
			OwnerType.PLAYER_2, OwnerType.PLAYER_1, OwnerType.PLAYER_1,
		]

		let [ score, move ] = minimax(board, OwnerType.PLAYER_1)
		expect(score).toEqual(0)
		expect(move).toEqual(0)

		let [ p2score, p2move ] = minimax(board, OwnerType.PLAYER_2)
		expect(p2score).toEqual(0)
		expect(p2move).toEqual(0)
		
	})
	it('returns -1 when its a winner for PLAYER_2 on a real board', () => {
		const board = [
			OwnerType.PLAYER_0, OwnerType.PLAYER_1, OwnerType.PLAYER_2,
			OwnerType.PLAYER_2, OwnerType.PLAYER_1, OwnerType.PLAYER_2,
			OwnerType.PLAYER_2, OwnerType.PLAYER_2, OwnerType.PLAYER_1,
		]

		const [ score, move ] = minimax(board, OwnerType.PLAYER_1)
		expect(score).toEqual(1)
		expect(move).toEqual(0)
	})
	it('returns 0 when draw', () => {
		const board = [
			OwnerType.PLAYER_1, OwnerType.PLAYER_2, OwnerType.PLAYER_2,
			OwnerType.PLAYER_2, OwnerType.PLAYER_1, OwnerType.PLAYER_1,
			OwnerType.PLAYER_0, OwnerType.PLAYER_1, OwnerType.PLAYER_2,
		]
		const [ score, move ] = minimax(board, OwnerType.PLAYER_1)
		printBoard(board)
		expect(score).toEqual(0)
		expect(move).toEqual(6)
	})
	it('finds the draw', () => {
		const board = [
			OwnerType.PLAYER_2, OwnerType.PLAYER_1, OwnerType.PLAYER_1,
			OwnerType.PLAYER_1, OwnerType.PLAYER_2, OwnerType.PLAYER_2,
			OwnerType.PLAYER_2, OwnerType.PLAYER_1, OwnerType.PLAYER_0,
		]

		const [ score, move ] = minimax(board, OwnerType.PLAYER_1)
		expect(move).toEqual(8)
		expect(score).toEqual(0)
	})
	it('finds the win 3 moves out', () => {
		const board = [
			OwnerType.PLAYER_1, OwnerType.PLAYER_2, OwnerType.PLAYER_1,
			OwnerType.PLAYER_0, OwnerType.PLAYER_0, OwnerType.PLAYER_0,
			OwnerType.PLAYER_1, OwnerType.PLAYER_0, OwnerType.PLAYER_2,
		]

		const [ score, move ] = minimax(board, OwnerType.PLAYER_2)
		expect(score).toEqual(1)
	})
	it('finds the draw 3 moves out', () => {
		const board = [
			OwnerType.PLAYER_2, OwnerType.PLAYER_0, OwnerType.PLAYER_1,
			OwnerType.PLAYER_1, OwnerType.PLAYER_2, OwnerType.PLAYER_2,
			OwnerType.PLAYER_0, OwnerType.PLAYER_1, OwnerType.PLAYER_0,
		]

		const [ score ] = minimax(board, OwnerType.PLAYER_1)
		expect(score).toBeFalsy()
	})
	it('returns 0 when its a draw', () => {
		const board = [
			OwnerType.PLAYER_2, OwnerType.PLAYER_2, OwnerType.PLAYER_1,
			OwnerType.PLAYER_1, OwnerType.PLAYER_1, OwnerType.PLAYER_2,
			OwnerType.PLAYER_2, OwnerType.PLAYER_0, OwnerType.PLAYER_1,
		]

		const [ score ] = minimax(board, OwnerType.PLAYER_1)
		expect(score).toEqual(0)
	})
	it('returns -1 when PLAYER_2 wins', () => {
		const board = [
			OwnerType.PLAYER_2, OwnerType.PLAYER_2, OwnerType.PLAYER_1,
			OwnerType.PLAYER_1, OwnerType.PLAYER_2, OwnerType.PLAYER_2,
			OwnerType.PLAYER_2, OwnerType.PLAYER_1, OwnerType.PLAYER_0,
		]

		const [ score ] = minimax(board, OwnerType.PLAYER_2)
		expect(score).toEqual(-1)
	})
	it('should choose the middle square', () => {
		const board = [
			OwnerType.PLAYER_1, OwnerType.PLAYER_0, OwnerType.PLAYER_0,
			OwnerType.PLAYER_0, OwnerType.PLAYER_0, OwnerType.PLAYER_0,
			OwnerType.PLAYER_0, OwnerType.PLAYER_0, OwnerType.PLAYER_0,
		]

		const [ score, move ] = minimax(board, OwnerType.PLAYER_2)
		expect(score).toEqual(0)
		expect(move).toEqual(4)
	})
	it.only('should choose the win', () => {
		const board = [
			OwnerType.PLAYER_1, OwnerType.PLAYER_0, OwnerType.PLAYER_0,
			OwnerType.PLAYER_0, OwnerType.PLAYER_2, OwnerType.PLAYER_0,
			OwnerType.PLAYER_0, OwnerType.PLAYER_2, OwnerType.PLAYER_1,
		]

		const [ score, move ] = minimax(board, OwnerType.PLAYER_2)
		expect(move).toEqual(1)
		expect(score).toEqual(-1)
	})
})
