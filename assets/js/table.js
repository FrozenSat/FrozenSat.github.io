// Table Load Message
$("#main_diff").prepend("<div id='tableLoading'>Loading...</div>");

// メニュー開閉
function menu(tName) {
  var tMenu = document.getElementById(tName).style;
  if (tMenu.display == "none") {
    tMenu.display = "block";
  } else {
    tMenu.display = "none";
  }
}

$(document).ready(function () {
  $.getJSON($("meta[name=bmstable]").attr("content"), function (header) {
    $("#update").text("Last Update : " + header.last_update);
    makeChangelog();
    $.getJSON(header.data_url, function (info) {
      // headerのsort有無で分岐
      if (header.level_order) {
        makeBMSTable(info, header.symbol, header.level_order);
      } else {
        makeBMSTable(info, header.symbol);
      }
      $("#tableLoading").remove();
    });
  });
});

// Changelog
function makeChangelog() {
  var $changelog = $("#changelog");
  var $show_log = $("#show_log");
  $changelog.load("change.txt");
  $show_log.click(function () {
    if (
      $changelog.css("display") == "none" &&
      $show_log.html() == "VIEW CHANGELOG"
    ) {
      $changelog.show();
      $show_log.html("HIDE CHANGELOG");
    } else {
      $changelog.hide();
      $show_log.html("VIEW CHANGELOG");
    }
  });
}

