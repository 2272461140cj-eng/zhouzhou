const TEACHERS = [
  { id: "shen", name: "沈老师", image: "./teacher-1.png", date: "10/11", time: "10:00-12:00", campus: "小码王苏州苏悦广场校区" },
  { id: "han", name: "韩潇老师", image: "./teacher-2.png", date: "10/17", time: "10:00-12:00", campus: "小码王北京五道口校区" },
  { id: "zhang", name: "张老师", image: "./teacher-3.png", date: "10/17", time: "9:30-11:30", campus: "小码王深圳福田百花校区" },
  { id: "zhou", name: "周老师", image: "./teacher-4.png", date: "10/11", time: "13:30-15:30", campus: "小码王杭州文鼎国际校区" },
  { id: "shen2", name: "申老师", image: "./teacher-5.png", date: "10/18", time: "18:30-20:30", campus: "小码王宁波宏泰广场校区" },
  { id: "chen", name: "陈老师", image: "./teacher-6.png", date: "10/24", time: "18:30-20:30", campus: "小码王上海浦东金桥校区" },
  { id: "xia", name: "夏老师", image: "./teacher-7.png", date: "10/17", time: "15:30-17:30", campus: "小码王上海大宁国际校区" },
  { id: "guo", name: "郭老师", image: "./teacher-8.png", date: "10/17", time: "13:30-15:30", campus: "小码王南京新街口校区" },
  { id: "qi", name: "戚老师", image: "./teacher-9.png", date: "10/17", time: "13:30-15:30", campus: "小码王南京新街口校区" }
];

const CITY_CAMPUSES = [
  { city: "北京", campuses: ["北京金源时代校区", "北京双井校区", "北京望京悠乐汇校区", "北京五道口校区", "北京亚运村校区"] },
  { city: "成都", campuses: ["成都鹭洲里校区", "成都牛市口校区", "成都新希望校区"] },
  { city: "广州", campuses: ["广州北京路校区", "广州番禺骏和广场校区", "广州海珠昌岗校区", "广州天河北校区", "广州万胜围校区", "广州珠江新城校区"] },
  { city: "杭州", campuses: ["杭州滨江乐游城校区", "杭州凤起东路校区", "杭州黄龙体育中心校区", "杭州近江昆仑校区", "杭州临平西子国际校区", "杭州深蓝广场校区", "杭州未来科技城校区", "杭州文鼎国际校区", "杭州下沙印象城校区", "杭州萧山金城路校区", "杭州中大银泰校区"] },
  { city: "南京", campuses: ["南京清江广场校区", "南京仙林九霄校区", "南京新街口校区"] },
  { city: "宁波", campuses: ["宁波广博国贸校区", "宁波宏泰广场校区", "宁波青林湾校区", "宁波芝士公园校区"] },
  { city: "上海", campuses: ["上海南方商城校区", "上海世纪公园校区", "上海西藏南路校区", "上海五角场校区", "上海天山缤谷广场校区", "上海虹口足球场校区", "上海徐汇光启城校区", "上海浦东金桥校区", "上海普陀长寿路189校区", "上海莘庄维璟印象城校区", "上海大宁国际校区"] },
  { city: "深圳", campuses: ["深圳宝安丽晶国际校区", "深圳东海城市广场校区", "深圳福田百花校区", "深圳福田CBD校区", "深圳龙岗中心城校区", "深圳龙华宝山时代校区", "深圳罗湖喜荟城校区", "深圳南山海岸城校区", "深圳南山万象天地校区", "深圳蛇口水湾校区"] },
  { city: "苏州", campuses: ["苏州苏悦广场校区", "苏州新光天地校区"] },
  { city: "无锡", campuses: ["无锡中山路校区"] },
  { city: "武汉", campuses: ["武汉南湖校区", "武汉徐东新世界校区"] },
  { city: "西安", campuses: ["西安芙蓉新天地校区"] }
].map((item) => ({
  city: item.city,
  campuses: item.campuses.map((campus) => ({ label: campus, value: `小码王${campus}` }))
}));

