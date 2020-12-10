var nbGenre = 9;
var nbArtistes = 500;
var svg;

//maj des figures
function update(val, val2){
    if(val!==undefined){
        nbGenre = val;
    }
    if(val2!==undefined){
        nbArtistes = val2;
    }
    document.getElementById('textInput').value=nbGenre;
    document.getElementById('textInputArtistes').value=nbArtistes;
    window.location.hash = "";
    //treemap
    d3.json("../data/treemap-data.json", function(err, res) {
        if (!err) {
            res = res.slice(0,nbGenre);
            console.log(nbGenre);
            for(let i=0;i<res.length;i++){
                res[i].values = res[i].values.slice(0, nbArtistes);
            }
            document.getElementById("chart").innerHTML = "";
            main({title: "Genres et artistes les plus populaires sur Deezer"}, {key: "Deezer", values: res});
        }
    });
    if(val2===undefined){
        //sunburst
        d3.json("../data/sunburst-data.json", function(err, res) {
            if (!err) {
                for(let i=0;i<res.children.length;i++){
                    for(let j=0;j<res.children[i].children.length;j++){
                        res.children[i].children[j].children = res.children[i].children[j].children.slice(0, nbGenre);
                    }
                }
                console.log(res);
                document.getElementById("sunburst").innerHTML = "";
                displaySunburst(res);
            }
        });
    }
}

window.addEventListener('message', function(e) {
    var opts = e.data.opts,
        data = e.data.data;

    return main(opts, data);
});

//taille treemap
var defaults = {
    margin: {top: 24, right: 0, bottom: 0, left: 0},
    rootname: "TOP",
    format: ",d",
    title: "",
    width: 600,
    height: 400
};

