/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var countriesValues = [];

d3.json("CountryDecade.json").then(function(data) {
    data.forEach(function(p){
        countriesValues.push(p);
    });
});


const width = 1200, height = 650;

const svg = d3.select('#map').append("svg")
    .attr("id", "svg")
    .attr("width", width)
    .attr("height", height)
    .style("border", "solid 1px")
    .style("border-color", "gray");

/*
 * .call(d3.zoom().on("zoom", function () {
       svg.attr("transform", d3.event.transform);
    }))
 */



const path = d3.geoPath();

var projection = d3.geoMercator()
    .center([-40,45])                // GPS of location to zoom on
    .scale(150)                       // This is like the zoom
    .translate([ width/2, height/2 ]);
    
path.projection(projection);


const deps = svg.append("g");


// create a tooltip
    var Tooltip = d3.select("#map")
      .append("div")
      .attr("class", "tooltip")
      .style("opacity", 0)
      .style("background-color", "#545f69")
      .style("color", "white")
      .style("border-width", "2px")
      .style("border-radius", "5px")
      .style("padding", "5px");
      
      // Three function that change the tooltip when user hover / move / leave a cell
    var mouseover = function(d) {
      Tooltip.style("opacity", 1);
      d3.select(this).attr("fill-opacity", 1)
          .attr("stroke", "#3c0036");
    }
    var mousemove = function(d) {
        
      Tooltip
        .html(d.country+"<br>" + "Count :  "  + d.sum)
        .style("left", (d3.mouse(this)[0]+200) + "px")
        .style("top", (d3.mouse(this)[1]+90) + "px");

    }
    var mouseleave = function(d) {
      Tooltip.style("opacity", 0);

        d3.select(this).attr("fill-opacity", .6)
            .attr("stroke", "#8d1e83");
    }


    // Add a scale for bubble size
    var sizeAll = function(d){
        if(d>6000){
            if(d>10000){
                d=10000+d*0.25;
            }else{
                d=6000+d*0.5;
            }
        }
        return 2+(40*(d)/10000);
    }

    // Legend

// Add legend: circles
var valuesToShow = [1000, 5000, 20000]
var xCircle = 75;
var xLabel = 225;
var yCircle = 540;

svg.append("text")
    .attr("x", 20 )
    .attr("y", 400) // 100 is where the first dot appears. 25 is the distance between dots
    .style("opacity", 1)
    .text("Nombre d'artistes")
    .attr("text-anchor", "left")
    .style("alignment-baseline", "middle")
    .style("font-weight", "bold");

svg
    .selectAll("legend")
    .data(valuesToShow)
    .enter()
    .append("circle")
    .attr("cx", xCircle)
    .attr("cy", function(d){ return yCircle - sizeAll(d) } )
    .attr("r", function(d){ return sizeAll(d) })
    .style("fill", "none")
    .attr("stroke", "black")

// Add legend: segments
svg
    .selectAll("legend")
    .data(valuesToShow)
    .enter()
    .append("line")
    .attr('x1', function(d){ return xCircle + sizeAll(d) } )
    .attr('x2', xLabel)
    .attr('y1', function(d){ return yCircle - sizeAll(d) } )
    .attr('y2', function(d){ return yCircle - sizeAll(d) } )
    .attr('stroke', 'black')
    .style('stroke-dasharray', ('2,2'))

// Add legend: labels
svg
    .selectAll("legend")
    .data(valuesToShow)
    .enter()
    .append("text")
    .attr('x', xLabel)
    .attr('y', function(d){ return yCircle - sizeAll(d) } )
    .text( function(d){ return d } )
    .style("font-size", 10)
    .attr('alignment-baseline', 'middle')




    // create a list of keys
    var keys = ["Pop", "Rock", "Hip Hop", "Indie Rock", "Alternative Rock", "Folk", "Others"]

    // Usually you have a color scale in your chart already
    var color = d3.scaleOrdinal()
        .domain(keys)
        .range(d3.schemeSet1);


    svg.append("text")
        .attr("x", 20 )
        .attr("y", 130) // 100 is where the first dot appears. 25 is the distance between dots
        .style("opacity", 1)
        .text("Genres musicaux populaires")
        .attr("text-anchor", "left")
        .style("alignment-baseline", "middle")
        .style("font-weight", "bold");

    // Add one dot in the legend for each name.
    var size = 20
    svg.selectAll("mydots")
        .data(keys)
        .enter()
        .append("rect")
        .attr("x", 20)
        .attr("y", function(d,i){ return 145 + i*(size+5)}) // 100 is where the first dot appears. 25 is the distance between dots
        .attr("width", size)
        .attr("height", size)
        .style("opacity", 1)
        .style("fill", function(d){ return color(d)})

    // Add one dot in the legend for each name.
    svg.selectAll("mylabels")
        .data(keys)
        .enter()
        .append("text")
        .attr("x", 20 + size*1.2)
        .attr("y", function(d,i){ return 145 + i*(size+5) + (size/2)}) // 100 is where the first dot appears. 25 is the distance between dots
        .style("fill", function(d){ return color(d)})
        .style("opacity", 1)
        .text(function(d){ return d})
        .attr("text-anchor", "left")
        .style("alignment-baseline", "middle")