const form = document.querySelector("#poster-form");
const teacherInput = document.querySelector("#teacher");
const monthInput = document.querySelector("#month");
const dayInput = document.querySelector("#day");
const startTimeInput = document.querySelector("#start-time");
const endTimeInput = document.querySelector("#end-time");
const cityInput = document.querySelector("#city");
const campusInput = document.querySelector("#campus");
const filenameInput = document.querySelector("#filename");
const canvas = document.querySelector("#poster-canvas");
const ctx = canvas.getContext("2d", { alpha: false });
const loading = document.querySelector("#canvas-loading");
const previewName = document.querySelector("#preview-name");
const recordBody = document.querySelector("#record-body");
const recordCount = document.querySelector("#record-count");
const emptyState = document.querySelector("#empty-state");
const downloadAllButton = document.querySelector("#download-all");
const toast = document.querySelector("#toast");
const fileInput = document.querySelector("#file-input");
const dropZone = document.querySelector("#drop-zone");

const images = new Map();
let xlsxLoadPromise;
let records = [];
let editIndex = -1;
let renderVersion = 0;
let toastTimer;
const DEFAULT_YEAR = "2026";

for (let month = 1; month <= 12; month += 1) {
  const option = document.createElement("option");
  option.value = String(month).padStart(2, "0");
  option.textContent = `${month}月`;
  monthInput.append(option);
}

function updateDayOptions(month, preferredDay = "") {
  const monthNumber = Number(month || 1);
  const dayCount = new Date(Number(DEFAULT_YEAR), monthNumber, 0).getDate();
  dayInput.innerHTML = "";
  for (let day = 1; day <= dayCount; day += 1) {
    const value = String(day).padStart(2, "0");
    const option = document.createElement("option");
    option.value = value;
    option.textContent = `${day}日`;
    dayInput.append(option);
  }
  if (preferredDay && Number(preferredDay) <= dayCount) dayInput.value = preferredDay;
}

function timeLabel(totalMinutes) {
  const hours = String(Math.floor(totalMinutes / 60)).padStart(2, "0");
  const minutes = String(totalMinutes % 60).padStart(2, "0");
  return `${hours}:${minutes}`;
}

for (let minutes = 8 * 60; minutes <= 23 * 60; minutes += 30) {
  const value = timeLabel(minutes);
  for (const select of [startTimeInput, endTimeInput]) {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value;
    select.append(option);
  }
}

function ensureTimeOption(select, value) {
  if ([...select.options].some((option) => option.value === value)) return;
  const option = document.createElement("option");
  option.value = value;
  option.textContent = value;
  select.append(option);
}

function setTimeRange(value) {
  const match = String(value || "").trim().match(/^(\d{1,2}:\d{2})\s*[-–—~至]\s*(\d{1,2}:\d{2})$/);
  const start = match?.[1]?.padStart(5, "0") || "10:00";
  const end = match?.[2]?.padStart(5, "0") || "12:00";
  ensureTimeOption(startTimeInput, start);
  ensureTimeOption(endTimeInput, end);
  startTimeInput.value = start;
  endTimeInput.value = end;
}

for (const teacher of TEACHERS) {
  const option = document.createElement("option");
  option.value = teacher.id;
  option.textContent = teacher.name;
  teacherInput.append(option);
}

for (const item of CITY_CAMPUSES) {
  const option = document.createElement("option");
  option.value = item.city;
  option.textContent = item.city;
  cityInput.append(option);
}

function setCampusOptions(city, preferredCampus = "") {
  const item = CITY_CAMPUSES.find((entry) => entry.city === city);
  campusInput.innerHTML = "";
  for (const campus of item?.campuses || []) {
    const option = document.createElement("option");
    option.value = campus.value;
    option.textContent = campus.label;
    campusInput.append(option);
  }
  if (preferredCampus && [...campusInput.options].some((option) => option.value === preferredCampus)) {
    campusInput.value = preferredCampus;
  }
}

