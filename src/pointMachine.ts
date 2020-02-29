import { Machine, assign, interpret, actions } from 'xstate'

export enum OwnerType {
	WHITE = 'white',
	BLACK = 'black',
}

export enum Events {
	ADD_MARKER = 'add',
	REMOVE_MARKER = 'remove',
	NULL_EVENT = '',
}

export enum State {
	OPEN = 'open',
	LOCKED = 'locked',
	EMPTY = 'empty',
}

export type PointEvent = {
	type: Events
	owner: OwnerType
}

export interface PointStateSchema {
	states: {
		[State.OPEN]: {}
		[State.LOCKED]: {}
		[State.EMPTY]: {}
	}
}

export interface PointContext {
	index: number
	count: number
	owner: OwnerType
}

const willLock = (context: PointContext, event: PointEvent) =>
	context.owner == event.owner && context.count >= 1

const isLocked = (context: PointContext, _: PointEvent) => context.count >= 2

const isOwned = (context: PointContext, event: PointEvent) => {
	console.log('checking is owned ', context, event)
	return context.owner === event.owner
}

const isOwnedAndLocked = (c: PointContext, event: PointEvent) =>
	isLocked(c, event) && isOwned(c, event)

const incrementCount = assign((context: PointContext, event: PointEvent) => {
	console.log('logging out ', event)
	return {
		count: context.count + 1,
		index: context.index,
		owner: event.owner,
	}
})

export const pointMachine = Machine<PointContext, PointStateSchema, PointEvent>(
	{
		id: 'point',
		initial: State.EMPTY,
		context: {
			index: -1,
			count: 0,
			owner: OwnerType.WHITE,
		},
		states: {
			[State.EMPTY]: {
				on: {
					[Events.ADD_MARKER]: [
						{
							target: State.OPEN,
							actions: incrementCount,
						},
					],
				},
			},
			[State.OPEN]: {
				on: {
					[Events.ADD_MARKER]: [
						{
							target: State.LOCKED,
							cond: isOwned,
							actions: incrementCount,
						},
						{
							target: State.OPEN,
							actions: [
								assign<PointContext, PointEvent>({
									count: 1,
									owner: (_, event) => event.owner,
								}),
							],
						},
					],
				},
			},
			[State.LOCKED]: {},
		},
	}
)
export const createMachine = () => {
	const service = interpret(pointMachine).onTransition(state => {
	})
	return service.start()
}

console.log('owner type = ' + OwnerType.WHITE)
