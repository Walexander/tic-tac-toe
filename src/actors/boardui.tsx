/**
 * @license
 * Copyright (c) 2018 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */

import { h, render } from 'preact'
import { Actor, lookup } from 'actor-helpers/src/actor/Actor.js'
import { OwnerType } from '../game/marker'
import { Actions, GameBoard, WinningCombo } from '../game/board'
import { Player } from '../components/player'

declare global {
	interface ActorMessageType {
		boardui: BoardUiMessage
	}
}

export interface BoardUiMessage {
	player: OwnerType
	type: Actions | 'INIT'
	board: GameBoard
	boardState?: any
	winningCombo?: WinningCombo
}

export interface BoardUiWinner {
	winner: OwnerType
	board: GameBoard 
	winningLine: number[]
}

export class UI extends Actor<BoardUiMessage> {
	private board = lookup('board')
	private el: any = document.getElementById('myui')

	onMessage(message: BoardUiMessage) {
		const board = message.board
		const whoseTurn = message.player
		const winningCombo = message.winningCombo || [-1,-1,-1]
		const button =
				<button onClick={() => this.restartGame()}>Restart</button>

		if(message.type == 'RESET')
			this.render()
		else
			render(
				<div className="dial-wrapper">
					<header>
						<h1>
							{message.boardState === 'winner' ?
								`Winner 🐔 dinner ${message.player}!!` :
								message.boardState ==='finished' ?
									'DRAW (you suck)' :
									`${message.player} its your turn`}
						</h1>
						<div> {button} </div>
					</header>
					<Player active={whoseTurn}/>
					<ul className={['board', '--' + message.boardState].join(' ')} >
						{board.map((mark, index) => (
							<li
								onClick={() => this.mark(index)}
								className={[
									'board__mark ',
									mark ? '--marked' : '',
									winningCombo.indexOf(index) >= 0 ? '--winner' : '',
								].join(' ')}

							>
								{mark ? mark : '·'}
							</li>
						))}
					</ul>
				</div>,
				this.el as any,
				this.el.firstChild as any
			)
	}

	render() {
		render(
			<div className="dial-wrpaper">
				<h1> Click to Start The Game </h1>
				<button className="marker" onClick={() => this.startGame()}>
					Start
				</button>
			</div>,
			this.el as any,
			this.el.firstChild
		)
	}

	mark(markerIndex: number): void {
		console.log('marking index as ', markerIndex)
		this.board.send({
			type: Actions.MARK,
			markerIndex,
		})
	}

	async startGame() {
		await this.board.send({
			type: Actions.START,
		})
	}

	async restartGame() {
		await this.resetGame()
		await this.startGame()
	}

	async resetGame() {
		await this.board.send({
			type: Actions.RESET
		})
	}
}
