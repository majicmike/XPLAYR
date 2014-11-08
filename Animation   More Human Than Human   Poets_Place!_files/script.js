/**
 * Copyright (c) 2008 Google Inc.
 *
 * You are free to copy and use this sample.
 * License can be found here: http://code.google.com/apis/ajaxsearch/faq/#license
*/

function GSvideoSearchControl(root, defaultTags,
                   opt_loadTagsFunction, opt_saveTagsFunction, opt_options) {

  this.processArguments(root, defaultTags, opt_loadTagsFunction,
                        opt_saveTagsFunction, opt_options);

  this.setGlobals();
  this.bindToPage();
  this.loadTags();
  this.startSearchControl();
}

GSvideoSearchControl.prototype.processArguments = function(root, defaultTags,
                                                opt_loadTagsFunction,
                                                opt_saveTagsFunction,
                                                opt_options) {
  this.root = root;
  this.defaultTags = defaultTags;
  this.enableEditTags = false;

  if (opt_loadTagsFunction) {
    this.loadCallback = opt_loadTagsFunction;
  } else {
    this.loadCallback = null;
  }

  if (opt_saveTagsFunction) {
    this.saveCallback = opt_saveTagsFunction;
    this.enableEditTags = true;
  } else {
    this.saveCallback = null;
  }

  // set defaults that are changable via options
  this.resultSetSize = GSearch.SMALL_RESULTSET;
  this.ssDelay = 350;
  this.twoRowMode = false;
  this.ST_ALL_DONE = GSearch.strings["im-done"];

  // process options if specified
  if (opt_options) {

    // option.largetResultSet
    if (opt_options.largeResultSet && opt_options.largeResultSet == true ) {
      this.resultSetSize = GSearch.LARGE_RESULTSET;
    } else {
      this.resultSetSize = GSearch.SMALL_RESULTSET;
    }

    // option.startupDelay
    if (opt_options.startupDelay &&
        (opt_options.startupDelay > 0 && opt_options.startupDelay <= 2000) ) {
      this.ssDelay = opt_options.startupDelay;
    }

    // option.twoRowMode
    if (opt_options.twoRowMode && opt_options.twoRowMode == true ) {
      this.twoRowMode = true;
    }

    if (opt_options.string_allDone) {
      this.ST_ALL_DONE = opt_options.string_allDone;
    }
  }
}

GSvideoSearchControl.prototype.setGlobals = function() {
  this.br_AgentContains_cache_ = {};

  // superstructure class
  this.CLSS_MORE = "more_gsvsc";
  this.CLSS_READBOX = "readBox_gsvsc";
  this.CLSS_EDITBOX = "editBox_gsvsc";
  this.CLSS_FOOTERBOX = "footerBox_gsvsc";
  this.CLSS_CONTROLBOX = "controlBox_gsvsc";
  this.CLSS_PLAYERBOX = "playerBox_gsvsc";
  this.CLSS_TAGSTACKBOX = "tagStackBox_gsvsc";
  this.CLSS_SEARCHFORM = "searchForm_gsvsc";
  this.CLSS_RESULTSBOX = "results_gsvsc";
  this.CLSS_TINYRESULTSBOX = "tiny-results_gsvsc";

  // global classes
  // major app states
  this.CL_READING = "app_gsvsc reading_gsvsc";
  this.CL_SEARCHING = "app_gsvsc searching_gsvsc";
  this.CL_EDITING = "app_gsvsc editing_gsvsc";
  this.CL_PLAYING = "app_gsvsc playing_gsvsc";
  this.CL_TAGCONTROL = "tag-control_gsvsc";
  this.CL_ODD = "odd_gsvsc";
  this.CL_EVEN = "even_gsvsc";

  // tag classes
  this.CL_TAG = "tag_gsvsc";
  this.CL_TAGSELECTED = " tag-selected_gsvsc";
  this.CL_RTAG_PREFIX = "tag_gsvsc-";
  this.CL_EDITTAG = "edit-tag_gsvsc";

  // search form components
  this.CL_SFINPUT = "search-form-input_gsvsc";
  this.CL_SFINPUTCELL = "search-form-input-cell_gsvsc";
  this.CL_SFSEARCH = "search-form-search_gsvsc";
  this.CL_SFSEARCHCELL = "search-form-search-cell_gsvsc";
  this.CL_SFSAVE = "search-form-save_gsvsc";
  this.CL_SFCOMPLETE = "searchForm_gsvsc search-form-complete_gsvsc";

  // edit form components
  this.CL_EFINPUTBOX = "edit-form-input-box_gsvsc";
  this.CL_EFINPUT = "edit-form-input_gsvsc";
  this.CL_EFDELETE = "edit-form-delete_gsvsc";
  this.CL_EFDELETE_OPERA = "edit-form-delete-opera_gsvsc";
  this.CL_EFSUBMITBOX = "edit-form-submit-box_gsvsc";

  // results
  this.CL_VIDEORESULT = "video-result_gsvsc";
  this.CL_TINYVIDEORESULT = "tiny-video-result_gsvsc";
  this.CL_VIDEORESULTTABLE = "video-result-table_gsvsc";
  this.CL_VIDEORESULTCELL = "video-result-cell_gsvsc-";

  // player
  this.CL_PLAYER = "player_gsvsc";
  this.CL_TITLE = "title_gsvsc";

  // footer
  this.CL_FOOTERLINK = "footer-link_gsvsc";
  this.CL_FOOTEREDIT = "footer-edit_gsvsc";

  // non-settable strings, strings that
  // are not modifiable via options
  this.ST_SEARCH = GSearch.strings["search"];
  this.ST_EDIT = GSearch.strings["edit-tags"];
  this.ST_SAVESEARCH = GSearch.strings["tag-search"];
  this.ST_QUERY = GSearch.strings["search"];
  this.ST_LABEL = GSearch.strings["optional-label"];
  this.ST_DELETE = GSearch.strings["delete"];
  this.ST_DELETED = GSearch.strings["deleted"];
  this.ST_SAVEBTN = GSearch.strings["save"];
  this.ST_CANCELBTN = GSearch.strings["cancel"];
  this.ST_MOREVIDEOS = "";

  this.tinyResultBoxHeight = 39;
  this.resultBoxHeight = 77;
  this.maxRandom = 2;
  this.footerUrl = "http://www.nexxuz.com";
}

