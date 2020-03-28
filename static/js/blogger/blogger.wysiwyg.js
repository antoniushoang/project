//////////////////////////////////////////////////
//
// Copyright (C) 2005 Justin Koivisto
//
var DEF_FRAME_WIDTH = 600;
var DEF_FRAME_HEIGHT = 260;
//
function WYSIWYG_Editor(instance_name, content, path, fwidth, fheight, styleHref, spellCheckPath){
    if(typeof(instance_name)=='undefined'){
        alert("ERROR: No instance name was passed for the editor.");
        return false;
    }else{
        this.instance_name=instance_name;
    }
    if(typeof(content)=='undefined'){
        this.content='';
    }else{
        this.content=content;
    }
    if(typeof(path)=='undefined'){
        this.wysiwyg_path='.'; // default value
    }else{
        path.replace(/[\/\\]$/,''); // remove trailing slashes
        this.wysiwyg_path=path;
    }
    if(typeof(fwidth)=='number' && Math.round(fwidth) > 50){
        this.frame_width=Math.round(fwidth); // default value
    }else{
        this.frame_width=DEF_FRAME_WIDTH;
    }
    if(typeof(fheight)=='number' && Math.round(fheight) > 50){
        this.frame_height=Math.round(fheight);
    }else{
        this.frame_height=DEF_FRAME_HEIGHT;
    }
    if(typeof(styleHref)=='undefined'){
        this.stylesheet=''; // default value
    }else{
        this.stylesheet=styleHref;
    }
    if(typeof(spellCheckPath)=='undefined'){
        this.spell_path=''; // default value
    }else{
        this.spell_path=spellCheckPath;
    }
    this.wysiwyg_content=this.instance_name+'_WYSIWYG_Editor';  // the editor IFRMAE element id
    this.wysiwyg_hidden=this.instance_name+'_content';          // the editor's hidden field to store the HTML in for the post
    this.wysiwyg_speller=this.instance_name+'_speller';         // the editor's hidden textarea to store the HTML in for the spellchecker
    this.ta_rows=Math.round(this.frame_height/15);              // number of rows for textarea for unsupported browsers
    this.ta_cols=Math.round(this.frame_width/8);                // number of cols for textarea for unsupported browsers
    this.viewMode=1;                                        // by default, set to design view
    this._X = this._Y = 0;                                  // these are used to determine mouse position when clicked
    this.table_border = 1;                                  // default border used when inserting tables
    this.table_cell_padding = 3;                            // default cellpadding used when inserting tables
    this.table_cell_spacing = 0;                            // default cellspacing used when inserting tables
    this.allow_mode_toggle = true;                          // allow users to switch to source code mode
    this.font_format_toolbar1 = true;                       // buttons for font family, size, and style
    this.font_format_toolbar2 = true;                       // buttons for font color and background-color
    this.font_format_toolbar3 = true;                       // buttons for bold, italic, underline
    this.font_format_toolbar4 = true;                       // buttons for superscript, subscript
    this.alignment_toolbar1 = true;                         // buttons for left, center, right, full justify
    this.alignment_toolbar2 = true;                         // buttons for indent, outdent
    this.web_toolbar1 = true;                               // buttons for add, remove hyperlinks
    this.web_toolbar2 = true;                               // buttons for ordered, unordered lists
    this.web_toolbar3 = true;                               // buttons for horizontal rule, insert table
    this.web_toolbar4 = false;                              // buttons for insert image and save (submit form)
    this.misc_format_toolbar = false;                       // buttons for remove format, copy, paste, redo, undo, etc.
    this.image_button = false;
    this.save_button = true;
    this.font_format_toolbar1_after = false;
    this.font_format_toolbar2_after = '|';
    this.font_format_toolbar3_after = '|';
    this.font_format_toolbar4_after = 'br';
    this.alignment_toolbar1_after = '|';
    this.alignment_toolbar2_after = '|';
    this.web_toolbar1_after = '|';
    this.web_toolbar2_after = '|';
    this.web_toolbar3_after = false;
    this.web_toolbar4_after = false;
    this.misc_format_toolbar_after = false;
    this.web_toolbar4 = true;                               // show insert image and save buttons
    this.imagePopUp = null;                                 // used in the insertImage and addImage methods
    this.site_path = this.wysiwyg_path;                     // default to what was passed, should be set in HTML
    this.page_title = 'index';                              // default to nothing, should be set in HTML
}
WYSIWYG_Editor.prototype.prepareSubmit = function(){
    if(this.viewMode == 2){
        this.toggleMode();
    }
    var htmlCode=document.getElementById(this.wysiwyg_content).contentWindow.document.body.innerHTML;
    document.getElementById(this.wysiwyg_hidden).value=htmlCode;
    return true;
}
WYSIWYG_Editor.prototype.display = function(){
    if(this.isSupported()){
        this._display_editor();
        this._load_content();
        var thedoc = document.getElementById(this.wysiwyg_content).contentWindow.document;
        thedoc.designMode='On';
        thedoc = document.getElementById(this.wysiwyg_content).contentWindow.document;
        thedoc.open();
        thedoc.write('<html><head>');
        if(this.stylesheet){
            thedoc.write('<style type="text/css">@import url('+this.stylesheet+');</style>');
        }
        thedoc.write('</head><body>');
        thedoc.write(this.content);
        thedoc.write('</body></html>');
        thedoc.close();
    }else{
        this._display_textarea();
        this._load_content();
    }
}
WYSIWYG_Editor.prototype._display_textarea = function(){
    document.write('<p style="background-color: yellow; color: red; padding: 3px;"><b>WARNING:</b> Your browser does not support the WYSIWYG_Editor class.</p>');
    document.write('<textarea name="'+this.wysiwyg_hidden+'" id="'+this.wysiwyg_hidden+'" rows="'+this.ta_rows+'" cols="'+this.ta_cols+'"></textarea><br>');
}
WYSIWYG_Editor.prototype._display_editor = function(){
    document.write('   <textarea name="'+this.wysiwyg_hidden+'" id="'+this.wysiwyg_hidden+'" style="visibility:hidden;display:none;"></textarea>');
    document.write('   <table cellpadding="5" cellspacing="0" border="2" id="'+this.instance_name+'_table" bgcolor="#EAEAEA">');
    document.write('    <tr>');
    document.write('     <td>');
    document.write('      <table width="100%" border="0" cellspacing="0" cellpadding="0">');
    document.write('       <tr>');
    document.write('        <td valign="top" colspan="2">');
    document.write('         <div id="'+this.instance_name+'_toolbars">');
    if(this.font_format_toolbar2){
        document.write('           <img alt="Font Color" title="Font Color" class="butClass" src="https://lh3.googleusercontent.com/-3yGx1cfbi1w/UKW5opEXohI/AAAAAAAACMQ/ySzNGrQFAxc/s24-p-k/forecol.png" onClick="'+this.instance_name+'.doTextFormat(\'forecolor\',\'\',event)" id="'+this.instance_name+'_forecolor">');
        document.write('           <img alt="Background Color" title="Background Color" class="butClass" src="https://lh4.googleusercontent.com/-FrHM95-mfMg/UKW5nR1Z1LI/AAAAAAAACMI/XS33v-d3JHc/s24-p-k/bgcol.png" onClick="'+this.instance_name+'.doTextFormat(\'hilitecolor\',\'\',event)" id="'+this.instance_name+'_hilitecolor">');
    }
    if(this.font_format_toolbar3){
        document.write('          <img alt="Bold" title="Bold" class="butClass" src="https://lh6.googleusercontent.com/-0Wx329d1JPo/UKW5nTAHjaI/AAAAAAAACME/P96a1crzSvc/s24-p-k/bold.png" onClick="'+this.instance_name+'.doTextFormat(\'bold\',\'\')">');
        document.write('          <img alt="Italic" title="Italic" class="butClass" src="https://lh5.googleusercontent.com/-vBvG562NN28/UKW5pYi-tBI/AAAAAAAACMc/RAlRSIJyxro/s24-p-k/italic.png" onClick="'+this.instance_name+'.doTextFormat(\'italic\',\'\')">');
        document.write('          <img alt="Underline" title="Underline" class="butClass" src="https://lh3.googleusercontent.com/-4ZAtf4t8UQE/UKW5vFONFdI/AAAAAAAACOM/kKZu2G3LFAU/s24-p-k/underline.png" onClick="'+this.instance_name+'.doTextFormat(\'underline\',\'\')">');
    }
    if(this.font_format_toolbar4){
        document.write('          <img alt="Superscript" title="Superscript" class="butClass" src="https://lh3.googleusercontent.com/-IL_VhPpU87Y/UKW5u7xK3mI/AAAAAAAACOI/zK2_hzFFC7I/s24-p-k/sup.png" onClick="'+this.instance_name+'.doTextFormat(\'superscript\',\'\')">');
        document.write('          <img alt="Subscript" title="Subscript" class="butClass" src="https://lh3.googleusercontent.com/-J_hS7IIpj4g/UKW5uobzmPI/AAAAAAAACN4/OW6DDMjAHwY/s24-p-k/sub.png" onClick="'+this.instance_name+'.doTextFormat(\'subscript\',\'\')">');
    }
    if(this.alignment_toolbar1){
        document.write('          <img alt="Left" title="Left" class="butClass" src="https://lh6.googleusercontent.com/-WZDf9dtnplM/UKW5qWcTooI/AAAAAAAACM4/Ip3_sGOcwcQ/s24-p-k/left.png" onClick="'+this.instance_name+'.doTextFormat(\'justifyleft\',\'\')">');
        document.write('          <img alt="Center" title="Center" class="butClass" src="https://lh3.googleusercontent.com/-3_6uLSW-rBA/UKW5oTF04AI/AAAAAAAACMM/znAkSrJmxbg/s24-p-k/center.png" onClick="'+this.instance_name+'.doTextFormat(\'justifycenter\',\'\')">');
        document.write('          <img alt="Right" title="Right" class="butClass" src="https://lh3.googleusercontent.com/-y3ywfJVunK4/UKW5so9zU7I/AAAAAAAACNw/pL6zqFrQj9A/s24-p-k/right.png" onClick="'+this.instance_name+'.doTextFormat(\'justifyright\',\'\')">');
        document.write('          <img alt="Full" title="Full" class="butClass" src="https://lh4.googleusercontent.com/-o3ireHGgMAI/UKW5ormsMEI/AAAAAAAACMg/foTuE_bBreA/s24-p-k/full.png" onClick="'+this.instance_name+'.doTextFormat(\'justifyfull\',\'\')">');
    }
    if(this.alignment_toolbar2){
        document.write('          <img alt="Indent" title="Indent" src="https://lh4.googleusercontent.com/-BWj_Yc6zHkQ/UKW5pbeFXQI/AAAAAAAACMo/_oYDOAHWubw/s24-p-k/indent.png" class=butClass onClick="'+this.instance_name+'.doTextFormat(\'indent\',\'\')">');
        document.write('          <img alt="Outdent" title="Outdent" src="https://lh3.googleusercontent.com/--CbQ73TJG4E/UKW5riDrPaI/AAAAAAAACNU/NNJuw87xgFw/s24-p-k/outdent.png" class=butClass onClick="'+this.instance_name+'.doTextFormat(\'outdent\',\'\')">');
    }
    if(this.web_toolbar1){
        document.write('          <img alt="Image" title="Image" class="butClass" src="https://lh6.googleusercontent.com/-myfUN_9ZNyI/UKaUZExnFaI/AAAAAAAACPc/EiMiQ6sJvyk/s24/image.gif" onClick="'+this.instance_name+'.doTextFormat(\'createimage\',\'\')">');
        document.write('          <img alt="Youtube" title="Youtube" class="butClass" src="https://lh3.googleusercontent.com/-0ZZJ57JA-pk/UKaUZLEcDXI/AAAAAAAACPc/0YeBwbB0Th8/s24/youtube.gif" onClick="'+this.instance_name+'.doTextFormat(\'createyoutube\',\'\')">');
        document.write('          <img alt="Hyperlink" title="Hyperlink" class="butClass" src="https://lh6.googleusercontent.com/-Nso2HdyV86w/UKW5qM7sj1I/AAAAAAAACMw/wlDeJe9hsz8/s24-p-k/link.png" onClick="'+this.instance_name+'.doTextFormat(\'createlink\',\'\')">');
    }
    if(this.web_toolbar2){
        document.write('          <img alt="Ordered List" title="Ordered List" class="butClass" src="https://lh3.googleusercontent.com/-RamhKdIzCMQ/UKW5rNttTZI/AAAAAAAACNQ/s4USD2omVZc/s24-p-k/ordlist.png"  onClick="'+this.instance_name+'.doTextFormat(\'insertorderedlist\',\'\')">');
        document.write('          <img alt="Bulleted List" title="Bulleted List" class="butClass" src="https://lh4.googleusercontent.com/-OmJuR6PJK1o/UKW5nRZJHVI/AAAAAAAACMA/7CwM78h8kfE/s24-p-k/bullist.png" onClick="'+this.instance_name+'.doTextFormat(\'insertunorderedlist\',\'\')">');
    }
    if(this.web_toolbar3){
        document.write('          <img alt="Horizontal Rule" title="Horizontal Rule" class="butClass" src="https://lh6.googleusercontent.com/-h8Dh0KRBb28/UKW5sgwuZAI/AAAAAAAACNc/C4Qfroy_Zyc/s24-p-k/rule.png" onClick="'+this.instance_name+'.doTextFormat(\'inserthorizontalrule\',\'\')">');
    }
    document.write('<br/>');
    if(this.font_format_toolbar1){
        document.write('          <select onChange="'+this.instance_name+'.doTextFormat(\'fontname\',this.options[this.selectedIndex].value)">');
        document.write('           <option value="">Font:</option>');
        document.write('           <option value="Cursive">Cursive</option>');
        document.write('           <option value="Fantasy">Fantasy</option>');
        document.write('           <option value="Sans-serif">Sans Serif</option>');
        document.write('           <option value="Serif">Serif</option>');
        document.write('           <option value="Monospace">Typewriter</option>');
        document.write('          </select>');
        document.write('          <select onChange="'+this.instance_name+'.doTextFormat(\'fontSize\',this.options[this.selectedIndex].value)">');
        document.write('           <option value="">Size:</option>');
        document.write('           <option value="2">Very Small (2)</option>');
        document.write('           <option value="3">Small</option>');
        document.write('           <option value="4">Medium</option>');
        document.write('           <option value="5">Large</option>');
        document.write('           <option value="6">Very Large (6)</option>');
        document.write('          </select>');
    }
    if(this.web_toolbar4){
        if(this.image_button)
            document.write('          <img alt="Insert Image" title="Insert Image" class="butClass" src="'+this.wysiwyg_path+'/images/image.png" onClick="'+this.instance_name+'.insertImage()">');
        if(this.spell_path.length > 0)
            document.write('          <img alt="Check Spelling" title="Check Spelling" class="butClass" src="'+this.wysiwyg_path+'/images/spelling.png" onclick="'+this.instance_name+'.checkSpelling()">');
    }
    if(this.misc_format_toolbar){
        document.write('         <br>');
        document.write('          <img alt="Remove Formatting" title="Remove Formatting" class="butClass" src="'+this.wysiwyg_path+'/images/unformat.png" onClick="'+this.instance_name+'.doTextFormat(\'removeformat\',\'\')">');
        document.write('          <img alt="Undo" title="Undo" class="butClass" src="'+this.wysiwyg_path+'/images/undo.png" onClick="'+this.instance_name+'.doTextFormat(\'undo\',\'\')">');
        document.write('          <img alt="Redo" title="Redo" class="butClass" src="'+this.wysiwyg_path+'/images/redo.png" onClick="'+this.instance_name+'.doTextFormat(\'redo\',\'\')">');
        document.write('          <img alt="Cut" title="Cut" class="butClass" src="'+this.wysiwyg_path+'/images/cut.png" onClick="'+this.instance_name+'.doTextFormat(\'cut\',\'\')">');
        document.write('          <img alt="Copy" title="Copy" class="butClass" src="'+this.wysiwyg_path+'/images/copy.png" onClick="'+this.instance_name+'.doTextFormat(\'copy\',\'\')">');
        document.write('          <img alt="Paste" title="Paste" class="butClass" src="'+this.wysiwyg_path+'/images/paste.png" onClick="'+this.instance_name+'.doTextFormat(\'paste\',\'\')">');
    }
    document.write('<br/>');
    document.write('<br/>');
    document.write('         </div>');
    document.write('        </td>');
    document.write('       </tr>');
    document.write('      </table>');
    document.write('      <iframe id="'+this.wysiwyg_content+'" style="margin-left: 3px; background-color: white; color: black; width:'+this.frame_width+'px; height:'+this.frame_height+'px;"></iframe>');
    document.write('      <table width="'+this.frame_width+'" border="0" cellspacing="0" cellpadding="0" bgcolor="#EAEAEA">');
    document.write('       <tr>');
    document.write('        <td>');
    document.write('        </td>');
    document.write('        <td align="right">');
    if(this.allow_mode_toggle){
        document.write('      <img alt="Toggle HTML" title="Toggle HTML" class="butClass" src="https://lh4.googleusercontent.com/-FfGPowbYNAo/UKW5sBqCWhI/AAAAAAAACNY/YQ2LoAdfTO8/s24-p-k/mode.png" onClick="'+this.instance_name+'.toggleMode()">');
    }
    document.write('         <img alt="Take Code" title="Take Code" class="butClass" src="https://lh4.googleusercontent.com/-EKsFYoqD1l8/UKW5tXrlk9I/AAAAAAAACN0/uS53kkC7xGQ/s24-p-k/save.png" onClick="'+this.instance_name+'.takeCode()">');
    document.write('        </td>');
    document.write('       </tr>');
    document.write('      </table>');
    document.write('     </td>');
    document.write('    </tr>');
    document.write('   </table>');
    document.write('   <br>');
}
WYSIWYG_Editor.prototype.doTextFormat = function(command, optn, evnt){
    if((command=='forecolor') || (command=='hilitecolor')){
        this.getPallete(command, optn, evnt);
    }else if(command=='createlink'){
        var szURL=prompt('Enter a link URL', '');
        if(document.getElementById(this.wysiwyg_content).contentWindow.document.queryCommandEnabled(command)){
            document.getElementById(this.wysiwyg_content).contentWindow.document.execCommand('CreateLink',false,szURL);
            return true;
        }else return false;
    }else if(command=='createimage'){
        var szURL=prompt('Enter an image URL', '');
        if(szURL) this.addImage(szURL+'#picture#');
    }else if(command=='createyoutube'){
        var szURL=prompt('Enter a Youtube video URL', '');
        if(szURL) this.addImage('{youtube}'+szURL);
    }else{
        if(document.getElementById(this.wysiwyg_content).contentWindow.document.queryCommandEnabled(command)){
              document.getElementById(this.wysiwyg_content).contentWindow.document.execCommand(command, false, optn);
              return true;
          }else return false;
    }
    document.getElementById(this.wysiwyg_content).contentWindow.focus();
}
WYSIWYG_Editor.prototype._load_content = function(){
    document.getElementById(this.wysiwyg_hidden).value=this.content;
}
WYSIWYG_Editor.prototype.toggleMode = function(){
    if(this.viewMode == 2){
        document.getElementById(this.wysiwyg_content).contentWindow.document.body.style.fontFamily = '';
        document.getElementById(this.wysiwyg_content).contentWindow.document.body.style.fontSize = '';
        document.getElementById(this.wysiwyg_content).contentWindow.document.body.style.color = '';
        document.getElementById(this.wysiwyg_content).contentWindow.document.body.style.fontWeight = '';
        document.getElementById(this.wysiwyg_content).contentWindow.document.body.style.backgroundColor = '';
        document.getElementById(this.instance_name+'_toolbars').style.visibility='visible';
    }else{
        document.getElementById(this.wysiwyg_content).contentWindow.document.body.style.fontFamily = 'monospace';
        document.getElementById(this.wysiwyg_content).contentWindow.document.body.style.fontSize = '10pt';
        document.getElementById(this.wysiwyg_content).contentWindow.document.body.style.color = '#000';
        document.getElementById(this.wysiwyg_content).contentWindow.document.body.style.backgroundColor = '#fff';
        document.getElementById(this.wysiwyg_content).contentWindow.document.body.style.fontWeight = 'normal';
        document.getElementById(this.instance_name+'_toolbars').style.visibility='hidden';
    }
    if(this.isMSIE()){
        this._toggle_mode_ie();
    }else{
        this._toggle_mode_gecko();
    }
}
WYSIWYG_Editor.prototype.takeCode = function(){
  if(this.viewMode == 2){
    this.toggleMode();
  }
  var htmlCode = document.getElementById(this.wysiwyg_content).contentWindow.document.body.innerHTML;
  var cmtCode = htmlCode.html2cmt();
  document.getElementById("comment_code").value = cmtCode;
}
WYSIWYG_Editor.prototype._toggle_mode_ie = function(){
    if(this.viewMode == 2){
        document.getElementById(this.wysiwyg_content).contentWindow.document.body.innerHTML = document.getElementById(this.wysiwyg_content).contentWindow.document.body.innerText;
        document.getElementById(this.wysiwyg_content).contentWindow.focus();
        this.viewMode = 1; // WYSIWYG
    }else{
        document.getElementById(this.wysiwyg_content).contentWindow.document.body.innerText = document.getElementById(this.wysiwyg_content).contentWindow.document.body.innerHTML;
        document.getElementById(this.wysiwyg_content).contentWindow.focus();
        this.viewMode = 2; // Code
    }
}
WYSIWYG_Editor.prototype._toggle_mode_gecko = function(){
    if(this.viewMode == 2){
        var html = document.getElementById(this.wysiwyg_content).contentWindow.document.body.ownerDocument.createRange();
        html.selectNodeContents(document.getElementById(this.wysiwyg_content).contentWindow.document.body);
        document.getElementById(this.wysiwyg_content).contentWindow.document.body.innerHTML = html.toString();
        document.getElementById(this.wysiwyg_content).contentWindow.focus();
        this.viewMode = 1; // WYSIWYG
    }else{
        var html = document.createTextNode(document.getElementById(this.wysiwyg_content).contentWindow.document.body.innerHTML);
        document.getElementById(this.wysiwyg_content).contentWindow.document.body.innerHTML = '';
        document.getElementById(this.wysiwyg_content).contentWindow.document.body.appendChild(html);
        document.getElementById(this.wysiwyg_content).contentWindow.focus();
        this.viewMode = 2; // Code
    }
}
WYSIWYG_Editor.prototype._get_offset_left = function(elm){
    var mOffsetLeft=elm.offsetLeft;
    var mOffsetParent=elm.offsetParent;
    while(mOffsetParent){
        mOffsetLeft += mOffsetParent.offsetLeft;
        mOffsetParent=mOffsetParent.offsetParent;
    }
    return mOffsetLeft;
}
WYSIWYG_Editor.prototype._get_offset_top = function(elm){
    var mOffsetTop=elm.offsetTop;
    var mOffsetParent=elm.offsetParent;
    while(mOffsetParent){
        mOffsetTop += mOffsetParent.offsetTop;
        mOffsetParent=mOffsetParent.offsetParent;
    }
    return mOffsetTop;
}
WYSIWYG_Editor.prototype.insertTable = function(){
    colstext = prompt('Enter the number of columns per row.');
    rowstext = prompt('Enter the number of rows to create.');
    rows = parseInt(rowstext,'0');
    cols = parseInt(colstext,'0');
    if(this.isMSIE()){
        return this._insert_table_ie(cols,rows);
    }else{
        return this._insert_table_gecko(cols,rows);
    }
}
WYSIWYG_Editor.prototype._insert_table_ie = function(cols, rows){
    document.getElementById(this.wysiwyg_content).contentWindow.focus();
    //get current selected range
    var cursor=document.getElementById(this.wysiwyg_content).contentWindow.document.selection.createRange();
    if((rows > 0) && (cols > 0)){
        var tableHTML = '<table border="'+this.table_border+'" cellpadding="'+this.table_cell_padding+'" cellspacing="'+this.table_cell_spacing+'">';
        while(rows>0){
            rows--;
            var rowCols = cols;
            tableHTML = tableHTML + '<tr>';
            while(parseInt(rowCols)>0){
                rowCols--;
                tableHTML=tableHTML+'<td>&nbsp;</td>';
            }
            tableHTML = tableHTML + '</tr>';
        }
        tableHTML = tableHTML + '</table>';
        cursor.pasteHTML(tableHTML);
        document.getElementById(this.wysiwyg_content).contentWindow.focus();
    }
    return true;
}
WYSIWYG_Editor.prototype._insert_table_gecko = function(cols, rows){
    contentWin=document.getElementById(this.wysiwyg_content).contentWindow;
    if((rows > 0) && (cols > 0)){
        table=contentWin.document.createElement('table');
        table.setAttribute('border', this.table_border);
        table.setAttribute('cellpadding', this.table_cell_padding);
        table.setAttribute('cellspacing', this.table_cell_spacing);
        tbody=contentWin.document.createElement('tbody');
        for(i=0;i<rows;i++){
            tr=contentWin.document.createElement('tr');
            for(j=0;j<cols;j++){
                td=contentWin.document.createElement('td');
                br=contentWin.document.createElement('br');
                td.appendChild(br);
                tr.appendChild(td);
            }
            tbody.appendChild(tr);
        }
        table.appendChild(tbody);
        this._insert_element_gecko(contentWin, table);
    }
    return true;
}
WYSIWYG_Editor.prototype._insert_element_gecko = function(win, elem){
    var sel = win.getSelection();           // get current selection
    var range = sel.getRangeAt(0);          // get the first range of the selection (there's almost always only one range)
    sel.removeAllRanges();                  // deselect everything
    range.deleteContents();                 // remove content of current selection from document
    var container = range.startContainer;   // get location of current selection
    var pos = range.startOffset;
    range=document.createRange();           // make a new range for the new selection
    if (container.nodeType==3 && elem.nodeType==3) {
        container.insertData(pos, elem.nodeValue);
        range.setEnd(container, pos+elem.length);
        range.setStart(container, pos+elem.length);
    }else{
        var afterNode;
        if (container.nodeType==3) {
          var textNode = container;
          container = textNode.parentNode;
          var text = textNode.nodeValue;
          var textBefore = text.substr(0,pos);  // text before the split
          var textAfter = text.substr(pos);     // text after the split
          var beforeNode = document.createTextNode(textBefore);
          var afterNode = document.createTextNode(textAfter);
          container.insertBefore(afterNode, textNode);
          container.insertBefore(elem, afterNode);
          container.insertBefore(beforeNode, elem);
          container.removeChild(textNode);
        }else{
          afterNode = container.childNodes[pos];
          container.insertBefore(elem, afterNode);
        }
    }
}
WYSIWYG_Editor.prototype.setColor = function(color, command){
    if(typeof(pwin)=='object'){ // make sure it exists
        if(!pwin.closed){ // if it is still open
            pwin.close();
        }
    }
    if(this.isMSIE() && command == 'hilitecolor') command = 'backcolor';
    var sel=document.getElementById(this.wysiwyg_content).contentWindow.document.selection;
    if(sel!=null){
        rng=sel.createRange();
    }
    document.getElementById(this.wysiwyg_content).contentWindow.focus();
    if(document.getElementById(this.wysiwyg_content).contentWindow.document.queryCommandEnabled(command)){
        document.getElementById(this.wysiwyg_content).contentWindow.document.execCommand(command, false, color);
    }else return false;
    document.getElementById(this.wysiwyg_content).contentWindow.focus();
    return true;
}
WYSIWYG_Editor.prototype.getPallete = function(command, optn, evnt) {
    html = this._get_palette_html(command);
    if(typeof(pwin)=='object'){ // make sure it exists
        if(!pwin.closed){ // if it is still open
            pwin.close();
        }
    }
    pwin = window.open('','colorPallete','dependent=yes, directories=no, fullscreen=no,hotkeys=no,height=120,width=172,left='+evnt.screenX+',top='+evnt.screenY+',locatoin=no,menubar=no,resizable=no,scrollbars=no,status=no,titlebar=no,toolbar=no');
    pwin.document.write(html);
    pwin.document.close(); // prevents page from attempting to load more code
}
WYSIWYG_Editor.prototype.isSupported = function() {
    document.write('<iframe id="WYSIWYG_Editor_Testing_Browser_Features" style="display: none; visibility: hidden;"></iframe>');
    test = typeof(document.getElementById('WYSIWYG_Editor_Testing_Browser_Features').contentWindow);
    if(test == 'object'){
        return true;
    }else{
        return false;
    }
    return this.supported;
}
WYSIWYG_Editor.prototype.isMSIE = function(){
    if(typeof(document.all)=='object'){
        return true;
    }else{
        return false;
    }
}
WYSIWYG_Editor.prototype._get_palette_html = function(command) {
    s =     '<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">';
    s = s + '<html>';
    s = s + ' <head>';
    s = s + '  <meta http-equiv="Content-Type" content="text/html; charset=ISO-8859-1">';
    s = s + '  <title>Color Pallete</title>';
    s = s + '  <style type="text/css">';
    s = s + '   <!--';
    s = s + '    html,body{margin: 0px; padding: 0px; color: black; background-color: white;}';
    s = s + '    td{border: black none 2px;}';
    s = s + '    td:hover{border: white solid 2px;}';
    s = s + '   -->';
    s = s + '  </style>';
    s = s + ' </head>';
    s = s + '';
    s = s + ' <body onload="window.focus()" onblur="window.focus()">';
    s = s + '  <table border="0" cellpadding="0" cellspacing="2">';
    s = s + '   <tr>';
    s = s + '    <td id="cFFFFFF" bgcolor="#FFFFFF" width="15" height="15" onclick="str=this.id;color=str.replace(\'c\',\'#\');opener.'+this.instance_name+'.setColor(color,\''+command+'\');window.close();"><img width="1" height="1" alt="" src=""></td>';
    s = s + '    <td id="cFFCCCC" bgcolor="#FFCCCC" width="15" height="15" onclick="str=this.id;color=str.replace(\'c\',\'#\');opener.'+this.instance_name+'.setColor(color,\''+command+'\');window.close();"><img width="1" height="1" alt="" src=""></td>';
    s = s + '    <td id="cFFCC99" bgcolor="#FFCC99" width="15" height="15" onclick="str=this.id;color=str.replace(\'c\',\'#\');opener.'+this.instance_name+'.setColor(color,\''+command+'\');window.close();"><img width="1" height="1" alt="" src=""></td>';
    s = s + '    <td id="cFFFF99" bgcolor="#FFFF99" width="15" height="15" onclick="str=this.id;color=str.replace(\'c\',\'#\');opener.'+this.instance_name+'.setColor(color,\''+command+'\');window.close();"><img width="1" height="1" alt="" src=""></td>';
    s = s + '    <td id="cFFFFCC" bgcolor="#FFFFCC" width="15" height="15" onclick="str=this.id;color=str.replace(\'c\',\'#\');opener.'+this.instance_name+'.setColor(color,\''+command+'\');window.close();"><img width="1" height="1" alt="" src=""></td>';
    s = s + '    <td id="c99FF99" bgcolor="#99FF99" width="15" height="15" onclick="str=this.id;color=str.replace(\'c\',\'#\');opener.'+this.instance_name+'.setColor(color,\''+command+'\');window.close();"><img width="1" height="1" alt="" src=""></td>';
    s = s + '    <td id="c99FFFF" bgcolor="#99FFFF" width="15" height="15" onclick="str=this.id;color=str.replace(\'c\',\'#\');opener.'+this.instance_name+'.setColor(color,\''+command+'\');window.close();"><img width="1" height="1" alt="" src=""></td>';
    s = s + '    <td id="cCCFFFF" bgcolor="#CCFFFF" width="15" height="15" onclick="str=this.id;color=str.replace(\'c\',\'#\');opener.'+this.instance_name+'.setColor(color,\''+command+'\');window.close();"><img width="1" height="1" alt="" src=""></td>';
    s = s + '    <td id="cCCCCFF" bgcolor="#CCCCFF" width="15" height="15" onclick="str=this.id;color=str.replace(\'c\',\'#\');opener.'+this.instance_name+'.setColor(color,\''+command+'\');window.close();"><img width="1" height="1" alt="" src=""></td>';
    s = s + '    <td id="cFFCCFF" bgcolor="#FFCCFF" width="15" height="15" onclick="str=this.id;color=str.replace(\'c\',\'#\');opener.'+this.instance_name+'.setColor(color,\''+command+'\');window.close();"><img width="1" height="1" alt="" src=""></td>';
    s = s + '   </tr>';
    s = s + '   <tr>';
    s = s + '    <td id="cCCCCCC" bgcolor="#CCCCCC" width="15" height="15" onclick="str=this.id;color=str.replace(\'c\',\'#\');opener.'+this.instance_name+'.setColor(color,\''+command+'\');window.close();"><img width="1" height="1" alt="" src=""></td>';
    s = s + '    <td id="cFF6666" bgcolor="#FF6666" width="15" height="15" onclick="str=this.id;color=str.replace(\'c\',\'#\');opener.'+this.instance_name+'.setColor(color,\''+command+'\');window.close();"><img width="1" height="1" alt="" src=""></td>';
    s = s + '    <td id="cFF9966" bgcolor="#FF9966" width="15" height="15" onclick="str=this.id;color=str.replace(\'c\',\'#\');opener.'+this.instance_name+'.setColor(color,\''+command+'\');window.close();"><img width="1" height="1" alt="" src=""></td>';
    s = s + '    <td id="cFFFF66" bgcolor="#FFFF66" width="15" height="15" onclick="str=this.id;color=str.replace(\'c\',\'#\');opener.'+this.instance_name+'.setColor(color,\''+command+'\');window.close();"><img width="1" height="1" alt="" src=""></td>';
    s = s + '    <td id="cFFFF33" bgcolor="#FFFF33" width="15" height="15" onclick="str=this.id;color=str.replace(\'c\',\'#\');opener.'+this.instance_name+'.setColor(color,\''+command+'\');window.close();"><img width="1" height="1" alt="" src=""></td>';
    s = s + '    <td id="c66FF99" bgcolor="#66FF99" width="15" height="15" onclick="str=this.id;color=str.replace(\'c\',\'#\');opener.'+this.instance_name+'.setColor(color,\''+command+'\');window.close();"><img width="1" height="1" alt="" src=""></td>';
    s = s + '    <td id="c33FFFF" bgcolor="#33FFFF" width="15" height="15" onclick="str=this.id;color=str.replace(\'c\',\'#\');opener.'+this.instance_name+'.setColor(color,\''+command+'\');window.close();"><img width="1" height="1" alt="" src=""></td>';
    s = s + '    <td id="c66FFFF" bgcolor="#66FFFF" width="15" height="15" onclick="str=this.id;color=str.replace(\'c\',\'#\');opener.'+this.instance_name+'.setColor(color,\''+command+'\');window.close();"><img width="1" height="1" alt="" src=""></td>';
    s = s + '    <td id="c9999FF" bgcolor="#9999FF" width="15" height="15" onclick="str=this.id;color=str.replace(\'c\',\'#\');opener.'+this.instance_name+'.setColor(color,\''+command+'\');window.close();"><img width="1" height="1" alt="" src=""></td>';
    s = s + '    <td id="cFF99FF" bgcolor="#FF99FF" width="15" height="15" onclick="str=this.id;color=str.replace(\'c\',\'#\');opener.'+this.instance_name+'.setColor(color,\''+command+'\');window.close();"><img width="1" height="1" alt="" src=""></td>';
    s = s + '   </tr>';
    s = s + '   <tr>';
    s = s + '    <td id="cC0C0C0" bgcolor="#C0C0C0" width="15" height="15" onclick="str=this.id;color=str.replace(\'c\',\'#\');opener.'+this.instance_name+'.setColor(color,\''+command+'\');window.close();"><img width="1" height="1" alt="" src=""></td>';
    s = s + '    <td id="cFF0000" bgcolor="#FF0000" width="15" height="15" onclick="str=this.id;color=str.replace(\'c\',\'#\');opener.'+this.instance_name+'.setColor(color,\''+command+'\');window.close();"><img width="1" height="1" alt="" src=""></td>';
    s = s + '    <td id="cFF9900" bgcolor="#FF9900" width="15" height="15" onclick="str=this.id;color=str.replace(\'c\',\'#\');opener.'+this.instance_name+'.setColor(color,\''+command+'\');window.close();"><img width="1" height="1" alt="" src=""></td>';
    s = s + '    <td id="cFFCC66" bgcolor="#FFCC66" width="15" height="15" onclick="str=this.id;color=str.replace(\'c\',\'#\');opener.'+this.instance_name+'.setColor(color,\''+command+'\');window.close();"><img width="1" height="1" alt="" src=""></td>';
    s = s + '    <td id="cFFFF00" bgcolor="#FFFF00" width="15" height="15" onclick="str=this.id;color=str.replace(\'c\',\'#\');opener.'+this.instance_name+'.setColor(color,\''+command+'\');window.close();"><img width="1" height="1" alt="" src=""></td>';
    s = s + '    <td id="c33FF33" bgcolor="#33FF33" width="15" height="15" onclick="str=this.id;color=str.replace(\'c\',\'#\');opener.'+this.instance_name+'.setColor(color,\''+command+'\');window.close();"><img width="1" height="1" alt="" src=""></td>';
    s = s + '    <td id="c66CCCC" bgcolor="#66CCCC" width="15" height="15" onclick="str=this.id;color=str.replace(\'c\',\'#\');opener.'+this.instance_name+'.setColor(color,\''+command+'\');window.close();"><img width="1" height="1" alt="" src=""></td>';
    s = s + '    <td id="c33CCFF" bgcolor="#33CCFF" width="15" height="15" onclick="str=this.id;color=str.replace(\'c\',\'#\');opener.'+this.instance_name+'.setColor(color,\''+command+'\');window.close();"><img width="1" height="1" alt="" src=""></td>';
    s = s + '    <td id="c6666CC" bgcolor="#6666CC" width="15" height="15" onclick="str=this.id;color=str.replace(\'c\',\'#\');opener.'+this.instance_name+'.setColor(color,\''+command+'\');window.close();"><img width="1" height="1" alt="" src=""></td>';
    s = s + '    <td id="cCC66CC" bgcolor="#CC66CC" width="15" height="15" onclick="str=this.id;color=str.replace(\'c\',\'#\');opener.'+this.instance_name+'.setColor(color,\''+command+'\');window.close();"><img width="1" height="1" alt="" src=""></td>';
    s = s + '   </tr>';
    s = s + '   <tr>';
    s = s + '    <td id="c999999" bgcolor="#999999" width="15" height="15" onclick="str=this.id;color=str.replace(\'c\',\'#\');opener.'+this.instance_name+'.setColor(color,\''+command+'\');window.close();"><img width="1" height="1" alt="" src=""></td>';
    s = s + '    <td id="cCC0000" bgcolor="#CC0000" width="15" height="15" onclick="str=this.id;color=str.replace(\'c\',\'#\');opener.'+this.instance_name+'.setColor(color,\''+command+'\');window.close();"><img width="1" height="1" alt="" src=""></td>';
    s = s + '    <td id="cFF6600" bgcolor="#FF6600" width="15" height="15" onclick="str=this.id;color=str.replace(\'c\',\'#\');opener.'+this.instance_name+'.setColor(color,\''+command+'\');window.close();"><img width="1" height="1" alt="" src=""></td>';
    s = s + '    <td id="cFFCC33" bgcolor="#FFCC33" width="15" height="15" onclick="str=this.id;color=str.replace(\'c\',\'#\');opener.'+this.instance_name+'.setColor(color,\''+command+'\');window.close();"><img width="1" height="1" alt="" src=""></td>';
    s = s + '    <td id="cFFCC00" bgcolor="#FFCC00" width="15" height="15" onclick="str=this.id;color=str.replace(\'c\',\'#\');opener.'+this.instance_name+'.setColor(color,\''+command+'\');window.close();"><img width="1" height="1" alt="" src=""></td>';
    s = s + '    <td id="c33CC00" bgcolor="#33CC00" width="15" height="15" onclick="str=this.id;color=str.replace(\'c\',\'#\');opener.'+this.instance_name+'.setColor(color,\''+command+'\');window.close();"><img width="1" height="1" alt="" src=""></td>';
    s = s + '    <td id="c00CCCC" bgcolor="#00CCCC" width="15" height="15" onclick="str=this.id;color=str.replace(\'c\',\'#\');opener.'+this.instance_name+'.setColor(color,\''+command+'\');window.close();"><img width="1" height="1" alt="" src=""></td>';
    s = s + '    <td id="c3366FF" bgcolor="#3366FF" width="15" height="15" onclick="str=this.id;color=str.replace(\'c\',\'#\');opener.'+this.instance_name+'.setColor(color,\''+command+'\');window.close();"><img width="1" height="1" alt="" src=""></td>';
    s = s + '    <td id="c6633FF" bgcolor="#6633FF" width="15" height="15" onclick="str=this.id;color=str.replace(\'c\',\'#\');opener.'+this.instance_name+'.setColor(color,\''+command+'\');window.close();"><img width="1" height="1" alt="" src=""></td>';
    s = s + '    <td id="cCC33CC" bgcolor="#CC33CC" width="15" height="15" onclick="str=this.id;color=str.replace(\'c\',\'#\');opener.'+this.instance_name+'.setColor(color,\''+command+'\');window.close();"><img width="1" height="1" alt="" src=""></td>';
    s = s + '   </tr>';
    s = s + '   <tr>';
    s = s + '    <td id="c666666" bgcolor="#666666" width="15" height="15" onclick="str=this.id;color=str.replace(\'c\',\'#\');opener.'+this.instance_name+'.setColor(color,\''+command+'\');window.close();"><img width="1" height="1" alt="" src=""></td>';
    s = s + '    <td id="c990000" bgcolor="#990000" width="15" height="15" onclick="str=this.id;color=str.replace(\'c\',\'#\');opener.'+this.instance_name+'.setColor(color,\''+command+'\');window.close();"><img width="1" height="1" alt="" src=""></td>';
    s = s + '    <td id="cCC6600" bgcolor="#CC6600" width="15" height="15" onclick="str=this.id;color=str.replace(\'c\',\'#\');opener.'+this.instance_name+'.setColor(color,\''+command+'\');window.close();"><img width="1" height="1" alt="" src=""></td>';
    s = s + '    <td id="cCC9933" bgcolor="#CC9933" width="15" height="15" onclick="str=this.id;color=str.replace(\'c\',\'#\');opener.'+this.instance_name+'.setColor(color,\''+command+'\');window.close();"><img width="1" height="1" alt="" src=""></td>';
    s = s + '    <td id="c999900" bgcolor="#999900" width="15" height="15" onclick="str=this.id;color=str.replace(\'c\',\'#\');opener.'+this.instance_name+'.setColor(color,\''+command+'\');window.close();"><img width="1" height="1" alt="" src=""></td>';
    s = s + '    <td id="c009900" bgcolor="#009900" width="15" height="15" onclick="str=this.id;color=str.replace(\'c\',\'#\');opener.'+this.instance_name+'.setColor(color,\''+command+'\');window.close();"><img width="1" height="1" alt="" src=""></td>';
    s = s + '    <td id="c339999" bgcolor="#339999" width="15" height="15" onclick="str=this.id;color=str.replace(\'c\',\'#\');opener.'+this.instance_name+'.setColor(color,\''+command+'\');window.close();"><img width="1" height="1" alt="" src=""></td>';
    s = s + '    <td id="c3333FF" bgcolor="#3333FF" width="15" height="15" onclick="str=this.id;color=str.replace(\'c\',\'#\');opener.'+this.instance_name+'.setColor(color,\''+command+'\');window.close();"><img width="1" height="1" alt="" src=""></td>';
    s = s + '    <td id="c6600CC" bgcolor="#6600CC" width="15" height="15" onclick="str=this.id;color=str.replace(\'c\',\'#\');opener.'+this.instance_name+'.setColor(color,\''+command+'\');window.close();"><img width="1" height="1" alt="" src=""></td>';
    s = s + '    <td id="c993399" bgcolor="#993399" width="15" height="15" onclick="str=this.id;color=str.replace(\'c\',\'#\');opener.'+this.instance_name+'.setColor(color,\''+command+'\');window.close();"><img width="1" height="1" alt="" src=""></td>';
    s = s + '   </tr>';
    s = s + '   <tr>';
    s = s + '    <td id="c333333" bgcolor="#333333" width="15" height="15" onclick="str=this.id;color=str.replace(\'c\',\'#\');opener.'+this.instance_name+'.setColor(color,\''+command+'\');window.close();"><img width="1" height="1" alt="" src=""></td>';
    s = s + '    <td id="c660000" bgcolor="#660000" width="15" height="15" onclick="str=this.id;color=str.replace(\'c\',\'#\');opener.'+this.instance_name+'.setColor(color,\''+command+'\');window.close();"><img width="1" height="1" alt="" src=""></td>';
    s = s + '    <td id="c993300" bgcolor="#993300" width="15" height="15" onclick="str=this.id;color=str.replace(\'c\',\'#\');opener.'+this.instance_name+'.setColor(color,\''+command+'\');window.close();"><img width="1" height="1" alt="" src=""></td>';
    s = s + '    <td id="c996633" bgcolor="#996633" width="15" height="15" onclick="str=this.id;color=str.replace(\'c\',\'#\');opener.'+this.instance_name+'.setColor(color,\''+command+'\');window.close();"><img width="1" height="1" alt="" src=""></td>';
    s = s + '    <td id="c666600" bgcolor="#666600" width="15" height="15" onclick="str=this.id;color=str.replace(\'c\',\'#\');opener.'+this.instance_name+'.setColor(color,\''+command+'\');window.close();"><img width="1" height="1" alt="" src=""></td>';
    s = s + '    <td id="c006600" bgcolor="#006600" width="15" height="15" onclick="str=this.id;color=str.replace(\'c\',\'#\');opener.'+this.instance_name+'.setColor(color,\''+command+'\');window.close();"><img width="1" height="1" alt="" src=""></td>';
    s = s + '    <td id="c336666" bgcolor="#336666" width="15" height="15" onclick="str=this.id;color=str.replace(\'c\',\'#\');opener.'+this.instance_name+'.setColor(color,\''+command+'\');window.close();"><img width="1" height="1" alt="" src=""></td>';
    s = s + '    <td id="c000099" bgcolor="#000099" width="15" height="15" onclick="str=this.id;color=str.replace(\'c\',\'#\');opener.'+this.instance_name+'.setColor(color,\''+command+'\');window.close();"><img width="1" height="1" alt="" src=""></td>';
    s = s + '    <td id="c333399" bgcolor="#333399" width="15" height="15" onclick="str=this.id;color=str.replace(\'c\',\'#\');opener.'+this.instance_name+'.setColor(color,\''+command+'\');window.close();"><img width="1" height="1" alt="" src=""></td>';
    s = s + '    <td id="c663366" bgcolor="#663366" width="15" height="15" onclick="str=this.id;color=str.replace(\'c\',\'#\');opener.'+this.instance_name+'.setColor(color,\''+command+'\');window.close();"><img width="1" height="1" alt="" src=""></td>';
    s = s + '   </tr>';
    s = s + '   <tr>';
    s = s + '    <td id="c000000" bgcolor="#000000" width="15" height="15" onclick="str=this.id;color=str.replace(\'c\',\'#\');opener.'+this.instance_name+'.setColor(color,\''+command+'\');window.close();"><img width="1" height="1" alt="" src=""></td>';
    s = s + '    <td id="c330000" bgcolor="#330000" width="15" height="15" onclick="str=this.id;color=str.replace(\'c\',\'#\');opener.'+this.instance_name+'.setColor(color,\''+command+'\');window.close();"><img width="1" height="1" alt="" src=""></td>';
    s = s + '    <td id="c663300" bgcolor="#663300" width="15" height="15" onclick="str=this.id;color=str.replace(\'c\',\'#\');opener.'+this.instance_name+'.setColor(color,\''+command+'\');window.close();"><img width="1" height="1" alt="" src=""></td>';
    s = s + '    <td id="c663333" bgcolor="#663333" width="15" height="15" onclick="str=this.id;color=str.replace(\'c\',\'#\');opener.'+this.instance_name+'.setColor(color,\''+command+'\');window.close();"><img width="1" height="1" alt="" src=""></td>';
    s = s + '    <td id="c333300" bgcolor="#333300" width="15" height="15" onclick="str=this.id;color=str.replace(\'c\',\'#\');opener.'+this.instance_name+'.setColor(color,\''+command+'\');window.close();"><img width="1" height="1" alt="" src=""></td>';
    s = s + '    <td id="c003300" bgcolor="#003300" width="15" height="15" onclick="str=this.id;color=str.replace(\'c\',\'#\');opener.'+this.instance_name+'.setColor(color,\''+command+'\');window.close();"><img width="1" height="1" alt="" src=""></td>';
    s = s + '    <td id="c003333" bgcolor="#003333" width="15" height="15" onclick="str=this.id;color=str.replace(\'c\',\'#\');opener.'+this.instance_name+'.setColor(color,\''+command+'\');window.close();"><img width="1" height="1" alt="" src=""></td>';
    s = s + '    <td id="c000066" bgcolor="#000066" width="15" height="15" onclick="str=this.id;color=str.replace(\'c\',\'#\');opener.'+this.instance_name+'.setColor(color,\''+command+'\');window.close();"><img width="1" height="1" alt="" src=""></td>';
    s = s + '    <td id="c330099" bgcolor="#330099" width="15" height="15" onclick="str=this.id;color=str.replace(\'c\',\'#\');opener.'+this.instance_name+'.setColor(color,\''+command+'\');window.close();"><img width="1" height="1" alt="" src=""></td>';
    s = s + '    <td id="c330033" bgcolor="#330033" width="15" height="15" onclick="str=this.id;color=str.replace(\'c\',\'#\');opener.'+this.instance_name+'.setColor(color,\''+command+'\');window.close();"><img width="1" height="1" alt="" src=""></td>';
    s = s + '   </tr>';
    s = s + '  </table>';
    s = s + ' </body>';
    s = s + '</html>';
    return s;
}
WYSIWYG_Editor.prototype.insertImage = function(){
    this.imagePopUp=window.open(this.site_path+'/_include/back_end/image_dialog.php?page_title='+this.page_title,'','width=620,height=500,resizable=1,scrollbars=yes');
    var sel=document.getElementById(this.wysiwyg_content).contentWindow.document.selection;
    if(sel!=null){
        rng=sel.createRange();
    }
}
WYSIWYG_Editor.prototype.addImage = function(thisimage){
    if(this.imagePopUp && !this.imagePopUp.closed) this.imagePopUp.close();
    document.getElementById(this.wysiwyg_content).contentWindow.focus();
    if(this.viewMode==1){
        var x=document.getElementById(this.wysiwyg_content).contentWindow.document;
        x.execCommand('insertimage', false, thisimage);
    }
}
//
//////////////////////////////////////////////////