//on load la figure
function main(o, data) {
    var root,
        opts = $.extend(true, {}, defaults, o),
        formatNumber = d3.format(opts.format),
        rname = opts.rootname,
        margin = opts.margin,
        theight = 36 + 16;

    $('#chart').width(opts.width).height(opts.height);
    var width = opts.width - margin.left - margin.right,
        height = opts.height - margin.top - margin.bottom - theight,
        transitioning;

    //couleurs
    var color = d3.scale.ordinal()
        .domain(["foo", "bar", "baz"])
        .range(colorbrewer.RdPu[5]);


    var x = d3.scale.linear()
        .domain([0, width])
        .range([0, width]);

    var y = d3.scale.linear()
        .domain([0, height])
        .range([0, height]);

    var treemap = d3.layout.treemap()
        .children(function(d, depth) { return depth ? null : d._children; })
        .sort(function(a, b) { return a.value - b.value; })
        .ratio(height / width * 0.5 * (1 + Math.sqrt(5)))
        .round(false);

    svg = d3.select("#chart").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.bottom + margin.top)
        .style("margin-left", -margin.left + "px")
        .style("margin.right", -margin.right + "px")
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .style("shape-rendering", "crispEdges");

    var grandparent = svg.append("g")
        .attr("class", "grandparent");

    grandparent.append("rect")
        .attr("y", -margin.top)
        .attr("width", width)
        .attr("height", margin.top);

    grandparent.append("text")
        .attr("x", 6)
        .attr("y", 6 - margin.top)
        .attr("dy", ".75em");

    if (opts.title) {
        $("#chart").prepend("<p class='title'>" + opts.title + "</p>");
    }
    if (data instanceof Array) {
        root = { key: rname, values: data };
    } else {
        root = data;
    }

    initialize(root);
    accumulate(root);
    layout(root);
    console.log(root);
    display(root);

    if (window.parent !== window) {
        var myheight = document.documentElement.scrollHeight || document.body.scrollHeight;
        window.parent.postMessage({height: myheight}, '*');
    }

    function initialize(root) {
        root.x = root.y = 0;
        root.dx = width;
        root.dy = height;
        root.depth = 0;
    }

    // Aggregate the values for internal nodes. This is normally done by the
    // treemap layout, but not here because of our custom implementation.
    // We also take a snapshot of the original children (_children) to avoid
    // the children being overwritten when when layout is computed.
    function accumulate(d) {
        return (d._children = d.values)
            ? d.value = d.values.reduce(function(p, v) { return p + accumulate(v); }, 0)
            : d.value;
    }

    // Compute the treemap layout recursively such that each group of siblings
    // uses the same size (1×1) rather than the dimensions of the parent cell.
    // This optimizes the layout for the current zoom state. Note that a wrapper
    // object is created for the parent node for each group of siblings so that
    // the parent’s dimensions are not discarded as we recurse. Since each group
    // of sibling was laid out in 1×1, we must rescale to fit using absolute
    // coordinates. This lets us use a viewport to zoom.
    function layout(d) {
        if (d._children) {
            treemap.nodes({_children: d._children});
            d._children.forEach(function(c) {
                c.x = d.x + c.x * d.dx;
                c.y = d.y + c.y * d.dy;
                c.dx *= d.dx;
                c.dy *= d.dy;
                c.parent = d;
                layout(c);
            });
        }
    }

    function display(d) {
        grandparent
            .datum(d.parent)
            .on("click", transition)
            .select("text")
            .text(name(d));

        var g1 = svg.insert("g", ".grandparent")
            .datum(d)
            .attr("class", "depth");

        var g = g1.selectAll("g")
            .data(d._children)
            .enter().append("g");

        g.filter(function(d) { return d._children; })
            .classed("children", true)
            .on("click", transition);

        var children = g.selectAll(".child")
            .data(function(d) { return d._children || [d]; })
            .enter().append("g");

        children.append("rect")
            .attr("class", "child")
            .call(rect)
            .append("title")
            .text(function(d) { return d.key + " (" + formatNumber(d.value) + ")"; });
        children.append("text")
            .attr("class", "ctext")
            .text(function(d) { return d.key; })
            .call(text2);

        g.append("rect")
            .attr("class", "parent")
            .call(rect);

        var t = g.append("text")
            .attr("class", "ptext")
            .attr("dy", ".75em")

        t.append("tspan")
            .text(function(d) { return d.key; });
        t.append("tspan")
            .attr("dy", "1.0em")
            .text(function(d) { return formatNumber(d.value); });
        t.call(text);

        //on change la transparence du noeud en fonction de sa valeur
        g.selectAll("rect")
            .style("fill", function(d) { return color(name(d.parent)); })
            .style("opacity", function(d){
                return (d.value/d.parent.value)*30 > 0.3 ? (d.value/d.parent.value)*30 : 0.3});

        //transistions
        function transition(d) {
            if (transitioning || !d) return;
            transitioning = true;

            var g2 = display(d),
                t1 = g1.transition().duration(300),
                t2 = g2.transition().duration(300);

            // Update the domain only after entering new elements.
            x.domain([d.x, d.x + d.dx]);
            y.domain([d.y, d.y + d.dy]);

            // Enable anti-aliasing during the transition.
            svg.style("shape-rendering", null);

            // Draw child nodes on top of parent nodes.
            svg.selectAll(".depth").sort(function(a, b) { return a.depth - b.depth; });

            // Fade-in entering text.
            g2.selectAll("text").style("fill-opacity", 0);

            // Transition to the new view.
            t1.selectAll(".ptext").call(text).style("fill-opacity", 0);
            t1.selectAll(".ctext").call(text2).style("fill-opacity", 0);
            t2.selectAll(".ptext").call(text).style("fill-opacity", 1);
            t2.selectAll(".ctext").call(text2).style("fill-opacity", 0);
            t1.selectAll("rect").call(rect);
            t2.selectAll("rect").call(rect);

            // Remove the old node when the transition is finished.
            t1.remove().each("end", function() {
                svg.style("shape-rendering", "crispEdges");
                transitioning = false;
            });
        }

        return g;
    }

    function text(text) {
        text.selectAll("tspan")
            .attr("x", function(d) { return x(d.x) + 6; })
        text.attr("x", function(d) { return x(d.x) + 6; })
            .attr("y", function(d) { return y(d.y) + 6; })
            .style("opacity", function(d) { return this.getComputedTextLength() < x(d.x + d.dx) - x(d.x) ? 1 : 0; });
    }

    function text2(text) {
        text.attr("x", function(d) { return x(d.x + d.dx) - this.getComputedTextLength() - 6; })
            .attr("y", function(d) { return y(d.y + d.dy) - 6; })
            .style("opacity", 0);
    }

    function rect(rect) {
        rect.attr("x", function(d) { return x(d.x); })
            .attr("y", function(d) { return y(d.y); })
            .attr("width", function(d) { return x(d.x + d.dx) - x(d.x); })
            .attr("height", function(d) { return y(d.y + d.dy) - y(d.y); });
    }

    function name(d) {
        return d.parent
            ? name(d.parent) + " / " + d.key + " (" + formatNumber(d.value) + ")"
            : d.key + " (" + formatNumber(d.value) + ")";
    }
}

