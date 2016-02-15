// StateMachine for List UI element in Headstart
// Filename: list.js

var list = StateMachine.create({

    events: [
        { name: "start",  from: "none",    to: "hidden"  },
        { name: "show",   from: "hidden",  to: "visible" },
        { name: "hide",   from: "visible", to: "hidden"  },
        { name: "toggle", from: "hidden",  to: "visible" },
        { name: "toggle", from: "visible", to: "hidden"  },
    ],

    callbacks: {
        onbeforestart: function( event, from, to, bubbles ) {
            this.width = main_canvas.list_width;
            this.papers_list = null;
            this.drawList();
            this.populateList( bubbles.data );
            this.initListMouseListeners();
            sortBy(main_canvas.sort_options[0]);
        },

        onshow: function( event, from, to ) {
            // if the papers_force has stopped.
            if(!papers.is("loading")) {
                d3.select("#sort_container").style("display", "block");
                d3.select("#input_container").style("display", "block");
                d3.select( "#papers_list"     ).style("display", "block");
                d3.select( "#left_arrow"      ).text("\u25B2");
                d3.select( "#right_arrow"     ).text("\u25B2");
                d3.select( "#show_hide_label" ).text("Hide papers");
            }
        },

        onhide: function( event, from, to ) {
            d3.select("#sort_container").style("display", "none");
            d3.select("#input_container").style("display", "none");
            d3.select( "#papers_list"     ).style("display", "none");
            d3.select( "#left_arrow"      ).text("\u25BC");
            d3.select( "#right_arrow"     ).text("\u25BC");
            d3.select( "#show_hide_label" ).text("Show papers");
        },

        onbeforetoggle: function( event, from, to ) {
            if(this.current == "visible") {
               this.hide();
               main_canvas.recordAction("none", "hide_list", main_canvas.user_id, "none", null);
            } else  {
                this.show();
                main_canvas.recordAction("none", "show_list", main_canvas.user_id, "none", null);
            }
        }
    }
});

list.drawShowHideContainer = function() { 
    var list_show_hide_container =
        d3.select ( "#papers_list_container" )
            //.style ( "left",  main_canvas.max_chart_size+10 + "px" )
            //.style ( "width", main_canvas.list_width + "px")
            // .style ( "height", main_canvas.list_height + "px" )
           .append( "div" )
            .attr  ( "id", "show_hide_container" )
            .classed("col-xs-12", true)
            //.style ( "width", main_canvas.list_width-10 + "px" )
            // .style ( "height", main_canvas.list_height + "px" );

    return list_show_hide_container;
}

list.drawList = function() {

    var list_show_hide_container = this.drawShowHideContainer();

    var show_hide = list_show_hide_container.append("div")
      .attr("id", "show_hide")
      .classed("col-xs-12", true);

    showhide_row = show_hide.append("div").classed("row",true)

    this.drawLeftArrow(showhide_row);
    this.drawLabel(showhide_row);
    this.drawRightArrow(showhide_row);

    list_show_hide_container.append("div")
      .attr("id", "input_container")
      .classed("col-xs-6", true)
      .style("display", "none")
      .append("input")
      .classed("form-control",true)
      .attr("type", "text")
      .attr("placeholder", "Search...")
      .attr("oninput", "filterList(event)")
      .attr("size", 15);

    list_show_hide_container.append("div")
      .attr("id", "sort_container")
      .classed("col-xs-6", true)
      .style("display", "none");

    var papers_list = d3.select("#papers_list_container").append("div")
                            .attr("id", "papers_list")
                            .style("height", main_canvas.max_chart_size - main_canvas.list_height_correction + "px")
                            //.style("width", main_canvas.list_width - 10 + "px")
                            .style("display", "none")


    var container = d3.select("#sort_container")
                      .append("ul")
                      .attr("class", "filter")
                      .append("div")
                      .classed("btn-group",true)
                      .attr("id","filter-buttons");

    addSortOption = function(sort_option, selected) {
      d3.select("#filter-buttons").append("button")
        .attr("type","button")
        .classed("btn btn-default",true)
        // .attr("class", function() { return selected?("selected"):("")})
        .attr("id", "sort_" + sort_option)
        .on("click", function() {
          main_canvas.recordAction("none", "sortBy", main_canvas.user_id, "listsort", null, "sort_option=" + sort_option);
          sortBy(sort_option);
        }).text(sort_option);

/*      container.append("li")
        .append("a")
        .attr("class", function() { return selected?("selected"):("")})
        .attr("id", "sort_" + sort_option)
        .on("click", function() {
          main_canvas.recordAction("none", "sortBy", main_canvas.user_id, "listsort", null, "sort_option=" + sort_option);
          sortBy(sort_option);
        }).text(sort_option);*/
    }

    addSortOption(main_canvas.sort_options[0], true);

      var counter = 0;

      for (option in main_canvas.sort_options) {
        if (counter === 0) {
          counter++;
          continue;
        }
        addSortOption(main_canvas.sort_options[option], false);
      }



    this.papers_list = d3.select("#papers_list");
}

