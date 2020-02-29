
// Available variables:
// - Machine
// - interpret
// - assign
// - send
// - sendParent
// - spawn
// - raise
// - actions
// - XState (all XState exports)

const fetchMachine = Machine({
	id: 'fetch',
	initial: 'idle',
	context: {
		retries: 0,
		bestMove: -1,
	},
	states: {
		idle: {
			entry: assign({
				retries: 0
			}),
			on: {
				PLAY: {
					target: 'playing',
				},
			},
		},
		playing: {
			initial: 'idle',
			on: {
				RESET: 'idle',
			},
			states: {
				idle: {
					on: {
						BEGIN: 'deciding',
					},
				},
				deciding: {
					entry: [
						assign({
							bestMove: () => Math.floor(Math.random() * 1e3)
						}),
					],
					on: {
						'MOVE': 'move',
					}
				},
				move: {
					entry: [
						assign({
							retries: (c) => c.retries + 1
						}),
					],
					on: {
						'JUDGE': 'judging',
					}
				},
				judging: {
					 on: {
					 	 'PICK': [
					 	 	 {
					 	 	 	 target: '#fetch.finished.winner',
					 	 	 	 cond: {
					 	 	 	 	 type: 'hasWinner',
					 	 	 	 	 mustBeat: 900,
					 	 	 	 },
					 	 	 },
					 	 	 {
					 	 	 	 target: '#fetch.finished.loser',
					 	 	 	 cond: {
					 	 	 	 	 type: 'maxRetries',
					 	 	 	 	 maxTurns: 3,
					 	 	 	 }
					 	 	 },
					 	 	 {
					 	 	 	 target: 'idle',
					 	 	 	 cond: () => true
					 	 	 },
					 	 ]
					 }
					
				},
			},
		},
		finished: {
			states: {
				winner: {},
				loser:{},
			},
			on: {
				'RESTART': 'idle',
			}
		}
	},
}, {
	guards: {
		maxRetries: (context, _, { cond }) => context.retires >= cond.maxTurns,
		hasWinner: (context, _, { cond }) => context.bestMove > cond.mustBeat,
	}
})
