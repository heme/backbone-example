/* 
    Create data objects
    List employees

*/

// Configure jQuery
$.ajaxSetup({
    headers: {"X-Requested-With": "XMLHttpRequest"},
    dataType : 'json',
    crossDomain: true
});
$.ajaxPrefilter( function( options, originalOptions, jqXHR ) {
    options.url = '' + options.url;
});

$(function() { // document ready

    // Data - Model
    var Employee = Backbone.Model.extend({
      urlRoot: '/employee/'
    });

    // Data - Collection
    var Employees = Backbone.Collection.extend({
      url: '/employee',
      model: Employee
    });

    // View - List
    var EmployeeListView = Backbone.View.extend({
        initialize: function() {
            this.collection = new Employees();
            this.listenTo(this.collection, 'sync', this.render);
            this.collection.fetch();
        },
        render: function() {
            var html_template = $('#listTemplate').html();
            var data = this.collection.toJSON();
            this.$el.html(html_template);
            this.$el.find('.js-data-model').render(data);
            $('#left_column').empty().append(this.$el);
        }
    });

    var employeeListView = new EmployeeListView();


});