function sortBy(field) {
  d3.selectAll("#list_holder")
    .sort(function(a,b) { 
      return stringCompare(a[field], b[field])
      })

    d3.selectAll(".active")
      .attr("class", "btn btn-default")

    d3.select("#sort_" + field)
      .attr("class", "btn btn-default active");
}

function stringCompare(a, b) {
  if(typeof a == 'undefined' || typeof b == 'undefined')
    return;

  else if(typeof a == 'string' && typeof b == 'string') {
    a = a.toLowerCase();
    b = b.toLowerCase();
    return a > b ? 1 : a == b ? 0 : -1;
  }
  else {
    return d3.descending(a, b);
  }
}


list.initListMouseListeners = function() {
  d3.selectAll( "#show_hide" ).on( "mouseover", function (d) {
    list.colorButton( this, '#666', '#EEE' );
  }).on( "mouseout", function (d) {
    list.colorButton( this, '#EEE', '#000' );
  }).on( "click", function (d) {
    list.toggle();
  });

  d3.selectAll( "#list_title" ).on( "click", function(d) {
    list.makeTitleClickable(d);
  });
}

// sets text and background color for a given button
list.colorButton = function( button, background_color, text_color ) {
    d3.select( "#show_hide_container" ).style("background-color", background_color );
    // IE workaround
    d3.select( "#left_arrow" ).style("background-color", background_color );
    d3.select( "#right_arrow").style("background-color", background_color );
    d3.select( "#show_hide_label_container" ).style("background-color", background_color );
    d3.select(button).style( "color", text_color );
}

list.getPaperNodes = function(list_data) {
  return list.papers_list.data(list_data).selectAll("div")
                  .data(list_data)
                  .enter().append("div")
                  .attr("id", "list_holder")
                  .sort(function(a,b) {  return b.readers - a.readers; });
}

list.populateList = function(list_data) {

    list_data.filter(function(el){
        return el !== null;
    });

    var paper_nodes = this.getPaperNodes(list_data);
    this.populateMetaData(paper_nodes);
    this.createAbstracts(paper_nodes);
    this.populateReaders(paper_nodes);
}

list.populateMetaData = function(nodes) {
  
  var paper_title = nodes.append("div")
    .attr("class", "list_metadata")
    .append("p")
    .attr("id", "list_title")
    .html(function (d) { return "<a href=\"#\" id=\"paper_list_title\">" + d.title+"</a> " })
  
  paper_title.filter(function(d) {
        return d.recommended == 1 && d.bookmarked != 1;    
    })
    .append("span")
     .attr("class", "recommended")
     .html("recommended")
     .append("span")
      .html(" ")
   
  if(main_canvas.is_adaptive) {
    paper_title.filter(function(d) {
          return (d.bookmarked != 1);    
      })
      .append("span")
       .attr("class", "tobookmark")
       .attr("id", "bookmark")
       .html("Add to schedule")
       .on("click", function (d) { 
         list.addBookmark(d);      
         d3.event.stopPropagation();
       })
  }
     
  paper_title.filter(function(d) {
        return (d.bookmarked == 1);    
    })
    .append("span")
     .attr("class", "bookmarked")
     .attr("id", "bookmark")
     .html("Already in your schedule X")
     .on("click", function (d) { 
       list.removeBookmark(d);
       d3.event.stopPropagation();
     })
  
  paper_title.append("p")
    .attr("class", "list_details")
    .html(function (d) { return d.authors_string })
    .append("span")
    .attr("class", "list_in")
    .html(" in ")
    .append("span")
    .attr("class", "list_pubyear")
    .html(function (d) { return d.published_in + " (" + d.year + ")" });
}