GSvideoSearchControl.prototype.buildSuperStructure = function() {
  this.app = this.createDiv(null, this.CL_READING);

  // first level children
  this.more = this.createDiv(null, this.CLSS_MORE);
  this.readBox = this.createDiv(null, this.CLSS_READBOX);
  this.editBox = this.createDiv(null, this.CLSS_EDITBOX);
  this.footerBox = this.createDiv(null, this.CLSS_FOOTERBOX);
  this.app.appendChild(this.more);
  this.app.appendChild(this.readBox);
  this.app.appendChild(this.editBox);
  this.app.appendChild(this.footerBox);

  // readBox children
  this.controlBox = this.createDiv(null, this.CLSS_CONTROLBOX);
  this.searchForm = this.createDiv(null, this.CLSS_SEARCHFORM);
  this.results = this.createDiv(null, this.CLSS_RESULTSBOX);
  this.tinyResults = this.createDiv(null, this.CLSS_TINYRESULTSBOX);
  this.playerBox = this.createDiv(null, this.CLSS_PLAYERBOX);
  this.tagStack = this.createDiv(null, this.CLSS_TAGSTACKBOX);
  this.controlBox.appendChild(this.playerBox);
  this.controlBox.appendChild(this.searchForm);
  this.controlBox.appendChild(this.results);
  this.controlBox.appendChild(this.tinyResults);
  this.controlBox.appendChild(this.tagStack);
  this.readBox.appendChild(this.controlBox);

  // footerBox children
  this.footerLink = this.createLink(this.footerUrl, this.ST_MOREVIDEOS);

  if (this.enableEditTags) {
    var table = this.createTable();
    var row = this.createTableRow(table);
    var editCell = this.createTableCell(row, this.CL_FOOTEREDIT);
    var linkCell = this.createTableCell(row, this.CL_FOOTERLINK);

    var edit = this.createDiv(this.ST_EDIT, this.CL_EDITTAG);
    edit.onclick = this.methodClosure(this, GSvideoSearchControl.prototype.startEditing, [true]);
    editCell.appendChild(edit);

    // footer link
    linkCell.appendChild(this.footerLink);
    this.footerBox.appendChild(table);
  } else {
    this.footerBox.appendChild(this.footerLink);
  }
}
GSvideoSearchControl.prototype.bindToPage = function() {
  this.buildSuperStructure();
  this.removeChildren(this.root);
  this.root.appendChild(this.app);

  // bind up the search and edit controls
  this.more.innerHTML = this.ST_SEARCH;
  this.more.onclick = this.methodClosure(this, GSvideoSearchControl.prototype.twiddleMore, []);

  // build the search form
  this.vsf = new GSearchForm(false, this.searchForm,
                             {
                               clickableBrandingUrl : "http://video.google.com"
                             });
  this.vsf.setOnSubmitCallback(this,GSvideoSearchControl.prototype.searchByString);

  if ( this.enableEditTags ) {
    this.vsfSaveQuery = this.createDiv(this.ST_SAVESEARCH, this.CL_SFSAVE);
    this.vsf.userDefinedCell.appendChild(this.vsfSaveQuery);
    this.vsfSaveQuery.onclick = this.methodClosure(this, GSvideoSearchControl.prototype.addTag, []);
  }
}

