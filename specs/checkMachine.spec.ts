import { markerMachine, Events, State, OwnerType } from '../src/game/marker'

describe.skip('check machine', () => {
	let { initialState } = markerMachine

	it('is initially open', () => {
		expect(initialState.value).toEqual(State.OPEN)
	})

	it('is closed when MARK event is sent', () => {
		let state = markerMachine.transition(initialState, {
			type: Events.MARK,
			owner: OwnerType.PLAYER_2,
		})
		expect(state.value).toEqual(State.CLOSED)
		expect(state.context.owner).toEqual(OwnerType.PLAYER_2)
	})

	it('is done() when closed', () => {
		let state = markerMachine.transition(initialState, {
			type: Events.MARK,
			owner: OwnerType.PLAYER_2,
		})
		expect(state.value).toEqual(State.CLOSED)
		expect(state.context.owner).toEqual(OwnerType.PLAYER_2)
	})
})
