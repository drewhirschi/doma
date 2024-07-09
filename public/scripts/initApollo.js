function initApollo() {
  var n = Math.random().toString(36).substring(7);
  var o = document.createElement("script");
  o.src =
    "https://assets.apollo.io/micro/website-tracker/tracker.iife.js?nocache=" +
    n;
  o.async = true;
  o.defer = true;
  o.onload = function () {
    window.trackingFunctions.onLoad({ appId: "667477187e6bd9038afdbaf4" });
  };
  document.head.appendChild(o);
}
initApollo();
