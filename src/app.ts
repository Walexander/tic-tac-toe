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

import { hookup, initializeQueues } from "actor-helpers/src/actor/Actor.js";
import { UI as BoardUI } from "./actors/boardui";
import { Clock } from "./actors/clock.js";
import { Board } from "./actors/board";

async function bootstrap() {
	await initializeQueues();
	const myui = new BoardUI()
	await hookup("boardui", myui);
	const clock = new Clock();
	const board = new Board();
	await hookup("clock", clock);
	await hookup("board", board);
	myui.render()
}

bootstrap();
