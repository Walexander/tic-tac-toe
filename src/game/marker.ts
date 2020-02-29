import { Machine, Actor, assign, interpret, actions, sendParent } from 'xstate'
const { log } = actions
export type MarkerActor = Actor<CheckContext, Event>

export enum OwnerType {
	PLAYER_1 = '⤫',
	PLAYER_2 = 'O',
	PLAYER_0 = '',
}

export enum Events {
	MARK = 'MARK',
}

export enum State {
	OPEN = 'open',
	CLOSED = 'closed',
}

export type Event = {
	type: Events
	owner: OwnerType
}

export interface Schema {
	states: {
		[State.OPEN]: {}
		[State.CLOSED]: {}
	}
}

export interface CheckContext {
	owner?: OwnerType
}

export const markerMachine = Machine<CheckContext, Schema, Event>({
	id: 'marker',
	initial: State.OPEN,
	context: {},
	states: {
		[State.OPEN]: {
			on: {
				[Events.MARK]: {
					target: State.CLOSED,
					actions: [
						assign({
							owner: (_: any, e: Event) => e.owner,
						}),
						sendParent('MARK'),
					],
				}
			},
		},
		[State.CLOSED]: {},
	},
})

export const createMachine = () => interpret(markerMachine).start()
