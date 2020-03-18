# Tic-tac-toe!
Simple game built as a learning project for [xstate], the [actor model] and minmax

This is a fork of the [actor-boilerplate] repository.

## What do i do?
```
$ npm install
$ npx rollup -c rollup.config.js --watch 
$ open http://127.0.0.1:8001/dist/
```
## So what?
This was for fun, not profit.

## TBD
Need to off-load the player actor to the service worker. This was built into the
[actor-boilerplate] but broke when switching to [index-html]

---

License BSD-3-clause

Please note: this is not a Google product.

[actor-boilerplate]: https://github.com/PolymerLabs/actor-boilerplate
[xstate]: https://github.com/davidkpiano/xstate
[index-html]: https://www.npmjs.com/package/rollup-plugin-index-html
[actor model]: https://en.wikipedia.org/wiki/Actor_model
