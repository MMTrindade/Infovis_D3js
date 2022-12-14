function createDotMatrix(input_data, id) {

  // ---------------------------------------------
  // ---------        Filter Data      -----------
  // ---------------------------------------------

  // Filter data for color
  data = input_data.sort(compareRedList);

  familyNames = [];
  data.forEach(species => {
    if (!familyNames.includes(species.taxFamily_en)) {
      familyNames.push(species.taxFamily_en);
    }
  });

  // ---------------------------------------------
  // ---------    Basic Chart Layout      --------
  // ---------------------------------------------

  // create svg element, respecting margin_dotMatrixs
  var svg = d3.select(id)
    .append("svg")
      .attr("width", width_dotMatrix + margin_dotMatrix.left + margin_dotMatrix.right)
      .attr("height", height_dotMatrix + margin_dotMatrix.top + margin_dotMatrix.bottom)
    .append("g")
      .attr("transform",
            "translate(" + margin_dotMatrix.left + "," + margin_dotMatrix.top + ")");

  // Add X axis
  var x = d3.scaleLinear().domain([]).range([0, width_dotMatrix]);
  svg
    .append("g")
    .attr("transform", "translate(0," + height_dotMatrix + 30 + ")")
    .call(d3.axisBottom(x));

  // Configure Y axis
  var y = d3.scaleLinear().domain([0, familyNames.length]).range([height_dotMatrix - 30, 0]);
  yScale = d3.axisLeft(y)
              .ticks(familyNames.length)
              .tickFormat(function (d) {
                return familyNames[d];
              });

  // Y AXIS
  svg.append("g")
    .attr("class", "y-axis")
    .call(yScale);

  // Add X axis label:
  svg.append("text")
    .attr("text-anchor", "end")
    .attr("x", width_dotMatrix)
    .attr("y", height_dotMatrix)
    .text("Species");

  // Save values of ticks for adding points
  let yValues = []
  d3.select(".y-axis").selectAll(".tick")
    .each(function(d){
        yValues.push(d)
    });

  svg.append('line')
    .style("stroke", "black")
    .style("stroke-width_dotMatrix", 1)
    .attr("x1", width_dotMatrix)
    .attr("y1", height_dotMatrix - 20)
    .attr("x2", width_dotMatrix)
    .attr("y2", 0); 

  svg.append('line')
    .style("stroke", "black")
    .style("stroke-width_dotMatrix", 1)
    .attr("x1", 0)
    .attr("y1", height_dotMatrix - 20)
    .attr("x2", width_dotMatrix)
    .attr("y2", height_dotMatrix - 20); 

  svg.append('line')
    .style("stroke", "black")
    .style("stroke-width_dotMatrix", 1)
    .attr("x1", 0)
    .attr("y1", height_dotMatrix - 20)
    .attr("x2", width_dotMatrix)
    .attr("y2", height_dotMatrix - 20); 

  svg.append('line')
    .style("stroke", "black")
    .style("stroke-width_dotMatrix", 1)
    .attr("x1", 0)
    .attr("y1", 0)
    .attr("x2", width_dotMatrix)
    .attr("y2", 0);
      
  // ---------------------------------------------
  // ---------       Chart Data           --------
  // ---------------------------------------------

  // Remember x values for counting in each line
  let counter = new Array(familyNames.length).fill(distanceToYAxis);

  let i;
  let finalData = [];
  for(var j = 0; j < data.length; j++) {
    i = familyNames.indexOf(data[j].taxFamily_en);    
    xVal = counter[i];
    counter[i] = counter[i] + step; 
    finalData.push({
      y: yValues[i], 
      x: parseFloat(xVal),
      red_list_cat: data[j].red_list_cat,
      speciesname: data[j].speciesname,
      taxFamily_en: data[j].taxFamily_en,
      speciescode: data[j].speciescode,
      keywintering: data[j].keywintering,
      distribution_surface_area: data[j].distribution_surface_area,
      population_maximum_size: data[j].population_maximum_size
    });
  }

  svg.append("g")
      .attr("stroke-width_dotMatrix", 1.5)
      .attr("font-family", "sans-serif")
      .attr("font-size", 10)
    .selectAll("path")
    .data(finalData)
    .join("path")
      .attr("class", "dotMatrixDot " + dotMatrixItem)
      .attr("transform", d => `translate(${d.x},${y(d.y)})`)
      .attr( "d", d3.symbol().size(symbolSizeDotMatrix).type( function(d) { return getSymbol(d); }) )
      .style("fill",function(d) {
        return getColor(d.red_list_cat);
      });

    // add legend
    var legend = svg
      .selectAll(".legend")
      .data(['Breeding', 'Wintering'])
      .enter()
      .append("g")
      .attr("class", "legend")
      .attr("border", "2px solid black")
      .attr("transform", "translate(-100," + 20 + ")");

    legend
      .append("circle")
      .attr('class', 'legendEntryBreed')
      .attr("cx",  width_dotMatrix-margin_dotMatrix.right)
      .attr("cy", 5)
      .attr("r", 8)
      .attr("curser", "pointer")
      .style("fill", breedingColor)

    legend
      .append('path')
      .attr('class', 'legendEntryWinter')
      .attr("transform", function (d,i) {
        return 'translate(' + (width_dotMatrix - 20) + ', ' + 25 + ')';
      })
      .attr("d", d3.symbol().size(100).type(d3.symbols[4]))
      .attr("curser", "pointer")
      .style("fill", winteringColor);

    legend
      .append("text")
      .attr('class', 'legendEntryBreed')
      .attr("x", width_dotMatrix-margin_dotMatrix.right+15)
      .attr("y", 10)
      .attr("fill", breedingColor)
      .text(breedingText)
      .on('click', function(e, d) {
        winteringFilter("Breeding");
      });

      legend
        .append("text")
          .attr('class', 'legendEntryWinter')
          .attr("x", width_dotMatrix-margin_dotMatrix.right+15)
          .attr("y", 30)
          .attr("fill", winteringColor)
          .text(winteringText)
          .on('click', function(e, d) {
            winteringFilter("Wintering");
          });

  // ---------------------------------------------
  // ---------     Interaction            --------
  // ---------------------------------------------

  var tooltip = d3.select(id)
    .append('div')
    .attr('class', 'tooltip');

  tooltip.append('div')
    .attr('class', 'code');
  tooltip.append('div')
    .attr('class', 'name');
  tooltip.append('div')
    .attr('class', 'family');
  tooltip.append('div')
    .attr('class', 'surface_area');
  tooltip.append('div')
    .attr('class', 'population');
  tooltip.append('div')
    .attr('class', 'red_list');

  svg.selectAll(".dotMatrixDot")
    .on('mouseover', function(e, d) {
      handleSingleMouseOver(d);
      tooltip.select('.red_list').html('<b>Red List: <span class="tooltip-text">' + d.red_list_cat + '</span></b>');
      tooltip.select('.code').html('<b>Code: <span class="tooltip-text">' + d.speciescode + '</span></b>');
      tooltip.select('.name').html('<b>Name: <span class="tooltip-text">' + d.speciesname+ '</span></b>');
      tooltip.select('.family').html('<b>Family: <span class="tooltip-text">' + d.taxFamily_en + '</span></b>');
      tooltip.select('.population').html('<b>Population: <span class="tooltip-text">' + d.population_maximum_size + '</span></b>');

      const area = d.distribution_surface_area == -1 ? "-" : d.distribution_surface_area;
      tooltip.select('.surface_area').html('<b>Suface Area: <span class="tooltip-text">' + area + '</span></b>');

      tooltip.style('display', 'block');
      tooltip.style('border', '6px solid' + getColor(d.red_list_cat));
      tooltip.style('opacity', 2);

    })
    .on('mousemove', function(e, d) {
        handleSingleMouseOver(d);
        d3.select(this)
          .attr( "d", d3.symbol().size(zoomSymbolSizeDotMatrix).type( function(d) { return getSymbol(d); }) )
          .style('cursor', 'pointer');

        tooltip
          .style('top', (e.layerY + 10) + 'px')
          .style('left', (e.layerX - 25) + 'px');
    })
    .on('mouseout', function(e, d) {
        handleMouseLeave(d);
        d3.select(this)
        .attr( "d", d3.symbol().size(symbolSizeDotMatrix).type( function(d) { return getSymbol(d); }) );

        tooltip.style('display', 'none');
        tooltip.style('opacity',0);
    });
}