GSvideoSearchControl.prototype.startSearchControl = function() {
  this.vs = new GvideoSearch();
  this.vs.setResultSetSize(this.resultSetSize);
  this.vs.setSearchCompleteCallback(this, GSvideoSearchControl.prototype.searchComplete, [null]);
  this.searchCounter = 0;
  this.startupTimer = setTimeout(this.methodClosure(this, GSvideoSearchControl.prototype.firstSearch, [null]), this.ssDelay);
}

GSvideoSearchControl.prototype.firstSearch = function() {
  if (this.searchCounter == 0) {
    this.doRandomSearch();
  }
}

GSvideoSearchControl.prototype.searchComplete = function() {
  if ( this.vs.results && this.vs.results.length > 0) {
    this.removeChildren(this.results);
    this.removeChildren(this.tinyResults);
    if (this.vsf.input.value != "") {
      if ( this.enableEditTags ) {
        this.cssSetClass(this.searchForm, this.CL_SFCOMPLETE);
      }
      if (this.currentItem) {
        this.cssSetClass(this.currentItem.domNode, this.currentItem.savedClassName);
        this.currentItem = null;
      }
    }

    var maxColumns = 2;
    var tinyMaxColumns = 2;
    if (this.getNodeWidth(this.results) > 350 || this.getNodeWidth(this.tinyResults) > 350 ) {
      maxColumns = 4;
      tinyMaxColumns = 8;
    }
    var table = this.createTable(this.CL_VIDEORESULTTABLE + " " + this.CL_VIDEORESULTTABLE + "-" + maxColumns);
    table.setAttribute("align", "center");
    var tinyTable = this.createTable(this.CL_VIDEORESULTTABLE + " " + this.CL_VIDEORESULTTABLE + "-" + tinyMaxColumns);
    tinyTable.setAttribute("align", "center");

    var row = null;
    var tinyRow = null;
    var cellCounter = 0;
    var tinyCellCounter = 0;
    var rowCounter = 0;

    for (var i = 0; i < this.vs.results.length; i++) {
      var res = this.vs.results[i];

      // full size image
      var imageScaler = {width:100,height:75};
      var scaled = GSearch.scaleImage(res.tbWidth, res.tbHeight, imageScaler);
      var img = this.createImage(res.tbUrl, scaled.width, scaled.height, null);
      img.onclick = this.methodClosure(this, GSvideoSearchControl.prototype.playVideo, [res]);

      // half sized image
      var tinyImageScaler = {width:50,height:37};
      var tinyScaled = GSearch.scaleImage(res.tbWidth, res.tbHeight, tinyImageScaler);

      var tinyImg = this.createImage(res.tbUrl, tinyScaled.width, tinyScaled.height, null);
      tinyImg.onclick = this.methodClosure(this, GSvideoSearchControl.prototype.playVideo, [res]);

      // manually set the top padding
      if ((this.resultBoxHeight - scaled.height) > 0) {
        var padTop = Math.round((this.resultBoxHeight - scaled.height)/2);

        if  ( this.br_IsNav() ) {
          //img.setAttribute("style", "{padding-top:" + padTop +";}");
          img.setAttribute("vspace", padTop);
        } else {
          img.setAttribute("vspace", padTop);
        }
      }
      if ((this.tinyResultBoxHeight - tinyScaled.height) > 0) {
        var tinyPadTop = Math.round((this.tinyResultBoxHeight - tinyScaled.height)/2);

        if  ( this.br_IsNav() ) {
          //tinyImg.setAttribute("style", "{padding-top:" + tinyPadTop +";}");
          tinyImg.setAttribute("vspace", tinyPadTop);
        } else {
          tinyImg.setAttribute("vspace", tinyPadTop);
        }
      }

      // compute duration
      var seconds = res.duration;
      var minutes = parseInt(seconds/60);
      var durationString;
      if (minutes > 0) {
        durationString = minutes + "m";
        var remainder = seconds%60;
        if (remainder > 20) {
          durationString += " " + remainder + "s";
        }
      } else {
        durationString = seconds + "s";
      }

      var toolTip = res.titleNoFormatting + " ( " + durationString + " )";
      var div = this.createDiv(null, this.CL_VIDEORESULT);
      div.title = toolTip;
      div.appendChild(img);

      var tinyDiv = this.createDiv(null, this.CL_TINYVIDEORESULT);
      tinyDiv.title = toolTip;
      tinyDiv.appendChild(tinyImg);

      // create rows as needed
      if (row == null || cellCounter >= maxColumns) {
        row = this.createTableRow(table);
        cellCounter = 0;
        rowCounter++;
        if (this.twoRowMode && rowCounter > 2) {
          break;
        }
      }

      // create rows as needed
      if (tinyRow == null || tinyCellCounter >= tinyMaxColumns) {
        tinyRow = this.createTableRow(tinyTable);
        tinyCellCounter = 0;
      }


      var cell = this.createTableCell(row, this.CL_VIDEORESULTCELL + cellCounter);
      cell.appendChild(div);
      cellCounter++;

      var tinyCell = this.createTableCell(tinyRow, this.CL_VIDEORESULTCELL + cellCounter);
      tinyCell.appendChild(tinyDiv);
      tinyCellCounter++;
    }
    this.results.appendChild(table);
    this.tinyResults.appendChild(tinyTable);
  }
}