filterList = function(event) {

  var filtered_data = d3.selectAll("#list_holder, .paper")
  var current_circle = d3.select(main_canvas.current_zoom_node);
  
    var data_circle = filtered_data
    .filter(function (d) {
      if (headstart.states.zoomedin === true) {
        if (main_canvas.use_area_uri)
          return current_circle.data()[0].area_uri == d.area_uri;
        else
          return current_circle.data()[0].title == d.area;
      } else {
        return true;
      }
    })

  if (event.target.value === "") {
    data_circle.style("display", "block")

      main_canvas.bubbles[main_canvas.current_file_number].data.forEach(function (d) {
        d.filtered_out = false;
      })

    return;
  }

  data_circle.style("display", "inline")

  var searchtext = event.target.value;
  var searchtext_processed = searchtext.trim().toLowerCase();
  var search_words = searchtext_processed.split(" ");
  
  main_canvas.recordAction("none", "filter", main_canvas.user_id, "filter_list", null, "search_words=" + search_words);

  filtered_data
    .filter(function (d) {
      var abstract = d.paper_abstract.toLowerCase();
      var title = d.title.toLowerCase();
      var authors = d.authors_string.toLowerCase();
      var word_found = true;
      var count = 0;
      if(typeof abstract !== 'undefined') {
        while(word_found && count < search_words.length) {
          word_found = (abstract.indexOf(search_words[count]) !== -1
            || title.indexOf(search_words[count]) !== -1
            || authors.indexOf(search_words[count]) !== -1);
          count++;
        }
        d.filtered_out = word_found?false:true;
        return d.filtered_out;
      }
      else {
        d.filtered_out = true;
        return false;
      }
    })
  .style("display", "none")
}

list.createAbstracts = function(nodes) {
  nodes.append("div")
    .attr("class", "abstract")
    .append("p")
    .attr("id", "list_abstract")
    .html(function (d) { return list.createAbstract(d, main_canvas.abstract_small) });
}

list.populateReaders = function(nodes) {
  var areas = nodes.append("div")
    .attr("class", "list_readers")
    .append("p")
    .attr("id", "list_area")
    .html(function(d) {
      return "<b>Area:</b> " + d.area
    })
    
  if(!main_canvas.content_based) {
   areas.append("p")
    .attr("id", "list_readers")
    .html(function (d) {
      return d.readers
    })
  .append("span")
    .attr("class", "list_readers_entity")
    .html(" " + main_canvas.base_unit + "&nbsp;");
    
  } else {
    d3.selectAll("#list_area").style("margin-bottom", "7px")
    
  }
}

// called quite often
list.createAbstract = function(d, cut_off) {
    if(cut_off) {
        if(d.paper_abstract.length > cut_off) {
            return d.paper_abstract.substr(0,cut_off) + "...";
        }
    }
    return d.paper_abstract
}

list.addBookmark = function(d)  {
  $.getJSON(main_canvas.service_path + "addBookmark.php?"
    + "user_id=" + main_canvas.user_id
    + "&content_id=" +d.id,
      function(data) {
        console.log("Successfully added bookmark");
        
        main_canvas.recordAction(d.id, "add_bookmark", main_canvas.user_id, d.bookmarked + " " + d.recommended, data);

        d.bookmarked = true;

        d3.selectAll("#bookmark").filter(function(x) {
          return x.id == d.id;
        })
            .attr("class", "bookmarked")
            .html("Already in your schedule X")
             .on("click", function (d) { 
               list.removeBookmark(d); 
               d3.event.stopPropagation();
             })
             
        d3.selectAll("#region").filter(function (x) {
          return x.id == d.id
        })
          .attr("class", "framed_bookmarked")
       }
  );
}

