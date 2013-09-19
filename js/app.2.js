/* 
    Create data objects
    List employees
    Show single employee on list item click

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
        events: {
            'click tbody tr': 'clickItem'
        },
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
        },
        clickItem: function(event) {
            event.preventDefault();
            var link = $(event.currentTarget).find('a.js-view-record');
            events.trigger('employeeListView:select', {id:link.text()});
        }
    });

    // View - Detail
    var EmployeeDetailView = Backbone.View.extend({
        initialize: function() {
            this.listenTo(events, 'employeeListView:select', this.show);
        },
        show: function(options) {
                this.model = new Employee({id: options.id});
                this.listenTo(this.model, 'sync', this.render);
                this.model.fetch();
        },
        render: function () {
            var html_template = $('#detailTemplate').html();
            var data = this.model.toJSON();
            this.$el.html(html_template);
            this.$el.find('.js-data-model').render(data);
            $('#right_column').empty().append(this.$el);
        }
    });

    var events = _.extend({}, Backbone.Events);
    var employeeListView = new EmployeeListView();
    var userEditView = new EmployeeDetailView();

});