function setCampusFromValue(value) {
  const campusValue = String(value || "").trim();
  for (const item of CITY_CAMPUSES) {
    if (item.campuses.some((campus) => campus.value === campusValue)) {
      cityInput.value = item.city;
      setCampusOptions(item.city, campusValue);
      return;
    }
  }

  let customCity = [...cityInput.options].find((option) => option.value === "其他");
  if (!customCity) {
    customCity = document.createElement("option");
    customCity.value = "其他";
    customCity.textContent = "其他（表格导入）";
    cityInput.append(customCity);
  }
  cityInput.value = "其他";
  campusInput.innerHTML = "";
  const customCampus = document.createElement("option");
  customCampus.value = campusValue;
  customCampus.textContent = campusValue || "未填写校区";
  campusInput.append(customCampus);
}

function selectedTeacher() {
  return TEACHERS.find((item) => item.id === teacherInput.value) || TEACHERS[0];
}

function dateInputValue(value) {
  const text = String(value || "").trim();
  let match = text.match(/^(\d{4})[-\/.年](\d{1,2})[-\/.月](\d{1,2})(?:日)?$/);
  if (match) return `${match[1]}-${match[2].padStart(2, "0")}-${match[3].padStart(2, "0")}`;
  match = text.match(/^(\d{1,2})[\/.-](\d{1,2})$/);
  if (match) return `${DEFAULT_YEAR}-${match[1].padStart(2, "0")}-${match[2].padStart(2, "0")}`;
  match = text.match(/^(\d{1,2})月(\d{1,2})日?$/);
  if (match) return `${DEFAULT_YEAR}-${match[1].padStart(2, "0")}-${match[2].padStart(2, "0")}`;
  return "";
}

function posterDate(value) {
  const text = String(value || "").trim();
  const match = text.match(/^\d{4}-(\d{2})-(\d{2})$/);
  return match ? `${match[1]}/${match[2]}` : text;
}

function setDateFromValue(value) {
  const normalized = dateInputValue(value);
  const match = normalized.match(/^\d{4}-(\d{2})-(\d{2})$/);
  const month = match?.[1] || "10";
  const day = match?.[2] || "11";
  monthInput.value = month;
  updateDayOptions(month, day);
}

function normalizePosterDate(value) {
  const inputValue = dateInputValue(value);
  return inputValue ? posterDate(inputValue) : String(value || "").trim();
}

function currentRecord() {
  const teacher = selectedTeacher();
  return {
    teacherId: teacher.id,
    teacher: teacher.name,
    date: `${monthInput.value}/${dayInput.value}`,
    time: `${startTimeInput.value}-${endTimeInput.value}`,
    campus: campusInput.value.trim(),
    filename: filenameInput.value.trim()
  };
}

function safeFilename(value) {
  return String(value || "海报")
    .replace(/[\\/:*?"<>|]/g, "-")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 80) || "海报";
}

function recordFilename(record) {
  return safeFilename(record.filename || `${record.teacher}-${record.date}-${record.campus}`) + ".png";
}

function showToast(message) {
  clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add("show");
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2600);
}

function loadImage(src) {
  if (images.has(src)) return images.get(src);
  const promise = new Promise((resolve, reject) => {
    const image = new Image();
    image.decoding = "async";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("模板图片载入失败"));
    image.src = src;
  });
  images.set(src, promise);
  return promise;
}

function fitFont(text, maxWidth, startSize, minSize, weight = 800) {
  let size = startSize;
  while (size > minSize) {
    ctx.font = `${weight} ${size}px "Noto Sans SC Local", "PingFang SC", "Microsoft YaHei", sans-serif`;
    if (ctx.measureText(text).width <= maxWidth) break;
    size -= 1;
  }
  return size;
}

