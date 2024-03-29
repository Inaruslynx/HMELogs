const { startOfMonth, nextSunday, isAfter, isBefore } = require("date-fns");

module.exports = function isDst(date) {
  const result =
    isAfter(date, getSecondSundayInMarch()) &&
    isBefore(date, getFirstSundayInNovember());

  return result;
};

function getSecondSundayInMarch() {
  const marchFirst = startOfMonth(new Date().getFullYear(), 2, 1);
  const firstSunday = nextSunday(marchFirst);
  const secondSunday = nextSunday(firstSunday);
  return secondSunday;
}

function getFirstSundayInNovember() {
  const novFirst = startOfMonth(new Date().getFullYear(), 10, 1);
  const firstSunday = nextSunday(novFirst);
  return firstSunday;
}
