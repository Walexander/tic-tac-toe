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
	player: OwnerType,
	type: Actions | 'INIT',
	board: GameBoard,
	boardState?: any,
	isFinished?: boolean,
	winningCombo?: WinningCombo,
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

		if(message.type == 'RESET')
			this.render()
		else
			render(
				this.renderBoard(message),
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

	async switchPlayers() {
		await this.board.send({type: Actions.SWITCH_PLAYERS})
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

	renderBoard(message: BoardUiMessage) {

		let className = [
			'dial-wrapper',
			'--' + message.boardState.join(' --').replace(/\./g, '-'),
		].join(' ')
		const whoseTurn = message.player
		const board = message.board
		const winningCombo = message.winningCombo || [-1,-1,-1]
		const switchButton =
				<button onClick={() => this.switchPlayers()}>Switch</button>

		let boardMessage = message.boardState.indexOf('board.winner') >= 0
								? `Winner 🐔 dinner ${message.player}!!`
								: message.boardState === 'finished'
								? 'DRAW (you suck)'
								: message.player + 'its your turn'

		return (<div className={className}>
					<header> <h1>{boardMessage}</h1> </header>
					<main>
					<Player active={whoseTurn}>
						<div className="players__switch">
							<button
								className="players__switch-button"
								onClick={() => this.switchPlayers()}
							>
								Switch Players
							</button>
						</div>
					</Player>
					<ul className="board">
						{board.map((mark, index) => (
							<li
								onClick={() => this.mark(index)}
								className={[
									'board__mark ',
									mark ? '--marked' : '',
									winningCombo.indexOf(index) >= 0 ? '--winner' : '',
								].join(' ')}
							> {mark ? mark : '·'} </li>
						))}
					</ul>
					<div className="board__reset">
						<button className="marker" onClick={() => this.restartGame()}>
							Play Again
						</button>
					</div>
				</main>
				</div>
			);
	}
}
