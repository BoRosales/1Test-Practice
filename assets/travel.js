var calendar_from = new SalsaCalendar({
    inputId: 'checkin',
    lang: 'en',
    range: {
      min: 'today'
    },
    calendarPosition: 'right',
    fixed: false,
    connectCalendar: true
});

var calendar_to = new SalsaCalendar({
    inputId: 'checkout',
    lang: 'en',
    range: {
      min: 'today'
    },
    calendarPosition: 'right',
    fixed: false
});
new SalsaCalendar.Connector({
    from: calendar_from,
    to: calendar_to,
    maximumInterval: 21,
    minimumInterval: 1
  });

new SalsaCalendar.NightsCalculator({
  from: calendar_from,
  to: calendar_to,
  nightsNo: 'nights-no'
});
{
    lang: 'en',
    yearsNavigation: false,
    range: {
      min: false,
      max: false,
      weekdays: false,
      closing_dates: false
    },
    minDate: false,
    allowEmptyDate: false,
    inputReadOnly: false,
    showNextMonth: false,
    onSelect = function(input) {},
    calendarPosition: 'bottom',
    fixed: false,
    dateFormats: {}
  }