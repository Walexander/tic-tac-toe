import { Actor, lookup } from "actor-helpers/src/actor/Actor.js";
import { createMachine, State, Event } from '../game/marker'
declare global {
	interface ActorMessageType {
		marker: MarkerMessage 
	}
}
export type MarkerMessage = Event

export class Marker extends Actor<MarkerMessage> {
	private machine = createMachine()
	private ui = lookup('myui')
	private state = this.machine.state

	onMessage(message: MarkerMessage) {
		const state = this.machine.send(message)
		console.log('state is ', state)
		this.ui.send({
			player: state.context.owner,
			marked: state.value === State.CLOSED,
		})
	}

	constructor() {
		super()
	}

	async init() {
		await this.ui.send({
			marked: this.state.value === State.CLOSED,
		})
	}
}