GSvideoSearchControl.prototype.playVideo = function(result) {
  this.stopVideo();
  if (result.playUrl && result.playUrl != "") {

    // switch to the player
    this.more.innerHTML = this.ST_ALL_DONE;
    this.cssSetClass(this.app, this.CL_PLAYING);
    if (GvideoSearch.createPlayer) {
      this.player = GvideoSearch.createPlayer(result, this.CL_PLAYER);
    } else {
      var playUrl = result.playUrl;

      if (this.br_IsOpera()) {
        this.player = document.createElement("object");
        this.player.className = this.CL_PLAYER;
        this.player.setAttribute("type", "application/x-shockwave-flash");
        this.player.setAttribute("data", playUrl);
      } else {
        this.player = document.createElement("embed");
        this.player.className = this.CL_PLAYER;
        this.player.setAttribute("type", "application/x-shockwave-flash");
        this.player.setAttribute("src", playUrl);
        if (result.videoType) {
          if (result.videoType == "Google") {
            this.player.setAttribute("bgcolor", "#000000");
          } else {
            this.player.setAttribute("wmode", "transparent");
          }
        } else {
          this.player.setAttribute("bgcolor", "#000000");
        }
      }
    }
    this.playerBox.appendChild(this.player);

    // the title
    var title = this.createDivLink(result.url, result.title, null, this.CL_TITLE);
    this.playerBox.appendChild(title);
  }
}

GSvideoSearchControl.prototype.stopVideo = function(result) {
  this.removeChildren(this.playerBox);
  if (this.player) {
    delete(this.player);
    this.player = null;
  }
}

GSvideoSearchControl.prototype.doRandomSearch = function() {
  // pick a random video
  var max = this.tags.length - 1;
  var index = Math.round(max * Math.random());
  this.searchByIndex(index);
}

GSvideoSearchControl.prototype.loadTags = function() {

  if (this.loadCallback) {
    var tags = this.loadCallback();
    if (tags == null || tags == "") {
      this.tags = this.defaultTags;
    } else {
      this.tags = GSvideoSearchControl_JSON.parse(tags);
    }
  } else {
    this.tags = this.defaultTags;
  }

  this.removeChildren(this.tagStack);
  for (var i=0; i < this.tags.length; i++ ) {
    this.loadTagItem(i);
  }
}

GSvideoSearchControl.prototype.loadTagItem = function(itemIndex) {

  var item = this.tags[itemIndex]
  var baseClassName = this.CL_TAG + " " + this.CL_RTAG_PREFIX;
  var label = item.query;
  if (item.label) {
    label = item.label;
  }

  // random class between 0 and this.maxRandom
  var r = Math.round(this.maxRandom * Math.random());
  className = baseClassName + r;

  label = " " + label.replace(/\s/g,"") + " ";
  var div = this.createDiv(label, className);
  div.onclick = this.methodClosure(this, GSvideoSearchControl.prototype.searchByIndex, [itemIndex]);
  this.tagStack.appendChild(div);

  item.savedClassName = className;
  item.domNode = div;
}