function drawCenteredText(text, x, y, maxWidth, size, minSize, color, weight = 800) {
  const actualSize = fitFont(text, maxWidth, size, minSize, weight);
  ctx.font = `${weight} ${actualSize}px "Noto Sans SC Local", "PingFang SC", "Microsoft YaHei", sans-serif`;
  ctx.fillStyle = color;
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText(text, x, y, maxWidth);
}

async function renderPoster(record = currentRecord(), target = canvas) {
  const version = ++renderVersion;
  const teacher = TEACHERS.find((item) => item.id === record.teacherId) || TEACHERS[0];
  const targetCtx = target.getContext("2d", { alpha: false });
  const image = await loadImage(teacher.image);
  if (target === canvas && version !== renderVersion) return;

  targetCtx.clearRect(0, 0, 1242, 2520);
  targetCtx.drawImage(image, 0, 0, 1242, 2520);

  // 日期区域：保持讲座时间标签不变，只清除原日期文字。
  targetCtx.fillStyle = "rgb(247,247,247)";
  targetCtx.fillRect(82, 846, 328, 105);

  // 时间条为模板中的固定蓝色。
  targetCtx.fillStyle = "rgb(22,58,180)";
  targetCtx.fillRect(85, 953, 329, 65);

  // 校区区域使用与原海报接近的浅灰渐变，避免长文字留下旧字边缘。
  const campusBg = targetCtx.createLinearGradient(490, 0, 1220, 0);
  campusBg.addColorStop(0, "rgb(246,246,246)");
  campusBg.addColorStop(1, "rgb(236,236,238)");
  targetCtx.fillStyle = campusBg;
  targetCtx.fillRect(490, 2265, 735, 88);

  const originalCtx = ctx;
  if (target !== canvas) {
    // Text helpers use the visible canvas context; temporarily mirror their operations.
    ctx.save();
  }

  const drawTextOn = (text, x, y, maxWidth, size, minSize, color, weight) => {
    let actualSize = size;
    do {
      targetCtx.font = `${weight} ${actualSize}px "Noto Sans SC Local", "PingFang SC", "Microsoft YaHei", sans-serif`;
      if (targetCtx.measureText(text).width <= maxWidth) break;
      actualSize -= 1;
    } while (actualSize > minSize);
    targetCtx.fillStyle = color;
    targetCtx.textAlign = "left";
    targetCtx.textBaseline = "middle";
    targetCtx.fillText(text, x, y, maxWidth);
  };

  drawTextOn(record.date || teacher.date, 88, 900, 310, 96, 58, "#0b43ba", 900);
  drawTextOn(record.time || teacher.time, 112, 986, 276, 49, 34, "#ffffff", 700);
  drawTextOn(record.campus || teacher.campus, 506, 2307, 686, 57, 36, "#050505", 900);

  if (target !== canvas) ctx.restore();
  if (target === canvas) {
    loading.classList.add("hidden");
    previewName.textContent = teacher.name;
  }
}

function setFormFromTeacher(fillDefaults = true) {
  const teacher = selectedTeacher();
  if (fillDefaults) {
    setDateFromValue(teacher.date);
    setTimeRange(teacher.time);
    setCampusFromValue(teacher.campus);
    filenameInput.value = "";
  }
  editIndex = -1;
  document.querySelector("#add-record").textContent = "加入生成清单";
  renderPoster();
}

function validateRecord(record) {
  if (!record.teacherId || !record.date || !record.time || !record.campus) return "老师、日期、时间和校区均不能为空";
  if (record.date.length > 18) return "日期内容过长，请按海报格式填写";
  if (record.time.length > 24) return "时间内容过长，请按海报格式填写";
  const [startTime, endTime] = record.time.split("-");
  if (startTime && endTime && startTime >= endTime) return "结束时间必须晚于开始时间";
  if (record.campus.length > 30) return "校区名称最多 30 个字符";
  return "";
}

