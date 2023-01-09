let margin = {
    top: 20,
    right: 120,
    bottom: 20,
    left: 120
},
    width = 700 - margin.right - margin.left,
    height = 800 - margin.top - margin.bottom;


fetch('http://83.167.124.57/get-tree/')
    .then(response => response.json())
            .then(res => {
                let root = {}
                root = res[0]
                let ApplChildName;
                let mainChild = res[0].children
                // Хранится архитектура приложения
                let ApplicationLevelArchitecture
                let child
                for (child of mainChild) {
                    if (child.name == 'Архитектура Предприятия') continue
                    ApplicationLevelArchitecture = child
                }

                let ApplChildren = ApplicationLevelArchitecture.children
                let words;
                let resp;
                let cur_str;
                let trimStrResponse;
                for (let i in ApplChildren) {
                    ApplChildName = ApplChildren[i].name
                    function splitN(str, N) {
                        words = str.trim().split(/\s+/g);
                        resp = [];
                        cur_str = words.shift();
                        for (const word of words) {
                            if (cur_str.length + 1 + word.length >= N || cur_str.length >= N) {
                                resp.push(cur_str);
                                cur_str = word;
                            } else {

                                cur_str += ' ' + word;
                            }
                        }
                        resp.push(cur_str);

                        trimStrResponse = resp.join('\n')
                        console.log(trimStrResponse)
                       

                    }
                    splitN(ApplChildName, 20);
                }
                let cloneRoot = {}
                for (let key in child) {
                    cloneRoot[key] = child[key];
                }
           
                cloneRoot =  Object.defineProperty(root.children[1].children, "name",  {value : [trimStrResponse]}); 
               console.log(cloneRoot)
                // root = cloneRoot


                // root = ApplChildName;
                // console.log(ApplicationLevelArchitecture)

                let i = 0,
                    // Размер прямoугольников
                    duration = 750,
                    rectW = 350,
                    rectH = 70;
                // размер разлета направляющих
                let tree = d3.layout.tree().nodeSize([420, 300]);
                let diagonal = d3.svg.diagonal()
                    .projection(function (d) {
                        // Откуда будут исходить стрелки к элементам(ставит посередине блока)
                        return [d.x + rectW / 2, d.y + rectH / 2];
                    });

                // Задает ширину блока в котором находится схема
                let svg = d3.select("#body").append("svg").attr("width", "80%").attr("height", 800)
                    // Приближение отдаление
                    .call(zm = d3.behavior.zoom().scaleExtent([0.4, 10]).on("zoom", redraw)).append("g")
                    // Задает положение блока схемы внутри родителя (ширина-высота)
                    .attr("transform", "translate(" + 700 + "," + 100 + ")");




                zm.translate([350, 20]);

                root.x0 = 0;
                root.y0 = height / 2;

                // function collapse(d) {
                //     if (d.children) {
                //         d._children = d.children;
                //         d._children.forEach(collapse);
                //         d.children = null;
                //     }
                // }

                // root.children.forEach(collapse);
                update(root);

                d3.select("#body").style("height", "500px");

                function update(source) {
                    // Compute the new tree layout.
                    let nodes = tree.nodes(root).reverse(),
                        links = tree.links(nodes);
                    // Длина стрелок
                    nodes.forEach(function (d) {
                        d.y = d.depth * 200;
                    });

                    // Update the nodes…
                    let node = svg.selectAll("g.node")
                        .data(nodes, function (d) {
                            return d.id || (d.id = ++i);
                        });

                    // Введите любые новые узлы в предыдущей позиции родителя.
                    let nodeEnter = node.enter().append("g")
                        .attr("class", "node")
                        .attr("transform", function (d) {
                            return "translate(" + source.x0 + "," + source.y0 + ")";
                        })
                        .on("click", click);

                    // Положение   прямоугольников и его стили
                    nodeEnter.append("rect")
                        .attr("width", rectW)
                        .attr("height", rectH)
                        .attr("stroke", "black")
                        .attr("stroke-width", 1)
                        .style("fill", function (d) {
                            return d._children ? "#FFE599" : "#edbf35";
                        });
                    // Положение текста внутри прямоугольников и его стили
                    nodeEnter.append("text")
                        .attr("x", rectW / 2)
                        .attr("y", rectH / 2)
                        .attr("dy", ".35em")
                        .attr("text-anchor", "middle")
                        .text(function (d) {
                            return d.name;

                        });

                    // Перемещаем узлы в их новую позицию.
                    let nodeUpdate = node.transition()
                        .duration(duration)
                        .attr("transform", function (d) {
                            return "translate(" + d.x + "," + d.y + ")";
                        });

                    nodeUpdate.select("rect")
                        .attr("width", rectW)
                        .attr("height", rectH)
                        .attr("stroke", "black")
                        .attr("stroke-width", 1)
                        .style("fill", function (d) {
                            return d._children ? "#FFE599" : "#edbf35";
                        });

                    nodeUpdate.select("text")
                        .style("fill-opacity", 1);


                    // Переход существующих узлов в новую позицию родителя.А
                    let nodeExit = node.exit().transition()
                        .duration(duration)
                        .attr("transform", function (d) {
                            return "translate(" + source.x + "," + source.y + ")";
                        })
                        .remove();

                    nodeExit.select("rect")
                        .attr("width", rectW)
                        .attr("height", rectH)
                        .attr("stroke", "black")
                        .attr("stroke-width", 1);

                    nodeExit.select("text");

                    // Обновить ссылки…
                    let link = svg.selectAll("path.link")
                        .data(links, function (d) {
                            return d.target.id;
                        });

                    // Введите любые новые ссылки в предыдущую позицию родителя.
                    link.enter().insert("path", "g")
                        .attr("class", "link")
                        .attr("x", rectW / 2)
                        .attr("y", rectH / 2)
                        .attr("d", function (d) {
                            let o = {
                                x: source.x0,
                                y: source.y0
                            };
                            return diagonal({
                                source: o,
                                target: o
                            });
                        });

                    // Переместить ссылки на их новую позицию.
                    link.transition()
                        .duration(duration)
                        .attr("d", diagonal);

                    // Переход существующих узлов в новую позицию родителя.
                    link.exit().transition()
                        .duration(duration)
                        .attr("d", function (d) {
                            let o = {
                                x: source.x,
                                y: source.y
                            };
                            return diagonal({
                                source: o,
                                target: o
                            });
                        })
                        .remove();

                    // Сохраняем старые позиции для перехода.
                    nodes.forEach(function (d) {
                        d.x0 = d.x;
                        d.y0 = d.y;
                    });
                }


                //Переключать дочерние элементы по клику.
                function click(d) {
                    if (d.children) {
                        // Свернуть
                        d._children = d.children;
                        d.children = null;

                    } else {
                        //Развернуть
                        d.children = d._children;
                        d._children = null;
                        let a = d.text;
                        let name = d.name;
                        let name_en = d.name_en;
                        let more_link = d.more_link
                        let file
                        let name_file
                        let img
                        let attachments = d.attachments
                        attachments.map(att => {
                            file = att.file
                            name_file = att.name
                            img = att.img
                        })

                        let file_attachments = document.getElementById("file_attachments");
                        file_attachments.href = file;

                        let more_links = document.getElementById("more_link")
                        more_links.href = more_link


                        let b = d.id
                        document.getElementById('info-block').style.display = 'block';
                        document.getElementById('name').innerHTML = name
                        document.getElementById('name_en').innerHTML = name_en
                        document.getElementById('description').innerHTML = a
                        document.getElementById('file').innerHTML = file
                        document.getElementById('name_file').innerHTML = name_file
                        document.getElementById('img').innerHTML = img

                        document.getElementById('description1').innerHTML = b


                    }
                    // update(d);
                }

                //Redraw for zoom
                function redraw() {
                    //console.log("here", d3.event.translate, d3.event.scale);
                    svg.attr("transform",
                        "translate(" + d3.event.translate + ")"
                        + " scale(" + d3.event.scale + ")");
                }




            })
  


document.getElementById('close').onclick = function () {
    document.getElementById('info-block').style.display = 'none';

}