GSvideoSearchControl.prototype.addTag = function() {
  if ( this.enableEditTags ) {
    if (this.vsf.input.value && this.vsf.input.value != "") {
      var item = new Object();
      item.query = this.vsf.input.value;

      // ensure this one is not already in our stack
      var matchFound = false;
      for (var i=0; i < this.tags.length; i++) {
        var ci = this.tags[i];
        if (ci.query.toLowerCase() == item.query.toLowerCase()) {
          matchFound = true;
          break;
        }
      }
      this.vsf.input.value = "";
      if (!matchFound) {
        this.tags.push(item);
        this.loadTagItem(this.tags.length-1);
        this.setSelectedIndex(this.tags.length-1);
        this.twiddleMore();
        this.saveTags();
      } else {
        this.twiddleMore();
      }
    }
  }
}

GSvideoSearchControl.prototype.saveTags = function() {

  var cleanTags = new Array();
  for (var i=0; i < this.tags.length; i++) {
    var ci = this.tags[i];
    var ni = new Object();
    ni.query = ci.query;
    if (ci.label) {
      ni.label = ci.label;
    }
    cleanTags.push(ni);
  }
  var tagStrings = GSvideoSearchControl_JSON.stringify(cleanTags);
  if (tagStrings) {
    if (this.saveCallback) {
      this.saveCallback(tagStrings);
    }
  }
}

GSvideoSearchControl.prototype.deleteTag = function(formRow, itemIndex) {

  this.tags[itemIndex].softDeleted = true;
  if (this.br_IsOpera()) {
    // opera will not let me touch the table
    // so I just redraw the thing instead

    // create a value table array so I can promote the current form
    // values...

    valueTable = new Array();
    for (var i=0; i < this.formInputs.length; i++) {
      var inputObject = new Object();

      // promote query value
      if (this.tags[i].softDeleted) {
        inputObject.query = "";
        inputObject.label = "";
      } else {
        if (this.formInputs[i].queryInput.value) {
          inputObject.query = this.cleanse(this.formInputs[i].queryInput.value);
        } else {
          inputObject.query = "";
        }
        if (this.formInputs[i].labelInput.value) {
          inputObject.label = this.cleanse(this.formInputs[i].labelInput.value);
        } else {
          inputObject.label = "";
        }
      }
      valueTable.push(inputObject);
    }
    this.createEditForm(valueTable);
  } else {
    this.cssSetClass(formRow, this.CL_EFDELETE);
  }
}

GSvideoSearchControl.prototype.startEditing = function() {
  if (this.tags.length <= 0) {
    return;
  }
  this.cssSetClass(this.app, this.CL_EDITING);
  this.createEditForm(null);
}

GSvideoSearchControl.prototype.stopEditing = function(formDisposition) {
  this.cssSetClass(this.app, this.CL_READING);
  this.submitEditForm(formDisposition);
  return false;
}

