var Mediator = new Mediator();
Mediator.subscribe("click", zoom);
Mediator.subscribe("mouseover", mouseover);
Mediator.subscribe("mouseout", mouseout);

function zoom(bubbles, b_fsm) {
    if (papers.is("loading"))
        return false;

    if (headstart.is_zoomed)
        return false;

    if (bubbles !== undefined) {
        headstart.is_zoomed = true;
        var previous_zoom_node = headstart.current_zoom_node;
        list.reset();
        if (typeof bubbles != 'undefined') {
            list.papers_list.selectAll("#list_holder")
                .style("display", function(bubbles) {
                    return bubbles.filtered_out ? "none" : "inline"
                });

            list.papers_list.selectAll("#list_holder")
                .filter(function(x, i) {
                    return (headstart.use_area_uri) ? (x.area_uri != bubbles.area_uri) : (x.area != bubbles.title);
                })
                .style("display", "none");
        }

        d3.event.stopPropagation();

        if (previous_zoom_node != null && typeof previous_zoom_node != 'undefined') {

            if (typeof bubbles != 'undefined') {
                if (d3.select(previous_zoom_node).data()[0].title == bubbles.title) {
                    return;
                }
            } else {
                resetList();

                list.papers_list.selectAll("#list_holder")
                    .style("display", function(bubbles) {
                        return bubbles.filtered_out ? "none" : "inline"
                    });

                d3.event.stopPropagation();
                return;
            }
        }

        // select the clicked node and set current node
        zoom_node = headstart.getZoomNode(bubbles);
        headstart.current_zoom_node = zoom_node.node();

        zoom_node.on("mouseover", null)
            .on("mouseout", null);

        zoom_node.style("display", "block");

        if (headstart.current_zoom_node != null)
            toFront(headstart.current_zoom_node.parentNode);

        if (previous_zoom_node !== null) {
            toBack(previous_zoom_node.parentNode);
        }

        // Update the papers list to the selected papers
        b_fsm.bringPapersToFront(bubbles);
        // Zoom into the selected bubbles
        b_fsm.zoom(bubbles, zoom_node);

        b_fsm.initMouseListeners();
        papers.zoom();
    }
}

function mouseover(b_fsm, bubbles, circle) {
    if (headstart.is_zoomed)
        return false;
    if (headstart.is("normal") || headstart.is("switchfiles")) {
        b_fsm.resetCircleDesign();
    }
    headstart.current_circle = d3.select(circle);
    if (headstart.is("timeline")) {
        b_fsm.resetCircleDesignTimeLine(circle);
        b_fsm.highlightAllCirclesWithLike(circle);
        b_fsm.drawConnectionLines(circle);
        //hideSibling(circle);
    } else {
        b_fsm.resetCircleDesign();
        b_fsm.highlightCircle(headstart.current_circle);
        toFront(headstart.current_circle.node().parentNode);
        b_fsm.bringPapersToFront(bubbles);
        hideSibling(circle);

        if (papers.is("behindbubble") || papers.is("behindbigbubble")) {
            papers.mouseover();
        }
        d3.selectAll("#region").style("fill-opacity", 1);
    }

}

function mouseout(b_fsm, bubbles, circle) {
	if (headstart.is_zoomed)
        return false;

    if (b_fsm.is("zoomedin") || b_fsm.is("hoverbig")) {
        return false;
    }

    if (papers.is("loading")) {
        return false;
    }

    if (!$(event.target).hasClass(circle)) {
    	return false;
    }

    if (event != "notzoomedmouseout") {
        if (papers.current == "infrontofbubble") {
            return false;
        }
    }

    if (circle != "outofbigbubble") {
        if (papers.is("infrontofbigbubble")) {
            return false;
        }
    }


    if (headstart.is("normal") || headstart.is("switchfiles")) {
        if (event == "notzoomedmouseout") {
            b_fsm.resetCircleDesign();
            if (!papers.is("loading")) {
                papers.mouseout();
            }
        }
        if (papers.is("infrontofbigbubble")) {
            papers.mouseout();
        }
    }

    if (headstart.is("timeline")) {
        b_fsm.resetCircleDesignTimeLine(circle);
        b_fsm.removeAllConnections();
    } else {
        b_fsm.resetCircleDesign();
    }
}