// ソートのための引数追加
function makeBMSTable(info, mark, order) {
  // orderが未指定の場合はnull
  if (typeof order === "undefined") order = null;

  var x,
    count = 0,
    obj = $("#table_int"),
    shortcut = $("#shortcut_table");

  if (order) {
    var orderAry = [];
    order.forEach((i) => {
      orderAry.push(i.toString());
    });

    info.forEach((i) => {
      i._index = orderAry.indexOf(i.level);
    });

    info.sort((a, b) => {
      if (a._index < b._index) {
        return -1;
      } else if (a._index > b._index) {
        return 1;
      } else if (a.title.toLowerCase() < b.title.toLowerCase()) {
        return -1;
      } else if (a.title.toLowerCase() > b.title.toLowerCase()) {
        return 1;
      } else {
        return 0;
      }
    });
    info.forEach((i) => {
      delete i._index;
    });
  } else {
    info.sort((a, b) => {
      var aLv = a.level.toString();
      var bLv = b.level.toString();
      if (isNaN(a.level) == false && isNaN(b.level) == false) {
        return a.level - b.level;
      } else if (aLv < bLv) {
        return -1;
      } else if (aLv > bLv) {
        return 1;
      } else if (a.title.toLowerCase() < b.title.toLowerCase()) {
        return -1;
      } else if (a.title.toLowerCase() > b.title.toLowerCase()) {
        return 1;
      } else {
        return 0;
      }
    });
  }

  // 表のクリア
  obj.html("");
  $(
    "<thead>" +
      "<tr>" +
      "<th style='width: 6%'>Lv</th>" +
      "<th style='width: 1%'>Movie</th>" +
      "<th style='width: 1%'>Score</th>" +
      "<th style='width: 20%'>Title</th>" +
      "<th style='width: 20%'>Artist</th>" +
      "<th style='width: 5%'>DL</th>" +
      "<th style='width: 25%'>Comment</th>" +
      "</tr>" +
      "</thead>" +
      "<tbody></tbody>"
  ).appendTo(obj);
  var obj_sep = null;
  shortcut.html("");
  $("<tbody></tbody>").appendTo(shortcut);
  var shortcut_str = $("<tr></tr>");
  info.forEach((i) => {
    // 難度ごとの区切り
    if (x != i.level) {
      // 前の区切りに譜面数、平均密度を追加
      if (obj_sep != null) {
        if (count != 1) {
          obj_sep.html(
            "<td colspan='7'>" +
              "<b>" +
              mark +
              x +
              " (" +
              count +
              " Charts)</b>" +
              "</td>"
          );
        } else {
          obj_sep.html(
            "<td colspan='7'>" +
              "<b>" +
              mark +
              x +
              " (" +
              count +
              " Chart)</b>" +
              "</td>"
          );
        }
        $(
          "<td>" + "<a href='#" + mark + x + "'>" + mark + x + "</a>" + "</td>"
        ).appendTo(shortcut_str);
      }
      obj_sep = $("<tr class='tr_separate' id='" + mark + i.level + "'></tr>");
      obj_sep.appendTo(obj);
      shortcut_str.appendTo(shortcut);
      count = 0;
      x = i.level;
    }
    // 本文
    var str = $("<tr class='tr_normal'></tr>");
    if (i.state == 1) str = $("<tr class='state1'></tr>");
    if (i.state == 2) str = $("<tr class='state2'></tr>");
    if (i.state == 3) str = $("<tr class='state3'></tr>");
    if (i.state == 4) str = $("<tr class='state4'></tr>");
    if (i.state == 5) str = $("<tr class='state5'></tr>");
    if (i.state == 6) str = $("<tr class='state6'></tr>");

    // レベル表記
    $("<td>" + mark + x + "</td>").appendTo(str);
    // 動画
    if (i.video2) {
      // YouTube
      $(
        "<td>" +
          "<a href='https://www.youtube.com/watch?v=" +
          i.video2 +
          "' class='fas fa-lg fa-play' target='_blank'></a></td>"
      ).appendTo(str);
    } else {
      $("<td></td>").appendTo(str);
    }
    // 譜面画像
    $(
      "<td>" +
        "<a href='http://www.ribbit.xyz/bms/score/view?p=1&md5=" +
        i.md5 +
        "' class='fas fa-lg fa-music' target='_blank'></a></td>"
    ).appendTo(str);

    // タイトル
    $(
      "<td>" +
        "<a href='http://www.dream-pro.info/~lavalse/LR2IR/search.cgi?mode=ranking&bmsmd5=" +
        i.md5 +
        "' target='_blank'>" +
        i.title +
        "</a></td>"
    ).appendTo(str);
    // アーティスト
    var astr = "";
    if (i.url) {
      if (i.artist) {
        astr = "<a href='" + i.url + "'>" + i.artist + "</a>";
      } else {
        astr = "<a href='" + i.url + "'>" + i.url + "</a>";
      }
    } else {
      if (i.artist) {
        astr = i.artist;
      }
    }
    if (i.url_pack) {
      if (i.name_pack) {
        astr += "<br>(<a href='" + i.url_pack + "'>" + i.name_pack + "</a>)";
      } else {
        astr += "<br>(<a href='" + i.url_pack + "'>" + i.url_pack + "</a>)";
      }
    } else {
      if (i.name_pack) {
        astr += "<br>(" + i.name_pack + ")";
      }
    }
    $("<td>" + astr + "</td>").appendTo(str);
    // 差分
    if (i.url_diff) {
      if (i.name_diff) {
        $(
          "<td>" + "<a href='" + i.url_diff + "'>" + i.name_diff + "</a></td>"
        ).appendTo(str);
      } else {
        $(
          "<td>" +
            "<a href='" +
            i.url_diff +
            "' class='fas fa-lg fa-arrow-down'></a></td>"
        ).appendTo(str);
      }
    } else {
      if (i.name_diff) {
        $("<td>" + i.name_diff + "</td>").appendTo(str);
      } else {
        $("<td>" + "同梱" + "</td>").appendTo(str);
      }
    }
    // コメント
    $("<td>" + i.comment + "</td>").appendTo(str);
    str.appendTo(obj);
    count++;
  });

  // 最後の区切り処理
  // マークが抜け落ちてたので追加
  if (obj_sep != null) {
    if (count != 1) {
      obj_sep.html(
        "<td colspan='7'>" +
          "<b>" +
          mark +
          x +
          " (" +
          count +
          " Charts)</b>" +
          "</td>"
      );
    } else {
      obj_sep.html(
        "<td colspan='7'>" +
          "<b>" +
          mark +
          x +
          " (" +
          count +
          " Chart)</b>" +
          "</td>"
      );
    }
    $(
      "<td>" + "<a href='#" + mark + x + "'>" + mark + x + "</a>" + "</td>"
    ).appendTo(shortcut_str);
  }
}