GSvideoSearchControl.prototype.createEditForm = function(opt_valueTable) {

  // build the search form

  this.removeChildren(this.editBox);
  this.ef = this.createForm(null);
  this.formInputs = new Array();

  var table = this.createTable();
  for (var i=0; i < this.tags.length; i++) {
    var rowClass = this.CL_ODD;
    if (i % 2 == 0) {
      var rowClass = this.CL_EVEN;
    }
    var item = this.tags[i];
    var inputObject = new Object();

    // for each item, create a row, input cell, delete cell, etc
    var row = this.createTableRow(table, rowClass);
    var inputCell = this.createTableCell(row, this.CL_EFINPUT);
    var deleteCell = this.createTableCell(row, this.CL_EFDELETE);

    // query
    var div = this.createDiv(null, this.CL_EFINPUTBOX);
    var input = this.createTextInput(this.CL_EFINPUT, "query");
    var label = this.createDiv(this.ST_QUERY, this.CL_TAGCONTROL);
    div.appendChild(input);
    div.appendChild(label);
    inputCell.appendChild(div);
    if (item.softDeleted) {
      input.value = this.ST_DELETED;
      input.disabled = true;
    } else {
      if (opt_valueTable) {
        input.value = opt_valueTable[i].query;
      } else {
        if (item.query) {
          input.value = item.query;
        }
      }
    }
    inputObject.queryInput = input;

    // label
    div = this.createDiv(null, this.CL_EFINPUTBOX);
    input = this.createTextInput(this.CL_EFINPUT, "label");
    label = this.createDiv(this.ST_LABEL, this.CL_TAGCONTROL);
    div.appendChild(input);
    div.appendChild(label);
    inputCell.appendChild(div);
    if (item.softDeleted) {
      input.value = this.ST_DELETED;
      input.disabled = true;
    } else {
      if (opt_valueTable) {
        input.value = opt_valueTable[i].label;
      } else {
        if (item.label) {
          input.value = item.label;
        }
      }
    }
    inputObject.labelInput = input;
    this.formInputs.push(inputObject);

    // delete
    if (item.softDeleted) {
      div = this.createDiv(" ", this.CL_TAGCONTROL);
    } else {
      div = this.createDiv(this.ST_DELETE, this.CL_TAGCONTROL);
      div.onclick = this.methodClosure(this, GSvideoSearchControl.prototype.deleteTag, [row, i]);
    }

    deleteCell.appendChild(div);
  }
  this.ef.appendChild(table);

  // save/cancel buttons
  div = this.createDiv(null, this.CL_EFSUBMITBOX);
  var button = this.createButton(this.ST_CANCELBTN, this.CL_TAGCONTROL);
  button.onclick = this.methodClosure(this, GSvideoSearchControl.prototype.stopEditing, [false]);
  div.appendChild(button);

  button = this.createButton(this.ST_SAVEBTN, this.CL_TAGCONTROL);
  button.onclick = this.methodClosure(this, GSvideoSearchControl.prototype.stopEditing, [true]);
  this.ef.onsubmit = this.methodClosure(this, GSvideoSearchControl.prototype.stopEditing, [true]);
  div.appendChild(button);
  this.ef.appendChild(div);

  this.editBox.appendChild(this.ef)
}

GSvideoSearchControl.prototype.submitEditForm = function(ok) {

  if (ok) {

    // whip through the form creating a new set of items
    var cleanTags = new Array();
    for (var i=0; i < this.tags.length; i++) {
      ci = this.tags[i];

      // skip soft deletes
      if (ci.softDeleted) {
        continue;
      }

      var item = new Object();
      // safari forces me to use
      // a parallel array... if (this.ef["query"][i].value) {
      if (this.formInputs[i].queryInput.value) {
        item.query = this.cleanse(this.formInputs[i].queryInput.value);
      } else {
        item.query = ci.query;
      }

      if (this.formInputs[i].labelInput.value) {
        item.label = this.cleanse(this.formInputs[i].labelInput.value);
      }
      cleanTags.push(item);
    }

    // resort to default if you have nuked everything?
    if (cleanTags.length) {
      this.tags = cleanTags;
    } else {
      this.tags = this.defaultTags;
    }
    this.saveTags();

    // todo(markl): this should be a this.loadTags()
    this.removeChildren(this.tagStack);
    for (var i=0; i < this.tags.length; i++ ) {
      this.loadTagItem(i);
    }
    this.doRandomSearch();
  } else {
    for (var i=0; i < this.tags.length; i++) {
      ci = this.tags[i];
      ci.softDeleted = false;
    }
  }
}

GSvideoSearchControl.prototype.setSelectedIndex = function(itemIndex) {
  if (this.currentItem) {
    this.cssSetClass(this.currentItem.domNode, this.currentItem.savedClassName);
  }
  var item = this.tags[itemIndex];
  this.currentItem = item;
  this.cssSetClass(this.currentItem.domNode, this.currentItem.savedClassName + this.CL_TAGSELECTED);
}

GSvideoSearchControl.prototype.searchByIndex = function(itemIndex) {
  var item = this.tags[itemIndex];
  this.setSelectedIndex(itemIndex);
  this.searchByString(this.vsf, item.query);
}

/**
 * Standard .execute function to perform a search
 */
GSvideoSearchControl.prototype.execute = function(query) {
  this.vsf.input.value = query;
  this.searchByString(this.vsf);
}

