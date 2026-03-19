export function getDisplayDate(dateStr: string, lang: string): string {
  const [dayStr, monthStr, yearStr] = dateStr.split("/");

  const day = parseInt(dayStr, 10);
  const month = parseInt(monthStr, 10);
  const year = parseInt(yearStr, 10);

  const monthsTH = [
    "ม.ค.",
    "ก.พ.",
    "มี.ค.",
    "เม.ย.",
    "พ.ค.",
    "มิ.ย.",
    "ก.ค.",
    "ส.ค.",
    "ก.ย.",
    "ต.ค.",
    "พ.ย.",
    "ธ.ค.",
  ];

  const monthsEN = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  let formattedDate = "";

  if (lang === "TH") {
    const buddhistYear = year + 543;
    formattedDate = `${day} ${monthsTH[month - 1]} ${buddhistYear}`;
  } else {
    formattedDate = `${day} ${monthsEN[month - 1]} ${year}`;
  }

  const displayDate = lang === "TH" ? `วันที่ ${formattedDate}` : formattedDate;

  return displayDate;
}