list.removeBookmark = function(d)  {
  $.getJSON(main_canvas.service_path + "removeBookmark.php?"
    + "user_id=" + main_canvas.user_id
    + "&content_id=" +d.id,
      function(data) {
        console.log("Successfully removed bookmark");
        
        main_canvas.recordAction(d.id, "remove_bookmark", main_canvas.user_id, d.bookmarked + " " + d.recommended, data);
        
        d.bookmarked = false;
        
        d3.selectAll("#bookmark").filter(function(x) {
         return x.id == d.id;
       })
            .attr("class", "tobookmark")
            .html("Add to schedule")
             .on("click", function (d) { 
               list.addBookmark(d); 
               d3.event.stopPropagation();
             })
        
        d3.selectAll("#region").filter(function (x) {
          return x.id == d.id
        })
            .attr("class", function (d) {
              return (d.recommended)?("framed"):("unframed");
            })
        
      });
}

list.makeTitleClickable = function(d) {
    main_canvas.current_circle =  main_canvas.chart.selectAll("circle").
                                filter(function (x) {
                                  if (main_canvas.use_area_uri)
                                    return x.area_uri == d.area_uri;
                                  else
                                    return x.title == d.area;
                                });

    main_canvas.bubbles[main_canvas.current_file_number].zoomin(main_canvas.current_circle.data()[0]);
    main_canvas.bubbles[main_canvas.current_file_number].current = "hoverbig";
    papers.mouseoverpaper();
    this.enlargeListItem(d);
    main_canvas.current_enlarged_paper = d;

    main_canvas.recordAction(d.id, "click_paper_list", main_canvas.user_id, d.bookmarked + " " + d.recommended, null);
    
    d3.event.stopPropagation();
}

list.enlargeListItem = function(d) {
    if(main_canvas.current_enlarged_paper != null) {
      if(main_canvas.current_enlarged_paper.id == d.id) {
        return;
      } else {
        this.reset();
        main_canvas.current_enlarged_paper.paper_selected = false;
      }
    }

    this.setListHolderDisplay(d);

    this.papers_list.selectAll("#list_abstract")
                    .html(this.createAbstract(d,main_canvas.abstract_large));

    this.setImageForListHolder(d);
}

list.setListHolderDisplay = function(d) {
  this.papers_list.selectAll("#list_holder")
    .filter(function (x, i) {
        if (main_canvas.use_area_uri)
          return (x.area_uri == d.area_uri);
        else
          return (x.area == d.area);
    })
  .style("display", function (d) { return d.filtered_out?"none":"inline"});

  this.papers_list.selectAll("#list_holder")
    .filter(function (x, i) {
      return (x.id != d.id)
    })
  .style("display", "none");
}

// recreates abstracts, if we zoom out from circle
list.reset = function() {

    d3.selectAll("#list_abstract")
    .html(function (d) {
        return list.createAbstract(d, main_canvas.abstract_small)
    });

    if (main_canvas.current_enlarged_paper !== null) {
      notSureifNeeded();
    }
}

// display a preview image of paper and page if preview image is
// available
list.loadAndAppendImage = function(image_src, page_number) {

    if (this.testImage(image_src)) {
        popup.paper_frame.select("#preview")
           .append("div")
            .attr("id", "preview_page_index")
            .style("width", main_canvas.preview_image_width + "px")
            .html("Page " + page_number)

        popup.paper_frame.select("#preview")
           .append("img")
            .attr("id", "preview_page")
            .attr("class", "lazy")
            .attr("src", image_src)
            .style("height", main_canvas.preview_image_height + "px")
            .style("width", main_canvas.preview_image_width + "px")

    } else {
        return false;
    }
    return true;
}

