var Mediator = new Mediator();
Mediator.subscribe("click", zoom);

function zoom(bubble, bubbles) {
    if (bubble !== undefined) {
        bubbles.zoom(bubble);
    }
    bubbles.initMouseListeners();
    papers.zoom();
    popup.initClickListenersForNav();
}
