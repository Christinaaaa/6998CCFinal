var checkout = {};

$(document).ready(function() {
                  var $messages = $('.messages-content'),
                  d, h, m,
                  i = 0;
                  
                  checkout = function(payload) {
                  console.log('checkout');
                  return sdk.checkoutPost({}, {
                                          productId: 'test',
                                          deliveryAddress: 'test',
                                          deliveryDate: 'test'
                                          }, {})
                  .then((response) => {
                        console.log('checkout api call returned', response);
                        
                        var data = response.data;
                        
                        if (data.message) {
                        insertResponseMessage(data.message);
                        } else {
                        insertResponseMessage('Oops, something went wrong. Please try again.');
                        }
                        })
                  .catch((error) => {
                         console.log('an error occurred during checkout');
                         console.log(error);
                         });
                  }
                  
                  $(window).load(function() {
                                 $messages.mCustomScrollbar();
                                 insertResponseMessage('Hi there, I\'m your personal Concierge. How can I help?');
                                 });
                  
                  function updateScrollbar() {
                  $messages.mCustomScrollbar("update").mCustomScrollbar('scrollTo', 'bottom', {
                                                                        scrollInertia: 10,
                                                                        timeout: 0
                                                                        });
                  }
                  
                  function setDate() {
                  d = new Date()
                  if (m != d.getMinutes()) {
                  m = d.getMinutes();
                  $('<div class="timestamp">' + d.getHours() + ':' + m + '</div>').appendTo($('.message:last'));
                  }
                  }
                  
                  function callNluApi(message) {
                  // params, body, additionalParams
                  return sdk.nluPost({}, {
                                     messages: [{
                                                type: 'unstructured',
                                                unstructured: {
                                                text: message
//                                                payload: {
//                                                    //imageUrl: 'https://static.mangata.io/photos/F1260B26-32C9-4442-8EA0-29A51D1F6010-5.jpg'
//                                                    imageUrl:'https://s3.us-east-2.amazonaws.com/myphoto.xyw/dog.jpeg'
//                                                        }
                                                            }
                                                }]
                                     }, {});
                  }
                  
                  function insertMessage() {
                  msg = $('.message-input').val();
                  if ($.trim(msg) == '') {
                  return false;
                  }
                  $('<div class="message message-personal">' + msg + '</div>').appendTo($('.mCSB_container')).addClass('new');
                  setDate();
                  $('.message-input').val(null);
                  updateScrollbar();
                  
                  callNluApi(msg)
                  .then((response) => {
                        console.log(response);
                        var data = response.data;
                        
                        if (data.messages && data.messages.length > 0) {
                        console.log('received ' + data.messages.length + ' messages');
                        
                        var messages = data.messages;
                        
                        for (var message of messages) {
                        if (message.type === 'unstructured') {
                        insertResponseMessage(message.unstructured.text);
                        } else if (message.type === 'structured') {
                        var html = '';
                        var results1 = message.structured.text;
                        var results = JSON.parse(results1);

                        for (var result of results){


                        // insertResponseMessage(message.structured.text);
                        console.log(result);
                        
      
//                                   html = '<img src="' + message.structured.payload.imageUrl + '" witdth="200" height="240" class="thumbnail" /><b>' + '<br>$' + '</b><br><a target="_blank" href= "https://static.mangata.io/photos/F1260B26-32C9-4442-8EA0-29A51D1F6010-5.jpg" onclick="' +  '()">' + '<img src= "https://static.mangata.io/photos/F1260B26-32C9-4442-8EA0-29A51D1F6010-5.jpg">'+ '</a>';
//                                   html = '<img src="' + message.structured.payload.imageUrl + '" witdth="200" height="240" class="thumbnail" /><b>';
//                                   html = '<img src="' + message.structured.payload.imageUrl + '" witdth="200" height="240" class="thumbnail" /><b>' + '<br>$' + '</b><br><a target="_blank" href= "' + message.structured.payload.imageUrl + '" onclick="' +  '()">' + '<img src="' + message.structured.payload.imageUrl + '" >' + '</a>';
                                    // html = '<a target="_blank" href= "' + result.recipe.url + '" onclick="' +  '()">' + '<img src="https://s3.us-east-2.amazonaws.com/myphoto.xyw/click.png" witdth="230" height="140" class="thumbnail" >' + '</a>';
                                    html = '<a target="_blank" href= "' + result.recipe.url + '" onclick="' +  '()">' + '<img src= "' + result.recipe.image + '" witdth="300" height="300" class="thumbnail" >' + '</a>';
                                     //html = '<a target="_blank" href= "' + message.structured.text + '" onclick="' +  '()">' + '</a>';

                                   insertResponseMessage(html);
                                   
                        }

                        
                        } else {
                        console.log('not implemented');
                        }
                        }
                        } else {
                        insertResponseMessage('Oops, something went wrong. Please try again.');
                        }
                        })
                  .catch((error) => {
                         console.log('an error occurred', error);
                         insertResponseMessage('Oops, something went wrong. Please try again.');
                         });
                  }
                  
                  $('.message-submit').click(function() {
                                             insertMessage();
                                             });
                  
                  $(window).on('keydown', function(e) {
                               if (e.which == 13) {
                               insertMessage();
                               return false;
                               }
                               })
                  
                  function insertResponseMessage(content) {
                  $('<div class="message loading new"><figure class="avatar"><img src="http://flask.com/wp-content/uploads/dos-equis-most-interesting-guy-in-the-world-300x300.jpeg" /></figure><span></span></div>').appendTo($('.mCSB_container'));
                  updateScrollbar();
                  
                  setTimeout(function() {
                             $('.message.loading').remove();
                             $('<div class="message new"><figure class="avatar"><img src="http://flask.com/wp-content/uploads/dos-equis-most-interesting-guy-in-the-world-300x300.jpeg" /></figure>' + content + '</div>').appendTo($('.mCSB_container')).addClass('new');
                             setDate();
                             updateScrollbar();
                             i++;
                             }, 500);
                  }
                  
                  });
