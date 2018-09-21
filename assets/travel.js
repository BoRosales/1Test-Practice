$(document).ready(function(){

    let minDate = new Date();

    $('#depart').datepicker({
        showAnim: 'drop',
        numberOfMonth: 2,
        minDate: minDate,
        dateFormat: 'mm/dd/yy',
        onClose: function(selectedDate){
            $('#return').datepicker('option', 'minDate', 'selectedDate');
        }
});
    $('#return').datepicker({
        showAnim: 'drop',
        numberOfMonth: 2,
        dateFormat: 'mm/dd/yy',
        onClose: function(selectedDate){
            $('#depart').datepicker('option', 'minDate', 'selectedDate');
    }
});


asd;lfkjadsr;tlawurg;alkfj;rlytiyjgua;ov

});