if (window.location.hash === "") {
    update(undefined, undefined);
}

//sunburst
function displaySunburst(root){
    //taille
    var width = 400,
        height = 400,
        radius = Math.min(width, height) / 2;

    var x = d3.scale.linear()
        .range([0, 2 * Math.PI]);

    var y = d3.scale.linear()
        .range([0, radius]);
    //pour choisir les couleurs dans la bibliotheque V3
    var o = d3.scale.ordinal()
        .domain(["foo", "bar", "baz"])
        .range(colorbrewer.RdPu[5]);

    var svg = d3.select("#sunburst").append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", "translate(" + width / 2 + "," + (height / 2 + 1) + ")");

    var partition = d3.layout.partition()
        .value(function(d) { return d.value; });

    var arc = d3.svg.arc()
        .startAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x))); })
        .endAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x + d.dx))); })
        .innerRadius(function(d) { return Math.max(0, y(d.y)); })
        .outerRadius(function(d) { return Math.max(0, y(d.y + d.dy)); });
    //pour cacher les labels quand la portion est trop petite
    var kx = width, ky = height;

    //**********************
    //        TOOLTIP
    //**********************
    var Tooltip = d3.select("#sunburst")
        .append("div")
        .attr("class", "tooltip")
        .style("opacity", 0)
        .style("background-color", "#545f69")
        .style("color", "white")
        .style("border-width", "2px")
        .style("border-radius", "5px")
        .style("padding", "5px");


    /**
     * Intégration des données avec le JSON
     */
    var g = svg.selectAll("g")
        .data(partition.nodes(root))
        .enter().append("g");

    var path = g.append("path")
        .attr("d", arc)
        .style("fill", function(d) { return o((d.children ? d : d.parent).name); })
        .on("click", click)
        .on("mousemove", function(d) {
            console.log(d);
            Tooltip.transition()
                .duration(200)
                .style("opacity", .9);
            Tooltip.html("value : "+d.value)
                .style("left", (d3.event.pageX) + "px") //change le diisplay du tooltip selon les coordonnées de la souris
                .style("top", (d3.event.pageY - 28) + "px");
        })
        .on("mouseout", function(d) {
            Tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        });


    var text = g.append("text")
        .attr("transform", function(d) { return "rotate(" + computeTextRotation(d) + ")"; })
        .attr("x", function(d) { return y(d.y); })
        .attr("dx", "6") // margin
        .attr("dy", ".35em") // vertical-align
        .attr("opacity", function(d) { return d.dx * ky > 10 ? 1 : 0; })
        .text(function(d) { return d.name; });


    function click(d) {
        // fade out all text elements
        text.transition().attr("opacity", 0);

        kx = (d.y ? width - 40 : width) / (1 - d.y);
        ky = height / d.dx;

        path.transition()
            .duration(750)
            .attrTween("d", arcTween(d))
            .each("end", function(e, i) {
                // check if the animated element's data e lies within the visible angle span given in d
                if (e.x >= d.x && e.x < (d.x + d.dx)) {
                    // get a selection of the associated text element
                    var arcText = d3.select(this.parentNode).select("text");
                    // fade in the text element and recalculate positions
                    arcText.transition().duration(750)
                        .attr("opacity", 1)
                        .attr("opacity", function(d) { return d.dx * ky > 10 ? 1 : 0; })
                        .attr("transform", function() { return "rotate(" + computeTextRotation(e) + ")" })
                        .attr("x", function(d) { return y(d.y); });
                }
            });
    }

    d3.select(self.frameElement).style("height", height + "px");

    // Interpolate the scales!
    function arcTween(d) {
        var xd = d3.interpolate(x.domain(), [d.x, d.x + d.dx]),
            yd = d3.interpolate(y.domain(), [d.y, 1]),
            yr = d3.interpolate(y.range(), [d.y ? 20 : 0, radius]);
        return function(d, i) {
            return i
                ? function(t) { return arc(d); }
                : function(t) { x.domain(xd(t)); y.domain(yd(t)).range(yr(t)); return arc(d); };
        };
    }

    function computeTextRotation(d) {
        return (x(d.x + d.dx / 2) - Math.PI / 2) / Math.PI * 180;
    }
}

