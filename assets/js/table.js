// Table Load Message
$(".tableflame").prepend("<div id='tableLoading'>Loading...</div>");

// メニュー開閉
function menu(tName) {
    var tMenu = document.getElementById(tName).style;
    if (tMenu.display == "none") {
        tMenu.display = "block";
    } else {
        tMenu.display = "none";
    }
}


$(document).ready(function() {
    $.getJSON($("meta[name=bmstable]").attr("content"), function(header) {
        $("#update").text("Last Update : " + header.last_update);
        makeChangelog();
        $.getJSON(header.data_url, function(information) {
            // headerのsort有無で分岐
            if (header.level_order) {
                makeBMSTable(information, header.symbol, header.level_order);
            } else {
                makeBMSTable(information, header.symbol);
            }
            $("#tableLoading").remove();
        });
    });
});

// Changelog
function makeChangelog() {
    $("#changelog").load("change.txt");
    $("#show_log").click(function() {
        if ($("#changelog").css("display") == "none" && $(this).html() == "VIEW CHANGELOG") {
            $("#changelog").show();
            $(this).html("HIDE CHANGELOG");
        } else {
            $("#changelog").hide();
            $(this).html("VIEW CHANGELOG");
        }
    });
}


// ソートのための引数追加
function makeBMSTable(info, mark, order) {
    // orderが未指定の場合はnull
    if (typeof order === "undefined") {
        order = null;
    }

    var x = "";
    var ev = "";
    var count = 0;
    var obj = $("#table_int");

    // ソート
    if (order != "" && order != null) {
        // herder.jsonにsortが存在する場合は指定順->タイトル順にソート

        var orderAry = [];
        for (var l = 0; l < order.length; l++) {
            orderAry.push(order[l].toString());
        }

        for (var j = 0; j < info.length; j++) {
            var index = orderAry.indexOf(info[j]["level"]);
            info[j]["_index"] = index;
        }

        info.sort(function(a, b) {
            if (a["_index"] < b["_index"]) {
                return -1;
            } else if (a["_index"] > b["_index"]) {
                return 1;
            } else if (a["title"].toLowerCase() < b["title"].toLowerCase()) {
                return -1;
            } else if (a["title"].toLowerCase() > b["title"].toLowerCase()) {
                return 1;
            } else {
                return 0;
            }
        });
        for (var k = 0; k < info.length; k++) {
            delete info[k]["_index"];
        }
    } else {
        // そうでない場合はレベル順->タイトル順にソート
        info.sort(
            function(a, b) {
                var aLv = a["level"].toString();
                var bLv = b["level"].toString();
                if (isNaN(a["level"]) == false && isNaN(b["level"]) == false) {
                    return a["level"] - b["level"];
                } else if (aLv < bLv) {
                    return -1;
                } else if (aLv > bLv) {
                    return 1;
                } else if (a["title"].toLowerCase() < b["title"].toLowerCase()) {
                    return -1;
                } else if (a["title"].toLowerCase() > b["title"].toLowerCase()) {
                    return 1;
                } else {
                    return 0;
                }
            }
        );
    }

    // 表のクリア
    obj.html("");
    $("<thead><tr><th width='6%'>Lv</th><th width='1%'>Movie</th><th width='1%'>Score</th><th width='20%'>Title</th><th width='20%'>Artist</th><th width='5%'>DL</th><th width='25%'>Comment</th></tr></thead><tbody></tbody>").appendTo(obj);
    var obj_sep = null;
    var shortcut = $("<table id='shortcut_table'></table>");
    for (var i = 0; i < info.length; i++) {
        // 難度ごとの区切り
        if (x != info[i].level) {
            // 前の区切りに譜面数、平均密度を追加
            if (obj_sep != null) {
                if (count != 1) {
                    obj_sep.html("<td colspan='7'>" + "<b>" + mark + x + " (" + count + " Charts)</b></td>");
                } else {
                    obj_sep.html("<td colspan='7'>" + "<b>" + mark + x + " (" + count + " Chart)</b></td>");
                }
                $("<td><a href='#" + mark + x + "'>" + mark + x + "</a></td>").appendTo(shortcut);
            }
            obj_sep = $("<tr class='tr_separate' id='" + mark + info[i].level + "'></tr>");
            obj_sep.appendTo(obj);
            shortcut.appendTo("#shortcut_diff");
            count = 0;
            x = info[i].level;
        }
        // 本文
        var str = $("<tr class='tr_normal'></tr>");

        if (info[i].state == 1) {
            str = $("<tr class='state1'></tr>");
        }
        if (info[i].state == 2) {
            str = $("<tr class='state2'></tr>");
        }
        if (info[i].state == 3) {
            str = $("<tr class='state3'></tr>");
        }
        if (info[i].state == 4) {
            str = $("<tr class='state4'></tr>");
        }
        if (info[i].state == 5) {
            str = $("<tr class='state5'></tr>");
        }
        if (info[i].state == 6) {
            str = $("<tr class='state6'></tr>");

        }

        // レベル表記
        $("<td width='6%'>" + mark + x + "</td>").appendTo(str);
        // 動画
        if (info[i].video1 != "" && info[i].video1 != null) {
            // ニコニコ
            $("<td width='1%'><a href='http://www.nicovideo.jp/watch/sm" + info[i].video1 + "' class='fas fa-lg fa-play' target='_blank'></a></td>").appendTo(str);
        } else if (info[i].video2 != "" && info[i].video2 != null) {
            // YouTube
            $("<td width='1%'><a href='https://www.youtube.com/watch?v=" + info[i].video2 + "' class='fas fa-lg fa-play' target='_blank'></a></td>").appendTo(str);
        } else if (info[i].video3 != "" && info[i].video3 != null) {
            // vimeo
            $("<td width='1%'><a href='http://vimeo.com/" + info[i].video3 + "' class='fas fa-lg fa-play' target='_blank'></a></td>").appendTo(str);
        } else {
            $("<td width='1%'></td>").appendTo(str);
        }
        // 譜面画像
        $("<td width='1%'><a href='http://www.ribbit.xyz/bms/score/view?p=1&md5=" + info[i].md5 + "' class='fas fa-lg fa-music' target='_blank'></a></td>").appendTo(str);

        // タイトル
        $("<td width='20%'>" + "<a href='http://www.dream-pro.info/~lavalse/LR2IR/search.cgi?mode=ranking&bmsmd5=" + info[i].md5 + "' target='_blank'>" + info[i].title + "</a></td>").appendTo(str);
        // アーティスト
        var astr = "";
        if (info[i].url != "" && info[i].url != null) {
            if (info[i].artist != "" && info[i].artist != null) {
                astr = "<a href='" + info[i].url + "'>" + info[i].artist + "</a>";
            } else {
                astr = "<a href='" + info[i].url + "'>" + info[i].url + "</a>";
            }
        } else {
            if (info[i].artist != "" && info[i].artist != null) {
                astr = info[i].artist;
            }
        }
        if (info[i].url_pack != "" && info[i].url_pack != null) {
            if (info[i].name_pack != "" && info[i].name_pack != null) {
                astr += "<br>(<a href='" + info[i].url_pack + "'>" + info[i].name_pack + "</a>)";
            } else {
                astr += "<br>(<a href='" + info[i].url_pack + "'>" + info[i].url_pack + "</a>)";
            }
        } else {
            if (info[i].name_pack != "" && info[i].name_pack != null) {
                astr += "<br>(" + info[i].name_pack + ")";
            }
        }
        $("<td width='20%'>" + astr + "</td>").appendTo(str);
        // 差分
        if (info[i].url_diff != "" && info[i].url_diff != "") {
            if (info[i].name_diff != "" && info[i].name_diff != null) {
                $("<td width='5%'><a href='" + info[i].url_diff + "'>" + info[i].name_diff + "</a></td>").appendTo(str);
            } else {
                $("<td width='5%'><a href='" + info[i].url_diff + "' class='fas fa-lg fa-arrow-down'></a></td>").appendTo(str);
            }
        } else {
            if (info[i].name_diff != "" && info[i].name_diff != null) {
                $("<td width='5%'>" + info[i].name_diff + "</td>").appendTo(str);
            } else {
                $("<td width='5%'>同梱</td>").appendTo(str);
            }
        }
        // コメント
        $("<td width='25%'>" + info[i].comment + "</div></td>").appendTo(str);
        str.appendTo(obj);
        count++;
    }

    // 最後の区切り処理
    // マークが抜け落ちてたので追加
    if (obj_sep != null) {
        if (count != 1) {
            obj_sep.html("<td colspan='7'>" + "<b>" + mark + x + " (" + count + " Charts)</b></td>");
        } else {
            obj_sep.html("<td colspan='7'>" + "<b>" + mark + x + " (" + count + " Chart)</b></td>");
        }
        $("<td><a href='#" + mark + x + "'>" + mark + x + "</a></td>").appendTo(shortcut);
    }
}