GSvideoSearchControl.prototype.searchByString = function(form, opt_query) {

  this.searchCounter++;
  clearTimeout(this.startupTimer);

  var query = "";
  if (opt_query) {
    query = opt_query;
    this.vsf.input.value = "";
    this.cssSetClass(this.searchForm, this.CLSS_SEARCHFORM);
  } else if (this.vsf.input.value) {
    query = this.vsf.input.value;
  } else {
    return false;
  }
  if (this.twoRowMode) {
    if (this.getNodeWidth(this.results) > 350 || this.getNodeWidth(this.tinyResults) > 350 ) {
      this.resultSetSize = GSearch.LARGE_RESULTSET;
    } else {
      this.resultSetSize = GSearch.SMALL_RESULTSET;
    }
    this.vs.setResultSetSize(this.resultSetSize);
  }
  this.vs.execute(query);

  return false;
}

GSvideoSearchControl.prototype.twiddleMore = function() {
  if (this.app.className == this.CL_READING) {
    this.more.innerHTML = this.ST_ALL_DONE;
    this.cssSetClass(this.app, this.CL_SEARCHING);
    this.cssSetClass(this.searchForm, this.CLSS_SEARCHFORM);
  } else if (this.app.className == this.CL_PLAYING) {
    this.more.innerHTML = this.ST_SEARCH;
    this.cssSetClass(this.app, this.CL_READING);
    this.stopVideo();
  } else {
    this.more.innerHTML = this.ST_SEARCH;
    this.cssSetClass(this.app, this.CL_READING);
  }
}

/**
 * Static Helper Method
*/
GSvideoSearchControl.methodCallback = function(object, method) {
  return function() {
    return method.apply(object, arguments);
  }
}