var nameC = "";


d3.json('geoGenre.json').then(function(geojson) {

    
    // Map creation
    deps.selectAll("path")
        .data(geojson.features)
        .enter()
        .append("path")
        .attr("d", path)
        .style('fill', function(d){

            var i = 0;
            var indiceK = 0;
            keys.forEach(function(k){
                if (k == d.genre){
                    indiceK = i;
                }else{
                    i++;
                }
            })

            return color(keys[indiceK]);

        })
        .attr("stroke", "#F2F2F2")
        .attr("stroke-width", 1)
        .style("opacity", 0.5)
        .on("click", function(d) {
            nameC = d.properties.name;
            d3.select("#countryChoiced").text(nameC);
            d3.select("#changeVisu").attr("hidden", null);
        })
        .on("mouseover", function(d) {
            d3.select(this).style("opacity", 1);
        })
        .on("mouseleave", function(d) {
            d3.select(this).style("opacity", 0.5);
        }).append("title").text(d => d.genre);



    // Circles creation
    var circles = svg
        .selectAll("myCircles")
        .data(countriesValues)
        .enter().append('circle')
        .attr("class" , function(d){ val = "Decade"+d.decade; return val })
        .attr("cx", function(d) { return projection([d.longitude, d.latitude])[0];
        })		 
        .attr("cy", function(d) { return projection([d.longitude, d.latitude])[1];
        })
        .style("fill", "D700C4")
        .style("opacity", 0).attr("r", 0)
        .attr("stroke", "#8d1e83")
        .attr("stroke-width", 1)
        .attr("fill-opacity", .6)
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseleave", mouseleave)
        .on("click", function(d) {
            nameC = d.country;
            d3.select("#countryChoiced").text(nameC);
            d3.select("#changeVisu").attr("hidden", null);
        });


        // Manage the displaying of the circles
        function update(){
            
            // For each check box:
            d3.selectAll(".checkbox").each(function(d){
              var cb = d3.select(this);
              var decade = cb.property("value");

              var decadeChoosen = document.getElementById("currentDecadeValue").value;

              var displayingDecade = d3.select("#displayingDecade");

              // If the box is check, I show the group
              if(!cb.property("checked")){
                  
                    displayingDecade.attr("hidden", "true");
                  
                    svg.selectAll(".Decade"+decade).transition().duration(1000).style("opacity", 1).attr("r", function(d){ return sizeAll(d.count) });

                    // We hide all datas we don't need

                    for(var i = 1880; i<2021; i+=10){
                        
                        svg.selectAll(".Decade"+i).style("opacity", 0).attr("r", 0);
                    }

                    // We display the displaying of te decades

                    d3.select("#currentDecadeValue").attr("hidden","true");
                    
                    d3.select("#currentDecadeValue").attr("disabled","true");
                    
              // Otherwise I hide it
              }else{
                  
                    displayingDecade.attr("hidden", null);
                  
                    displayingDecade.html("Décennie : "+decadeChoosen);
                
                   svg.selectAll(".Decade"+decade).transition().duration(1000).style("opacity", 0).attr("r", 0);
                   
                   
                   svg.selectAll(".Decade"+decadeChoosen).transition().duration(1000).style("opacity", 1).attr("r", function(d){ return sizeAll(d.sum) });

                  // We hide the displaying of the decade

                  d3.select("#currentDecadeValue").attr("hidden",null);
                   
                    d3.select("#currentDecadeValue").attr("disabled",null);
                   
              }
            });
          }
          
          // When a button change, I run the update function
            d3.selectAll(".checkbox").on("change",update);

            // And I initialize it at the beginning
            update();

});

function changeVal(){

    var decadeChoosen = document.getElementById("currentDecadeValue").value;

    var displayingDecade = d3.select("#displayingDecade");

    // We hide all datas we don't need
    for(var i = 1880; i<2021; i+=10){
        if(i!=decadeChoosen)
            svg.selectAll(".Decade"+i).style("opacity", 0).attr("r", 0);
    }

    svg.selectAll(".Decade"+decadeChoosen).style("opacity", 1).attr("r", function(d){ return sizeAll(d.sum) });

    // We hide the displaying of the decade

    displayingDecade.attr("hidden", null);

    displayingDecade.html("Décennie : "+decadeChoosen);

}


