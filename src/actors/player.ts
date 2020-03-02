import { Actor, lookup } from "actor-helpers/src/actor/Actor.js";
import { Actions, GameBoard } from '../game/board'
import { minimax } from '../game/minimax'
import { OwnerType } from '../game/marker'

declare global {
	interface ActorMessageType {
		player: PlayerMessage
	}
}
export enum EventTypes {
	MOVE = 'MOVE',
	UPDATE = 'UPDATE'	
}

export interface PlayerMessage {
	type: EventTypes,
	board: GameBoard,
}

export class Player extends Actor<PlayerMessage> {
	private board = lookup('board')
	private player = OwnerType.PLAYER_2

	constructor(player: OwnerType) {
		super()
		this.player = player
	}

	onMessage(message: PlayerMessage) {
		const state = message.board
		if(message.type != 'MOVE')
			return
		const [ _, move ] = minimax(state, this.player)
		this.board.send({
			type: Actions.MARK,
			markerIndex: move
		})
	}
}
