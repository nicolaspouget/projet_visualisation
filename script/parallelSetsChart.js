/* import data JSON */
d3.json("../data/parallel-sets-data.json").then(function(dataJSON){
    let keys = dataJSON[dataJSON.length-1].slice(0,-1);
    dataJSON.pop();
    let dataChart = dataProcess(dataJSON);

    /**
     * Initialisation des checkbox pour le genre
     */
    generateCheckBox("types", dataChart.types);
    generateCheckBox("genres", dataChart.genres);
    generateCheckBox("urls", dataChart.urls);

    //tooltip
    let tooltip = d3.select("body")
        .append("div")
        .style("position", "absolute")
        .style("z-index", "10")
        .style("background", "whitesmoke")
        .style("visibility", "hidden");

    /**
     * Mise en place du svg
     */
    let width = 1170, height= 400;
    let svg = d3.select("#chart")
        .append("div")
        .attr("class", "row")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    /**
     * Mise en place du parallel sets
     */
    const sankey = d3.sankey()
        .nodeSort(null)
        .linkSort(null)
        .nodeWidth(4)
        .nodePadding(20)
        .extent([[0, 5], [width, height - 5]])

    /**
     * Data pour le parallel sets
     */
    const a = sankey({
        nodes: dataChart.nodes.map(d => Object.assign({}, d)),
        links: dataChart.links.map(d => Object.assign({}, d))
    });

    /**
     * Pour les nodes du parallel sets
     */
    svg.append("g")
        .selectAll("rect")
        .data(a.nodes)
        .join("rect")
        .attr("x",  d => d.x0)
        .attr("y", d => d.y0)
        .attr("height", d => d.y1 - d.y0)
        .attr("width", d => d.x1 - d.x0)
        .append("title")
        .text(d => `${d.name}\n${d.value.toLocaleString()}`);

    /**
     * Pour les links du parallel sets
     */
    svg.append("g")
        .attr("fill", "none")
        .selectAll("g")
        .data(a.links)
        .join("path")
        .attr("d", d3.sankeyLinkHorizontal())
        .attr("stroke", "#919090")
        .style('stroke-opacity', 0.5)
        .attr("stroke-width", d => d.width)
        .style("mix-blend-mode", "multiply")
        .on("mouseover", function(d){
            d3.select(this)
                .attr("stroke", "#3182bd")
                .style('stroke-opacity', 1);

            return tooltip.style("visibility", "visible")
                .style("font-family", "Arial")
                .style("font-size", "12px")
                .text(d.names.join(" → ")+"\n"+d.value.toLocaleString());
        })
        .on("mousemove", function(){
            return tooltip
                    .style("top", (event.pageY-10)+"px")
                    .style("left",(event.pageX+10)+"px");
        })
        .on("mouseout", function(){
            d3.select(this)
                .attr("stroke", "#919090")
                .style('stroke-opacity', 0.5);
            return tooltip.style("visibility", "hidden");
        });

    /**
     * Gestion libellés des Nodes
     */
    svg.append("g")
        .style("font-family", "Arial")
        .style("font-size", "14px")
        .selectAll("text")
        .data(a.nodes)
        .join("text")
        .attr("x", d => d.x0 < width / 2 ? d.x1 + 6 : d.x0 - 6)
        .attr("y", d => (d.y1 + d.y0) / 2)
        .attr("dy", "0.35em")
        .attr("text-anchor", d => d.x0 < width / 2 ? "start" : "end")
        .text(d => d.name)
        .append("tspan")
        .attr("fill-opacity", 0.7);

    let tabTypes=[];
    /**
     * Evènement on change sur les checkbox de genres
     * Permet la MAJ des données
     */
    let typeSize = dataChart.types.length;
    d3.select("#labels-types")
        .selectAll("input[name='checkbox-types']")
        .on("change", function(data) {
            if(d3.select(this).property("checked")===true){
                typeSize++;
            }else{
                typeSize--;
            }
            if(typeSize===0){
                alert("Il doit rester au minimum 1 type !");
                d3.select(this).property("checked", true);
                typeSize++;
            }else{
                if(!tabTypes.includes(data)){
                    tabTypes.push(data);
                }else{
                    for(let i=0;i<tabTypes.length;i++){
                        if (tabTypes[i] === data) {
                            tabTypes.splice(i, 1);
                        }
                    }
                }
                d3.json("../data/parallel-sets-data.json").then(function(dataJSON){
                    dataJSON[dataJSON.length-1].slice(0,-1);
                    dataJSON.pop();
                    update(dataJSON, tabTypes);
                });
            }
        });

    /**
     * Evènement on change sur les checkbox de genres
     * Permet la MAJ des données
     */
    let genreSize = dataChart.genres.length;
    d3.select("#labels-genres")
        .selectAll("input[name='checkbox-genres']")
        .on("change", function(data) {
            console.log("castor");
            if(d3.select(this).property("checked")===true){
                genreSize++;
            }else{
                genreSize--;
            }
            if(genreSize===0){
                alert("Il doit rester au minimum 1 genre !");
                d3.select(this).property("checked", true);
                genreSize++;
            }else{
                if(!tabTypes.includes(data)){
                    tabTypes.push(data);
                }else{
                    for(let i=0;i<tabTypes.length;i++){
                        if (tabTypes[i] === data) {
                            tabTypes.splice(i, 1);
                        }
                    }
                }
                d3.json("../data/parallel-sets-data.json").then(function(dataJSON){
                    dataJSON[dataJSON.length-1].slice(0,-1);
                    dataJSON.pop();
                    update(dataJSON, tabTypes);
                });
            }
        });

    /**
     * Evènement on change sur les checkbox des plateformes
     * Permet la MAJ des données
     */
    let urlSize = dataChart.urls.length;
    d3.select("#labels-urls")
        .selectAll("input[name='checkbox-urls']")
        .on("change", function(data) {
            console.log("castor");
            if(d3.select(this).property("checked")===true){
                urlSize++;
            }else{
                urlSize--;
            }
            if(urlSize===0){
                alert("Il doit rester au minimum 1 plateforme !");
                d3.select(this).property("checked", true);
                urlSize++;
            }else{
                if(!tabTypes.includes(data)){
                    tabTypes.push(data);
                }else{
                    for(let i=0;i<tabTypes.length;i++){
                        if (tabTypes[i] === data) {
                            tabTypes.splice(i, 1);
                        }
                    }
                }
                d3.json("../data/parallel-sets-data.json").then(function(dataJSON){
                    dataJSON[dataJSON.length-1].slice(0,-1);
                    dataJSON.pop();
                    update(dataJSON, tabTypes);
                });
            }
        });

    /**
     * Fonction qui permet de structuer les données pour la visualisation
     * @param data correspond aux données
     * @returns {{types: [], urls: [], nodes: [], genres: [], links: []}}
     */
    function dataProcess (data){
        let index = -1;
        const nodes = [];
        //pour le filtrage par genres
        const genres = [], types = [], urls = [];
        const nodeByKey = new Map;
        const indexByKey = new Map;
        const links = [];

        for (const k of keys) {
            for (const d of data) {
                const key = JSON.stringify([k, d[k]]);
                if (nodeByKey.has(key)) continue;
                if (k==="genres") { genres.push(d[k])};
                if (k==="type") { types.push(d[k])};
                if (k==="url") { urls.push(d[k])};
                const node = {name: d[k]};
                nodes.push(node);
                nodeByKey.set(key, node);
                indexByKey.set(key, ++index);
            }
        }

        for (let i = 1; i < keys.length; ++i) {
            const a = keys[i - 1];
            const b = keys[i];
            const prefix = keys.slice(0, i + 1);
            const linkByKey = new Map;
            for (const d of data) {
                const names = prefix.map(k => d[k]);
                const key = JSON.stringify(names);
                const value = d.value || 1;
                let link = linkByKey.get(key);
                if (link) { link.value += value; continue; }

                link = {
                    source: indexByKey.get(JSON.stringify([a, d[a]])),
                    target: indexByKey.get(JSON.stringify([b, d[b]])),
                    names,
                    value
                };
                links.push(link);
                linkByKey.set(key, link);
            }
        }
        return { genres, types, urls, nodes, links };
    }

    /**
     * Met à jour des données après avoir décoché
     * @param dataJSON
     */
    function update(dataJSON, tab){
        let dataFilter=[];
        for (const d of dataJSON) {
            if(!tab.includes(d["genres"]) && !tab.includes(d["type"]) && !tab.includes(d["url"])){
                dataFilter.push(d);
            }
        }
        console.log(dataFilter);

        let dataChart = dataProcess(dataFilter);

        const a = sankey({
            nodes: dataChart.nodes.map(d => Object.assign({}, d)),
            links: dataChart.links.map(d => Object.assign({}, d))
        });

        updateNodes(a);
        updateLinks(a);
        updateNodesNames(a)
    }

    /**
     * MAJ Nodes
     */
    function updateNodes(a){
        let nodeG = svg.select("g")
            .selectAll("rect")
            .data(a.nodes);

        nodeG.exit().remove();

        let subNodeG = nodeG.enter().append("rect")
            .attr("x",  0)
            .attr("y", 0);

        nodeG = nodeG.merge(subNodeG);
        nodeG.transition()
            .duration(300)
            .attr("x",  d => d.x0)
            .attr("y", d => d.y0)
            .attr("height", d => d.y1 - d.y0)
            .attr("width", d => d.x1 - d.x0);
    }

    /**
     * MAJ Links
     * @param a correspond aux nouvelles données données
     */
    function updateLinks(a){
        let linkG = svg.selectAll("path")
            .data(a.links);

        linkG.exit().remove();

        let subLinkG = linkG.enter().append("path")
            .attr("fill", "none")
            .attr("d", d3.sankeyLinkHorizontal())
            .attr("stroke", "#919090")
            .attr("stroke-width", d => d.width)
            .style('stroke-opacity', 0.5)
            .style("mix-blend-mode", "multiply")
            .on("mouseover", function(d){
                d3.select(this)
                    .attr("stroke", "#3182bd")
                    .style('stroke-opacity', 1);

                return tooltip.style("visibility", "visible")
                    .style("font-family", "Arial")
                    .style("font-size", "12px")
                    .text(d.names.join(" → ")+"\n"+d.value.toLocaleString());
            })
            .on("mousemove", function(){
                return tooltip
                    .style("top", (event.pageY-10)+"px")
                    .style("left",(event.pageX+10)+"px");
            })
            .on("mouseout", function(){
                d3.select(this)
                    .attr("stroke", "#919090")
                    .style('stroke-opacity', 0.5);
                return tooltip.style("visibility", "hidden");
            });

        linkG = linkG.merge(subLinkG);
        linkG
            .transition()
            .duration(300)
            .attr("d", d3.sankeyLinkHorizontal())
            .attr("stroke", "#919090")
            .attr("stroke-width", d => d.width)
            .style('stroke-opacity', 0.5)
            .style("mix-blend-mode", "multiply")
            ;
    }

    /**
     * MAJ du libellé des Nodes
     * @param a
     */
    function updateNodesNames(a){
        let nameNodes = svg.selectAll("text")
            .data(a.nodes);

        nameNodes.exit().remove();

        let subNode = nameNodes.enter().append("text")
            .style("font-family", "Arial")
            .style("font-size", "14px");

        nameNodes = nameNodes.merge(subNode);
        nameNodes.transition()
            .duration(300)
            .attr("x", d => d.x0 < width / 2 ? d.x1 + 6 : d.x0 - 6)
            .attr("y", d => (d.y1 + d.y0) / 2)
            .attr("dy", "0.35em")
            .attr("text-anchor", d => d.x0 < width / 2 ? "start" : "end")
            .text(d => d.name);
    }

    /**
     * Fonction permettant de générer des checkbox
     * @param type correspond au node qui contient les différentes modalités
     * @param dataChart correspond à la clé du node
     */
    function generateCheckBox(type, dataChart){
        d3.select("#checkbox-"+type)
            .attr("id", "labels-"+type)
            .selectAll("input")
            .data(dataChart)
            .enter()
            .append("div")
            .append('label')
            .attr('for', function(d){ return d; })
            .text(function(d) { return d; })
            .append("input")
            .attr("name", "checkbox-"+type)
            .attr("value", function(d) { return d; })
            .attr("checked", true)
            .attr("type", "checkbox")
            .attr("id", function(d,i) { return 'a'+i; });
    }
});