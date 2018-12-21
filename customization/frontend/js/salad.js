//var apigClientFactory = require('aws-api-gateway-client').default;
var apigClient = apigClientFactory.newClient();

var params = {
};
var body = {
    //This is where you define the body of the request
};
var additionalParams = {
};

var cur_category='Protein';

var category_id = ["Protein","Rice","Vegetable", "Other"];
var prod = {"Protein":["Beef","Chicken","Lamb","Pork"],"Rice":["Brown Rice","White Rice"],"Vegetable":["Spinach","Cabbage","Kale"],"Other":[]};
var img = ["Beef.jpg","Chicken.jpg","Lamb.jpg","Pork.jpg","Brown_rice.jpg","White_rice.jpg","Spinach.jpg","Cabbage.jpg","Kale.jpg","default1.jpg"];

function addProd(img_name,prod_name,id_name){
  //console.log(prod_name[0]);
  //onclick="addProd(event, "'+prod_name+'")"
  var new_p = '<div class="center">'+'<div><img src="img/'+img_name+'" style="height:100px" id="Add_'+prod_name+'" ></div>'
  +'<div class="desc">'+'<h3>'+prod_name+'</h3>'+'<input type="number" id="'+prod_name+'" name = "myNumber" value="0" min="0" oninput="numChange()">'
  +'</div> </div>'                                            
  $('#'+id_name).append('<li>'+new_p+'</li>');
}
function listProd(){
  var cnt = 0
  for (var i=0; i < category_id.length; i++){
    var prod_arr = prod[category_id[i]];
    for (var j=0;j<prod_arr.length;++j){    
        addProd(img[cnt],prod_arr[j],category_id[i]);
        cnt += 1;
    }
    var new_p = '<div class="center">'+'<div><button class="button btnAdd" onclick="document.getElementById(\'id01\').style.display=\'block\'">+</button></div>'
    +'<div class="desc">'+'<h3>Add new</h3>'
    +'</div></div>';
    $('#'+category_id[i]).append('<li id ="Button_'+category_id[i]+'">'+new_p+'</li>');
  }

}

function openCatagory(evt, category) {
  var i, tabcontent, tablinks;
  tabcontent = document.getElementsByClassName("table");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }
  tablinks = document.getElementsByClassName("tablinks");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" active", "");
  }
  document.getElementById(category).style.display = "block";
  evt.currentTarget.className += " active";
  cur_category =  category;
}


// Get the element with id="defaultOpen" and click on it
$(document).ready(function() {
     document.getElementById("defaultOpen").click();
     listProd();
     Response();
});




var nutrition_chart = {
};
function Response() {
    apigClient.ingredientsGet(params, body, additionalParams)
    .then(function(result){
        // Add success callback code here.
        //response_body = JSON.parse(result);
        //docs = result['data']['results']

        items = result['data']['Items'];

        for (var i=0; i<items.length; i++){ 
             //console.log(items[i]['nutrients']);           
             nutrition_chart[items[i]['name']]=items[i]['nutrients'];
            
         }
         console.log(nutrition_chart);   

    }).catch( function(result){
        // Add error callback code here.
        console.log("error");  
    });
    
}


function search(){
  var name = document.getElementById("foodName").value;
  if (name in nutrition_chart){
    alert("Ingredient exists!");
    return;
  }
  var xhr = new XMLHttpRequest();   
  xhr.open("GET", "https://api.edamam.com/api/food-database/parser?app_id=YOUR_API_ID&app_key=YOUR_APP_KEY&nutrition-type=logging&ingr=" + encodeURI(name));

  xhr.onload = function (event) {
    var parsed = JSON.parse(xhr.responseText).parsed;
    if (parsed === undefined || parsed.length == 0) {
      // No such food
      alert("No such food!");
    }
    else{
      nutrients = parsed[0].food.nutrients;
      nutrition_chart[name] = nutrients;
      console.log(nutrition_chart);
      alert("Added!");

      $('#Button_'+cur_category).remove();
      addProd(img[img.length -1],name,cur_category);
      var new_p = '<div class="center">'+'<div><button class="button btnAdd" onclick="document.getElementById(\'id01\').style.display=\'block\'">+</button></div>'
      +'<div class="desc">'+'<h3>Add new</h3>'
      +'</div></div>';
      $('#'+cur_category).append('<li id ="Button_'+cur_category+'">'+new_p+'</li>');
      
    //   for (var nutrient in nutrients)
    //     alert(nutrient + ": " + nutrients[nutrient]);
     }
  };
  xhr.send();
  
}

function getNutrition(item_name){
  if (nutrition_chart[item_name] != undefined ){
    console.log(item_name, nutrition_chart);
    return nutrition_chart[item_name]; // {ENERC_KCAL: "246.0",FAT: "17.57"}
  }
  else{
    return "No info";
  }
    
}

function getNum() {
    var x = document.getElementsByName("myNumber");
    var total_cal = 0;
    var total_fat = 0;
    var total_prot = 0;

    for (var i=0;i<x.length;++i){
      if (x[i].value != 0){
        var nutri = getNutrition(x[i].id);

        if (nutri['ENERC_KCAL']!=undefined && nutri['FAT']!=undefined && nutri['PROCNT']){
          //$('#result').append("<tr><td>"+x[i].id+"</td><td>"+x[i].value+"</td><td>"+nutri['ENERC_KCAL']+"</td>");
          var cal = parseFloat(nutri['ENERC_KCAL']) * parseFloat(x[i].value);
          var fat = parseFloat(nutri['FAT']) * parseFloat(x[i].value);
          var prot = parseFloat(nutri['PROCNT']) * parseFloat(x[i].value);
          //console.log(cal.toFixed(2))

          $('#result').append("<tr><td>"+x[i].id+"</td><td>"+x[i].value+"</td>\
                              <td>"+cal.toFixed(2)+"</td><td>"+fat.toFixed(2)+"</td><td>"+prot.toFixed(2)+"</td></tr>");

          total_cal += cal;
          total_fat += fat;
          total_prot += prot;
        }
        else{ //no info
          $('#result').append("<tr><td>"+x[i].id+"</td><td>"+x[i].value+"</td><td>-</td><td>-</td><td>-</td></tr>");
        }        
      }
    }

    $('#result').append("<tr><td style=\"font-weight: bold\">Total</td><td></td><td>"+total_cal.toFixed(2)+"</td>\
                        <td>"+total_fat.toFixed(2)+"</td><td>"+total_prot.toFixed(2)+"</td></tr>");
}


function numChange() {
    $("#result").empty();
    $("#result").append("<tr>\
              <th style=\"width:50%\">Ingredients</th>\
              <th>Quantity</th>\
              <th>Energy(kcal)</th>\
              <th>Fat(g)</th>\
              <th>Protein(g)</th>\
              </tr>");
    getNum();

}

