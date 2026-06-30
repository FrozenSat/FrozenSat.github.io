"use strict";

// Table Load Message
const mainDiff = document.getElementById("main_diff");
if (mainDiff) {
  mainDiff.insertAdjacentHTML(
    "afterbegin",
    "<div id='tableLoading'>Loading...</div>",
  );
}

document.addEventListener("DOMContentLoaded", async () => {
  const metaTag = document.querySelector("meta[name='bmstable']");
  if (!metaTag) return;

  try {
    const headerRes = await fetch(metaTag.getAttribute("content"));
    const header = await headerRes.json();

    const updateElement = document.getElementById("update");
    if (updateElement) {
      updateElement.textContent = `Last Update : ${header.last_update}`;
    }

    makeChangelog();

    const dataRes = await fetch(header.data_url);
    const info = await dataRes.json();

    // Branch based on whether sort order is present in the header
    if (header.level_order) {
      makeBMSTable(info, header.symbol, header.level_order);
    } else {
      makeBMSTable(info, header.symbol);
    }

    const tableLoading = document.getElementById("tableLoading");
    if (tableLoading) {
      tableLoading.remove();
    }
  } catch (error) {
    console.error("Failed to load BMS table data:", error);
  }
});

// Changelog
async function makeChangelog() {
  const changelog = document.getElementById("changelog");
  const showLog = document.getElementById("show_log");

  if (!changelog || !showLog) return;

  let isLogView = false;

  try {
    const res = await fetch("change.txt");
    const text = await res.text();
    changelog.innerHTML = text;
  } catch (error) {
    console.error("Failed to load changelog:", error);
  }

  showLog.addEventListener("click", () => {
    isLogView = !isLogView;
    if (isLogView === true) {
      changelog.style.display = "block";
      showLog.textContent = "HIDE CHANGELOG";
    } else {
      changelog.style.display = "none";
      showLog.textContent = "VIEW CHANGELOG";
    }
  });
}

// Added argument for sorting
function makeBMSTable(info, mark, order = null) {
  const obj = document.getElementById("table_int");
  const shortcut = document.getElementById("shortcut_table");

  if (!obj || !shortcut) return;

  if (order) {
    const orderAry = order.map((i) => i.toString());

    info.forEach((i) => {
      i._index = orderAry.indexOf(i.level.toString());
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
      const aLv = a.level.toString();
      const bLv = b.level.toString();

      if (!isNaN(a.level) && !isNaN(b.level)) {
        return Number(a.level) - Number(b.level);
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

  // Clear table contents
  obj.innerHTML = "";
  shortcut.innerHTML = "";

  // Set up headers
  const theadHTML = `
    <thead>
      <tr>
        <th style='width: 6%'>Lv</th>
        <th style='width: 1%'>Movie</th>
        <th style='width: 1%'>Score</th>
        <th style='width: 20%'>Title</th>
        <th style='width: 20%'>Artist</th>
        <th style='width: 5%'>DL</th>
        <th style='width: 25%'>Comment</th>
      </tr>
    </thead>
    <tbody></tbody>
  `;
  obj.insertAdjacentHTML("beforeend", theadHTML);
  const tbody = obj.querySelector("tbody");

  const shortcutTbody = document.createElement("tbody");
  shortcut.appendChild(shortcutTbody);
  const shortcutRow = document.createElement("tr");
  shortcutTbody.appendChild(shortcutRow);

  let currentLevel = null;
  let count = 0;
  let sepRowPlaceholder = null;

  info.forEach((i) => {
    // Difficulty separator
    if (currentLevel !== i.level) {
      // Add count to the previous separator
      if (sepRowPlaceholder !== null) {
        const chartText = count !== 1 ? "Charts" : "Chart";
        sepRowPlaceholder.innerHTML = `<td colspan='7'><b>${mark}${currentLevel} (${count} ${chartText})</b></td>`;

        shortcutRow.insertAdjacentHTML(
          "beforeend",
          `<td><a href='#${mark}${currentLevel}'>${mark}${currentLevel}</a></td>`,
        );
      }

      // Create new separator placeholder
      sepRowPlaceholder = document.createElement("tr");
      sepRowPlaceholder.className = "tr_separate";
      sepRowPlaceholder.id = `${mark}${i.level}`;
      tbody.appendChild(sepRowPlaceholder);

      count = 0;
      currentLevel = i.level;
    }

    // Build the row
    const tr = document.createElement("tr");

    // Assign classes
    if (i.state >= 1 && i.state <= 6) {
      tr.className = `state${i.state}`;
    } else {
      tr.className = "tr_normal";
    }

    // Level
    let rowHTML = `<td>${mark}${currentLevel}</td>`;

    // Movie (Video)
    if (i.video2) {
      rowHTML += `<td><a href='https://www.youtube.com/watch?v=${i.video2}' class='fas fa-lg fa-play' target='_blank'></a></td>`;
    } else {
      rowHTML += `<td></td>`;
    }

    // Score Image
    rowHTML += `<td><a href='https://bms-score-viewer.pages.dev/view?md5=${i.md5}' class='fas fa-lg fa-music' target='_blank'></a></td>`;

    // Title
    rowHTML += `<td><a href='https://ir.stellabms.xyz/charts/${i.md5}' target='_blank'>${i.title}</a></td>`;

    // Artist
    let astr = "";
    if (i.url) {
      astr = `<a href='${i.url}'>${i.artist ? i.artist : i.url}</a>`;
    } else if (i.artist) {
      astr = i.artist;
    }

    // Pack
    if (i.url_pack) {
      astr += `<br>(<a href='${i.url_pack}'>${i.name_pack ? i.name_pack : i.url_pack}</a>)`;
    } else if (i.name_pack) {
      astr += `<br>(${i.name_pack})`;
    }
    rowHTML += `<td>${astr}</td>`;

    // Diff
    if (i.url_diff) {
      if (i.name_diff) {
        rowHTML += `<td><a href='${i.url_diff}'>${i.name_diff}</a></td>`;
      } else {
        rowHTML += `<td><a href='${i.url_diff}' class='fas fa-lg fa-arrow-down'></a></td>`;
      }
    } else {
      if (i.name_diff) {
        rowHTML += `<td>${i.name_diff}</td>`;
      } else {
        rowHTML += `<td>同梱</td>`;
      }
    }

    // Comment
    const safeComment = i.comment ? i.comment : "";
    rowHTML += `<td>${safeComment}</td>`;

    tr.innerHTML = rowHTML;
    tbody.appendChild(tr);

    count++;
  });

  // Final group processing (the last level)
  if (sepRowPlaceholder !== null) {
    const chartText = count !== 1 ? "Charts" : "Chart";
    sepRowPlaceholder.innerHTML = `<td colspan='7'><b>${mark}${currentLevel} (${count} ${chartText})</b></td>`;
    shortcutRow.insertAdjacentHTML(
      "beforeend",
      `<td><a href='#${mark}${currentLevel}'>${mark}${currentLevel}</a></td>`,
    );
  }
}