/**
 * Class methods
*/
GSvideoSearchControl.prototype.cleanse = function(str) {
  return str.replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

GSvideoSearchControl.prototype.methodClosure = function(object, method, opt_argArray) {
  return function() {
    return method.apply(object, opt_argArray);
  }
}

GSvideoSearchControl.prototype.createDiv = function(opt_text, opt_className) {
  var el = document.createElement("div");
  if (opt_text) {
    el.innerHTML = opt_text;
  }
  if (opt_className) { el.className = opt_className; }
  return el;
}

GSvideoSearchControl.prototype.removeChildren = function(parent) {
  while (parent.firstChild) {
    parent.removeChild(parent.firstChild);
  }
}

GSvideoSearchControl.prototype.removeChild = function(parent, child) {
  parent.removeChild(child);
}

GSvideoSearchControl.prototype.cssSetClass = function(el, className) {
  el.className = className;
}


GSvideoSearchControl.prototype.createForm = function(opt_className) {
  var el = document.createElement("form");
  if (opt_className) { el.className = opt_className; }
  return el;
}

GSvideoSearchControl.prototype.createTable = function(opt_className) {
  var el = document.createElement("table");
  if (opt_className) { el.className = opt_className; }
  return el;
}

GSvideoSearchControl.prototype.createTableRow = function(table, opt_className) {
  var tr = table.insertRow(-1);
  if (opt_className) { tr.className = opt_className; }
  return tr;
}

GSvideoSearchControl.prototype.createTableCell = function(tr, opt_className) {
  var td = tr.insertCell(-1);
  if (opt_className) { td.className = opt_className; }
  return td;
}

GSvideoSearchControl.prototype.createTextInput = function(opt_className, opt_name) {
  var el = document.createElement("input");
  el.type = "text";
  if (opt_className) { el.className = opt_className; }
  if (opt_name) { el.name = opt_name; }
  return el;
}

GSvideoSearchControl.prototype.createLink = function(href, text, opt_target, opt_className) {
  var el = document.createElement("a");
  el.href = href;
  el.appendChild(document.createTextNode(text));
  if (opt_className) {
    el.className = opt_className;
  }
  if (opt_target) {
    el.target = opt_target;
  }
  return el;
}

GSvideoSearchControl.prototype.createDivLink = function(href, text, opt_target, opt_className) {
  var div = this.createDiv(null, opt_className);
  var el = document.createElement("a");
  el.href = href;
  el.appendChild(document.createTextNode(text));
  if (opt_className) {
    el.className = opt_className;
  }
  if (opt_target) {
    el.target = opt_target;
  }
  div.appendChild(el);
  return div;
}

GSvideoSearchControl.prototype.createButton = function(value, opt_className) {
  var el = document.createElement("input");
  el.type = "button";
  el.value = value;
  if (opt_className) { el.className = opt_className; }
  return el;
}

GSvideoSearchControl.prototype.createImage = function(src, opt_w, opt_h, opt_className) {
  var el = document.createElement("img");
  el.src = src;
  if (opt_w) { el.width = opt_w; }
  if (opt_h) { el.height = opt_h; }
  if (opt_className) { el.className = opt_className; }
  return el;
}


GSvideoSearchControl.prototype.getNodeWidth = function(node) {
  return node.offsetWidth;
}

GSvideoSearchControl.prototype.br_AgentContains_ = function(str) {
  if (str in this.br_AgentContains_cache_) {
    return this.br_AgentContains_cache_[str];
  }

  return this.br_AgentContains_cache_[str] =
    (navigator.userAgent.toLowerCase().indexOf(str) != -1);
}

GSvideoSearchControl.prototype.br_IsIE = function() {
  return this.br_AgentContains_('msie');
}

GSvideoSearchControl.prototype.br_IsKonqueror = function() {
  return this.br_AgentContains_('konqueror');
}

GSvideoSearchControl.prototype.br_IsOpera = function() {
  return this.br_AgentContains_('opera');
}

GSvideoSearchControl.prototype.br_IsSafari = function() {
  return this.br_AgentContains_('safari') || this.br_IsKonqueror();
}

GSvideoSearchControl.prototype.br_IsNav = function() {
  return !this.br_IsIE() &&
         !this.br_IsSafari() &&
         this.br_AgentContains_('mozilla');
}

GSvideoSearchControl.prototype.br_IsWin = function() {
  return this.br_AgentContains_('win');
}

/*
Copyright (c) 2005 JSON.org

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The Software shall be used for Good, not Evil.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

/*
    The global object GSvideoSearchControl_JSON contains two methods.

    GSvideoSearchControl_JSON.stringify(value) takes a JavaScript value and produces a JSON text.
    The value must not be cyclical.

    GSvideoSearchControl_JSON.parse(text) takes a JSON text and produces a JavaScript value. It will
    return false if there is an error.
*/
var GSvideoSearchControl_JSON = function () {
    var m = {
            '\b': '\\b',
            '\t': '\\t',
            '\n': '\\n',
            '\f': '\\f',
            '\r': '\\r',
            '"' : '\\"',
            '\\': '\\\\'
        },
        s = {
            'boolean': function (x) {
                return String(x);
            },
            number: function (x) {
                return isFinite(x) ? String(x) : 'null';
            },
            string: function (x) {
                if (/[\"\\\x00-\x1f]/.test(x)) {
                    x = x.replace(/([\x00-\x1f\\\"])/g, function(a, b) {
                        var c = m[b];
                        if (c) {
                            return c;
                        }
                        c = b.charCodeAt();
                        return '\\u00' +
                            Math.floor(c / 16).toString(16) +
                            (c % 16).toString(16);
                    });
                }
                return '"' + x + '"';
            },
            object: function (x) {
                if (x) {
                    var a = [], b, f, i, l, v;
                    if (x instanceof Array) {
                        a[0] = '[';
                        l = x.length;
                        for (i = 0; i < l; i += 1) {
                            v = x[i];
                            f = s[typeof v];
                            if (f) {
                                v = f(v);
                                if (typeof v == 'string') {
                                    if (b) {
                                        a[a.length] = ',';
                                    }
                                    a[a.length] = v;
                                    b = true;
                                }
                            }
                        }
                        a[a.length] = ']';
                    } else if (x instanceof Object) {
                        a[0] = '{';
                        for (i in x) {
                            v = x[i];
                            f = s[typeof v];
                            if (f) {
                                v = f(v);
                                if (typeof v == 'string') {
                                    if (b) {
                                        a[a.length] = ',';
                                    }
                                    a.push(s.string(i), ':', v);
                                    b = true;
                                }
                            }
                        }
                        a[a.length] = '}';
                    } else {
                        return;
                    }
                    return a.join('');
                }
                return 'null';
            }
        };
    return {
        copyright: '(c)2005 JSON.org',
        license: 'http://www.crockford.com/JSON/license.html',
/*
    Stringify a JavaScript value, producing a JSON text.
*/
        stringify: function (v) {
            var f = s[typeof v];
            if (f) {
                v = f(v);
                if (typeof v == 'string') {
                    return v;
                }
            }
            return null;
        },
/*
    Parse a JSON text, producing a JavaScript value.
    It returns false if there is a syntax error.
*/
        parse: function (text) {
            try {
                return !(/[^,:{}\[\]0-9.\-+Eaeflnr-u \n\r\t]/.test(
                        text.replace(/"(\\.|[^"\\])*"/g, ''))) &&
                    eval('(' + text + ')');
            } catch (e) {
                return false;
            }
        }
    };
}();
