import { Actor, lookup } from "actor-helpers/src/actor/Actor.js";
import { Actions, GameBoard } from '../game/board'
import { minimax } from '../game/minimax'
import { OwnerType } from '../game/marker'

declare global {
	interface ActorMessageType {
		player: PlayerMessage
	}
}

export interface PlayerMessage {
	board: GameBoard,
}

export class Player extends Actor<PlayerMessage> {
	private board = lookup('board')
	private player = OwnerType.PLAYER_2

	onMessage(message: PlayerMessage) {
		const state = message.board
		const [ score, move ] = minimax(state, this.player)
		console.log('i am gonna lose with %s -> %s\n', score, message)
		this.board.send({
			type: Actions.MARK,
			markerIndex: move
		})
	}
}
