/* 
    Create data objects
    List employees
    Show single employee on list item click
    Format Employee Detail template with Directives
    Add Router to Directly Access Employee Detail

*/

// Configure jQuery
$.ajaxSetup({
    headers: {"X-Requested-With": "XMLHttpRequest"},
    dataType : 'json',
    crossDomain: true
});
$.ajaxPrefilter( function( options, originalOptions, jqXHR ) {
    options.url = '' + options.url; // Cross Domain API URL
});

$(function() { //(document).ready

    // Data - Model
    var Employee = Backbone.Model.extend({
      urlRoot: '/api/employee/'
    });

    // Data - Collection
    var Employees = Backbone.Collection.extend({
      url: '/api/employees/',
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
        directives: {
            employee_photo: {
                src: function(element){
                    return (this.employee_photo) ? this.employee_photo : "/img/employee.png";
                }
            }
        },
        render: function () {
            var html_template = $('#detailTemplate').html();
            var data = this.model.toJSON();
            this.$el.html(html_template);
            this.$el.find('.js-data-model').render(data, this.directives);
            $('#right_column').empty().append(this.$el);
        },
        clear: function() {
            this.trigger('clear');
            $('#right_column').empty();
        }
    });

    // Router
    var Router = Backbone.Router.extend({
        routes: {
            '': "index",
            "employee/:id": "employee",
            '*path':  'defaultRoute'
        },
        index: function() {
            userEditView.clear();
        },
        employee: function(id) {
            userEditView.show({'id':id});
        },
        defaultRoute: function() {
            console.log('No Route Found');
        }
    });

    var events = _.extend({}, Backbone.Events);
    var employeeListView = new EmployeeListView();
    var userEditView = new EmployeeDetailView();
    var router = new Router();
    Backbone.history.start({pushState: true});

});