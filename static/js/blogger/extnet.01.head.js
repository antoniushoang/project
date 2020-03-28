//UTF-8
//
//JQuery:
var libJQueryGG = '<scr'+'ipt'+'\t'+'type="text/javascript"'+'\t'+'src="https://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js"></scr'+'ipt>';
document.write(libJQueryGG);
//Google:
var libGoogleGG = '<scr'+'ipt'+'\t'+'type="text/javascript">(function(){\n'+'var'+'\t'+'po=document.createElement("script");\n'+'po.type="text/javascript";\n'+'po.async=true;\n'+'po.src="https://apis.google.com/js/plusone.js";\n'+'var'+'\t'+'s=document.getElementsByTagName("script")[0];\n'+'s.parentNode.insertBefore(po,s);\n'+'})();</scr'+'ipt>';
document.write(libGoogleGG);
//Facebook:
var libFacebook = '<di'+'v'+'\t'+'id="fb-root"></di'+'v>\n'+'<scr'+'ipt'+'\t'+'type="text/javascript">(function(d,s,id){\n'+'var'+'\t'+'js,'+'\t'+'fjs=d.getElementsByTagName(s)[0];\n'+'if(d.getElementById(id))return;\n'+'js=d.createElement(s);\n'+'js.id=id;\n'+'js.src="http://connect.facebook.net/en_US/all.js#xfbml=1&appId=547955415241708";\n'+'fjs.parentNode.insertBefore(js,fjs);\n'+'}(document,"script","facebook-jssdk"));\n'+'</scr'+'ipt>\n';
document.write(libFacebook);
//Twitter:
var libTwitterA = '<scr'+'ipt'+'\t'+'type="text/javascript">!function(d,s,id){var'+'\t'+'js,fjs=d.getElementsByTagName(s)[0],p=/^http:/.test(d.location)?"http":"https";if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src=p+"://platform.twitter.com/widgets.js";fjs.parentNode.insertBefore(js,fjs);}}(document,"script","twitter-wjs");</scr'+'ipt>';
document.write(libTwitterA);
//
function commentFacebook(url,width,posts){document.write('<di'+'v'+'\t'+'class="fb-comments"'+'\t'+'data-href="'+url+'"'+'\t'+'data-width="'+width+'"'+'\t'+'data-num-posts="'+posts+'"></di'+'v>');}
function extnetComment(url,width){commentFacebook(url,width,10);}
function extnetComment480(url){extnetComment(url,480);}
//
function likeFacebook(url,Bsend,layout,width,Bface){document.write('<di'+'v'+'\t'+'class="fb-like"'+'\t'+'data-href="'+url+'"'+'\t'+'data-send="'+Bsend+'"'+'\t'+'data-layout="'+layout+'"'+'\t'+'data-width="'+width+'"'+'\t'+'data-show-faces="'+Bface+'"></di'+'v>');}
function extnetLike(url,width){likeFacebook(url,'true','button_count',width,'false');}
function extnetLike200(url){extnetLike(url,200);}
//
function plusGoogle(url,size){document.write('<di'+'v'+'\t'+'class="g-plusone"'+'\t'+'href="'+url+'"'+'\t'+'data-size="'+size+'"></di'+'v>');}
function extnetPlus(url){plusGoogle(url,'medium');}
//
function shareTwitter(url,msg){document.write('<a'+'\t'+'class="twitter-share-button"'+'\t'+'data-text="'+msg+'"'+'\t'+'data-url="'+url+'"'+'\t'+'href="https://twitter.com/share"/>');}
function extnetShare(url,msg){shareTwitter(url,msg);}