var headstart = null;
var namespace = "headstart";

Headstart = function(host, path, tag, files, options) {
    var mediator = new Mediator();
    mediator.subscribe("click", zoom);
    mediator.subscribe("mouseover", mouseover);
    mediator.subscribe("mouseout", mouseout);

    settings: {
        loading = true;
        zoomedin = false;
        current_view = "none";
    };

    init(host, path, tag, files, options);

    function init(host, path, tag, files, options) {
        var vis_directory = "vis/";
        var lib_directory = "lib/";
        var lib_sources = [{
            source: "browser_detect.js"
        }, {
            source: "jquery-1.8.1.min.js"
        }, {
            source: "state-machine.js"
        }, {
            source: "d3.v3.js",
            important: true
        }];

        var divs = [
            // "main",
            // "subdiscipline_title",
            "vis_row",
            "headstart-chart",
            "papers_list_container",
            "paper_frame"
        ];

        var script_sources = [{
            source: "intro.js"
        }, {
            source: "popup.js"
        }, {
            source: "bubbles.js"
        }, {
            source: "papers.js"
        }, {
            source: "list.js"
        }, {
            source: "main_canvas.js",
            final: true
        }]

        var source = $("#entry-template").html();
        var template = Handlebars.compile(source);
        $("#visualization").append(template());

        addScript = function(source, tag, async) {
            var current_script = document.createElement('script');
            current_script.type = 'text/javascript';
            current_script.src = source;
            current_script.async = async;
            return document.getElementsByTagName(tag)[0].appendChild(current_script);
        }

        addCss = function(source, tag) {
            var current_css = document.createElement('link');
            current_css.type = 'text/css';
            current_css.rel = 'stylesheet';
            current_css.href = source;
            return document.getElementsByTagName(tag)[0].appendChild(current_css);
        }

        document.getElementById(tag).className = namespace;

        addCss('http://' + host + path + vis_directory + 'style.css', 'head');

        lib_sources.forEach(function(script_source, i) {
            var current_script = addScript('http://' + host + path + vis_directory + lib_directory + script_source.source, 'head', false);

            if (typeof script_source.important !== 'undefined') {
                current_script.onload = function() {
                    script_sources.forEach(function(script_source) {
                        var source = 'http://' + host + path + vis_directory + script_source.source;
                        var this_script = addScript(source, 'head', false);

                        if (typeof script_source.final !== 'undefined') {
                            this_script.onload = function() {
                                main_canvas = new HeadstartFSM(
                                    host, path, tag, files, options
                                );

                                main_canvas.start();
                            }
                        }
                    })
                }
            }
        })
        
        headstart = this;
    }

    function zoom(bubbles, b_fsm) {
        if (papers.is("loading"))
            return false;

        if (main_canvas.is_zoomed)
            return false;

        if (bubbles !== undefined) {
            main_canvas.is_zoomed = true;
            var previous_zoom_node = main_canvas.current_zoom_node;
            list.reset();
            if (typeof bubbles != 'undefined') {
                list.papers_list.selectAll("#list_holder")
                    .style("display", function(bubbles) {
                        return bubbles.filtered_out ? "none" : "inline"
                    });

                list.papers_list.selectAll("#list_holder")
                    .filter(function(x, i) {
                        return (main_canvas.use_area_uri) ? (x.area_uri != bubbles.area_uri) : (x.area != bubbles.title);
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
            zoom_node = main_canvas.getZoomNode(bubbles);
            main_canvas.current_zoom_node = zoom_node.node();

            zoom_node.on("mouseover", null)
                .on("mouseout", null);

            zoom_node.style("display", "block");

            if (main_canvas.current_zoom_node != null)
                toFront(main_canvas.current_zoom_node.parentNode);

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
        if (zoomedin)
            return false;
        if (main_canvas.is("normal") || main_canvas.is("switchfiles")) {
            b_fsm.resetCircleDesign();
        }

        main_canvas.current_circle = d3.select(circle);
        if (main_canvas.is("timeline")) {
            b_fsm.resetCircleDesignTimeLine(circle);
            b_fsm.highlightAllCirclesWithLike(circle);
            b_fsm.drawConnectionLines(circle);
            //hideSibling(circle);
        } else {
            b_fsm.resetCircleDesign();
            b_fsm.highlightCircle(main_canvas.current_circle);
            toFront(main_canvas.current_circle.node().parentNode);
            b_fsm.bringPapersToFront(bubbles);
            hideSibling(circle);

            if (papers.is("behindbubble") || papers.is("behindbigbubble")) {
                papers.mouseover();
            }
            d3.selectAll("#region").style("fill-opacity", 1);
        }

    }

    function mouseout(b_fsm, bubbles, circle) {
        if (main_canvas.is_zoomed)
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


        if (main_canvas.is("normal") || main_canvas.is("switchfiles")) {
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

        if (main_canvas.is("timeline")) {
            b_fsm.resetCircleDesignTimeLine(circle);
            b_fsm.removeAllConnections();
        } else {
            b_fsm.resetCircleDesign();
        }
    }
}

function initVar(variable, default_value) {
    return typeof variable !== 'undefined' ? variable : default_value;
}

// ------------------------------------------------------------
// functions which are not being called at the moment, but might
// mausrad -> zoomen
function redraw() {
    chart.attr("transform",
        "translate(" + d3.event.translate + ")" + " scale(" + d3.event.scale + ")");
}

function redraw_drag(x, y, dx, dy) {
    console.log("redraw_drag");
    chart.attr("transform",
        "translate(" + dx + ", " + dy + ")");
}
