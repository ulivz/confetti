window.$ = selector => document.querySelector(selector)

Object.assign(window.$, {
  documentReady: handler => {
    if (document.readyState !== 'loading') {
      handler();
    } else {
      document.addEventListener('DOMContentLoaded', handler);
    }
  },

  on: (el, name, handler) => {
    el.addEventListener(name, handler, false)
  }
});

/**
 * requestAnimFrame
 */
window.requestAnimFrame = (function () {
  return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function (callback) {
    return window.setTimeout(callback, 1000 / 60);
  };
})();

function RandomFromTo (from, to) {
  return Math.floor(Math.random() * (to - from + 1) + from);
}

function indexGetter (index, arr) {
  const arrLen = arr.length;
  if (arrLen === 1) {
    return arr[0];
  }
  index = index >= arrLen
    ? index % arrLen
    : index;
  return arr[index];
}
