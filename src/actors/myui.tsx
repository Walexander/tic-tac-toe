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

import { h, render } from "preact";
import { Actor, lookup } from "actor-helpers/src/actor/Actor.js";
import {
	OwnerType,
	Events,
} from '../game/marker'


declare global {
  interface ActorMessageType {
    myui: MyUiMessage;
  }
}

export interface MyUiMessage {
  	player?: OwnerType,
  	marked: boolean,
}

type OnClick = () => void


export class UI extends Actor<MyUiMessage> {
  private marker = lookup('marker');

	onMessage(state: MyUiMessage) {
		const el: any = document.getElementById('myui')
		render(
				(<div className="dial-wrapper">
					<button className="marker" onClick={() => this.toggle()}></button>
					<div className={state.marked ? '--open' : '--closed'}>
						{state.marked ? 'YUP by ' + state.player : 'NOPE'}
					</div>
				</div>),
				el as any,
				el.firstChild as any
			)
	}

	async toggle() {
		await this.marker.send({
			type: Events.MARK,
			owner: OwnerType.PLAYER_1,
		})
	}
}
