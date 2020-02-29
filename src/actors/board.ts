import { Actor, lookup } from "actor-helpers/src/actor/Actor.js";
import { createMachine, BoardState, BoardEvent } from '../game/board'
import { OwnerType, CheckContext, MarkerActor } from '../game/marker'
declare global {
	interface ActorMessageType {
		board: BoardMessage
	}
}
export interface WinEvent {
	winner: OwnerType,
	winningCombo: number[], 
}
export type BoardMessage = BoardEvent
export interface Mark {
	owner: OwnerType | null,
}

const buildBoard = (markers: MarkerActor[]):Mark[] => {
	return markers.map( marker => marker.state.context.owner ? marker.state.context.owner : null )
}

export class Board extends Actor<BoardMessage> {
	private machine = createMachine()
	private ui = lookup('boardui')

	onMessage(message: BoardEvent) {
		const state = this.machine.send(message)
		const context = state.context
		const { whoseTurn, winningCombo } = context
		const board = buildBoard(context.markers)
		this.ui.send({
			type: message.type,
			boardState: state.value,
			board, player: whoseTurn,
			winningCombo,
		})
	}
}
