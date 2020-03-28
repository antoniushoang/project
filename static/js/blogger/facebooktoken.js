var gettoken = document.location.href.split('access_token=')[1];
gettoken = gettoken.split('&')[0];
if(gettoken){
  var thehost = document.location.href.split('?')[0];
  document.location.replace(thehost + '?oauth=facebook&access_token=' + gettoken);
}