list.populateOverlay = function (d) {
    
    var this_d = d;
    
    popup.paper_frame
    .style("display","block")
    
    popup.current = "visible";
    
    if(main_canvas.preview_type == "image") {
        list.loadAndAppendImage(main_canvas.images_path + d.id + "/page_1.png", 1);

        var images_finished = false
        , counter = 2;

        while(!images_finished) {
            var image_src = main_canvas.images_path + d.id + "/page_" + counter + ".png";

            if (!list.loadAndAppendImage(image_src, counter)) {
                images_finished = true;
            }

            counter++;
        }
    } else if (main_canvas.preview_type == "pdf") {
        popup.paper_frame.select("#preview")
           .append("iframe")
           .attr("width", 781 - 4)
           .attr("height", 460 - 75)
           .attr("src", function() { 
               return main_canvas.url_plos_pdf + this_d.id 
            })
    }
}

list.setImageForListHolder = function(d) {
  list.papers_list = d3.select("#papers_list");
  var current_item = list.papers_list.selectAll("#list_holder")
    .filter(function (x, i) {
      return (x.id == d.id)
    });

  var image_src = (main_canvas.preview_type=="images")?(main_canvas.images_path + d.id + "/page_1.png"):(main_canvas.images_path + "/preview_pdf.png");

  if (this.testImage(image_src)) {

    current_item.append("div")
      .attr("id", "preview_image")
      .style("width", main_canvas.preview_image_width_list + "px")
      .style("height", main_canvas.preview_image_height_list+ "px")
      .style("background", "url(" + image_src + ")")
      .style("background-size", main_canvas.preview_image_width_list + "px, " + main_canvas.preview_image_height_list+ "px")
      .on("mouseover", function (d) {
        current_item.select("#transbox")
        .style("display", "block");
      })
    .on("mouseout", function (d) {
      current_item.select("#transbox")
      .style("display", "none");
    })
    .append("div")
      .attr("id", "transbox")
      .style("width", main_canvas.preview_image_width_list + "px")
      .style("height", main_canvas.preview_image_height_list+ "px")
      .html("Click here to open preview")
      .on("click", this.populateOverlay)
  }
  
  /*$("#list_title a").hover(function () {
      $(this).css("text-decoration", "none");
  });*/
  
  // EVENTLISTENERS
  current_item.select("#paper_list_title")
    .on("click", function (d) {
        
      var url = "";
      if (main_canvas.url_prefix != null) {
          url = main_canvas.url_prefix + d.url;
      } else if (typeof d.url != 'undefined') {
          url = d.url;
      } else {
          d3.event.stopPropagation();
          return
      }
      
      main_canvas.recordAction(d.id, "click_on_title", main_canvas.user_id, d.bookmarked + " " + d.recommended, null, "url=" + d.url);
      
      window.open(url, "_blank");
      d3.event.stopPropagation();
    });
}


// test if preview Image is available
list.testImage = function(image_src) {

    var http = new XMLHttpRequest();
    http.open('HEAD', image_src, false);
    try {
      http.send();
    } catch (e) {
      console.log(e);
    } finally {
      return http.status != 404;
    }
}

// just a wrapper
list.drawLeftArrow = function(element) {
    element.append("div")
      .attr("id", "left_arrow")
      .classed("col-xs-2", true)
      .text("\u25BC");
}

// just a wrapper
list.drawRightArrow = function(element) {
  element.append("div")
    .attr("id", "right_arrow")
    .classed("col-xs-2", true)
    .text("\u25BC");
}

// just a wrapper
list.drawLabel = function(element) {
  element.append("div")
         .attr("id", "show_hide_label_container")
         .classed("col-xs-8", true)
         .append("strong")
         .attr("id", "show_hide_label")
         .text("Show papers");
}

function notSureifNeeded() {
  var list_holders_local =
    list.papers_list.selectAll("#list_holder")
    .filter(function (d) {
      return (main_canvas.current_enlarged_paper.id == d.id)
    });

  list_holders_local.select("#paper_list_title")
    // EVENTLISTENERS
    .on("click", function (d) {
      list.makeTitleClickable(d)
    });

  var image_node = list_holders_local.select("#preview_image").node();
  if (image_node != null)
    image_node.parentNode.removeChild(image_node);
}