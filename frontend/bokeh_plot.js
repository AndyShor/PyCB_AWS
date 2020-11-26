var xdr = new Bokeh.Range1d({ start: 1E-6, end: 0.1 });
var ydr = new Bokeh.Range1d({ start: 0, end: 1 });
var chart_title = Bokeh.Models('Title');

// make a plot with some tools

var plot = Bokeh.Plotting.figure({
    x_range: xdr,
    x_axis_type:"log",
    y_range: ydr,
    tools: "pan,wheel_zoom,box_zoom,reset,save",
    height: 300,
    width: 900,
    x_axis_label: 'Breeding time [s]',
    y_axis_label: 'Charge state abundance',
    sizing_mode: 'scale_width',
});

var Legend = Bokeh.Models('Legend');
var LegendItem = Bokeh.Models('LegendItem');
var legend_items=[];
var legend_curr = new Legend({
    items:legend_items, 
    orientation:'horizontal',
    click_policy:'hide',
    location:'top_left',
    glyph_width:10,
    title: 'Legend, current density, click on item to hide/show lines'
});
var LegendItem = Bokeh.Models('LegendItem');

// declare variables we will use later
var data_from_API=[]; 
var labels;
var  ch_state_number;
var i;

//declare Bokeh Cathegory20_20 palette locally
var palette = ['#1f77b4', '#aec7e8', '#ff7f0e', '#ffbb78', '#2ca02c', '#98df8a', '#d62728', '#ff9896', '#9467bd', '#c5b0d5', '#8c564b', '#c49c94', '#e377c2', '#f7b6d2', '#7f7f7f', '#c7c7c7', '#bcbd22', '#dbdb8d', '#17becf', '#9edae5'];

// function querying the backend endpoint using data from user inputs
function getData() {
            
    var address_string = "https://q0oo54zo2c.execute-api.eu-central-1.amazonaws.com/dev?element="+document.getElementById("elementSelector").value+"&energy="+document.getElementById("energySelector").value+"&density="+document.getElementById("densitySelector").value+'&minlogtime='+document.getElementById("minLogTime").value+'&maxlogtime='+document.getElementById("maxLogTime").value+'&rest_gas_pressure='+document.getElementById("restGasPressure").value+'&rest_gas_ip='+document.getElementById("restGasIP").value+'&injection='+document.getElementById("injectionSelector").value
    
    //get data into ajax result
    $("#loadingMessage").html('<img src="./giphy.gif" alt="" srcset="">');
    $.ajax({

        //url: "http://localhost:5000/get_csd?element=Ar&energy=2200&density=1000",
        url: address_string,
        headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Access-Control-Allow-Origin' },
        async: false,
        success: function (result) {
            $("#loadingMessage").html("");
            //var data = [];
            data_from_API=[];
            console.log(result)
            for (i = 0; i < result.number_of_ch_states; i++) {
            data_from_API.push(result[i+'+']);
            }
            
            //data_from_API = result['0'];
            ch_state_number=result.number_of_ch_states;
            labels = result.labels;
 
        },
        error: function (err) {
            $("#loadingMessage").html("<b>Error communicating to API</b>");
        }
    });

    var data_source_from_call = new Bokeh.ColumnDataSource({
        data: { x: [] }    
    });  

    data_source_from_call.data.x = labels;

    for (i = 0; i < ch_state_number; i++) {
        data_source_from_call.data[i] = data_from_API[i];
    }

    return  data_source_from_call;
}        

function updatePlot() {
     
    plot.title.text = 'Charge state evolution of '+document.getElementById("elementSelector").value+' under flow of '+document.getElementById("energySelector").value+'[eV] electrons at '+document.getElementById("densitySelector").value+ ' [A/cm2] current density';
    legend_items=[];
    source=getData();
    // delete previously rendered glyphs           
    if (plot.renderers.length>0){
        plot.renderers= [];
    }
    xdr.start=parseFloat('1E'+document.getElementById("minLogTime").value);
    xdr.end = parseFloat('1E'+document.getElementById("maxLogTime").value);
   
    //plot new lines from the updated data source
    for (i = 0; i < ch_state_number; i++) {
        
        plot.line({ field: "x" }, { field: i }, {
        source: source,
        line_width: 2,
        line_color: palette[i%palette.length],
        name : i+'+'
        });
    }
   
    for (i = 0; i < ch_state_number; i++) {
        var item_curr = new LegendItem({label:i+'+', renderers:[plot.renderers[i]], index:i});
        legend_items.push(item_curr);
        console.log('populating legend items', i);
     }
   
    legend_curr.items=legend_items;
    
    plot.add_layout(legend_curr);
 
}

                     

//update plot        
updatePlot();  

try {
    Bokeh.Plotting.show(plot);
}
catch(e){
    $("#loadingMessage").html("       Error while updating plot");
}
      
     
// render button
                var addDataButton = document.createElement("Button");
                addDataButton.className += "btn btn-primary  btn-small"
                addDataButton.appendChild(document.createTextNode("Calculate"));
                document.currentScript.parentElement.appendChild(addDataButton);
                addDataButton.addEventListener("click", updatePlot);  


