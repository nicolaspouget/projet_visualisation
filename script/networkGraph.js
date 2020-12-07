/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 * .data(graph.links.filter((d) => d.target.country === "Japan" && d.source.country === "Japan"))
 * .data(graph.nodes.filter((d) => d.country === "Japan"))
 * .force("collide", d3.forceCollide(r))
 */

/* global d3 */
function callNetforkFunction(){
    if(nameC!="") {
        networkFunction(nameC);
    }
}

function clearNetwork(){
    d3.select("#networkContains").selectAll("svg").remove();
}

function networkFunction(country) {

    d3.select("#staticBackdropLabel").text("Répartition des artistes associés à leur genre par labels pour le pays : "+country);

    d3.select("#loader").attr("hidden", null);

    let allData = [];
    let nodesTable = [];
    let linksTable = [];



    d3.json("wasabi-artist.json").then(function (graph) {

        function updatePays(pays) {
            graph.forEach((item, index) => {
                var labels = item.labels.replace("[", "").replace("]", "").replace("\"", "").replace("\"", "").replace("\",\"", ",").split(",");
                var genres = item.genres.replace("[", "").replace("]", "").replace("\"", "").replace("\"", "").replace("\",\"", ",").split(",");


                if (item.location.country == pays) {
                    labels.forEach((label, index) => {
                        label = label.replace("\"", "").replace("\"", "");
                        if (label !== "") {
                            if (!nodesTable.find(n => n.name == label && n.country == item.location.country)) {
                                let noeudlabel = new Object();
                                noeudlabel.name = label;
                                noeudlabel.nbArtist = 1;
                                noeudlabel.country = item.location.country;
                                noeudlabel.category = 1;
                                nodesTable.push(noeudlabel);
                            } else {
                                let noeud = nodesTable.find(n => n.name == label);
                                noeud.nbArtist = noeud.nbArtist + 1;
                            }

                            if (!linksTable.find(n => n.source == label && n.target == item.name)) {
                                let noeudlien1 = new Object();
                                noeudlien1.source = label;
                                noeudlien1.target = item.name;
                                linksTable.push(noeudlien1);
                            }
                        }
                    });

                    genres.forEach((genre, index) => {
                        genre = genre.replace("\"", "").replace("\"", "");
                        if (genre !== "") {
                            if (!nodesTable.find(n => n.name == genre && n.country == item.location.country)) {
                                let noeudlabel = new Object();
                                noeudlabel.name = genre;
                                noeudlabel.nbArtist = 1;
                                noeudlabel.country = item.location.country;
                                noeudlabel.category = 2;
                                nodesTable.push(noeudlabel);
                            } else {
                                let noeud = nodesTable.find(n => n.name == genre && n.country == item.location.country);
                                noeud.nbArtist = noeud.nbArtist + 1;
                            }

                            if (!linksTable.find(n => n.source == item.name && n.target == genre)) {
                                let noeudlien1 = new Object();
                                noeudlien1.source = item.name;
                                noeudlien1.target = genre;
                                linksTable.push(noeudlien1);
                            }
                        }
                    });
                    if (!nodesTable.find(n => n.name == item.name)) {
                        let noeudlabel = new Object();
                        noeudlabel.name = item.name;
                        noeudlabel.nbArtist = 1;
                        noeudlabel.country = item.location.country;
                        noeudlabel.category = 3;
                        nodesTable.push(noeudlabel);
                    }
                }
            });
        }

        updatePays(country);

        d3.select("#loader").attr("hidden", "true");


        var width = 800;
        var height = 620;

        var r = 3;
        var color = d3.scaleOrdinal(d3.schemeSet2)
            .domain([0, 3]);



        const svg = d3.select("#networkContains")
            .append("svg")
            .attr("width", width)
            .attr("height", height);


        var simulation = d3.forceSimulation(nodesTable)
            .force("x", d3.forceX(width / 2))
            .force("y", d3.forceY(height / 2))
            .force("link", d3.forceLink(linksTable).id(d => d.name))
            .force("collide", d3.forceCollide(r))
            .force("charge", d3.forceManyBody())
            .force("center", d3.forceCenter(width / 2, height / 2));

        var g = svg.append("g")
            .attr("class", "everything");

        var link = g.append("g")
            .attr("class", "links")
            .selectAll("line")
            .data(linksTable)
            .enter().append("line")
            .attr("stroke-width", function (d) {
                return d.nbArtist + 5;
            })
            .attr("stroke", "#999")
            .attr("stroke-opacity", 0.6);
/*
        var link = g.append("g")
            .attr("stroke", "#999")
            .attr("stroke-opacity", 0.6)
            .selectAll("line")
            .data(linksTable)
            .join("line")
            .attr("stroke-width", function (d) {
                return d.nbArtist + 5;
            });*/

        /*var node = g.append("g")
            .attr("stroke", "#fff")
            .attr("stroke-width", 1.5)
            .selectAll("circle")
            .data(nodesTable)
            .join("circle")
            .attr("r", function (d) {
                var rayon = 0;
                if (d.category !== 3 && d.nbArtist > 2) {
                    rayon = d.nbArtist / 2;
                } else {

                    rayon = d.nbArtist;
                }
                return rayon + 3;
            })
            .attr("fill", function (d) {
                return color(d.category);
            })
            .on('mouseover.fade', fade(0.1))
            .on('mouseout.fade', fade(1));*/

        var node = g.selectAll('.nodes')
            .data(nodesTable)
            .enter().append('g')
            .attr('class', 'nodes');

        node.append('circle')
            .attr("stroke", "#fff")
            .attr("stroke-width", 1.5)
            .attr("r", function (d) {
                var rayon = 0;
                if (d.category !== 3 && d.nbArtist > 2) {
                    rayon = d.nbArtist / 2;
                } else {

                    rayon = d.nbArtist;
                }
                return rayon + 3;
            })
            .attr("fill", function (d) {
                return color(d.category);
            })
            .on('mouseover.fade', fade(0.1, false))
            .on('mouseout.fade', fade(1, true));

        node.append("text")
            .attr('class', 'labelNode')
            .attr("dx", 12)
            .attr("dy", ".35em")
            .attr("hidden", true)
            .text(function (d) { return d.name });

        node.append("title")
            .text(function (d) {
                var result = "";
                if (d.category === 1) {
                    result = "Label : " + d.name + "\n" + " Nombre d'artistes : " + d.nbArtist ;
                }
                if (d.category === 2) {
                    result = "Genre : " + d.name + "\n" + " Nombre d'artistes : " + d.nbArtist ;
                }
                if (d.category === 3) {
                    result = "Artiste : " + d.name ;
                }
                return result;
            });

        var labels = node.selectAll("text");

        simulation.on("tick", () => {
            node.attr('transform', d => `translate(${d.x},${d.y})`);
            link.attr("x1", d => d.source.x)
                .attr("y1", d => d.source.y)
                .attr("x2", d => d.target.x)
                .attr("y2", d => d.target.y);
        });

        var drag_handler = d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended);

        drag_handler(node);

        function dragstarted() {
            if (!d3.event.active)
                simulation.alphaTarget(0.3).restart();
            d3.event.subject.fx = d3.event.subject.x;
            d3.event.subject.fy = d3.event.subject.y;
        }

        function dragged() {
            d3.event.subject.fx = d3.event.x;
            d3.event.subject.fy = d3.event.y;
        }

        function dragended() {
            if (!d3.event.active)
                simulation.alphaTarget(0);
            d3.event.subject.fx = null;
            d3.event.subject.fy = null;
        }

        var zoom_handler = d3.zoom()
            .on("zoom", zoom_actions);

        zoom_handler(svg);

        function zoom_actions() {
            g.attr("transform", d3.event.transform)
        }

        //highlight
        const linkedByIndex = {};
        linksTable.forEach(function (d) {
            linkedByIndex[`${d.source.index},${d.target.index}`] = 1;
        });

        function isConnected(a, b) {
            return linkedByIndex[`${a.index},${b.index}`] || linkedByIndex[`${b.index},${a.index}`] || a.index === b.index;
        }

        function fade(opacity, showLabel) {
            return function (d) {
                node.style('stroke-opacity', function (o) {
                    const thisOpacity = isConnected(d, o) ? 1 : opacity;
                    this.setAttribute('fill-opacity', thisOpacity);
                    return thisOpacity;
                });

                node.nodes().forEach(function (o) {
                    o = d3.select(o);
                    if(isConnected(d, o.data()[0])) {
                        o.select('text').attr('hidden', showLabel || null);
                    }
                });

                link.style('stroke-opacity', o => (o.source === d || o.target === d ? 1 : opacity));
            };
        }
    });
}