function renderRecords() {
  recordBody.innerHTML = "";
  records.forEach((record, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td><strong>${escapeHtml(record.teacher)}</strong></td>
      <td>${escapeHtml(record.date)}</td>
      <td>${escapeHtml(record.time)}</td>
      <td class="campus-cell">${escapeHtml(record.campus)}</td>
      <td><div class="row-actions"><button class="icon-button edit" type="button" data-index="${index}" aria-label="编辑第 ${index + 1} 条">编辑</button><button class="icon-button danger delete" type="button" data-index="${index}" aria-label="删除第 ${index + 1} 条">删</button></div></td>`;
    recordBody.append(row);
  });
  recordCount.textContent = String(records.length);
  emptyState.classList.toggle("hidden", records.length > 0);
  downloadAllButton.disabled = records.length === 0;
}

function escapeHtml(value) {
  const div = document.createElement("div");
  div.textContent = String(value ?? "");
  return div.innerHTML;
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const record = currentRecord();
  const error = validateRecord(record);
  if (error) return showToast(error);
  if (editIndex < 0 && records.length >= 50) return showToast("一次最多生成 50 张海报");

  if (editIndex >= 0) {
    records[editIndex] = record;
    showToast("清单内容已更新");
  } else {
    records.push(record);
    showToast(`已加入 ${record.teacher}`);
  }
  renderRecords();
  setFormFromTeacher(false);
});

teacherInput.addEventListener("change", () => setFormFromTeacher(true));
monthInput.addEventListener("change", () => {
  updateDayOptions(monthInput.value, dayInput.value);
  renderPoster();
});
dayInput.addEventListener("change", () => renderPoster());
startTimeInput.addEventListener("change", () => {
  if (endTimeInput.value <= startTimeInput.value) {
    const startIndex = [...endTimeInput.options].findIndex((option) => option.value === startTimeInput.value);
    endTimeInput.selectedIndex = Math.min(startIndex + 2, endTimeInput.options.length - 1);
  }
  renderPoster();
});
endTimeInput.addEventListener("change", () => renderPoster());
cityInput.addEventListener("change", () => {
  setCampusOptions(cityInput.value);
  renderPoster();
});
campusInput.addEventListener("change", () => renderPoster());

recordBody.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-index]");
  if (!button) return;
  const index = Number(button.dataset.index);
  if (button.classList.contains("delete")) {
    records.splice(index, 1);
    renderRecords();
    showToast("已从清单移除");
    return;
  }
  const record = records[index];
  editIndex = index;
  teacherInput.value = record.teacherId;
  setDateFromValue(record.date);
  setTimeRange(record.time);
  setCampusFromValue(record.campus);
  filenameInput.value = record.filename || "";
  document.querySelector("#add-record").textContent = "更新清单内容";
  renderPoster(record);
  document.querySelector(".editor-panel").scrollIntoView({ behavior: "smooth", block: "start" });
});

function canvasToBlob(sourceCanvas) {
  return new Promise((resolve, reject) => {
    sourceCanvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("PNG 生成失败")), "image/png");
  });
}

function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1200);
}

document.querySelector("#download-current").addEventListener("click", async () => {
  const record = currentRecord();
  const error = validateRecord(record);
  if (error) return showToast(error);
  await document.fonts.ready;
  await renderPoster(record);
  triggerDownload(await canvasToBlob(canvas), recordFilename(record));
  showToast("当前海报已生成");
});

function resolveTeacher(value) {
  const normalized = String(value || "").trim().replace(/\s+/g, "");
  if (!normalized) return null;
  return TEACHERS.find((teacher) => {
    const name = teacher.name.replace(/老师$/, "");
    return normalized === teacher.name || normalized === name || normalized.includes(name);
  }) || null;
}

function readCell(row, aliases) {
  const key = Object.keys(row).find((name) => aliases.includes(String(name).trim().toLowerCase()));
  return key ? String(row[key] ?? "").trim() : "";
}

function ensureXlsx() {
  if (window.XLSX) return Promise.resolve(window.XLSX);
  if (!xlsxLoadPromise) {
    xlsxLoadPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "./xlsx.full.min.js";
      script.onload = () => resolve(window.XLSX);
      script.onerror = () => reject(new Error("表格组件载入失败，请检查网络后重试"));
      document.head.append(script);
    });
  }
  return xlsxLoadPromise;
}

async function importWorkbook(file) {
  await ensureXlsx();
  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data, { type: "array", cellDates: false });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet, { defval: "", raw: false });
  if (!rows.length) throw new Error("表格中没有可读取的数据");

  const imported = [];
  const skipped = [];
  rows.slice(0, 50).forEach((row, index) => {
    const teacherValue = readCell(row, ["老师", "教师", "模板", "老师模板", "teacher"]);
    const teacher = resolveTeacher(teacherValue);
    const record = {
      teacherId: teacher?.id || "",
      teacher: teacher?.name || teacherValue,
      date: normalizePosterDate(readCell(row, ["日期", "讲座日期", "date"])),
      time: readCell(row, ["时间", "讲座时间", "time"]),
      campus: readCell(row, ["校区", "讲座地点", "地点", "campus"]),
      filename: readCell(row, ["输出文件名", "文件名", "filename"])
    };
    const error = teacher ? validateRecord(record) : `未找到老师模板：${teacherValue || "空"}`;
    if (error) skipped.push(`第 ${index + 2} 行 ${error}`);
    else imported.push(record);
  });

  records = imported.slice(0, 50);
  renderRecords();
  if (records[0]) {
    const first = records[0];
    teacherInput.value = first.teacherId;
    setDateFromValue(first.date);
    setTimeRange(first.time);
    setCampusFromValue(first.campus);
    filenameInput.value = first.filename;
    renderPoster(first);
  }
  if (skipped.length) showToast(`已导入 ${imported.length} 条，跳过 ${skipped.length} 条不完整数据`);
  else showToast(`已导入 ${imported.length} 条海报数据`);
}

fileInput.addEventListener("change", async () => {
  const file = fileInput.files?.[0];
  if (!file) return;
  try { await importWorkbook(file); } catch (error) { showToast(error.message || "表格导入失败"); }
  fileInput.value = "";
});

["dragenter", "dragover"].forEach((name) => dropZone.addEventListener(name, (event) => {
  event.preventDefault();
  dropZone.classList.add("dragover");
}));
["dragleave", "drop"].forEach((name) => dropZone.addEventListener(name, (event) => {
  event.preventDefault();
  dropZone.classList.remove("dragover");
}));
dropZone.addEventListener("drop", async (event) => {
  const file = event.dataTransfer?.files?.[0];
  if (!file) return;
  try { await importWorkbook(file); } catch (error) { showToast(error.message || "表格导入失败"); }
});

document.querySelector("#download-template").addEventListener("click", () => {
  const csv = "\uFEFF老师,日期,时间,校区,输出文件名\n沈老师,10/11,10:00-12:00,小码王苏州苏悦广场校区,沈老师-10月11日\n";
  triggerDownload(new Blob([csv], { type: "text/csv;charset=utf-8" }), "海报批量生成模板.csv");
});

// Minimal ZIP writer using STORE mode, avoiding third-party ZIP dependencies.
const crcTable = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = (c & 1) ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(bytes) {
  let crc = 0xffffffff;
  for (const byte of bytes) crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function u16(value) { return new Uint8Array([value & 255, (value >>> 8) & 255]); }
function u32(value) { return new Uint8Array([value & 255, (value >>> 8) & 255, (value >>> 16) & 255, (value >>> 24) & 255]); }

async function makeZip(files) {
  const encoder = new TextEncoder();
  const localParts = [];
  const centralParts = [];
  let offset = 0;
  for (const file of files) {
    const name = encoder.encode(file.name);
    const data = new Uint8Array(await file.blob.arrayBuffer());
    const crc = crc32(data);
    const local = [u32(0x04034b50), u16(20), u16(0x0800), u16(0), u16(0), u16(0), u32(crc), u32(data.length), u32(data.length), u16(name.length), u16(0), name, data];
    const localSize = local.reduce((sum, part) => sum + part.length, 0);
    localParts.push(...local);
    centralParts.push(u32(0x02014b50), u16(20), u16(20), u16(0x0800), u16(0), u16(0), u16(0), u32(crc), u32(data.length), u32(data.length), u16(name.length), u16(0), u16(0), u16(0), u16(0), u32(0), u32(offset), name);
    offset += localSize;
  }
  const centralSize = centralParts.reduce((sum, part) => sum + part.length, 0);
  const end = [u32(0x06054b50), u16(0), u16(0), u16(files.length), u16(files.length), u32(centralSize), u32(offset), u16(0)];
  return new Blob([...localParts, ...centralParts, ...end], { type: "application/zip" });
}

downloadAllButton.addEventListener("click", async () => {
  if (!records.length) return;
  downloadAllButton.disabled = true;
  downloadAllButton.textContent = `正在生成 0 / ${records.length}`;
  try {
    await document.fonts.ready;
    const files = [];
    const workCanvas = document.createElement("canvas");
    workCanvas.width = 1242;
    workCanvas.height = 2520;
    for (let index = 0; index < records.length; index++) {
      downloadAllButton.textContent = `正在生成 ${index + 1} / ${records.length}`;
      await renderPoster(records[index], workCanvas);
      files.push({ name: recordFilename(records[index]), blob: await canvasToBlob(workCanvas) });
      await new Promise((resolve) => requestAnimationFrame(resolve));
    }
    const zip = await makeZip(files);
    triggerDownload(zip, `信奥讲座海报-${new Date().toISOString().slice(0, 10)}.zip`);
    showToast(`已生成 ${records.length} 张 PNG`);
  } catch (error) {
    showToast(error.message || "批量生成失败");
  } finally {
    downloadAllButton.disabled = false;
    downloadAllButton.textContent = "打包下载 PNG";
  }
});

function registerWebMcpTools() {
  const modelContext = document.modelContext;
  if (!modelContext?.registerTool) return;
  const tools = [
    {
      name: "read_current_poster",
      title: "读取当前海报信息",
      description: "读取工作台当前选择的老师、日期、时间和校区。",
      inputSchema: { type: "object", properties: {}, additionalProperties: false },
      annotations: { readOnlyHint: true, untrustedContentHint: false },
      execute: () => currentRecord()
    },
    {
      name: "set_current_poster",
      title: "设置当前海报信息",
      description: "选择老师并设置日期、时间和校区，同时更新可见预览。",
      inputSchema: {
        type: "object",
        properties: {
          teacher: { type: "string" }, date: { type: "string" }, time: { type: "string" }, campus: { type: "string" }
        },
        required: ["teacher", "date", "time", "campus"], additionalProperties: false
      },
      annotations: { readOnlyHint: false, untrustedContentHint: false },
      execute: async (input) => {
        const teacher = resolveTeacher(input.teacher);
        if (!teacher) throw new Error("未找到对应老师模板");
        const record = { teacherId: teacher.id, teacher: teacher.name, date: normalizePosterDate(input.date), time: String(input.time).trim(), campus: String(input.campus).trim(), filename: "" };
        const error = validateRecord(record);
        if (error) throw new Error(error);
        teacherInput.value = teacher.id; setDateFromValue(record.date); setTimeRange(record.time); setCampusFromValue(record.campus);
        await renderPoster(record);
        return { status: "ready", ...record };
      }
    }
  ];
  for (const tool of tools) Promise.resolve(modelContext.registerTool(tool)).catch(() => {});
}

document.fonts.ready.then(() => renderPoster()).catch(() => renderPoster());
setFormFromTeacher(true);
renderRecords();
registerWebMcpTools();
