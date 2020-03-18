import { Actor, lookup } from "actor-helpers/src/actor/Actor.js";
import { createMachine, BoardState, BoardEvent } from '../game/board'
import { EventTypes } from './player'
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

export class Board extends Actor<BoardMessage> {
	private machine = createMachine()
	private ui = lookup('boardui')
	private player = lookup('player')

	onMessage(message: BoardEvent) {
		const state = this.machine.send(message)
		const context = state.context
		const { whoseTurn, winningCombo, board } = context
		this.ui.send({
			type: message.type,
			boardState: state.toStrings(),
			board,
			player: whoseTurn,
			isFinished: !state.matches('playing'),
			winningCombo,
		})
		if (state.matches({ players: 'player2', board: 'playing' }))
			this.player.send({
				type: EventTypes.MOVE,
				board,
			})

	}
}
