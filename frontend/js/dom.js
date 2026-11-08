export function createElement(tag, className = "", text) {
  const element = document.createElement(tag);

  if (className) {
    element.className = className;
  }

  if (text !== undefined && text !== null) {
    element.textContent = text;
  }

  return element;
}

export function getPeriodLabel(period) {
  const labels = {
    DAY: "☀️ กลางวัน",
    NIGHT: "🌙 กลางคืน",
    ALL: "🕒 ทุกช่วงเวลา"
  };

  return labels[period] || "ไม่ระบุช่วงเวลา";
}

export function getHalalLabel(value) {
  if (value === true) {
    return "ฮาลาล";
  }

  if (value === false) {
    return "ไม่ใช่ฮาลาล";
  }

  return "ไม่ระบุ";
}
