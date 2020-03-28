//////////////////////////////////////////////////
//
// (C) 2014 KOA Group
//
var ads_c2 = [];
var ads_trb = [];
/// 
/// [ImgURL, ImgTitle, LinkURL, index, LinkCaption]
ads_c2[0] = ['https://fbcdn-sphotos-c-a.akamaihd.net/hphotos-ak-xaf1/v/t1.0-9/1779694_917575308271282_1465655742881612534_n.jpg?oh=efd7b79f7383a8263c88be7032e6d946&oe=54BA29A5&__gda__=1417895643_fc605dc44b39250c96803fe1ca7cfe51', 'ChipMode Kids Fashion', 'https://www.facebook.com/thoitrangtreem.clothingforkids', 1, ''];
///
/// [ImgURL, ImgTitle, LinkURL, index]
ads_trb[0] = ['https://fbcdn-sphotos-a-a.akamaihd.net/hphotos-ak-xap1/v/t1.0-9/10645076_918409491521197_1812436254634946469_n.jpg?oh=7645cf42632a79d910ecbac5e9b2cec2&oe=54CA288B&__gda__=1422557783_2f3d43f41dd30047a3b601213cbd4f36', 'ChipMode Kids Fashion', 'https://www.facebook.com/thoitrangtreem.clothingforkids', 1];
/// 
/// 
/// 
function showAdsMenu_c1(){
}
function showAdsMenu_c2(){
  var c2_width = 48;
  var c2_height = 48;
  for(var i=0; i<ads_c2.length; i++){
    document.write('<a target="_blank" href="'+ads_c2[i][2]+'"><img width="'+c2_width+'" height="'+c2_height+'" src="'+ads_c2[i][0]+'" title="'+ads_c2[i][1]+'"/></a>&nbsp;'+ads_c2[i][4]+'<br/>');
  }
}
function showAdsMenu_c3(){
}
function showAdsMenu_c4(){
  document.write('<img width="80" src="http://whos.amung.us/widget/weil910csn66.png"/>');
}
function showAdsMenu_toprightbar(){
  var trb_width = 199;
  var trb_height = 69;
  for(var i=0; i<ads_trb.length; i++){
    document.write('<a target="_blank" href="'+ads_trb[i][2]+'"><img width="'+trb_width+'" height="'+trb_height+'" src="'+ads_trb[i][0]+'" title="'+ads_trb[i][1]+'"/></a><br/>');
  }
}
//
//////////////////////////////////////////////////