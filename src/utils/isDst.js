module.exports = function isDst(date) {
  const year = date.getUTCFullYear();
  const marchSecondSunday = new Date(
    Date.UTC(year, 2, 8 - new Date(Date.UTC(year, 2, 1)).getUTCDay())
  );
  const novemberFirstSunday = new Date(
    Date.UTC(year, 10, 1 - new Date(Date.UTC(year, 10, 1)).getUTCDay())
  );

  return date >= marchSecondSunday && date < novemberFirstSunday;
};
